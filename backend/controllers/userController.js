const userModel = require('../models/userModel');
const userDepartmentModel = require('../models/userDepartmentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all users
  getAllUsers: asyncHandler(async (req, res) => {
    logger.info('Fetching all users');
    const users = await userModel.getAllUsers();
    logger.info('Users fetched successfully', { count: users.length });
    res.json({
      success: true,
      data: users,
      message: 'Users fetched successfully'
    });
  }),

  // Get user by ID
  getUserById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching user', { userId: id });
    const user = await userModel.getUserById(id);
    
    if (!user) {
      logger.warn('User not found', { userId: id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user departments
    const departments = await userDepartmentModel.getDepartmentsByUserId(id);
    
    logger.info('User fetched successfully', { userId: id, email: user.email, departmentsCount: departments.length });
    res.json({
      success: true,
      data: {
        ...user,
        departments
      },
      message: 'User fetched successfully'
    });
  }),

  // Create user
  createUser: asyncHandler(async (req, res) => {
    const { name, email, password_hash, role_id } = req.body;
    
    logger.info('Creating new user', { name, email, role_id });
    
    if (!name || !email || !password_hash || !role_id) {
      logger.warn('User creation failed - missing required fields', { name, email, password_hash, role_id });
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }
    
    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      logger.warn('User creation failed - email already exists', { email });
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    const user = await userModel.createUser({
      name,
      email,
      password_hash,
      role_id,
      is_active: true
    });
    
    logger.info('User created successfully', { userId: user.id, email, name });
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  }),

  // Update user
  updateUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role_id, is_active } = req.body;
    
    logger.info('Updating user', { userId: id, name, email, role_id });
    
    const user = await userModel.getUserById(id);
    if (!user) {
      logger.warn('User update failed - user not found', { userId: id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (email && email !== user.email) {
      const existing = await userModel.getUserByEmail(email);
      if (existing) {
        logger.warn('User update failed - email already exists', { userId: id, email });
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role_id) updateData.role_id = role_id;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    const updated = await userModel.updateUser(id, updateData);
    logger.info('User updated successfully', { userId: id, email: updated.email });
    
    res.json({
      success: true,
      data: updated,
      message: 'User updated successfully'
    });
  }),

  // Delete user
  deleteUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting user', { userId: id });
    
    const user = await userModel.getUserById(id);
    if (!user) {
      logger.warn('User deletion failed - user not found', { userId: id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const deleteResult = await userModel.deleteUser(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('User deletion failed - user in use', { userId: id });
      return res.status(409).json({
        success: false,
        code: "USER_IN_USE",
        message: "Cannot delete user because it is assigned to existing sales or stocks"
      });
    }
    logger.info('User deleted successfully', { userId: id, email: user.email });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }),

  // Get user departments
  getUserDepartments: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Fetching user departments', { userId: id });
    
    const user = await userModel.getUserById(id);
    if (!user) {
      logger.warn('User departments fetch failed - user not found', { userId: id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const departments = await userDepartmentModel.getDepartmentsByUserId(id);
    logger.info('User departments fetched successfully', { userId: id, departmentsCount: departments.length });
    
    res.json({
      success: true,
      data: departments,
      message: 'User departments fetched successfully'
    });
  })
};
