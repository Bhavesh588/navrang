const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes
router.get('/', authenticate, receiptController.getAllReceipts);
router.get('/recent', authenticate, receiptController.getRecentReceipts);
router.get('/:id', authenticate, receiptController.getReceiptById);
router.get('/user/:userId', authenticate, receiptController.getReceiptsByUser);
router.post('/', authenticate, validateBody(['uploaded_by']), receiptController.createReceipt);
router.put('/:id', authenticate, authorize('admin'), receiptController.updateReceipt);
router.delete('/:id', authenticate, authorize('admin'), receiptController.deleteReceipt);

module.exports = router;
