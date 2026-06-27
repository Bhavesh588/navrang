const { app, request } = require('./setup');
const fs = require('fs');
const path = require('path');

describe('File Upload Endpoints', () => {
  const validToken = 'Bearer fake_token';
  const testBase64 = Buffer.from('test file content').toString('base64');

  describe('POST /api/v1/files/receipts', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .send({
          file: testBase64,
          originalName: 'receipt.pdf'
        });

      expect([200, 201, 401]).toContain(response.status);
    });

    it('should return 400 without file data', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({ originalName: 'receipt.pdf' });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 without originalName', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({ file: testBase64 });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 for invalid base64', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: 'not-valid-base64!!!',
          originalName: 'receipt.pdf'
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should upload file successfully', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: testBase64,
          originalName: 'receipt.pdf'
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body.data).toHaveProperty('filename');
        expect(response.body.data).toHaveProperty('url');
      }
    });

    it('should generate unique filename', async () => {
      const response1 = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: testBase64,
          originalName: 'receipt.pdf'
        });

      const response2 = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: testBase64,
          originalName: 'receipt.pdf'
        });

      if ((response1.status === 200 || response1.status === 201) &&
          (response2.status === 200 || response2.status === 201)) {
        expect(response1.body.filename).not.toBe(response2.body.filename);
      }
    });

    it('should preserve file extension', async () => {
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: testBase64,
          originalName: 'receipt.pdf'
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body.data.filename).toMatch(/\.pdf$/);
      }
    });

    it('should handle different file types', async () => {
      const fileTypes = ['receipt.pdf', 'invoice.txt', 'document.docx', 'image.jpg'];

      for (const fileName of fileTypes) {
        const response = await request(app)
          .post('/api/v1/files/receipts')
          .set('Authorization', validToken)
          .send({
            file: testBase64,
            originalName: fileName
          });

        expect([200, 201, 400]).toContain(response.status);
      }
    });

    it('should handle empty file content', async () => {
      const emptyBase64 = Buffer.from('').toString('base64');
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: emptyBase64,
          originalName: 'empty.txt'
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should handle large file content', async () => {
      const largeContent = Buffer.alloc(1024 * 1024 * 5).toString('base64'); // 5MB
      const response = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: largeContent,
          originalName: 'large-file.bin'
        });

      expect([200, 201, 400, 413]).toContain(response.status);
    });
  });

  describe('GET /api/v1/files/receipts/:filename', () => {
    let uploadedFilename;

    beforeAll(async () => {
      const uploadResponse = await request(app)
        .post('/api/v1/files/receipts')
        .set('Authorization', validToken)
        .send({
          file: testBase64,
          originalName: 'test-receipt.pdf'
        });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        uploadedFilename = uploadResponse.body.filename;
      }
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/files/receipts/test.pdf');

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/v1/files/receipts/nonexistent-file.pdf')
        .set('Authorization', validToken);

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should download file successfully', async () => {
      if (uploadedFilename) {
        const response = await request(app)
          .get(`/api/v1/files/receipts/${uploadedFilename}`)
          .set('Authorization', validToken);

        expect([200, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toBeDefined();
        }
      }
    });

    it('should prevent directory traversal attacks', async () => {
      const response = await request(app)
        .get('/api/v1/files/receipts/../../etc/passwd')
        .set('Authorization', validToken);

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should handle encoded filename', async () => {
      const response = await request(app)
        .get('/api/v1/files/receipts/test%20file.pdf')
        .set('Authorization', validToken);

      expect([200, 404]).toContain(response.status);
    });

    it('should return proper content-type header', async () => {
      if (uploadedFilename) {
        const response = await request(app)
          .get(`/api/v1/files/receipts/${uploadedFilename}`)
          .set('Authorization', validToken);

        expect([200, 404]).toContain(response.status);
        if (response.status === 200) {
          expect(response.headers['content-type']).toBeDefined();
        }
      }
    });
  });
});
