const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes (Admin only)
router.get('/', authenticate, authorize('admin'), roleController.getAllRoles);
router.get('/:id', authenticate, authorize('admin'), roleController.getRoleById);
router.post('/', authenticate, authorize('admin'), validateBody(['name']), roleController.createRole);
router.put('/:id', authenticate, authorize('admin'), roleController.updateRole);
router.delete('/:id', authenticate, authorize('admin'), roleController.deleteRole);

module.exports = router;
