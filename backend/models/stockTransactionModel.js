const db = require('../config/dbConfig');

module.exports = {
  // Get all stock transactions
  async getAllStockTransactions(filters = {}) {
    let query = db('stock_transactions')
      .select(
        'stock_transactions.*',
        'stocks.name as stock_name',
        'users.name as user_name',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('stocks', 'stock_transactions.stock_id', 'stocks.id')
      .leftJoin('users', 'stock_transactions.user_id', 'users.id')
      .leftJoin('departments', 'stock_transactions.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id');
    
    if (filters.stock_id) query = query.where({ stock_id: filters.stock_id });
    if (filters.user_id) query = query.where({ user_id: filters.user_id });
    if (filters.department_id) query = query.where({ 'stock_transactions.department_id': filters.department_id });
    if (filters.action_type) query = query.where({ action_type: filters.action_type });
    if (filters.start_date) query = query.where(db.raw(`DATE(stock_transactions.created_at) >= ?`, [filters.start_date]));
    if (filters.end_date) query = query.where(db.raw(`DATE(stock_transactions.created_at) <= ?`, [filters.end_date]));
    
    return query.orderBy('stock_transactions.created_at', 'desc');
  },

  // Get transaction by ID
  async getTransactionById(id) {
    return db('stock_transactions')
      .where({ 'stock_transactions.id': id })
      .select(
        'stock_transactions.*',
        'stocks.name as stock_name',
        'users.name as user_name',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('stocks', 'stock_transactions.stock_id', 'stocks.id')
      .leftJoin('users', 'stock_transactions.user_id', 'users.id')
      .leftJoin('departments', 'stock_transactions.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id')
      .first();
  },

  // Create new transaction
  async createTransaction(data) {
    const [id] = await db('stock_transactions').insert(data);
    return this.getTransactionById(id);
  },

  // Get transactions for a stock
  async getTransactionsByStock(stockId) {
    return db('stock_transactions')
      .where({ stock_id: stockId })
      .select(
        'stock_transactions.*',
        'stocks.name as stock_name',
        'users.name as user_name'
      )
      .leftJoin('stocks', 'stock_transactions.stock_id', 'stocks.id')
      .leftJoin('users', 'stock_transactions.user_id', 'users.id')
      .orderBy('stock_transactions.created_at', 'desc');
  },

  // Get transactions by user
  async getTransactionsByUser(userId) {
    return db('stock_transactions')
      .where({ user_id: userId })
      .select(
        'stock_transactions.*',
        'stocks.name as stock_name',
        'departments.name as department_name'
      )
      .leftJoin('stocks', 'stock_transactions.stock_id', 'stocks.id')
      .leftJoin('departments', 'stock_transactions.department_id', 'departments.id')
      .orderBy('stock_transactions.created_at', 'desc');
  },

  // Get transactions by department
  async getTransactionsByDepartment(departmentId) {
    return this.getAllStockTransactions({ department_id: departmentId });
  },

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate, departmentId = null) {
    let query = db('stock_transactions')
      .where(db.raw(`DATE(created_at) BETWEEN ? AND ?`, [startDate, endDate]))
      .select(
        'stock_transactions.*',
        'stocks.name as stock_name',
        'users.name as user_name',
        'departments.name as department_name',
        'categories.name as category_name'
      )
      .leftJoin('stocks', 'stock_transactions.stock_id', 'stocks.id')
      .leftJoin('users', 'stock_transactions.user_id', 'users.id')
      .leftJoin('departments', 'stock_transactions.department_id', 'departments.id')
      .leftJoin('categories', 'stocks.category_id', 'categories.id');
    
    if (departmentId) {
      query = query.where({ 'stock_transactions.department_id': departmentId });
    }
    
    return query.orderBy('stock_transactions.created_at', 'desc');
  },

  // Get transaction statistics
  async getTransactionStats(departmentId = null) {
    let addQuery = db('stock_transactions').where({ action_type: 'ADD' });
    let removeQuery = db('stock_transactions').where({ action_type: 'REMOVE' });
    
    if (departmentId) {
      addQuery = addQuery.where({ department_id: departmentId });
      removeQuery = removeQuery.where({ department_id: departmentId });
    }
    
    const added = await addQuery.sum('quantity as total').first();
    const removed = await removeQuery.sum('quantity as total').first();
    
    return {
      total_added: added.total || 0,
      total_removed: removed.total || 0
    };
  }
};
