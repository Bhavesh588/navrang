const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middlewares/auth');
const logger = require('../utils/logger');
const s3Service = require('../utils/s3Service');

// Simple file upload handler (using Express without multer)
/**
 * POST /api/v1/files/receipts/cloud
 * Upload receipt file to S3-compatible storage.
 */
router.post('/receipts/cloud', authenticate, async (req, res) => {
  try {
    const { file_base64, filename, mime_type } = req.body;

    if (!file_base64 || !filename) {
      return res.status(400).json({
        success: false,
        message: 'file_base64 and filename are required'
      });
    }

    const upload = await s3Service.uploadReceipt({
      fileBase64: file_base64,
      filename,
      mimeType: mime_type
    });

    logger.info('Receipt uploaded to cloud successfully', {
      key: upload.key,
      uploadedBy: req.user.id,
      requestId: req.id
    });

    res.status(201).json({
      success: true,
      data: {
        file_name: upload.key,
        original_name: filename,
        file_url: upload.file_url
      },
      message: 'Receipt uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading receipt to cloud', {
      error: error.message,
      code: error.code,
      details: error.details,
      requestId: req.id
    });

    const status = error.code === 'S3_NOT_CONFIGURED' ? 503 : 500;
    res.status(status).json({
      success: false,
      message: error.code === 'S3_NOT_CONFIGURED'
        ? 'S3 is not configured'
        : 'Error uploading receipt',
      requestId: req.id
    });
  }
});

/**
 * POST /api/v1/files/receipts
 * Upload receipt file (supports base64 encoded files from mobile)
 */
router.post('/receipts', authenticate, async (req, res) => {
  try {
    const { file_base64, filename, mime_type } = req.body;

    if (!file_base64 || !filename) {
      return res.status(400).json({
        success: false,
        message: 'file_base64 and filename are required'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${filename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Decode base64 and write to file
    const buffer = Buffer.from(file_base64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/receipts/${uniqueFilename}`;

    logger.info('Receipt uploaded successfully', {
      filename: uniqueFilename,
      originalName: filename,
      uploadedBy: req.user.id,
      requestId: req.id
    });

    res.status(201).json({
      success: true,
      data: {
        file_name: uniqueFilename,
        original_name: filename,
        file_url: fileUrl
      },
      message: 'Receipt uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading receipt', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Error uploading receipt',
      requestId: req.id
    });
  }
});

/**
 * GET /api/v1/files/receipts/:filename
 * Download/view receipt file
 */
router.get('/receipts/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../uploads/receipts', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn('Receipt file not found', { filename, requestId: req.id });
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    logger.info('Receipt file downloaded', {
      filename,
      userId: req.user.id,
      requestId: req.id
    });

    res.download(filePath);
  } catch (error) {
    logger.error('Error downloading receipt', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Error downloading receipt',
      requestId: req.id
    });
  }
});

module.exports = router;
