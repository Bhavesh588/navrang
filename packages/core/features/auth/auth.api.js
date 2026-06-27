import http from '../../services/http.js'

export const login = (credentials) =>
  http.post('/auth/login', credentials)

export const refresh = (token) =>
  http.post('/auth/refresh', { token })
