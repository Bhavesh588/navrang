const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const userRoutes = require('./userRoutes');
const departmentRoutes = require('./departmentRoutes');
const userDepartmentRoutes = require('./userDepartmentRoutes');
const categoryRoutes = require('./categoryRoutes');
const receiptRoutes = require('./receiptRoutes');
const stockRoutes = require('./stockRoutes');
const stockTransactionRoutes = require('./stockTransactionRoutes');
const saleRoutes = require('./saleRoutes');
const notificationRoutes = require('./notificationRoutes');
const deviceTokenRoutes = require('./deviceTokenRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/user-departments', userDepartmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/receipts', receiptRoutes);
router.use('/stocks', stockRoutes);
router.use('/stock-transactions', stockTransactionRoutes);
router.use('/sales', saleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/device-tokens', deviceTokenRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date()
  });
});

module.exports = router;
