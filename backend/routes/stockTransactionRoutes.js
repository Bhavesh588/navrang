const express = require('express');
const router = express.Router();
const stockTransactionController = require('../controllers/stockTransactionController');
const { authenticate, authorize, departmentAccess } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes (Authentication required, authorization by department)
router.get('/', authenticate, stockTransactionController.getAllTransactions);
router.get('/stats', authenticate, stockTransactionController.getTransactionStats);
router.get('/:id', authenticate, stockTransactionController.getTransactionById);
router.get('/stock/:stockId', authenticate, stockTransactionController.getTransactionsByStock);
router.get('/user/:userId', authenticate, stockTransactionController.getTransactionsByUser);
router.get('/department/:departmentId', authenticate, departmentAccess, stockTransactionController.getTransactionsByDepartment);
router.get('/range/:startDate/:endDate', authenticate, stockTransactionController.getTransactionsByDateRange);
router.post('/', authenticate, validateBody(['stock_id', 'department_id', 'user_id', 'action_type', 'quantity']), stockTransactionController.createTransaction);

module.exports = router;
