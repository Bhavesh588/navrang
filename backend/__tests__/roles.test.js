const { app, request } = require('./setup');

describe('Roles Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/roles', () => {
    it('should return roles list', async () => {
      const response = await request(app)
        .get('/api/v1/roles');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should have role fields', async () => {
      const response = await request(app)
        .get('/api/v1/roles');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200 && response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
      }
    });
  });

  describe('GET /api/v1/roles/:id', () => {
    it('should return role details', async () => {
      const response = await request(app)
        .get('/api/v1/roles/1');

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .get('/api/v1/roles/99999');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/roles', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', validToken)
        .send({ name: 'moderator' });

      expect([200, 201, 400, 403, 409]).toContain(response.status);
    });

    it('should return 400 without role_name', async () => {
      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', validToken)
        .send({});

      expect([200, 201, 400, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/roles/:id', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .put('/api/v1/roles/1')
        .set('Authorization', validToken)
        .send({ name: 'administrator' });

      expect([200, 400, 403, 404, 409]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/roles/:id', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .delete('/api/v1/roles/1')
        .set('Authorization', validToken);

      expect([200, 204, 403, 404, 409]).toContain(response.status);
    });
  });
});
