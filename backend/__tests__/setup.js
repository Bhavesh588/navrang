process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('./app');
const knex = require('knex');
const dbConfig = require('../config/dbConfig');

// Test database configuration
const testDb = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_TEST_HOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQL_TEST_PORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQL_TEST_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_TEST_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_TEST_DATABASE || process.env.DB_NAME || 'navrang_test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
});


beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.warn.mockRestore();
  console.log.mockRestore();
});

module.exports = {
  app,
  request,
  testDb,
  
  // Test data generators
  generateUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role_id: 1,
    ...overrides
  }),

  generateDepartment: (overrides = {}) => ({
    name: 'Test Department',
    description: 'Test Department Description',
    ...overrides
  }),

  generateCategory: (overrides = {}) => ({
    name: 'Test Category',
    description: 'Test Category Description',
    ...overrides
  }),

  generateStock: (overrides = {}) => ({
    name: 'Test Stock Item',
    category_id: 1,
    quantity: 100,
    department_id: 1,
    ...overrides
  }),

  generateSale: (overrides = {}) => ({
    stock_id: 1,
    quantity: 10,
    sale_date: new Date(),
    user_id: 1,
    ...overrides
  }),

  // Helper functions
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  cleanupDatabase: async () => {
    try {
      await testDb('sales').del();
      await testDb('stock_transactions').del();
      await testDb('stocks').del();
      await testDb('user_departments').del();
      await testDb('categories').del();
      await testDb('departments').del();
      await testDb('users').del();
      await testDb('notifications').del();
    } catch (error) {
      console.log('Cleanup error (may be expected):', error.message);
    }
  },

  seedDatabase: async () => {
    try {
      // Seed roles first
      await testDb('roles').insert([
        { id: 1, role_name: 'admin' },
        { id: 2, role_name: 'user' }
      ]);

      // Seed users
      await testDb('users').insert([
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          password: '$2a$10$8T7XyzxwqeVVlesIxxml7.sVowNMfG2ZdplzK5E/tQAMa7Sb4dITK',
          role_id: 1
        },
        {
          id: 2,
          name: 'Regular User',
          email: 'user@example.com',
          password: '$2a$10$8T7XyzxwqeVVlesIxxml7.sVowNMfG2ZdplzK5E/tQAMa7Sb4dITK',
          role_id: 2
        }
      ]);

      // Seed departments
      await testDb('departments').insert([
        { id: 1, name: 'Sales Department', description: 'Sales' },
        { id: 2, name: 'Inventory Department', description: 'Inventory' }
      ]);

      // Seed categories
      await testDb('categories').insert([
        { id: 1, name: 'Category 1', description: 'Test Category 1' },
        { id: 2, name: 'Category 2', description: 'Test Category 2' }
      ]);

      // Seed user_departments
      await testDb('user_departments').insert([
        { user_id: 1, department_id: 1 },
        { user_id: 1, department_id: 2 },
        { user_id: 2, department_id: 1 }
      ]);

      // Seed stocks
      await testDb('stocks').insert([
        {
          id: 1,
          name: 'Stock Item 1',
          category_id: 1,
          quantity: 100,
          department_id: 1
        },
        {
          id: 2,
          name: 'Stock Item 2',
          category_id: 2,
          quantity: 50,
          department_id: 2
        }
      ]);
    } catch (error) {
      console.log('Seed error (may be expected):', error.message);
    }
  },

  getValidJWT: async () => {
    // Returns a valid JWT token for testing
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    if (response.body.token) {
      console.log(response.body)
      return response.body.token;
    }
    return null;
  }
};
