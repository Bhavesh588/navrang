const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all users
  async getAllUsers() {
    try {
      return await db('users')
        .select('users.*', 'roles.name as role_name')
        .leftJoin('roles', 'users.role_id', 'roles.id');
    } catch (error) {
      logger.error('Error fetching all users', { error: error.message });
      throw error;
    }
  },

  // Get all admin users
  async getAdmins() {
    try {
      return await db('users')
        .select('users.*', 'roles.name as role_name')
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .where('roles.name', 'admin');
    } catch (error) {
      logger.error('Error fetching admin users', { error: error.message });
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      return await db('users')
        .where({ 'users.id': id })
        .select('users.*', 'roles.name as role_name')
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .first();
    } catch (error) {
      logger.error('Error fetching user by ID', { userId: id, error: error.message });
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      return await db('users')
        .where({ email })
        .select('users.*', 'roles.name as role_name')
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .first();
    } catch (error) {
      logger.error('Error fetching user by email', { email, error: error.message });
      throw error;
    }
  },

  // Create new user
  async createUser(data) {
    try {
      const [id] = await db('users').insert(data);
      logger.info('User created successfully', { userId: id, email: data.email });
      return this.getUserById(id);
    } catch (error) {
      logger.error('Error creating user', { email: data.email, error: error.message });
      throw error;
    }
  },

  // Update user
  async updateUser(id, data) {
    try {
      await db('users').where({ id }).update(data);
      logger.info('User updated successfully', { userId: id });
      return this.getUserById(id);
    } catch (error) {
      logger.error('Error updating user', { userId: id, error: error.message });
      throw error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const result = await db('users').where({ id }).del();
      logger.info('User deleted successfully', { userId: id });
      return result;
    } catch (error) {
      logger.error('Error deleting user', { userId: id, error: error.message });
      throw error;
    }
  },

  // Get user by ID (without joins for password verification)
  async getUserByIdRaw(id) {
    try {
      return await db('users').where({ id }).first();
    } catch (error) {
      logger.error('Error fetching raw user data', { userId: id, error: error.message });
      throw error;
    }
  },

  // Check if user is active
  async isUserActive(id) {
    try {
      const user = await db('users').where({ id }).select('is_active').first();
      return user ? user.is_active : false;
    } catch (error) {
      logger.error('Error checking user active status', { userId: id, error: error.message });
      throw error;
    }
  }
};
