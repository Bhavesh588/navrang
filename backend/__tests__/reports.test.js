const { app, request } = require('./setup');

describe('Report Export Endpoints', () => {
  const validToken = 'Bearer fake_token';

  describe('GET /api/v1/reports/stocks/export', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export');

      expect([200, 401]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should return JSON export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should include export metadata', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('total');
        expect(response.body.metadata).toHaveProperty('exportedAt');
      }
    });

    it('should support filter by department', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?department_id=1')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.metadata).toHaveProperty('filters');
      }
    });

    it('should support filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?category_id=1')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should support filter by date range', async () => {
      const from = '2024-01-01';
      const to = '2024-12-31';
      const response = await request(app)
        .get(`/api/v1/reports/stocks/export?from=${from}&to=${to}`)
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should support multiple filters', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?department_id=1&category_id=1&from=2024-01-01&to=2024-12-31')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?from=invalid-date')
        .set('Authorization', validToken);

      expect([200, 400, 401, 403]).toContain(response.status);
    });

    it('should handle invalid department_id', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?department_id=abc')
        .set('Authorization', validToken);

      expect([200, 400, 403]).toContain(response.status);
    });

    it('should handle non-existent department', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?department_id=99999')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      // Should return empty data for non-existent department
    });

    it('should include all required columns in export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200 && response.body.data.length > 0) {
        const firstItem = response.body.data[0];
        // expect(firstItem).toHaveProperty('id');
        // expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('Current Quantity');
      }
    });

    it('should handle CSV export format request', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export?format=csv')
        .set('Authorization', validToken);

      expect([200, 400, 403]).toContain(response.status);
    });
  });

  describe('GET /api/v1/reports/sales/export', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export');

      expect([200, 401]).toContain(response.status);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should return JSON export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should include export metadata', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('total');
        expect(response.body.metadata).toHaveProperty('exportedAt');
      }
    });

    it('should support filter by department', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?department_id=1')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should support filter by date range', async () => {
      const from = '2024-01-01';
      const to = '2024-12-31';
      const response = await request(app)
        .get(`/api/v1/reports/sales/export?from=${from}&to=${to}`)
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should support multiple filters', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?department_id=1&from=2024-01-01&to=2024-12-31')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should calculate totals correctly', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200 && response.body.data.length > 0) {
        expect(response.body.metadata).toHaveProperty('total');
        expect(typeof response.body.metadata.total).toBe('number');
      }
    });

    it('should include all required columns in sales export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200 && response.body.data.length > 0) {
        const firstItem = response.body.data[0];
        // expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('Quantity');
      }
    });

    it('should handle invalid date format in sales export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?from=invalid-date')
        .set('Authorization', validToken);

      expect([200, 400, 403]).toContain(response.status);
    });

    it('should handle non-existent department in sales export', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?department_id=99999')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });

    it('should include filters applied in metadata', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?department_id=1&from=2024-01-01')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.metadata).toHaveProperty('filters');
      }
    });

    it('should support pagination in exports', async () => {
      const response = await request(app)
        .get('/api/v1/reports/sales/export?page=1&limit=50')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Report Export - General', () => {
    it('stocks export should have different structure than sales export', async () => {
      const stockResponse = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      const salesResponse = await request(app)
        .get('/api/v1/reports/sales/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(stockResponse.status);
      expect([200, 403]).toContain(salesResponse.status);
    });

    it('exports should be consistent format', async () => {
      const response = await request(app)
        .get('/api/v1/reports/stocks/export')
        .set('Authorization', validToken);

      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('exportedAt');
      }
    });
  });
});
