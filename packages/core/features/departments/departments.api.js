import http from '../../services/http.js'

export const listDepartments = (params) =>
  http.get('/departments', { params })

export const getDepartment = (id) =>
  http.get(`/departments/${id}`)

export const createDepartment = (data) =>
  http.post('/departments', data)

export const updateDepartment = (id, data) =>
  http.put(`/departments/${id}`, data)

export const deleteDepartment = (id) =>
  http.delete(`/departments/${id}`)

/**
 * User ↔ Department
 */
export const assignUserToDepartment = (data) =>
  http.post('/departments/assign', data)

export const removeUserFromDepartment = (data) =>
  http.post('/departments/unassign', data)
