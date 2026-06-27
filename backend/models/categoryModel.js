const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all categories
  async getAllCategories(departmentId = null) {
    let query = db('categories')
      .select('categories.*', 'departments.name as department_name')
      .leftJoin('departments', 'categories.department_id', 'departments.id');
    
    if (departmentId) {
      query = query.where({ department_id: departmentId });
    }
    
    return query.orderBy('categories.name');
  },

  // Get category by ID
  async getCategoryById(id) {
    return db('categories')
      .where({ 'categories.id': id })
      .select('categories.*', 'departments.name as department_name')
      .leftJoin('departments', 'categories.department_id', 'departments.id')
      .first();
  },

  // Get parent categories in a department
  async getParentCategories(departmentId) {
    return db('categories')
      .where({ department_id: departmentId, parent_id: null })
      .select('*')
      .orderBy('name');
  },

  // Get child categories for a parent
  async getChildCategories(parentId) {
    return db('categories')
      .where({ parent_id: parentId })
      .select('*')
      .orderBy('name');
  },

  // Create new category
  async createCategory(data) {
    const [id] = await db('categories').insert(data);
    return this.getCategoryById(id);
  },

  // Update category
  async updateCategory(id, data) {
    await db('categories').where({ id }).update(data);
    return this.getCategoryById(id);
  },

  // Delete category
  async deleteCategory(id) {
    return db('categories').where({ id }).del();
  },

  // Get categories for user's departments
  async getCategoriesByUserDepartments(userId) {
    let db_query = db('categories')
      .select('categories.*', 'departments.name as department_name')
      .leftJoin('departments', 'categories.department_id', 'departments.id')
      .orderBy('categories.name');

    if (userId !== 1) {
      db_query = db_query.whereIn('categories.department_id',
        db('user_departments')
          .where({ user_id: userId })
          .select('department_id')
      )
    }
    return db_query;
  },

  // Get categories with hierarchy
  async getCategoriesWithHierarchy(departmentId) {
    const parents = await this.getParentCategories(departmentId);
    
    return Promise.all(
      parents.map(async (parent) => ({
        ...parent,
        children: await this.getChildCategories(parent.id)
      }))
    );
  }
};
