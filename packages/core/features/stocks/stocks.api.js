import http from '../../services/http.js'

export const listStocks = (params) => {
  return http.get('/stocks', { params })
}

export const getStock = (id) =>
  http.get(`/stocks/${id}`)

export const createStock = (data) =>
  http.post('/stocks', data)

export const addStock = (id, data) =>
  http.post(`/stocks/${id}/add`, data)

export const removeStock = (id, data) =>
  http.post(`/stocks/${id}/remove`, data)

export const deleteStock = (id) =>
  http.delete(`/stocks/${id}`)

export const getUserStocks = () =>
  http.get('/stocks/by-user')
