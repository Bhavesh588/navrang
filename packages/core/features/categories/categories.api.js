import http from '../../services/http.js'

export const listCategories = (params) =>
  http.get('/categories', { params })

export const getCategory = (id) =>
  http.get(`/categories/${id}`)

export const createCategory = (data) =>
  http.post('/categories', data)

export const updateCategory = (id, data) =>
  http.put(`/categories/${id}`, data)

export const deleteCategory = (id) =>
  http.delete(`/categories/${id}`)

export const getUserCategories = () =>
  http.get('/categories/by-user')
