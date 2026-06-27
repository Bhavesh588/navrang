import { storage } from './storage'

const TOKEN_KEY = 'auth_token'
let listeners = []

export const getToken = async () => storage.get(TOKEN_KEY)

export const setToken = async (token) => {
  await storage.set(TOKEN_KEY, token)
  listeners.forEach((l) => l(token))
}

export const clearToken = async () => {
  await storage.remove(TOKEN_KEY)
  listeners.forEach((l) => l(null))
}

export const subscribeToken = (cb) => {
  listeners.push(cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
  }
}
