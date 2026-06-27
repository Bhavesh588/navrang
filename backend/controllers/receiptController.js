const receiptModel = require('../models/receiptModel');
const userModel = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all receipts
  getAllReceipts: asyncHandler(async (req, res) => {
    logger.info('Fetching all receipts');
    const receipts = await receiptModel.getAllReceipts();
    logger.info('Receipts fetched successfully', { count: receipts.length });
    res.json({
      success: true,
      data: receipts,
      message: 'Receipts fetched successfully'
    });
  }),

  // Get receipt by ID
  getReceiptById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching receipt', { receiptId: id });
    const receipt = await receiptModel.getReceiptById(id);
    
    if (!receipt) {
      logger.warn('Receipt not found', { receiptId: id });
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }
    
    logger.info('Receipt fetched successfully', { receiptId: id, uploadedBy: receipt.uploaded_by });
    res.json({
      success: true,
      data: receipt,
      message: 'Receipt fetched successfully'
    });
  }),

  // Create receipt
  createReceipt: asyncHandler(async (req, res) => {
    const { file_url, uploaded_by } = req.body;
    
    logger.info('Creating new receipt', { file_url, uploaded_by });
    
    if (!file_url || !uploaded_by) {
      logger.warn('Receipt creation failed - missing required fields', { file_url, uploaded_by });
      return res.status(400).json({
        success: false,
        message: 'File URL and uploaded_by user ID are required'
      });
    }
    
    const user = await userModel.getUserById(uploaded_by);
    if (!user) {
      logger.warn('Receipt creation failed - user not found', { uploaded_by });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const receipt = await receiptModel.createReceipt({
      file_url,
      uploaded_by,
      uploaded_at: new Date()
    });
    
    logger.info('Receipt created successfully', { receiptId: receipt.id, uploaded_by, fileName: file_url });
    
    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt created successfully'
    });
  }),

  // Update receipt
  updateReceipt: asyncHandler(async (req, res) => {
    let { id } = req.params;
    const { file_url } = req.body;
    id = parseInt(id);
    logger.info('Updating receipt', { receiptId: id, file_url });
    
    const receipt = await receiptModel.getReceiptById(id);
    if (!receipt) {
      logger.warn('Receipt update failed - receipt not found', { receiptId: id });
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }
    
    const updateData = {};
    if (file_url) updateData.file_url = file_url;
    
    const updated = await receiptModel.updateReceipt(id, updateData).catch(err => err);
    console.log(updated);
    
    logger.info('Receipt updated successfully', { receiptId: id, fileName: updated.file_url });
    
    res.json({
      success: true,
      data: updated,
      message: 'Receipt updated successfully'
    });
  }),

  // Delete receipt
  deleteReceipt: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting receipt', { receiptId: id });
    
    const receipt = await receiptModel.getReceiptById(id);
    if (!receipt) {
      logger.warn('Receipt deletion failed - receipt not found', { receiptId: id });
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }
    
    const deleteResult = await receiptModel.deleteReceipt(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Receipt deletion failed - receipt in use', { receiptId: id });
      return res.status(409).json({
        success: false,
        code: "RECEIPT_IN_USE",
        message: "Cannot delete receipt because it is assigned to existing users"
      });
    }
    
    logger.info('Receipt deleted successfully', { receiptId: id, fileName: receipt.file_url });
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  }),

  // Get recent receipts
  getRecentReceipts: asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    logger.info('Fetching recent receipts', { limit });
    const receipts = await receiptModel.getRecentReceipts(parseInt(limit));
    
    logger.info('Recent receipts fetched successfully', { count: receipts.length, limit });
    res.json({
      success: true,
      data: receipts,
      message: 'Recent receipts fetched successfully'
    });
  }),

  // Get receipts by user
  getReceiptsByUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    logger.info('Fetching receipts by user', { userId });
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      logger.warn('Receipts fetch failed - user not found', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const receipts = await receiptModel.getReceiptsByUser(userId);
    
    logger.info('User receipts fetched successfully', { userId, count: receipts.length });
    
    res.json({
      success: true,
      data: receipts,
      message: 'User receipts fetched successfully'
    });
  })
};
