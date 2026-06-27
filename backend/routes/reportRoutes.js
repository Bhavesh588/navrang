const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const stockModel = require('../models/stockModel');
const saleModel = require('../models/saleModel');
const logger = require('../utils/logger');

/**
 * GET /api/v1/reports/stocks/export
 * Export stocks to JSON (Excel-ready format)
 * Query params: department_id, category_id, from, to
 */
router.get('/stocks/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { department_id, category_id, from, to } = req.query;

    logger.info('Exporting stock report', {
      department_id,
      category_id,
      from,
      to,
      userId: req.user.id,
      requestId: req.id
    });

    let stocks = await stockModel.getAllStocks();

    // Filter by department if provided
    if (department_id) {
      stocks = stocks.filter(s => s.department_id == department_id);
    }

    // Filter by category if provided
    if (category_id) {
      stocks = stocks.filter(s => s.category_id == category_id);
    }

    // Format for export
    const data = stocks.map(stock => ({
      'Stock ID': stock.id,
      'Name': stock.name,
      'Category': stock.category_name || 'N/A',
      'Department': stock.department_name || 'N/A',
      'Current Quantity': stock.current_quantity,
      'Reorder Level': stock.reorder_level,
      'Unit': stock.unit || 'PCS',
      'Last Updated': stock.updated_at || new Date().toISOString()
    }));

    logger.info('Stock report generated', {
      count: data.length,
      userId: req.user.id,
      requestId: req.id
    });

    // Return as JSON with CSV headers (client can convert to Excel)
    res.json({
      success: true,
      data: data,
      metadata: {
        total: data.length,
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.id,
        filters: { department_id, category_id, from, to }
      },
      message: 'Stock report generated successfully'
    });
  } catch (error) {
    logger.error('Error exporting stock report', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Error exporting stock report',
      requestId: req.id
    });
  }
});

/**
 * GET /api/v1/reports/sales/export
 * Export sales to JSON (Excel-ready format)
 * Query params: department_id, from, to
 */
router.get('/sales/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { department_id, from, to } = req.query;

    logger.info('Exporting sales report', {
      department_id,
      from,
      to,
      userId: req.user.id,
      requestId: req.id
    });

    let sales = await saleModel.getAllSales();

    // Filter by department if provided
    if (department_id) {
      sales = sales.filter(s => s.department_id == department_id);
    }

    // Filter by date range if provided
    if (from || to) {
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        if (from && saleDate < new Date(from)) return false;
        if (to && saleDate > new Date(to)) return false;
        return true;
      });
    }

    // Format for export
    const data = sales.map(sale => ({
      'Sale ID': sale.id,
      'Stock': sale.stock_name || 'N/A',
      'Quantity': sale.quantity || 'N/A',
      'Amount': sale.amount,
      'Description': sale.description || '',
      'Date': sale.created_at || new Date().toISOString()
    }));

    logger.info('Sales report generated', {
      count: data.length,
      userId: req.user.id,
      requestId: req.id
    });

    // Return as JSON with CSV headers (client can convert to Excel)
    res.json({
      success: true,
      data: data,
      metadata: {
        total: data.length,
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.id,
        filters: { department_id, from, to }
      },
      message: 'Sales report generated successfully'
    });
  } catch (error) {
    logger.error('Error exporting sales report', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Error exporting sales report',
      requestId: req.id
    });
  }
});

module.exports = router;
