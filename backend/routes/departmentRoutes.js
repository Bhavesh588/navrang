const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes
router.get('/', authenticate, departmentController.getAllDepartments);
router.get('/:id', authenticate, departmentController.getDepartmentById);
router.post('/', authenticate, authorize('admin'), validateBody(['name']), departmentController.createDepartment);
router.put('/:id', authenticate, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
