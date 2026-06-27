import http from '../../services/http.js'

export const uploadReceiptToCloud = (data) =>
  http.post('/files/receipts/cloud', data)
