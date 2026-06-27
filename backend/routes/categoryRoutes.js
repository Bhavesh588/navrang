const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes
router.get('/', authenticate, categoryController.getAllCategories);
router.get('/by-user', authenticate, categoryController.getCategoriesByUserDepartments);
router.get('/:id', authenticate, categoryController.getCategoryById);
router.get('/hierarchy/:departmentId', authenticate, categoryController.getCategoriesHierarchy);
router.post('/', authenticate, authorize('admin'), validateBody(['name']), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
