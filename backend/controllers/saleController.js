const saleModel = require('../models/saleModel');
const departmentModel = require('../models/departmentModel');
const categoryModel = require('../models/categoryModel');
const stockModel = require('../models/stockModel');
const userModel = require('../models/userModel');
const notificationService = require('../utils/notificationService');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');
const { isAdmin, canCreateInDepartment } = require('../utils/authorization');

module.exports = {
  // Get all sales
  getAllSales: asyncHandler(async (req, res) => {
    const { stock_id, department_id, category_id, start_date, end_date } = req.query;
    
    logger.info('Fetching all sales', { stock_id, department_id, category_id, start_date, end_date });
    
    const filters = {};
    if (stock_id) filters.stock_id = stock_id;
    if (department_id) filters.department_id = department_id;
    if (category_id) filters.category_id = category_id;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    
    const sales = await saleModel.getAllSales(filters);
    
    logger.info('Sales fetched successfully', { count: sales.length });
    res.json({
      success: true,
      data: sales,
      message: 'Sales fetched successfully'
    });
  }),

  // Get sale by ID
  getSaleById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching sale', { saleId: id });
    const sale = await saleModel.getSaleById(id);
    
    if (!sale) {
      logger.warn('Sale not found', { saleId: id });
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    logger.info('Sale fetched successfully', { saleId: id, amount: sale.amount });
    res.json({
      success: true,
      data: sale,
      message: 'Sale fetched successfully'
    });
  }),

  // Get all sale rows in one sale group
  getSaleGroupById: asyncHandler(async (req, res) => {
    const { saleGroupId } = req.params;

    logger.info('Fetching sale group', { saleGroupId });

    const sales = await saleModel.getSalesByGroupId(saleGroupId);
    if (!sales || sales.length === 0) {
      logger.warn('Sale group not found', { saleGroupId });
      return res.status(404).json({
        success: false,
        message: 'Sale group not found'
      });
    }

    const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + parseFloat(sale.quantity || 0), 0);
    const receiptUrl = sales.find((sale) => sale.receipt_url)?.receipt_url || null;

    res.json({
      success: true,
      data: {
        sale_group_id: saleGroupId,
        total_amount: totalAmount,
        total_quantity: totalQuantity,
        receipt_url: receiptUrl,
        sales
      },
      message: 'Sale group fetched successfully'
    });
  }),

  // Create sale
  createSale: asyncHandler(async (req, res) => {
    const created_by = req.user?.id || req.body.created_by;
    const items = Array.isArray(req.body.items) && req.body.items.length > 0
      ? req.body.items
      : [{
          stock_id: req.body.stock_id,
          quantity: req.body.quantity,
          amount: req.body.amount,
          description: req.body.description
        }];

    logger.info('Creating new sale group', { itemCount: items.length, created_by });

    if (!created_by) {
      logger.warn('Sale creation failed - missing user', { created_by });
      return res.status(400).json({
        success: false,
        message: 'created_by is required'
      });
    }

    const user = await userModel.getUserById(created_by);
    if (!user) {
      logger.warn('Sale creation failed - user not found', { created_by });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const normalizedItems = [];
    for (const [index, item] of items.entries()) {
      const stock_id = item.stock_id;
      const parsedQuantity = parseFloat(item.quantity);
      const parsedAmount = parseFloat(item.amount);

      if (!stock_id || !item.quantity || !item.amount) {
        logger.warn('Sale creation failed - missing item fields', { index, item });
        return res.status(400).json({
          success: false,
          message: 'Each sale item requires stock ID, quantity, and amount'
        });
      }

      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        logger.warn('Sale creation failed - invalid quantity', { index, stock_id, quantity: item.quantity });
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than zero'
        });
      }

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        logger.warn('Sale creation failed - invalid amount', { index, stock_id, amount: item.amount });
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero'
        });
      }

      const stock = await stockModel.getStockById(stock_id);
      if (!stock) {
        logger.warn('Sale creation failed - stock not found', { index, stock_id });
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }

      const hasDepartmentAccess = await canCreateInDepartment(created_by, stock.department_id);
      if (!hasDepartmentAccess) {
        logger.warn('Sale creation failed - department access denied', {
          index,
          stock_id,
          department_id: stock.department_id,
          created_by
        });
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this stock'
        });
      }

      normalizedItems.push({
        stock_id,
        quantity: parsedQuantity,
        amount: parsedAmount,
        description: item.description || null
      });
    }

    let result;
    try {
      result = await saleModel.createSalesFromStocks({
        items: normalizedItems,
        created_by,
        receipt_url: req.body.receipt_url || null
      });
    } catch (error) {
      if (error.code === 'STOCK_NOT_FOUND') {
        logger.warn('Sale creation failed - stock not found during transaction', { stock_id: error.stock_id });
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }

      if (error.code === 'INSUFFICIENT_STOCK') {
        logger.warn('Sale creation failed - insufficient stock', {
          stock_id: error.stock_id,
          available: error.available
        });
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock quantity'
        });
      }

      throw error;
    }

    const totalAmount = result.sales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);

    if (!isAdmin(user.role_name)) {
      await notificationService.notify({
        type: 'SALE_CREATED',
        referenceId: result.sales[0].id,
        message: `New sale of Rs ${totalAmount} for ${result.sales.length} stock item(s)`
      });
    }

    logger.info('Sale group created successfully', {
      saleGroupId: result.sale_group_id,
      saleIds: result.sales.map((sale) => sale.id),
      itemCount: result.sales.length,
      totalAmount,
      created_by
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Sale created successfully'
    });
  }),

  // Update sale
  updateSale: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;
    
    logger.info('Updating sale', { saleId: id, amount, description });
    
    const sale = await saleModel.getSaleById(id);
    if (!sale) {
      logger.warn('Sale update failed - sale not found', { saleId: id });
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    
    const updated = await saleModel.updateSale(id, updateData);
    
    logger.info('Sale updated successfully', { saleId: id, amount: updated.amount });
    
    res.json({
      success: true,
      data: updated,
      message: 'Sale updated successfully'
    });
  }),

  // Delete all sale rows in a group and restore stock quantities
  deleteSaleGroup: asyncHandler(async (req, res) => {
    const { saleGroupId } = req.params;

    logger.info('Deleting sale group', { saleGroupId, userId: req.user?.id });

    const sales = await saleModel.getSalesByGroupId(saleGroupId);
    if (!sales || sales.length === 0) {
      logger.warn('Sale group deletion failed - sale group not found', { saleGroupId });
      return res.status(404).json({
        success: false,
        message: 'Sale group not found'
      });
    }

    const createdBy = sales[0].created_by;
    if (!isAdmin(req.user?.role_name) && req.user?.id !== createdBy) {
      logger.warn('Sale group deletion failed - not creator or admin', {
        saleGroupId,
        userId: req.user?.id,
        createdBy
      });
      return res.status(403).json({
        success: false,
        message: 'You can only remove sales you created'
      });
    }

    const result = await saleModel.deleteSaleGroup(saleGroupId, req.user.id);

    logger.info('Sale group deleted successfully', {
      saleGroupId,
      restoredItems: result.restored_items,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: result,
      message: 'Sale removed and stock restored successfully'
    });
  }),

  // Delete sale
  deleteSale: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting sale', { saleId: id });
    
    const sale = await saleModel.getSaleById(id);
    if (!sale) {
      logger.warn('Sale deletion failed - sale not found', { saleId: id });
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    const deleteResult = await saleModel.deleteSale(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Sale deletion failed - sale in use', { saleId: id });
      return res.status(409).json({
        success: false,
        code: "SALE_IN_USE",
        message: "Cannot delete sale because it is assigned to existing users"
      });
    }
    
    logger.info('Sale deleted successfully', { saleId: id, amount: sale.amount });
    
    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  }),

  // Get sales by department
  getSalesByDepartment: asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    
    logger.info('Fetching sales by department', { departmentId });
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Sales fetch failed - department not found', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const sales = await saleModel.getSalesByDepartment(departmentId);
    
    logger.info('Department sales fetched successfully', { departmentId, count: sales.length });
    
    res.json({
      success: true,
      data: sales,
      message: 'Department sales fetched successfully'
    });
  }),

  // Get sales by category
  getSalesByCategory: asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    
    logger.info('Fetching sales by category', { categoryId });
    
    const category = await categoryModel.getCategoryById(categoryId);
    if (!category) {
      logger.warn('Sales fetch failed - category not found', { categoryId });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const sales = await saleModel.getSalesByCategory(categoryId);
    
    logger.info('Category sales fetched successfully', { categoryId, count: sales.length });
    
    res.json({
      success: true,
      data: sales,
      message: 'Category sales fetched successfully'
    });
  }),

  // Get sales by user
  getSalesByUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    logger.info('Fetching sales by user', { userId });
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      logger.warn('Sales fetch failed - user not found', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const sales = await saleModel.getSalesByUser(userId);
    
    logger.info('User sales fetched successfully', { userId, count: sales.length });
    
    res.json({
      success: true,
      data: sales,
      message: 'User sales fetched successfully'
    });
  }),

  // Get sales by date range
  getSalesByDateRange: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.params;
    const { departmentId } = req.query;
    
    logger.info('Fetching sales by date range', { startDate, endDate, departmentId });
    
    const sales = await saleModel.getSalesByDateRange(startDate, endDate, departmentId);
    
    logger.info('Sales by date range fetched successfully', { startDate, endDate, count: sales.length });
    
    res.json({
      success: true,
      data: sales,
      message: 'Sales fetched successfully'
    });
  }),

  // Get sales statistics
  getSalesStats: asyncHandler(async (req, res) => {
    const { departmentId, startDate, endDate } = req.query;
    
    logger.info('Fetching sales statistics', { departmentId, startDate, endDate });
    
    const stats = await saleModel.getSalesStats(departmentId, startDate, endDate);
    
    logger.info('Sales statistics fetched successfully', { totalAmount: stats.totalAmount });
    
    res.json({
      success: true,
      data: stats,
      message: 'Sales statistics fetched successfully'
    });
  }),

  // Get top selling categories
  getTopSellingCategories: asyncHandler(async (req, res) => {
    const { limit = 5, departmentId } = req.query;
    
    logger.info('Fetching top selling categories', { limit, departmentId });
    
    const categories = await saleModel.getTopSellingCategories(parseInt(limit), departmentId);
    
    logger.info('Top selling categories fetched successfully', { count: categories.length, limit });
    
    res.json({
      success: true,
      data: categories,
      message: 'Top selling categories fetched successfully'
    });
  })
};
