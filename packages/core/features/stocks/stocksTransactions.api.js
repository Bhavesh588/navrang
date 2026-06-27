// packages/core/stocks/transactions.api.js
import http from '../../services/http.js'

export const listStockTransactions = (params) =>
  http.get('/stock-transactions', { params })

export const createStockTransaction = (data) =>
  http.post('/stock-transactions', data)
