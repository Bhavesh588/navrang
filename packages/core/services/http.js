import axios from 'axios'
import { getToken } from './authToken'

const env =
  typeof process !== 'undefined' && process.env
    ? process.env
    : {}

const manualApiUrl =
  env.EXPO_PUBLIC_API_URL ||
  env.API_URL ||
  (typeof global !== 'undefined' && global.__API_URL__)

const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

const isDev =
  env.EXPO_PUBLIC_APP_ENV
    ? env.EXPO_PUBLIC_APP_ENV !== 'production'
    : typeof __DEV__ !== 'undefined'
      ? __DEV__
      : env.NODE_ENV !== 'production'

const devApiUrl = env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:5000/api/v1'
const prodApiUrl = env.EXPO_PUBLIC_PROD_API_URL || 'https://navrang.bhaveshack.com/api/v1'

let defaultBaseURL
if (manualApiUrl) {
  defaultBaseURL = manualApiUrl
} else if (isReactNative) {
  defaultBaseURL = isDev ? devApiUrl : prodApiUrl
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
