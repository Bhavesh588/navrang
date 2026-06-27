const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all departments
  async getAllDepartments() {
    return db('departments').select('*').orderBy('name');
  },

  // Get department by ID
  async getDepartmentById(id) {
    return db('departments').where({ id }).first();
  },

  // Get department by name
  async getDepartmentByName(name) {
    return db('departments').where({ name }).first();
  },

  // Create new department
  async createDepartment(data) {
    const [id] = await db('departments').insert(data);
    return this.getDepartmentById(id);
  },

  // Update department
  async updateDepartment(id, data) {
    await db('departments').where({ id }).update(data);
    return this.getDepartmentById(id);
  },

  // Delete department
  async deleteDepartment(id) {
    return db('departments').where({ id }).del();
  },

  // Get department with users count
  async getDepartmentStats(id) {
    const department = await this.getDepartmentById(id);
    const usersCount = await db('user_departments')
      .where({ department_id: id })
      .count('* as count')
      .first();
    
    return {
      ...department,
      users_count: usersCount.count
    };
  }
};
