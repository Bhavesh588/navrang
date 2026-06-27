const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userDepartmentModel = require('../models/userDepartmentModel');
const userModel = require('../models/userModel');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validation');
const logger = require('../utils/logger');

// Routes
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.get('/:id/departments', authenticate, userController.getUserDepartments);
router.post('/', authenticate, authorize('admin'), validateBody(['name', 'email', 'password_hash', 'role_id']), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

/**
 * POST /api/v1/users/:id/departments
 * Assign departments to user (Admin only)
 */
router.post('/:id/departments', authenticate, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { department_ids } = req.body;
  try {

    // Validate input
    if (!Array.isArray(department_ids) || department_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'department_ids must be a non-empty array'
      });
    }

    // Verify user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete existing assignments
    await userDepartmentModel.deleteByUserId(id);

    // Create new assignments
    for (const deptId of department_ids) {
      await userDepartmentModel.createUserDepartment(id, deptId);
    }

    logger.info('User departments assigned', {
      userId: id,
      departmentIds: department_ids,
      adminId: req.user.id,
      requestId: req.id
    });

    res.json({
      success: true,
      message: `User assigned to ${department_ids.length} department(s)`,
      requestId: req.id
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      logger.warn('User department assignment failed - user in use', { userId: id });
      return res.status(409).json({
        success: false,
        code: "USER_IN_USE",
        message: "Cannot assign user to department because it is assigned to existing users"
      });
    }
    logger.error('Error assigning departments', { 
      error: error.message,
      requestId: req.id
    });
    res.status(500).json({
      success: false,
      message: 'Error assigning departments',
      requestId: req.id
    });
  }
});

module.exports = router;
