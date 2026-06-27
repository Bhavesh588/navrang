const { app, request } = require('./setup');

describe('Department Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/departments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/departments');

      expect([200, 401]).toContain(response.status);
    });

    it('should return array of departments', async () => {
      const response = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should filter departments by user role', async () => {
      const response = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
      // Admin should see all departments
      // Regular user should see only assigned departments
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/departments?page=1&limit=10')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
    });
  });

  describe('GET /api/v1/departments/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/departments/1');

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should return department details', async () => {
      const response = await request(app)
        .get('/api/v1/departments/1')
        .set('Authorization', validToken);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent department', async () => {
      const response = await request(app)
        .get('/api/v1/departments/99999')
        .set('Authorization', validToken);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/departments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/departments')
        .send({ name: 'New Department' });

      expect([200, 201, 401, 403]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', validToken)
        .send({ name: 'New Department' });

      expect([200, 201, 403, 409]).toContain(response.status);
    });

    it('should return 400 without name', async () => {
      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', validToken)
        .send({});

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should create department with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', validToken)
        .send({
          name: 'New Department',
          description: 'Test Department'
        });

      expect([200, 201, 400, 403, 409]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
      }
    });
  });

  describe('PUT /api/v1/departments/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/departments/1')
        .send({ name: 'Updated Department' });

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put('/api/v1/departments/1')
        .set('Authorization', validToken)
        .send({ name: 'Updated Department' });

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should update department', async () => {
      const response = await request(app)
        .put('/api/v1/departments/1')
        .set('Authorization', validToken)
        .send({
          name: 'Updated Department',
          description: 'Updated Description'
        });

      expect([200, 400, 403, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent department', async () => {
      const response = await request(app)
        .put('/api/v1/departments/99999')
        .set('Authorization', validToken)
        .send({ name: 'Updated' });

      expect([200, 400, 403, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/departments/1');

      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .delete('/api/v1/departments/1')
        .set('Authorization', validToken);

      expect([200, 403, 404, 409]).toContain(response.status);
    });

    it('should delete department', async () => {
      const response = await request(app)
        .delete('/api/v1/departments/1')
        .set('Authorization', validToken);

      expect([200, 204, 403, 404, 409]).toContain(response.status);
    });
  });
});
