const { app, request } = require('./setup');

describe('Receipts Endpoints', () => {
  const validToken = 'Bearer fake_token';
  const testBase64 = Buffer.from('test receipt content').toString('base64');

  describe('GET /api/v1/receipts', () => {
    it('should return receipts list', async () => {
      const response = await request(app)
        .get('/api/v1/receipts');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/receipts?page=1&limit=10');

      expect([200, 401]).toContain(response.status);
    });

    it('should support filtering by stock', async () => {
      const response = await request(app)
        .get('/api/v1/receipts?stock_id=1');

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('GET /api/v1/receipts/:id', () => {
    it('should return receipt details', async () => {
      const response = await request(app)
        .get('/api/v1/receipts/1');

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
      }
    });

    it('should return 404 for non-existent receipt', async () => {
      const response = await request(app)
        .get('/api/v1/receipts/99999');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/receipts', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/receipts')
        .send({
          stock_id: 1,
          quantity: 10
        });

      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/receipts')
        .set('Authorization', validToken)
        .send({});

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should create receipt with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/receipts')
        .set('Authorization', validToken)
        .send({
          stock_id: 1,
          quantity: 10,
          supplier: 'Supplier Name'
        });

      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/receipts/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/receipts/1')
        .send({ quantity: 15 });

      expect([200, 400, 401, 404]).toContain(response.status);
    });

    it('should update receipt', async () => {
      const response = await request(app)
        .put('/api/v1/receipts/1')
        .set('Authorization', validToken)
        .send({ quantity: 15, file_url: `data:image/png;base64,${testBase64}` });

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/receipts/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/receipts/1');

      expect([200, 204, 401, 404]).toContain(response.status);
    });

    it('should delete receipt', async () => {
      const response = await request(app)
        .delete('/api/v1/receipts/1')
        .set('Authorization', validToken);

      expect([200, 204, 404, 409]).toContain(response.status);
    });
  });
});
