const stockModel = require('../models/stockModel');
const departmentModel = require('../models/departmentModel');
const categoryModel = require('../models/categoryModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all stocks
  getAllStocks: asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    logger.info('Fetching all stocks', { departmentId, userId: req.user.id });
    const stocks = await stockModel.getAllStocks(departmentId);
    
    logger.info('Stocks fetched successfully', { count: stocks.length, departmentId });
    res.json({
      success: true,
      data: stocks,
      message: 'Stocks fetched successfully'
    });
  }),

  // Get stocks for logged-in user's departments
  getStocksByUserDepartments: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    logger.info('Fetching stocks for user departments', { userId });
    const stocks = await stockModel.getStocksByUserDepartments(userId);
    
    logger.info('User department stocks fetched successfully', { count: stocks.length, userId });
    res.json({
      success: true,
      data: stocks,
      message: 'Stocks fetched successfully'
    });
  }),

  // Get stock by ID
  getStockById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching stock', { stockId: id });
    const stock = await stockModel.getStockById(id);
    logger.info("Stock ID", id)
    
    if (!stock) {
      logger.warn('Stock not found', { stockId: id });
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    logger.info('Stock fetched successfully', { stockId: id, stockName: stock.name, quantity: stock.current_quantity });
    res.json({
      success: true,
      data: stock,
      message: 'Stock fetched successfully'
    });
  }),

  // Create stock
  createStock: asyncHandler(async (req, res) => {
    const { name, department_id, category_id, current_quantity } = req.body;
    
    logger.info('Creating new stock', { name, department_id, category_id, current_quantity });
    
    if (!name || !department_id || !category_id) {
      logger.warn('Stock creation failed - missing required fields', { name, department_id, category_id });
      return res.status(400).json({
        success: false,
        message: 'Name, department ID, and category ID are required'
      });
    }
    
    const department = await departmentModel.getDepartmentById(department_id);
    if (!department) {
      logger.warn('Stock creation failed - department not found', { department_id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const category = await categoryModel.getCategoryById(category_id);
    if (!category) {
      logger.warn('Stock creation failed - category not found', { category_id });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stock = await stockModel.createStock({
      name,
      department_id,
      category_id,
      current_quantity: current_quantity || 0
    });
    
    logger.info('Stock created successfully', { stockId: stock.id, name, department_id, category_id, quantity: current_quantity || 0 });
    
    res.status(201).json({
      success: true,
      data: stock,
      message: 'Stock created successfully'
    });
  }),

  // Update stock
  updateStock: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, current_quantity } = req.body;
    
    logger.info('Updating stock', { stockId: id, name, current_quantity });
    
    const stock = await stockModel.getStockById(id);
    if (!stock) {
      logger.warn('Stock update failed - stock not found', { stockId: id });
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (current_quantity !== undefined) updateData.current_quantity = current_quantity;
    
    const updated = await stockModel.updateStock(id, updateData);
    
    logger.info('Stock updated successfully', { stockId: id, name: updated.name, quantity: updated.current_quantity });
    
    res.json({
      success: true,
      data: updated,
      message: 'Stock updated successfully'
    });
  }),

  // Delete stock
  deleteStock: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting stock', { stockId: id });
    
    const stock = await stockModel.getStockById(id);
    if (!stock) {
      logger.warn('Stock deletion failed - stock not found', { stockId: id });
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const deleteResult = await stockModel.deleteStock(id).catch(err => err)
    if (deleteResult) {
      if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
        logger.warn('Stock deletion failed - stock in use', { stockId: id });
        return res.status(409).json({
          success: false,
          code: "STOCK_IN_USE",
          message: "Cannot delete stock because it is assigned to existing users"
        });
      }
    }
    
    logger.info('Stock deleted successfully', { stockId: id, name: stock.name });
    
    res.json({
      success: true,
      message: 'Stock deleted successfully'
    });
  }),

  // Get stocks by department
  getStocksByDepartment: asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    
    logger.info('Fetching stocks by department', { departmentId });
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Stocks fetch failed - department not found', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const stocks = await stockModel.getStocksByDepartment(departmentId);
    
    logger.info('Department stocks fetched successfully', { departmentId, count: stocks.length });
    
    res.json({
      success: true,
      data: stocks,
      message: 'Department stocks fetched successfully'
    });
  }),

  // Get stocks by category
  getStocksByCategory: asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    
    logger.info('Fetching stocks by category', { categoryId });
    
    const category = await categoryModel.getCategoryById(categoryId);
    if (!category) {
      logger.warn('Stocks fetch failed - category not found', { categoryId });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stocks = await stockModel.getStocksByCategory(categoryId);
    
    logger.info('Category stocks fetched successfully', { categoryId, count: stocks.length });
    
    res.json({
      success: true,
      data: stocks,
      message: 'Category stocks fetched successfully'
    });
  }),

  // Get low stock items
  getLowStockItems: asyncHandler(async (req, res) => {
    const { threshold = 100 } = req.query;
    
    logger.info('Fetching low stock items', { threshold });
    const stocks = await stockModel.getLowStockItems(parseInt(threshold));
    
    logger.info('Low stock items fetched successfully', { count: stocks.length, threshold });
    
    res.json({
      success: true,
      data: stocks,
      message: 'Low stock items fetched successfully'
    });
  })
};
