const categoryModel = require('../models/categoryModel');
const departmentModel = require('../models/departmentModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Get all categories
  getAllCategories: asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    logger.info('Fetching all categories', { departmentId });
    const categories = await categoryModel.getAllCategories(departmentId);
    logger.info('Categories fetched successfully', { count: categories.length, departmentId });
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    });
  }),

  // Get categories for logged-in user's departments
  getCategoriesByUserDepartments: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    logger.info('Fetching categories for user departments', { userId });
    const categories = await categoryModel.getCategoriesByUserDepartments(userId);
    logger.info('User department categories fetched successfully', { count: categories.length, userId });
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    });
  }),

  // Get category by ID
  getCategoryById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching category', { categoryId: id });
    const category = await categoryModel.getCategoryById(id);
    
    if (!category) {
      logger.warn('Category not found', { categoryId: id });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    logger.info('Category fetched successfully', { categoryId: id, categoryName: category.name });
    res.json({
      success: true,
      data: category,
      message: 'Category fetched successfully'
    });
  }),

  // Create category
  createCategory: asyncHandler(async (req, res) => {
    const { name, department_id, parent_id } = req.body;
    
    logger.info('Creating new category', { name, department_id, parent_id });
    
    if (!name || !department_id) {
      logger.warn('Category creation failed - missing required fields', { name, department_id });
      return res.status(400).json({
        success: false,
        message: 'Name and department ID are required'
      });
    }
    
    const department = await departmentModel.getDepartmentById(department_id);
    if (!department) {
      logger.warn('Category creation failed - department not found', { department_id });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    if (parent_id) {
      const parent = await categoryModel.getCategoryById(parent_id);
      if (!parent) {
        logger.warn('Category creation failed - parent category not found', { parent_id });
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }
    
    const category = await categoryModel.createCategory({
      name,
      department_id,
      parent_id: parent_id || null
    });
    
    logger.info('Category created successfully', { categoryId: category.id, name, department_id });
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  }),

  // Update category
  updateCategory: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, parent_id } = req.body;
    
    logger.info('Updating category', { categoryId: id, name, parent_id });
    
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
      logger.warn('Category update failed - category not found', { categoryId: id });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    if (parent_id) {
      const parent = await categoryModel.getCategoryById(parent_id);
      if (!parent) {
        logger.warn('Category update failed - parent category not found', { categoryId: id, parent_id });
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (parent_id !== undefined) updateData.parent_id = parent_id || null;
    
    const updated = await categoryModel.updateCategory(id, updateData);
    
    logger.info('Category updated successfully', { categoryId: id, name: updated.name });
    
    res.json({
      success: true,
      data: updated,
      message: 'Category updated successfully'
    });
  }),

  // Delete category
  deleteCategory: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting category', { categoryId: id });
    
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
      logger.warn('Category deletion failed - category not found', { categoryId: id });
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const deleteResult = await categoryModel.deleteCategory(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Category deletion failed - category in use', { categoryId: id });
      return res.status(409).json({
        success: false,
        code: "CATEGORY_IN_USE",
        message: "Cannot delete category because it is assigned to existing products"
      });
    }
    
    logger.info('Category deleted successfully', { categoryId: id, name: category.name });
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  }),

  // Get categories with hierarchy
  getCategoriesHierarchy: asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    
    logger.info('Fetching category hierarchy', { departmentId });
    
    const department = await departmentModel.getDepartmentById(departmentId);
    if (!department) {
      logger.warn('Category hierarchy fetch failed - department not found', { departmentId });
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    const hierarchy = await categoryModel.getCategoriesWithHierarchy(departmentId);
    
    logger.info('Category hierarchy fetched successfully', { departmentId, count: hierarchy.length });
    
    res.json({
      success: true,
      data: hierarchy,
      message: 'Category hierarchy fetched successfully'
    });
  })
};
