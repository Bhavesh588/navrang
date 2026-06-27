import http from '../../services/http.js'

export const listReceipts = (params) =>
  http.get('/receipts', { params })

export const getReceipt = (id) =>
  http.get(`/receipts/${id}`)

export const createReceipt = (data) =>
  http.post('/receipts', data)
