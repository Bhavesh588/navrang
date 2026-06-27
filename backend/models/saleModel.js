const db = require('../config/dbConfig');
const logger = require('../utils/logger');
const { randomUUID } = require('crypto');

module.exports = {
  // Get all sales
  async getAllSales(filters = {}) {
    let query = db('sales')
      .select(
        'sales.*',
        'stocks.name as stock_name',
        'stocks.current_quantity as stock_current_quantity',
        'departments.name as department_name',
        'categories.name as category_name',
        'users.name as created_by_name'
      )
      .leftJoin('stocks', 'sales.stock_id', 'stocks.id')
      .leftJoin('departments', 'sales.department_id', 'departments.id')
      .leftJoin('categories', 'sales.category_id', 'categories.id')
      .leftJoin('users', 'sales.created_by', 'users.id');
    
    if (filters.stock_id) query = query.where({ 'sales.stock_id': filters.stock_id });
    if (filters.sale_group_id) query = query.where({ 'sales.sale_group_id': filters.sale_group_id });
    if (filters.department_id) query = query.where({ 'sales.department_id': filters.department_id });
    if (filters.category_id) query = query.where({ 'sales.category_id': filters.category_id });
    if (filters.start_date) query = query.where(db.raw(`DATE(sales.created_at) >= ?`, [filters.start_date]));
    if (filters.end_date) query = query.where(db.raw(`DATE(sales.created_at) <= ?`, [filters.end_date]));
    
    return query.orderBy('sales.created_at', 'desc');
  },

  // Get sale by ID
  async getSaleById(id) {
    return db('sales')
      .where({ 'sales.id': id })
      .select(
        'sales.*',
        'stocks.name as stock_name',
        'stocks.current_quantity as stock_current_quantity',
        'departments.name as department_name',
        'categories.name as category_name',
        'users.name as created_by_name'
      )
      .leftJoin('stocks', 'sales.stock_id', 'stocks.id')
      .leftJoin('departments', 'sales.department_id', 'departments.id')
      .leftJoin('categories', 'sales.category_id', 'categories.id')
      .leftJoin('users', 'sales.created_by', 'users.id')
      .first();
  },

  // Get all rows created in one sale group
  async getSalesByGroupId(saleGroupId) {
    return this.getAllSales({ sale_group_id: saleGroupId });
  },

  // Create new sale
  async createSale(data) {
    const [id] = await db('sales').insert(data);
    return this.getSaleById(id);
  },

  // Create sale from stock and decrement selected stock quantity
  async createSaleFromStock(data) {
    const result = await this.createSalesFromStocks({
      items: [data],
      created_by: data.created_by,
      sale_group_id: data.sale_group_id
    });

    return result.sales[0];
  },

  // Create multiple sale rows from stocks and decrement each selected stock
  async createSalesFromStocks(data) {
    return db.transaction(async (trx) => {
      const saleGroupId = data.sale_group_id || randomUUID();
      const sales = [];
      const receiptUrl = data.receipt_url || null;
      const receiptUploadedBy = receiptUrl ? data.created_by : null;
      const receiptUploadedAt = receiptUrl ? new Date() : null;

      for (const item of data.items) {
        const quantity = parseFloat(item.quantity);
        const stock = await trx('stocks')
          .where({ id: item.stock_id })
          .forUpdate()
          .first();

        if (!stock) {
          const error = new Error('Stock not found');
          error.code = 'STOCK_NOT_FOUND';
          error.stock_id = item.stock_id;
          throw error;
        }

        const currentQuantity = parseFloat(stock.current_quantity || 0);
        if (currentQuantity < quantity) {
          const error = new Error('Insufficient stock quantity');
          error.code = 'INSUFFICIENT_STOCK';
          error.available = currentQuantity;
          error.stock_id = stock.id;
          throw error;
        }

        const [id] = await trx('sales').insert({
          sale_group_id: saleGroupId,
          stock_id: stock.id,
          department_id: stock.department_id,
          category_id: stock.category_id,
          quantity,
          amount: item.amount,
          description: item.description || null,
          receipt_url: receiptUrl,
          receipt_uploaded_by: receiptUploadedBy,
          receipt_uploaded_at: receiptUploadedAt,
          created_by: data.created_by
        });

        await trx('stocks')
          .where({ id: stock.id })
          .update({
            current_quantity: currentQuantity - quantity,
            updated_at: new Date()
          });

        await trx('stock_transactions').insert({
          stock_id: stock.id,
          department_id: stock.department_id,
          user_id: data.created_by,
          action_type: 'REMOVE',
          quantity,
          remarks: item.description ? `Sale: ${item.description}` : 'Sale created',
          created_at: new Date(),
          updated_at: new Date()
        });

        const sale = await trx('sales')
          .where({ 'sales.id': id })
          .select(
            'sales.*',
            'stocks.name as stock_name',
            'stocks.current_quantity as stock_current_quantity',
            'departments.name as department_name',
            'categories.name as category_name',
            'users.name as created_by_name'
          )
          .leftJoin('stocks', 'sales.stock_id', 'stocks.id')
          .leftJoin('departments', 'sales.department_id', 'departments.id')
          .leftJoin('categories', 'sales.category_id', 'categories.id')
          .leftJoin('users', 'sales.created_by', 'users.id')
          .first();

        sales.push(sale);
      }

      return {
        sale_group_id: saleGroupId,
        sales
      };
    });
  },

  // Update sale
  async updateSale(id, data) {
    await db('sales').where({ id }).update(data);
    return this.getSaleById(id);
  },

  // Delete sale
  async deleteSale(id) {
    return db('sales').where({ id }).del();
  },

  // Delete a sale group and restore each stock quantity
  async deleteSaleGroup(saleGroupId, userId) {
    return db.transaction(async (trx) => {
      const sales = await trx('sales')
        .where({ sale_group_id: saleGroupId })
        .forUpdate();

      if (sales.length === 0) {
        const error = new Error('Sale group not found');
        error.code = 'SALE_GROUP_NOT_FOUND';
        throw error;
      }

      for (const sale of sales) {
        const quantity = parseFloat(sale.quantity || 0);
        const stock = await trx('stocks')
          .where({ id: sale.stock_id })
          .forUpdate()
          .first();

        if (stock) {
          const currentQuantity = parseFloat(stock.current_quantity || 0);

          await trx('stocks')
            .where({ id: sale.stock_id })
            .update({
              current_quantity: currentQuantity + quantity,
              updated_at: new Date()
            });

          await trx('stock_transactions').insert({
            stock_id: sale.stock_id,
            department_id: sale.department_id,
            user_id: userId,
            action_type: 'ADD',
            quantity,
            remarks: `Sale removed: ${saleGroupId}`,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      await trx('sales').where({ sale_group_id: saleGroupId }).del();

      return {
        sale_group_id: saleGroupId,
        restored_items: sales.length
      };
    });
  },

  // Get sales by department
  async getSalesByDepartment(departmentId) {
    return this.getAllSales({ department_id: departmentId });
  },

  // Get sales by category
  async getSalesByCategory(categoryId) {
    return this.getAllSales({ category_id: categoryId });
  },

  // Get sales by user
  async getSalesByUser(userId) {
    return db('sales')
      .where({ created_by: userId })
      .select(
        'sales.*',
        'stocks.name as stock_name',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('stocks', 'sales.stock_id', 'stocks.id')
      .leftJoin('departments', 'sales.department_id', 'departments.id')
      .leftJoin('categories', 'sales.category_id', 'categories.id')
      .orderBy('sales.created_at', 'desc');
  },

  // Get sales by date range
  async getSalesByDateRange(startDate, endDate, departmentId = null) {
    return this.getAllSales({
      start_date: startDate,
      end_date: endDate,
      department_id: departmentId
    });
  },

  // Get sales statistics
  async getSalesStats(departmentId = null, startDate = null, endDate = null) {
    let query = db('sales');
    
    if (departmentId) query = query.where({ department_id: departmentId });
    if (startDate) query = query.where(db.raw(`DATE(created_at) >= ?`, [startDate]));
    if (endDate) query = query.where(db.raw(`DATE(created_at) <= ?`, [endDate]));
    
    const result = await query
      .sum('amount as total_amount')
      .count('* as total_sales')
      .first();
    
    return {
      total_amount: result.total_amount || 0,
      total_sales: result.total_sales || 0,
      average_amount: result.total_sales > 0 ? (result.total_amount / result.total_sales) : 0
    };
  },

  // Get top selling categories
  async getTopSellingCategories(limit = 10, departmentId = null) {
    let query = db('sales')
      .select('categories.id', 'categories.name', db.raw('COUNT(sales.id) as sales_count'), db.raw('SUM(sales.amount) as total_amount'))
      .leftJoin('categories', 'sales.category_id', 'categories.id')
      .groupBy('categories.id', 'categories.name')
      .orderBy('total_amount', 'desc')
      .limit(limit);
    
    if (departmentId) {
      query = query.where({ 'sales.department_id': departmentId });
    }
    
    return query;
  }
};
