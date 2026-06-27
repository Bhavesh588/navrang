import axios from 'axios'
import { getToken } from './authToken'

const envApiUrl =
  (typeof process !== 'undefined' && process.env && process.env.API_URL) ||
  (typeof global !== 'undefined' && global.__API_URL__)

const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

  
let defaultBaseURL
if (envApiUrl) {
  defaultBaseURL = envApiUrl
} else if (isReactNative) {
  // Common Android emulator host for localhost; adjust if your backend runs elsewhere
  defaultBaseURL = 'http://192.168.1.2:5000/api/v1'
} else {
  defaultBaseURL = '/api/v1'
}

const http = axios.create({
  baseURL: defaultBaseURL,
})

export function setApiUrl(url) {
  if (url) {
    http.defaults.baseURL = url
    if (typeof global !== 'undefined') global.__API_URL__ = url
  }
}

http.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http