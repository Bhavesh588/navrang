const roleModel = require('../models/roleModel');
const userModel = require('../models/userModel');
const userDepartmentModel = require('../models/userDepartmentModel');

// Check if user is admin
const isAdmin = (userRole) => {
  return userRole && userRole.toLowerCase() === 'admin';
};

// Check if user belongs to department
const userBelongsToDepartment = async (userId, departmentId) => {
  return await userDepartmentModel.isUserInDepartment(userId, departmentId);
};

// Get user accessible departments
const getUserDepartments = async (userId) => {
  return await userDepartmentModel.getDepartmentsByUserId(userId);
};

// Permission check middleware
const checkPermission = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role_name;

      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if user is admin (admins have full access)
      if (isAdmin(userRole)) {
        return next();
      }

      // If specific role is required
      if (requiredRole && userRole !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

// Permission check for department resource access
const checkDepartmentAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role_name;
    const departmentId = req.params.departmentId || req.body.department_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Admins have access to all departments
    if (isAdmin(userRole)) {
      return next();
    }

    // Regular users can only access their assigned departments
    if (departmentId) {
      const hasAccess = await userBelongsToDepartment(userId, departmentId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this department'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

// Permission check for operations
const canCreateInDepartment = async (userId, departmentId) => {
  const user = await userModel.getUserById(userId);
  if (isAdmin(user.role_name)) return true;
  return await userBelongsToDepartment(userId, departmentId);
};

const canModifyResource = async (userId, resourceDepartmentId) => {
  const user = await userModel.getUserById(userId);
  if (isAdmin(user.role_name)) return true;
  return await userBelongsToDepartment(userId, resourceDepartmentId);
};

module.exports = {
  isAdmin,
  userBelongsToDepartment,
  getUserDepartments,
  checkPermission,
  checkDepartmentAccess,
  canCreateInDepartment,
  canModifyResource
};
