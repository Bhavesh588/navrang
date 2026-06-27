const departmentModel = require('../models/departmentModel');
const userDepartmentModel = require('../models/userDepartmentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');
const { isAdmin } = require('../utils/authorization');

module.exports = {
  // Get all departments
  getAllDepartments: asyncHandler(async (req, res) => {
    logger.info('Fetching departments', { userId: req.user?.id, userRole: req.user?.role_name });
    
    let departments;

    // Admin sees all departments
    if (isAdmin(req.user.role_name)) {
      departments = await departmentModel.getAllDepartments();
      logger.info('Admin fetched all departments', {
        userId: req.user.id,
        count: departments.length
      });
    } else {
      // Regular user sees only assigned departments
      departments = await userDepartmentModel.getDepartmentsByUserId(req.user.id);
      logger.info('User fetched assigned departments', {
        userId: req.user.id,
        count: departments.length
      });
    }

    res.json({
      success: true,
      data: departments,
      message: 'Departments retrieved successfully'
    });
  }),

  // Get department by ID
  getDepartmentById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching department', { departmentId: id });
    const department = await departmentModel.getDepartmentById(id);
    
    if (!department) {
      logger.warn('Department not found', { departmentId: id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const stats = await departmentModel.getDepartmentStats(id);
    logger.info('Department fetched successfully', { departmentId: id, departmentName: department.name });
    
    res.json({
      success: true,
      data: stats,
      message: 'Department fetched successfully'
    });
  }),

  // Create department
  createDepartment: asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    logger.info('Creating new department', { name });
    
    if (!name) {
      logger.warn('Department creation failed - name is required');
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }
    
    const existing = await departmentModel.getDepartmentByName(name);
    if (existing) {
      logger.warn('Department creation failed - already exists', { name });
      return res.status(409).json({
        success: false,
        message: 'Department already exists'
      });
    }
    
    const department = await departmentModel.createDepartment({
      name,
      description: description || null
    });
    
    logger.info('Department created successfully', { departmentId: department.id, name });
    
    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully'
    });
  }),

  // Update department
  updateDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    logger.info('Updating department', { departmentId: id, name });
    
    const department = await departmentModel.getDepartmentById(id);
    if (!department) {
      logger.warn('Department update failed - not found', { departmentId: id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    if (name && name !== department.name) {
      const existing = await departmentModel.getDepartmentByName(name);
      if (existing) {
        logger.warn('Department update failed - name already exists', { departmentId: id, name });
        return res.status(409).json({
          success: false,
          message: 'Department name already exists'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const updated = await departmentModel.updateDepartment(id, updateData);
    logger.info('Department updated successfully', { departmentId: id, name: updated.name });
    
    res.json({
      success: true,
      data: updated,
      message: 'Department updated successfully'
    });
  }),

  // Delete department
  deleteDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting department', { departmentId: id });
    
    const department = await departmentModel.getDepartmentById(id);
    if (!department) {
      logger.warn('Department deletion failed - not found', { departmentId: id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const deleteResult = await departmentModel.deleteDepartment(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Department deletion failed - department in use', { departmentId: id });
      return res.status(409).json({
        success: false,
        code: "DEPARTMENT_IN_USE",
        message: "Cannot delete department because it is assigned to existing categories"
      });
    }
    logger.info('Department deleted successfully', { departmentId: id, name: department.name });
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  })
};
