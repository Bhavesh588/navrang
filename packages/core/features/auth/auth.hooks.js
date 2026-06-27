// packages/core/auth/hooks.js
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login as loginApi } from './auth.api'
import { getToken, subscribeToken, setToken, clearToken } from '@navrang/core/services/authToken.js'
import { decodeToken } from '@navrang/core/utils/jwt.js'
import { storage } from '@navrang/core/services/storage.js'

/**
 * useAuth
 * - reads token from storage
 * - platform-agnostic (works in app / web / desktop)
 */
export const useAuth = () => {
  const [token, setTokenState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const t = await getToken()
      
      if (isMounted) {
        setTokenState(t)
        console.log("Decoded token:", decodeToken(t))
        await storage.set("user", JSON.stringify(decodeToken(t)))
        setLoading(false)
      }
    }

    init()

    const unsubscribe = subscribeToken((newToken) => {
      setTokenState((prev) => {
        if (prev === newToken) return prev  // 🔥 prevent loop
        return newToken
      })
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return {
    token,
    isAuthenticated: !!token,
    loading,
  }
}

/**
 * useLogin
 */
export const useLogin = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (res) => {
      const token = res?.data?.token
      if (token) setToken(token)
      await storage.set("user", JSON.stringify(decodeToken(token)))
      qc.invalidateQueries()
    },
  })
}

/**
 * useLogout
 */
export const useLogout = () => {
  let qc
  try {
    qc = useQueryClient()
  } catch {
    // QueryClient might not be available yet
    qc = null
  }

  return () => {
    clearToken()
    if (qc) {
      qc.clear()
    }
  }
}
