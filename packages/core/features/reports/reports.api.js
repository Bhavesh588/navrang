import http from '../../services/http.js'

export const listReports = () =>
  http.get('/reports')

export const runReport = (name, params) =>
  http.post(`/reports/${name}`, params)
