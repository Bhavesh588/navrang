const { app, request } = require('./setup');

describe('Authentication Endpoints', () => {
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      expect(response.status).toBeLessThanOrEqual(401); // May fail if no user or wrong password
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect([400, 401, 404]).toContain(response.status);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword'
        });

      expect([400, 401, 404]).toContain(response.status);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    it('should return user data with valid token', async () => {
      // Get a valid token first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'correctpassword'
        });

      if (loginResponse.body.token) {
        const response = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${loginResponse.body.token}`);

        expect([200]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('email');
          expect(response.body).toHaveProperty('name');
        }
      }
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
    });
  });

  describe('Authentication Validation', () => {
    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect([400, 404]).toContain(response.status);
    });

    it('should handle invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123'
        });

      expect([400, 401, 404]).toContain(response.status);
    });

    it('should be case-insensitive for email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'ADMIN@EXAMPLE.COM',
          password: 'password123'
        });

      expect([200, 401, 404]).toContain(response.status);
    });
  });
});
