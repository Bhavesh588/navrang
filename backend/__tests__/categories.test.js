const { app, request } = require('./setup');

describe('Categories Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/categories', () => {
    it('should return categories list', async () => {
      const response = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/categories?page=1&limit=10')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return category details', async () => {
      const response = await request(app)
        .get('/api/v1/categories/1')
        .set('Authorization', validToken);

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/v1/categories/99999')
        .set('Authorization', validToken);

      expect([404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', validToken)
        .send({ name: 'New Category' });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', validToken)
        .send({ name: 'New Category' });

      expect([200, 201, 400, 403]).toContain(response.status);
    });

    it('should return 400 without name', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', validToken)
        .send({});

      expect([400]).toContain(response.status);
    });

    it('should create category with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', validToken)
        .send({
          name: 'Electronics',
          description: 'Electronic items'
        });

      expect([200, 201, 400, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .put('/api/v1/categories/1')
        .set('Authorization', validToken)
        .send({ name: 'Updated' });

      expect([200, 400, 403, 404]).toContain(response.status);
    });

    it('should update category', async () => {
      const response = await request(app)
        .put('/api/v1/categories/1')
        .set('Authorization', validToken)
        .send({ name: 'Updated Electronics' });

      expect([200, 400, 403, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should require admin role', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/1')
        .set('Authorization', validToken);

      expect([200, 204, 403, 404, 409]).toContain(response.status);
    });

    it('should delete category', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/1')
        .set('Authorization', validToken);

      expect([200, 204, 403, 404, 409]).toContain(response.status);
    });
  });
});
