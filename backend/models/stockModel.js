const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all stocks
  async getAllStocks(departmentId = null) {
    let query = db('stocks')
      .select(
        'stocks.*',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('departments', 'stocks.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id');
    
    if (departmentId) {
      query = query.where({ 'stocks.department_id': departmentId });
    }
    
    return query.orderBy('stocks.name');
  },

  // Get stock by ID
  async getStockById(id) {
    return db('stocks')
      .where({ 'stocks.id': id })
      .select(
        'stocks.*',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('departments', 'stocks.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id')
      .first();
  },

  // Get stocks by department
  async getStocksByDepartment(departmentId) {
    return this.getAllStocks(departmentId);
  },

  // Get stocks by category
  async getStocksByCategory(categoryId) {
    return db('stocks')
      .where({ category_id: categoryId })
      .select(
        'stocks.*',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('departments', 'stocks.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id')
      .orderBy('stocks.name');
  },

  // Create new stock
  async createStock(data) {
    const [id] = await db('stocks').insert(data);
    return this.getStockById(id);
  },

  // Update stock
  async updateStock(id, data) {
    await db('stocks').where({ id }).update(data);
    return this.getStockById(id);
  },

  // Delete stock
  async deleteStock(id) {
    return db.transaction(async trx => {
      await trx('stock_transactions').where({ stock_id: id }).del(); // Cascade delete transactions
      await trx('stocks').where({ id }).del();
    });
  },

  // Update stock quantity
  async updateStockQuantity(id, quantity) {
    await db('stocks').where({ id }).update({ current_quantity: quantity, updated_at: new Date() });
    return this.getStockById(id);
  },

  // Get stocks for user's departments
  async getStocksByUserDepartments(userId) {
    let db_query = db('stocks')
      .select(
        'stocks.*',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('departments', 'stocks.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id')
      .orderBy('stocks.name');
    
    if (userId !== 1) {
      db_query = db_query.whereIn('stocks.department_id', 
        db('user_departments')
          .where({ user_id: userId })
          .select('department_id')
      );
    }
    return db_query;
  },

  // Get low stock items (quantity below threshold)
  async getLowStockItems(threshold = 100) {
    return db('stocks')
      .where(db.raw(`current_quantity < ${threshold}`))
      .select(
        'stocks.*',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('departments', 'stocks.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id')
      .orderBy('stocks.current_quantity', 'asc');
  }
};
