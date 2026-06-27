const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all receipts
  async getAllReceipts() {
    return db('receipts')
      .select('receipts.*', 'users.name as uploaded_by_name')
      .leftJoin('users', 'receipts.uploaded_by', 'users.id')
      .orderBy('receipts.uploaded_at', 'desc');
  },

  // Get receipt by ID
  async getReceiptById(id) {
    return db('receipts')
      .where({ 'receipts.id': id })
      .select('receipts.*', 'users.name as uploaded_by_name')
      .leftJoin('users', 'receipts.uploaded_by', 'users.id')
      .first();
  },

  // Get receipts by user
  async getReceiptsByUser(userId) {
    return db('receipts')
      .where({ uploaded_by: userId })
      .select('receipts.*', 'users.name as uploaded_by_name')
      .leftJoin('users', 'receipts.uploaded_by', 'users.id')
      .orderBy('receipts.uploaded_at', 'desc');
  },

  // Create new receipt
  async createReceipt(data) {
    const [id] = await db('receipts').insert(data);
    return this.getReceiptById(id);
  },

  // Update receipt
  async updateReceipt(id, data) {
    await db('receipts').where({ id }).update(data);
    return this.getReceiptById(id);
  },

  // Delete receipt
  async deleteReceipt(id) {
    return db('receipts').where({ id }).del();
  },

  // Get recent receipts
  async getRecentReceipts(limit = 10) {
    return db('receipts')
      .select('receipts.*', 'users.name as uploaded_by_name')
      .leftJoin('users', 'receipts.uploaded_by', 'users.id')
      .orderBy('receipts.uploaded_at', 'desc')
      .limit(limit);
  }
};
