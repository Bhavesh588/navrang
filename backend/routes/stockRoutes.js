const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const stockTransactionController = require('../controllers/stockTransactionController');
const { authenticate, authorize, departmentAccess } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');
const logger = require('../utils/logger');

// GET routes (must be before :id routes)
router.get('/low-stock', authenticate, stockController.getLowStockItems);
router.get('/by-user', authenticate, stockController.getStocksByUserDepartments);

// Nested transaction routes (before generic :id route)
/**
 * POST /api/v1/stocks/:id/add
 * Add quantity to stock and create transaction
 */
router.post('/:id/add', authenticate, validateBody(['quantity']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, receipt_id, remarks } = req.body;
    logger.info('Adding stock quantity', { stockId: id, quantity, userId: req.user.id });

    const stockModel = require('../models/stockModel');
    const stock = await stockModel.getStockById(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    // Pass through to transaction controller with ADD action
    req.body.stock_id = id;
    req.body.department_id = stock.department_id;
    req.body.user_id = req.user.id;
    req.body.action_type = 'ADD';
    
    return await stockTransactionController.createTransaction(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding stock'
    });
  }
});

/**
 * POST /api/v1/stocks/:id/remove
 * Remove quantity from stock and create transaction
 */
router.post('/:id/remove', authenticate, validateBody(['quantity']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, receipt_id, remarks } = req.body;

    const stockModel = require('../models/stockModel');
    const stock = await stockModel.getStockById(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    // Pass through to transaction controller with REMOVE action
    req.body.stock_id = id;
    req.body.department_id = stock.department_id;
    req.body.user_id = req.user.id;
    req.body.action_type = 'REMOVE';
    
    return await stockTransactionController.createTransaction(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing stock'
    });
  }
});

// Generic routes
router.get('/', authenticate, stockController.getAllStocks);
router.get('/:id', authenticate, stockController.getStockById);
router.get('/department/:departmentId', authenticate, departmentAccess, stockController.getStocksByDepartment);
router.get('/category/:categoryId', authenticate, stockController.getStocksByCategory);
router.post('/', authenticate, authorize('admin'), validateBody(['name', 'category_id', 'department_id']), stockController.createStock);
router.put('/:id', authenticate, authorize('admin'), stockController.updateStock);
router.delete('/:id', authenticate, authorize('admin'), stockController.deleteStock);

module.exports = router;
