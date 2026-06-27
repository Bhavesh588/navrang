const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticate, authorize, departmentAccess } = require('../middlewares/auth');

// Routes
router.get('/', authenticate, saleController.getAllSales);
router.get('/stats', authenticate, saleController.getSalesStats);
router.get('/top-categories', authenticate, saleController.getTopSellingCategories);
router.get('/department/:departmentId', authenticate, departmentAccess, saleController.getSalesByDepartment);
router.get('/category/:categoryId', authenticate, saleController.getSalesByCategory);
router.get('/user/:userId', authenticate, saleController.getSalesByUser);
router.get('/range/:startDate/:endDate', authenticate, saleController.getSalesByDateRange);
router.get('/group/:saleGroupId', authenticate, saleController.getSaleGroupById);
router.delete('/group/:saleGroupId', authenticate, saleController.deleteSaleGroup);
router.get('/:id', authenticate, saleController.getSaleById);
router.post('/', authenticate, saleController.createSale);
router.put('/:id', authenticate, saleController.updateSale);
router.delete('/:id', authenticate, authorize('admin'), saleController.deleteSale);

module.exports = router;
