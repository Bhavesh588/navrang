const roleModel = require('../models/roleModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all roles
  getAllRoles: asyncHandler(async (req, res) => {
    logger.info('Fetching all roles');
    const roles = await roleModel.getAllRoles();
    logger.info('Roles fetched successfully', { count: roles.length });
    res.json({
      success: true,
      data: roles,
      message: 'Roles fetched successfully'
    });
  }),

  // Get role by ID
  getRoleById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching role', { roleId: id });
    const role = await roleModel.getRoleById(id);
    
    if (!role) {
      logger.warn('Role not found', { roleId: id });
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    logger.info('Role fetched successfully', { roleId: id, roleName: role.name });
    res.json({
      success: true,
      data: role,
      message: 'Role fetched successfully'
    });
  }),

  // Create role
  createRole: asyncHandler(async (req, res) => {
    const { name } = req.body;
    
    logger.info('Creating new role', { roleName: name });
    
    if (!name) {
      logger.warn('Role creation failed - name is required');
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }
    
    const existing = await roleModel.getRoleByName(name);
    if (existing) {
      logger.warn('Role creation failed - role already exists', { roleName: name });
      return res.status(409).json({
        success: false,
        message: 'Role already exists'
      });
    }
    
    const role = await roleModel.createRole({ name });
    logger.info('Role created successfully', { roleId: role.id, roleName: name });
    
    res.status(201).json({
      success: true,
      data: role,
      message: 'Role created successfully'
    });
  }),

  // Update role
  updateRole: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    logger.info('Updating role', { roleId: id, newName: name });
    
    const role = await roleModel.getRoleById(id);
    if (!role) {
      logger.warn('Role update failed - role not found', { roleId: id });
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    if (name) {
      const existing = await roleModel.getRoleByName(name);
      if (existing && existing.id !== parseInt(id)) {
        logger.warn('Role update failed - name already exists', { roleId: id, newName: name });
        return res.status(409).json({
          success: false,
          message: 'Role name already exists'
        });
      }
    }
    
    const updated = await roleModel.updateRole(id, { name });
    logger.info('Role updated successfully', { roleId: id, newName: name });
    
    res.json({
      success: true,
      data: updated,
      message: 'Role updated successfully'
    });
  }),

  // Delete role
  deleteRole: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting role', { roleId: id });
    
    const role = await roleModel.getRoleById(id);
    if (!role) {
      logger.warn('Role deletion failed - role not found', { roleId: id });
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    let deleteResult = await roleModel.deleteRole(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Role deletion failed - role in use', { roleId: id });
      return res.status(409).json({
        success: false,
        code: "ROLE_IN_USE",
        message: "Cannot delete role because it is assigned to existing users"
      });
    }
    logger.info('Role deleted successfully', { roleId: id, roleName: role.name });
    
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  })
};
