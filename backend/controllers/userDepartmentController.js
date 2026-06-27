const userDepartmentModel = require('../models/userDepartmentModel');
const userModel = require('../models/userModel');
const departmentModel = require('../models/departmentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all user-department mappings
  getAllUserDepartments: asyncHandler(async (req, res) => {
    logger.info('Fetching all user-department mappings');
    const mappings = await userDepartmentModel.getAllUserDepartments();
    logger.info('User-department mappings fetched successfully', { count: mappings.length });
    res.json({
      success: true,
      data: mappings,
      message: 'User-department mappings fetched successfully'
    });
  }),

  // Get departments for a user
  getDepartmentsByUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    logger.info('Fetching departments for user', { userId });
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      logger.warn('User not found', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const departments = await userDepartmentModel.getDepartmentsByUserId(userId);
    logger.info('User departments fetched successfully', { userId, count: departments.length });
    
    res.json({
      success: true,
      data: departments,
      message: 'User departments fetched successfully'
    });
  }),

  // Get users in a department
  getUsersByDepartment: asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    
    logger.info('Fetching users in department', { departmentId });
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Department not found', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const users = await userDepartmentModel.getUsersByDepartmentId(departmentId);
    logger.info('Department users fetched successfully', { departmentId, count: users.length });
    
    res.json({
      success: true,
      data: users,
      message: 'Department users fetched successfully'
    });
  }),

  // Assign user to department
  assignUserToDepartment: asyncHandler(async (req, res) => {
    const { userId, departmentId } = req.body;
    
    logger.info('Assigning user to department', { userId, departmentId });
    
    if (!userId || !departmentId) {
      logger.warn('Assignment failed - missing userId or departmentId', { userId, departmentId });
      return res.status(400).json({
        success: false,
        message: 'User ID and Department ID are required'
      });
    }
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      logger.warn('User not found for assignment', { userId });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Department not found for assignment', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const isAlready = await userDepartmentModel.isUserInDepartment(userId, departmentId);
    if (isAlready) {
      logger.warn('User already assigned to department', { userId, departmentId });
      return res.status(409).json({
        success: false,
        message: 'User is already assigned to this department'
      });
    }
    
    const mapping = await userDepartmentModel.assignUserToDepartment(userId, departmentId);
    logger.info('User assigned to department successfully', { userId, departmentId });
    
    res.status(201).json({
      success: true,
      data: mapping,
      message: 'User assigned to department successfully'
    });
  }),

  // Remove user from department
  removeUserFromDepartment: asyncHandler(async (req, res) => {
    const { userId, departmentId } = req.body;
    
    logger.info('Removing user from department', { userId, departmentId });
    
    if (!userId || !departmentId) {
      logger.warn('Removal failed - missing userId or departmentId', { userId, departmentId });
      return res.status(400).json({
        success: false,
        message: 'User ID and Department ID are required'
      });
    }
    
    const isInDepartment = await userDepartmentModel.isUserInDepartment(userId, departmentId);
    if (!isInDepartment) {
      logger.warn('User not assigned to department', { userId, departmentId });
      return res.status(404).json({
        success: false,
        message: 'User is not assigned to this department'
      });
    }
    
    await userDepartmentModel.removeUserFromDepartment(userId, departmentId);
    logger.info('User removed from department successfully', { userId, departmentId });
    
    res.json({
      success: true,
      message: 'User removed from department successfully'
    });
  })
};
