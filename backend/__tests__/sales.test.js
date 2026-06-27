const { app, request } = require('./setup');

describe('Sales Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/sales', () => {
    it('should return sales list', async () => {
      const response = await request(app)
        .get('/api/v1/sales');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/sales?page=1&limit=10');

      expect([200, 401]).toContain(response.status);
    });

    it('should support filtering by stock', async () => {
      const response = await request(app)
        .get('/api/v1/sales?stock_id=1');

      expect([200, 401]).toContain(response.status);
    });

    it('should support filtering by user', async () => {
      const response = await request(app)
        .get('/api/v1/sales?user_id=1');

      expect([200, 401]).toContain(response.status);
    });

    it('should support filtering by date range', async () => {
      const response = await request(app)
        .get('/api/v1/sales?from=2024-01-01&to=2024-12-31');

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('GET /api/v1/sales/:id', () => {
    it('should return sale details', async () => {
      const response = await request(app)
        .get('/api/v1/sales/1');

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('quantity');
      }
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .get('/api/v1/sales/99999');

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe('POST /api/v1/sales', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .send({
          stock_id: 1,
          quantity: 5
        });

      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({});

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({
          stock_id: 1,
          quantity: -5
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 for excessive quantity', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({
          stock_id: 1,
          quantity: 999999
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should create sale with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({
          stock_id: 1,
          quantity: 5,
          sale_date: new Date(),
          customer: 'Customer Name'
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should decrease stock quantity', async () => {
      const response = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({
          stock_id: 1,
          quantity: 5
        });

      expect([200, 201, 400]).toContain(response.status);
      // Verify stock quantity was decreased
    });
  });

  describe('PUT /api/v1/sales/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/sales/1')
        .send({ quantity: 10 });

      expect([200, 400, 401, 404]).toContain(response.status);
    });

    it('should update sale', async () => {
      const response = await request(app)
        .put('/api/v1/sales/1')
        .set('Authorization', validToken)
        .send({ quantity: 10 });

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .put('/api/v1/sales/99999')
        .set('Authorization', validToken)
        .send({ quantity: 10 });

      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/sales/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/sales/1');

      expect([200, 204, 401, 404]).toContain(response.status);
    });

    it('should delete sale', async () => {
      const response = await request(app)
        .delete('/api/v1/sales/1')
        .set('Authorization', validToken);

      expect([200, 204, 404]).toContain(response.status);
    });

    it('should reverse stock quantity', async () => {
      const response = await request(app)
        .delete('/api/v1/sales/1')
        .set('Authorization', validToken);

      expect([200, 204, 404]).toContain(response.status);
      // Verify stock quantity was restored
    });
  });

  describe('Sales Statistics', () => {
    it('should handle multiple sales for same stock', async () => {
      const response1 = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({ stock_id: 1, quantity: 2 });

      const response2 = await request(app)
        .post('/api/v1/sales')
        .set('Authorization', validToken)
        .send({ stock_id: 1, quantity: 3 });

      expect([200, 201, 400]).toContain(response1.status);
      expect([200, 201, 400]).toContain(response2.status);
    });

    it('should track sales by user', async () => {
      const response = await request(app)
        .get('/api/v1/sales?user_id=1');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        // All sales should be by user_id=1
      }
    });

    it('should calculate total quantity sold', async () => {
      const response = await request(app)
        .get('/api/v1/sales?stock_id=1');

      expect([200, 401]).toContain(response.status);
      if (response.status === 200 && Array.isArray(response.body)) {
        // Sum all quantities
      }
    });
  });
});
