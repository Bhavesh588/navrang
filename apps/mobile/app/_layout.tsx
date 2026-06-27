import './bootstrap/storageAdapter'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@navrang/core'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import usePushNotifications from '../components/hooks/usePushNotifications'

const queryClient = new QueryClient()

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Register push notifications only after auth has initialized.
  usePushNotifications(isAuthenticated && !loading)

  useEffect(() => {
    console.log('Auth status changed:', { isAuthenticated, loading })
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }

    if (!loading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) return null

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

