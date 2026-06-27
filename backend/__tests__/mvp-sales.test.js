const path = require('path');
const { app, request } = require('./setup');
const db = require('../config/dbConfig');

const ADMIN_TOKEN = 'Bearer fake_token';
const EMPLOYEE_TOKEN = 'Bearer fake_employee_token';
const OTHER_EMPLOYEE_TOKEN = 'Bearer fake_other_employee_token';

async function resetDatabase() {
  await db.raw('SET FOREIGN_KEY_CHECKS = 0');
  await db('notification_queue').del();
  await db('device_tokens').del();
  await db('notifications').del();
  await db('sales').del();
  await db('stock_transactions').del();
  await db('stocks').del();
  await db('user_departments').del();
  await db('categories').del();
  await db('departments').del();
  await db('users').del();
  await db('roles').del();
  await db.raw('SET FOREIGN_KEY_CHECKS = 1');
}

async function seedMvpData() {
  const now = new Date();

  await db('roles').insert([
    { id: 1, name: 'admin', created_at: now, updated_at: now },
    { id: 2, name: 'employee', created_at: now, updated_at: now }
  ]);

  await db('users').insert([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@navrang.com',
      password_hash: 'test-password',
      role_id: 1,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      name: 'Employee User',
      email: 'employee@navrang.com',
      password_hash: 'test-password',
      role_id: 2,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      name: 'Other Employee',
      email: 'other.employee@navrang.com',
      password_hash: 'test-password',
      role_id: 2,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ]);

  await db('departments').insert([
    { id: 1, name: 'Sales Department', description: 'Sales test department', created_at: now, updated_at: now },
    { id: 2, name: 'Inventory Department', description: 'Inventory test department', created_at: now, updated_at: now }
  ]);

  await db('categories').insert([
    { id: 1, department_id: 1, name: 'Saree', created_at: now, updated_at: now },
    { id: 2, department_id: 2, name: 'Suit', created_at: now, updated_at: now }
  ]);

  await db('user_departments').insert([
    { user_id: 1, department_id: 1, created_at: now, updated_at: now },
    { user_id: 1, department_id: 2, created_at: now, updated_at: now },
    { user_id: 2, department_id: 1, created_at: now, updated_at: now },
    { user_id: 3, department_id: 1, created_at: now, updated_at: now }
  ]);

  await db('stocks').insert([
    {
      id: 1,
      name: 'Blue Saree',
      department_id: 1,
      category_id: 1,
      current_quantity: 100,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      name: 'Red Suit',
      department_id: 2,
      category_id: 2,
      current_quantity: 50,
      created_at: now,
      updated_at: now
    }
  ]);

  await db('device_tokens').insert({
    id: 1,
    user_id: 1,
    platform: 'expo',
    push_token: 'ExponentPushToken[test-admin]',
    is_active: true,
    last_seen_at: now,
    created_at: now,
    updated_at: now
  });
}

async function getStockQuantity(stockId) {
  const stock = await db('stocks').where({ id: stockId }).first();
  return Number(stock.current_quantity);
}

