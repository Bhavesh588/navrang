import http from '../../services/http.js'

export const listRoles = (params) =>
  http.get('/roles', { params })

export const getRole = (id) =>
  http.get(`/roles/${id}`)
