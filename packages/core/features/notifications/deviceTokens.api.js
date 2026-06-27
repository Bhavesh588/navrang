import http from '../../services/http.js'

export const registerDeviceToken = (data) =>
  http.post('/device-tokens', data)

export const unregisterDeviceToken = (token) =>
  http.delete('/device-tokens', { data: { token } })

export const listMyDeviceTokens = () =>
  http.get('/device-tokens')