describe('MVP Sales Flow', () => {
  beforeAll(async () => {
    await db.migrate.latest({
      directory: path.join(__dirname, '..', 'database', 'migrations')
    });
  });

  beforeEach(async () => {
    await resetDatabase();
    await seedMvpData();
  });

  afterAll(async () => {
    await resetDatabase();
    await db.destroy();
  });

  it('rejects sale creation without login', async () => {
    const response = await request(app)
      .post('/api/v1/sales')
      .send({
        stock_id: 1,
        quantity: 1,
        amount: 100
      });

    expect(response.status).toBe(401);
  });

  it('creates one grouped sale with two stock rows, deducts stock, derives category and department, and stores one receipt URL', async () => {
    const receiptUrl = 'https://example-bucket.s3.ap-south-1.amazonaws.com/receipts/mvp-test.jpg';

    const response = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', ADMIN_TOKEN)
      .send({
        receipt_url: receiptUrl,
        items: [
          {
            stock_id: 1,
            quantity: 3,
            amount: 300,
            description: 'First item in grouped sale'
          },
          {
            stock_id: 2,
            quantity: 4,
            amount: 800,
            description: 'Second item in grouped sale'
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.sale_group_id).toBeTruthy();
    expect(response.body.data.sales).toHaveLength(2);

    const [firstSale, secondSale] = response.body.data.sales;
    expect(firstSale.sale_group_id).toBe(response.body.data.sale_group_id);
    expect(secondSale.sale_group_id).toBe(response.body.data.sale_group_id);
    expect(firstSale.stock_id).toBe(1);
    expect(firstSale.department_id).toBe(1);
    expect(firstSale.category_id).toBe(1);
    expect(firstSale.receipt_url).toBe(receiptUrl);
    expect(secondSale.stock_id).toBe(2);
    expect(secondSale.department_id).toBe(2);
    expect(secondSale.category_id).toBe(2);
    expect(secondSale.receipt_url).toBe(receiptUrl);

    expect(await getStockQuantity(1)).toBe(97);
    expect(await getStockQuantity(2)).toBe(46);

    const saleRows = await db('sales').where({ sale_group_id: response.body.data.sale_group_id });
    expect(saleRows).toHaveLength(2);

    const stockTransactions = await db('stock_transactions').where({ action_type: 'REMOVE' });
    expect(stockTransactions).toHaveLength(2);

    const notifications = await db('notifications').where({ type: 'SALE_CREATED' });
    expect(notifications).toHaveLength(0);

    const detailsResponse = await request(app)
      .get(`/api/v1/sales/group/${response.body.data.sale_group_id}`)
      .set('Authorization', ADMIN_TOKEN);

    expect(detailsResponse.status).toBe(200);
    expect(detailsResponse.body.data.sales).toHaveLength(2);
    expect(detailsResponse.body.data.total_amount).toBe(1100);
    expect(detailsResponse.body.data.total_quantity).toBe(7);
    expect(detailsResponse.body.data.receipt_url).toBe(receiptUrl);
  });

  it('creates a single-stock sale from the legacy payload shape used by one-item forms', async () => {
    const response = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', ADMIN_TOKEN)
      .send({
        stock_id: 1,
        quantity: 2,
        amount: 250,
        description: 'Single stock sale'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.sales).toHaveLength(1);
    expect(response.body.data.sales[0].sale_group_id).toBe(response.body.data.sale_group_id);
    expect(await getStockQuantity(1)).toBe(98);
  });

  it('sends a notification to admins when an employee creates a sale', async () => {
    const response = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', EMPLOYEE_TOKEN)
      .send({
        items: [
          {
            stock_id: 1,
            quantity: 2,
            amount: 500,
            description: 'Employee sale'
          }
        ]
      });

    expect(response.status).toBe(201);

    const notifications = await db('notifications').where({ type: 'SALE_CREATED' });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toContain('New sale of Rs 500');

    const queueItems = await db('notification_queue').where({ notification_id: notifications[0].id });
    expect(queueItems).toHaveLength(1);
    expect(queueItems[0].push_token).toBe('ExponentPushToken[test-admin]');
  });

  it('blocks an employee from selling stock outside their departments', async () => {
    const response = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', EMPLOYEE_TOKEN)
      .send({
        items: [
          {
            stock_id: 2,
            quantity: 1,
            amount: 100,
            description: 'Unauthorized department stock'
          }
        ]
      });

    expect(response.status).toBe(403);
    expect(await getStockQuantity(2)).toBe(50);
    expect(await db('sales')).toHaveLength(0);
  });

  it('rejects insufficient stock and rolls back every item in the sale group', async () => {
    const response = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', ADMIN_TOKEN)
      .send({
        items: [
          {
            stock_id: 1,
            quantity: 5,
            amount: 500,
            description: 'Would be valid'
          },
          {
            stock_id: 2,
            quantity: 999,
            amount: 9990,
            description: 'Too much stock'
          }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient stock quantity');
    expect(await getStockQuantity(1)).toBe(100);
    expect(await getStockQuantity(2)).toBe(50);
    expect(await db('sales')).toHaveLength(0);
    expect(await db('stock_transactions')).toHaveLength(0);
  });

  it('removes a sale group and restores stock to each selected stock item', async () => {
    const createResponse = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', ADMIN_TOKEN)
      .send({
        items: [
          { stock_id: 1, quantity: 6, amount: 600, description: 'Remove test 1' },
          { stock_id: 2, quantity: 7, amount: 700, description: 'Remove test 2' }
        ]
      });

    expect(createResponse.status).toBe(201);
    expect(await getStockQuantity(1)).toBe(94);
    expect(await getStockQuantity(2)).toBe(43);

    const saleGroupId = createResponse.body.data.sale_group_id;
    const deleteResponse = await request(app)
      .delete(`/api/v1/sales/group/${saleGroupId}`)
      .set('Authorization', ADMIN_TOKEN);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.restored_items).toBe(2);
    expect(await getStockQuantity(1)).toBe(100);
    expect(await getStockQuantity(2)).toBe(50);
    expect(await db('sales').where({ sale_group_id: saleGroupId })).toHaveLength(0);

    const restoreTransactions = await db('stock_transactions')
      .where({ action_type: 'ADD' })
      .where('remarks', `Sale removed: ${saleGroupId}`);
    expect(restoreTransactions).toHaveLength(2);

    const detailsResponse = await request(app)
      .get(`/api/v1/sales/group/${saleGroupId}`)
      .set('Authorization', ADMIN_TOKEN);
    expect(detailsResponse.status).toBe(404);
  });

  it('allows admins to remove employee sale groups but blocks other employees', async () => {
    const createResponse = await request(app)
      .post('/api/v1/sales')
      .set('Authorization', EMPLOYEE_TOKEN)
      .send({
        items: [
          { stock_id: 1, quantity: 3, amount: 300, description: 'Employee-owned sale' }
        ]
      });

    expect(createResponse.status).toBe(201);
    const saleGroupId = createResponse.body.data.sale_group_id;

    const blockedDelete = await request(app)
      .delete(`/api/v1/sales/group/${saleGroupId}`)
      .set('Authorization', OTHER_EMPLOYEE_TOKEN);

    expect(blockedDelete.status).toBe(403);
    expect(await getStockQuantity(1)).toBe(97);
    expect(await db('sales').where({ sale_group_id: saleGroupId })).toHaveLength(1);

    const adminDelete = await request(app)
      .delete(`/api/v1/sales/group/${saleGroupId}`)
      .set('Authorization', ADMIN_TOKEN);

    expect(adminDelete.status).toBe(200);
    expect(await getStockQuantity(1)).toBe(100);
    expect(await db('sales').where({ sale_group_id: saleGroupId })).toHaveLength(0);
  });
});
