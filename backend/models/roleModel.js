const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all roles
  async getAllRoles() {
    return db('roles').select('*');
  },

  // Get role by ID
  async getRoleById(id) {
    return db('roles').where({ id }).first();
  },

  // Get role by name
  async getRoleByName(name) {
    return db('roles').where({ name }).first();
  },

  // Create new role
  async createRole(data) {
    const [id] = await db('roles').insert(data);
    return this.getRoleById(id);
  },

  // Update role
  async updateRole(id, data) {
    await db('roles').where({ id }).update(data);
    return this.getRoleById(id);
  },

  // Delete role
  async deleteRole(id) {
    return db('roles').where({ id }).del();
  }
};
