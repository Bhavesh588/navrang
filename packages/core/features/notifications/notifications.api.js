import http from '../../services/http.js'

export const listNotifications = (params) =>
  http.get('/notifications', { params })

export const getNotification = (id) =>
  http.get(`/notifications/${id}`)

export const createNotification = (data) =>
  http.post('/notifications', data)

export const markNotificationRead = (id) =>
  http.post(`/notifications/${id}/read`)
