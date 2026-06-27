const stockTransactionModel = require('../models/stockTransactionModel');
const stockModel = require('../models/stockModel');
const userModel = require('../models/userModel');
const departmentModel = require('../models/departmentModel');
const notificationService = require('../utils/notificationService');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all stock transactions
  getAllTransactions: asyncHandler(async (req, res) => {
    const { stock_id, user_id, department_id, action_type, start_date, end_date } = req.query;
    
    const filters = {};
    if (stock_id) filters.stock_id = stock_id;
    if (user_id) filters.user_id = user_id;
    if (department_id) filters.department_id = department_id;
    if (action_type) filters.action_type = action_type;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    
    const transactions = await stockTransactionModel.getAllStockTransactions(filters);
    
    logger.info('Stock transactions fetched', {
      count: transactions.length,
      filters,
      userId: req.user?.id,
      requestId: req.id
    });
    
    res.json({
      success: true,
      data: transactions,
      message: 'Stock transactions fetched successfully'
    });
  }),

  // Get transaction by ID
  getTransactionById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await stockTransactionModel.getTransactionById(id);
    
    if (!transaction) {
      logger.warn('Transaction not found', {
        transactionId: id,
        userId: req.user?.id,
        requestId: req.id
      });

      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction,
      message: 'Transaction fetched successfully'
    });
  }),

  // Create stock transaction
  createTransaction: asyncHandler(async (req, res) => {
    const { stock_id, department_id, user_id, action_type, quantity, receipt_id, remarks } = req.body;
    
    logger.info('Creating stock transaction', { stock_id, department_id, user_id, action_type, quantity });
    
    if (!stock_id || !department_id || !user_id || !action_type || !quantity) {
      logger.warn('Stock transaction validation failed - missing required fields', { 
        stock_id, department_id, user_id, action_type, quantity 
      });
      return res.status(400).json({
        success: false,
        message: 'Stock ID, department ID, user ID, action type, and quantity are required'
      });
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      logger.warn('Invalid quantity - must be a valid positive number', { quantity });
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid positive number (integer or float)'
      });
    }
    
    // Validate action type
    if (!['ADD', 'REMOVE'].includes(action_type)) {
      logger.warn('Invalid action type', { action_type });
      return res.status(400).json({
        success: false,
        message: 'Action type must be ADD or REMOVE'
      });
    }
    
    const stock = await stockModel.getStockById(stock_id);
    if (!stock) {
      logger.warn('Stock not found for transaction', { stock_id });
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const user = await userModel.getUserById(user_id);
    if (!user) {
      logger.warn('User not found for transaction', { user_id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const department = await departmentModel.getDepartmentById(department_id);
    if (!department) {
      logger.warn('Department not found for transaction', { department_id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Update stock quantity
    let newQuantity = parseFloat(stock.current_quantity);
    console.log('Current stock quantity', { stock_id, currentQuantity: stock.current_quantity });
    if (action_type === 'ADD') {
      newQuantity += parseFloat(quantity);
    } else {
      if (stock.current_quantity < quantity) {
        logger.warn('Insufficient stock quantity', { stock_id, available: stock.current_quantity, requested: quantity });
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock quantity'
        });
      }
      newQuantity -= parseFloat(quantity);
    }
    
    await stockModel.updateStockQuantity(stock_id, newQuantity);
    logger.debug('Stock quantity updated', { stock_id, oldQuantity: stock.current_quantity, newQuantity });
    
    // Create transaction
    const transaction = await stockTransactionModel.createTransaction({
      stock_id,
      department_id,
      user_id,
      action_type,
      quantity: parseFloat(quantity),
      receipt_id: receipt_id || null,
      remarks: remarks || null
    });
    
    // Create notification (and queue push to admins)
    const notificationMsg = `Stock ${action_type === 'ADD' ? 'added' : 'removed'}: ${quantity} units of ${stock.name}`;
    const notificationType = action_type === 'ADD' ? 'STOCK_ADD' : 'STOCK_REMOVE';

    // Always notify admins about stock changes (regardless of who made the change)
    await notificationService.notify({
      type: notificationType,
      referenceId: transaction.id,
      message: notificationMsg
      // recipients: { userIds: [...] } // optional (defaults to admin users)
    });

    logger.info('Stock transaction created successfully', { transactionId: transaction.id, action_type, quantity });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Stock transaction created successfully'
    });
  }),

  // Get transactions by stock
  getTransactionsByStock: asyncHandler(async (req, res) => {
    const { stockId } = req.params;
    
    logger.info('Fetching transactions by stock', { stockId });
    
    const stock = await stockModel.getStockById(stockId);
    if (!stock) {
      logger.warn('Stock not found', { stockId });
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const transactions = await stockTransactionModel.getTransactionsByStock(stockId);
    logger.info('Stock transactions fetched', { stockId, count: transactions.length });
    
    res.json({
      success: true,
      data: transactions,
      message: 'Stock transactions fetched successfully'
    });
  }),

  // Get transactions by user
  getTransactionsByUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    logger.info('Fetching transactions by user', { userId });
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      logger.warn('User not found', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const transactions = await stockTransactionModel.getTransactionsByUser(userId);
    logger.info('User transactions fetched', { userId, count: transactions.length });
    
    res.json({
      success: true,
      data: transactions,
      message: 'User transactions fetched successfully'
    });
  }),

  // Get transactions by department
  getTransactionsByDepartment: asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    
    logger.info('Fetching transactions by department', { departmentId });
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Department not found', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const transactions = await stockTransactionModel.getTransactionsByDepartment(departmentId);
    logger.info('Department transactions fetched', { departmentId, count: transactions.length });
    
    res.json({
      success: true,
      data: transactions,
      message: 'Department transactions fetched successfully'
    });
  }),

  // Get transactions by date range
  getTransactionsByDateRange: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.params;
    const { departmentId } = req.query;
    
    logger.info('Fetching transactions by date range', { startDate, endDate, departmentId });
    
    const transactions = await stockTransactionModel.getTransactionsByDateRange(
      startDate,
      endDate,
      departmentId
    );
    
    logger.info('Date range transactions fetched', { startDate, endDate, departmentId, count: transactions.length });
    
    res.json({
      success: true,
      data: transactions,
      message: 'Transactions fetched successfully'
    });
  }),

  // Get transaction statistics
  getTransactionStats: asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    
    logger.info('Fetching transaction statistics', { departmentId });
    
    const stats = await stockTransactionModel.getTransactionStats(departmentId);
    logger.info('Transaction statistics retrieved', { departmentId, statsAvailable: !!stats });
    
    res.json({
      success: true,
      data: stats,
      message: 'Transaction statistics fetched successfully'
    });
  })
};
