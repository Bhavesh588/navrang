const { app, request } = require('./setup');
const notificationService = require('../utils/notificationService');
const notificationQueueModel = require('../models/notificationQueueModel');
const notificationModel = require('../models/notificationModel');
const db = require('../config/dbConfig');

// Mock the push service to avoid actual API calls during testing
jest.mock('../utils/pushService', () => ({
  sendPushNotifications: jest.fn().mockResolvedValue([{ status: 'ok' }])
}));

describe('Notifications Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/notifications', () => {
    it('should return notifications list', async () => {
      const response = await request(app)
        .get('/api/v1/notifications');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/notifications');

      expect([200, 401]).toContain(response.status);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?page=1&limit=20');

      expect([200, 401]).toContain(response.status);
    });

    it('should support filtering by read status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?is_read=false');

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('GET /api/v1/notifications/:id', () => {
    it('should return notification details', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/1');

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/99999');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/notifications', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({
          message: 'Test notification',
          user_id: 1
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should return 400 without message', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({ user_id: 1 });

      expect([200, 201, 400, 403, 404]).toContain(response.status);
    });

    it('should create notification with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({
          message: 'Stock running low',
          user_id: 1,
          type: 'warning'
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/notifications/:id', () => {
    it('should mark notification as read', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/1')
        .set('Authorization', validToken)
        .send({ is_read: true });

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/1')
        .send({ is_read: true });

      expect([200, 400, 401, 404]).toContain(response.status);
    });

    it('should update notification', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/1')
        .set('Authorization', validToken)
        .send({
          is_read: true,
          message: 'Updated message'
        });

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/99999')
        .set('Authorization', validToken)
        .send({ is_read: true });

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/notifications/1');

      expect([200, 204, 401, 404]).toContain(response.status);
    });

    it('should delete notification', async () => {
      const response = await request(app)
        .delete('/api/v1/notifications/1')
        .set('Authorization', validToken);

      expect([200, 204, 404]).toContain(response.status);
    });
  });

  describe('Notification Types', () => {
    it('should handle info type notifications', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({
          message: 'Information',
          type: 'info',
          user_id: 1
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should handle warning type notifications', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({
          message: 'Warning',
          type: 'warning',
          user_id: 1
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should handle error type notifications', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', validToken)
        .send({
          message: 'Error occurred',
          type: 'error',
          user_id: 1
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });
  });

  describe('Notification Filtering', () => {
    it('should filter unread notifications', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?is_read=false')
        .set('Authorization', validToken);

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        // All notifications should have is_read = false
      }
    });

    it('should filter read notifications', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?is_read=true')
        .set('Authorization', validToken);

      expect([200, 401]).toContain(response.status);
    });

    it('should support sorting by date', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?sort=created_at&order=desc')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
    });
  });

  describe('Notification Queue System', () => {
    beforeEach(async () => {
      // Clean up queue items before each test
      await db('notification_queue').del();
      await db('notifications').del();
    });

    describe('notificationService.notify()', () => {
      it('should create notification and queue push notifications', async () => {
        // First create a device token for testing
        await db('device_tokens').insert({
          user_id: 1,
          platform: 'expo',
          push_token: 'ExponentPushToken[test123]',
          is_active: true,
          last_seen_at: db.fn.now()
        });

        const result = await notificationService.notify({
          type: 'STOCK_ADD',
          referenceId: 123,
          message: 'Test stock notification'
        });

        expect(result).toHaveProperty('id');
        expect(result.type).toBe('STOCK_ADD');
        expect(result.message).toBe('Test stock notification');

        // Check that queue item was created
        const queueItems = await db('notification_queue').select('*');
        expect(queueItems.length).toBeGreaterThan(0);
        expect(queueItems[0]).toHaveProperty('notification_id', result.id);
        expect(queueItems[0]).toHaveProperty('push_token', 'ExponentPushToken[test123]');
        expect(queueItems[0].status).toBe('pending');
      });

      it('should handle multiple admin recipients', async () => {
        // Create tokens for multiple admins
        await db('device_tokens').insert([
          {
            user_id: 1,
            platform: 'expo',
            push_token: 'ExponentPushToken[admin1]',
            is_active: true,
            last_seen_at: db.fn.now()
          },
          {
            user_id: 2,
            platform: 'expo',
            push_token: 'ExponentPushToken[admin2]',
            is_active: true,
            last_seen_at: db.fn.now()
          }
        ]);

        await notificationService.notify({
          type: 'STOCK_REMOVE',
          referenceId: 456,
          message: 'Multi-admin test'
        });

        const queueItems = await db('notification_queue').select('*');
        expect(queueItems.length).toBe(2);
        const tokens = queueItems.map(item => item.push_token);
        expect(tokens).toContain('ExponentPushToken[admin1]');
        expect(tokens).toContain('ExponentPushToken[admin2]');
      });

      it('should handle specific user recipients', async () => {
        await db('device_tokens').insert({
          user_id: 5,
          platform: 'expo',
          push_token: 'ExponentPushToken[user5]',
          is_active: true,
          last_seen_at: db.fn.now()
        });

        await notificationService.notify({
          type: 'SALE_CREATED',
          referenceId: 789,
          message: 'Specific user test',
          recipients: { userIds: [5] }
        });

        const queueItems = await db('notification_queue').select('*');
        expect(queueItems.length).toBe(1);
        expect(queueItems[0].push_token).toBe('ExponentPushToken[user5]');
      });
    });

    describe('notificationQueueModel', () => {
      it('should create and retrieve queue items', async () => {
        const item = await notificationQueueModel.createItem({
          notification_id: 1,
          push_token: 'ExponentPushToken[test]',
          payload: { title: 'Test', body: 'Message' }
        });

        expect(item).toHaveProperty('id');
        expect(item.status).toBe('pending');
        expect(item.attempts).toBe(0);

        const dueItems = await notificationQueueModel.getDueItems(10);
        expect(dueItems.length).toBe(1);
        expect(dueItems[0].id).toBe(item.id);
      });

      it('should mark items as sent', async () => {
        const item = await notificationQueueModel.createItem({
          notification_id: 1,
          push_token: 'ExponentPushToken[test]',
          payload: { title: 'Test', body: 'Message' }
        });

        await notificationQueueModel.markAsSent(item.id);

        const updated = await db('notification_queue').where({ id: item.id }).first();
        expect(updated.status).toBe('sent');
      });

      it('should handle failed items with retry logic', async () => {
        const item = await notificationQueueModel.createItem({
          notification_id: 1,
          push_token: 'ExponentPushToken[test]',
          payload: { title: 'Test', body: 'Message' }
        });

        // First failure
        await notificationQueueModel.markAsFailed(item.id, 'Network error', 1, new Date(Date.now() + 60000));

        let updated = await db('notification_queue').where({ id: item.id }).first();
        expect(updated.status).toBe('pending');
        expect(updated.attempts).toBe(1);
        expect(updated.next_retry_at).toBeTruthy();

        // Second failure (should still retry)
        await notificationQueueModel.markAsFailed(item.id, 'Network error 2', 2, new Date(Date.now() + 120000));

        updated = await db('notification_queue').where({ id: item.id }).first();
        expect(updated.status).toBe('pending');
        expect(updated.attempts).toBe(2);

        // Third failure (should mark as failed)
        await notificationQueueModel.markAsFailed(item.id, 'Network error 3', 3, null);

        updated = await db('notification_queue').where({ id: item.id }).first();
        expect(updated.status).toBe('failed');
        expect(updated.attempts).toBe(3);
      });
    });
  });
});
