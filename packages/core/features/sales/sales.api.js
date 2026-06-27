import http from '../../services/http.js'

export const listSales = (params) =>
  http.get('/sales', { params })

export const listUserSales = (userId) =>
  http.get(`/sales/user/${userId}`)

export const getSaleGroup = (saleGroupId) =>
  http.get(`/sales/group/${saleGroupId}`)

export const getSale = (id) =>
  http.get(`/sales/${id}`)

export const createSale = (data) =>
  http.post('/sales', data)

export const deleteSaleGroup = (saleGroupId) =>
  http.delete(`/sales/group/${saleGroupId}`)
