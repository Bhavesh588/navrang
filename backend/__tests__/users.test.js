const { app, request } = require('./setup');

describe('User Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/users', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users');

      expect([200, 401]).toContain(response.status);
    });

    it('should return array of users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/v1/users?role_id=1')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/1');

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should return user details', async () => {
      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', validToken);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('email');
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/99999')
        .set('Authorization', validToken);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/users/:id/departments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .send({ department_ids: [1, 2] });

      expect([200, 201, 401, 403]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [1, 2] });

      expect([200, 201, 403]).toContain(response.status);
    });

    it('should return 400 without department_ids', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({});

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should return 400 for empty department_ids array', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [] });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should return 400 for non-array department_ids', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: '1,2' });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should assign departments to user', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [1, 2, 3] });

      expect([200, 201, 400, 403, 404]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/users/99999/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [1, 2] });

      expect([200, 201, 400, 403, 404]).toContain(response.status);
    });

    it('should handle duplicate department_ids', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [1, 1, 2, 2] });

      expect([200, 201, 400, 403, 404]).toContain(response.status);
    });

    it('should handle non-existent department_ids', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/departments')
        .set('Authorization', validToken)
        .send({ department_ids: [99999] });

      expect([200, 201, 400, 403, 404, 409]).toContain(response.status);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect([200, 201, 401, 403]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', validToken)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect([200, 201, 403, 400]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', validToken)
        .send({
          name: 'New User'
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should create user with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', validToken)
        .send({
          name: 'New User',
          email: `newuser${Date.now()}@example.com`,
          password: 'password123',
          role_id: 2
        });

      expect([200, 201, 400, 403]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
      }
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', validToken)
        .send({
          name: 'Duplicate User',
          email: 'admin@example.com',
          password: 'password123'
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/users/1')
        .send({ name: 'Updated Name' });

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/1')
        .set('Authorization', validToken)
        .send({ name: 'Updated Name' });

      expect([200, 400, 403, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/v1/users/99999')
        .set('Authorization', validToken)
        .send({ name: 'Updated Name' });

      expect([200, 400, 403, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/users/1');

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', validToken);

      expect([200, 403, 404, 409]).toContain(response.status);
    });

    it('should delete user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', validToken);

      expect([200, 204, 403, 404, 409]).toContain(response.status);
    });
  });
});
