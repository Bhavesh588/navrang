const express = require('express');
const router = express.Router();
const userDepartmentController = require('../controllers/userDepartmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');

// Routes
router.get('/', authenticate, authorize('admin'), userDepartmentController.getAllUserDepartments);
router.get('/user/:userId', authenticate, userDepartmentController.getDepartmentsByUser);
router.get('/department/:departmentId', authenticate, userDepartmentController.getUsersByDepartment);
router.post('/assign', authenticate, authorize('admin'), validateBody(['userId', 'departmentId']), userDepartmentController.assignUserToDepartment);
router.post('/remove', authenticate, authorize('admin'), validateBody(['userId', 'departmentId']), userDepartmentController.removeUserFromDepartment);

module.exports = router;
