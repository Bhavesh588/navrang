const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Create a new user-department mapping
  async createUserDepartment(userId, departmentId) {
    const existing = await db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .first();
    
    if (existing) {
      logger.warn('User is already assigned to this department', { userId, departmentId });
      return existing;
    }
    
    const [id] = await db('user_departments').insert({
      user_id: userId,
      department_id: departmentId
    });
    
    return db('user_departments').where({ id }).first();
  },

  // Get all user-department mappings
  async getAllUserDepartments() {
    return db('user_departments')
      .select(
        'user_departments.*',
        'users.name as user_name',
        'users.email as user_email',
        'departments.name as department_name'
      )
      .leftJoin('users', 'user_departments.user_id', 'users.id')
      .leftJoin('departments', 'user_departments.department_id', 'departments.id');
  },

  // Get departments for a user
  async getDepartmentsByUserId(userId) {
    return db('user_departments')
      .select('departments.*')
      .where({ user_id: userId })
      .join('departments', 'user_departments.department_id', 'departments.id');
  },

  // Get users in a department
  async getUsersByDepartmentId(departmentId) {
    return db('user_departments')
      .select('users.*')
      .where({ department_id: departmentId })
      .join('users', 'user_departments.user_id', 'users.id');
  },

  // Assign user to department
  async assignUserToDepartment(userId, departmentId) {
    const existing = await db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .first();
    
    if (existing) return existing;
    
    const [id] = await db('user_departments').insert({
      user_id: userId,
      department_id: departmentId
    });
    
    return db('user_departments').where({ id }).first();
  },

  // Remove user from department
  async removeUserFromDepartment(userId, departmentId) {
    return db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .del();
  },

  // Check if user belongs to department
  async isUserInDepartment(userId, departmentId) {
    const result = await db('user_departments')
      .where({ user_id: userId, department_id: departmentId })
      .first();
      return !!result;
  },

  // Delete all department assignments for a user
  async deleteByUserId(userId) {
    return db('user_departments')
      .where({ user_id: userId })
      .del();
  }
};
