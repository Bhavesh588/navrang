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
      try {
        const t = await getToken()
        const decodedUser = t ? decodeToken(t) : null

        if (isMounted) {
          setTokenState(t)
          if (decodedUser) {
            await storage.set("user", JSON.stringify(decodedUser))
          } else {
            await storage.remove("user")
          }
        }
      } catch (error) {
        console.log("Auth initialization failed:", error)
        if (isMounted) {
          setTokenState(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
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
      if (!token) return

      const decodedUser = decodeToken(token)
      await setToken(token)
      if (decodedUser) {
        await storage.set("user", JSON.stringify(decodedUser))
      }
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
