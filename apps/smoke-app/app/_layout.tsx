import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@navrang/core'

export default function RootLayout() {
  const { isAuthenticated } = useAuth()

  // 🔴 NOT logged in → login
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    )
  }

  // 🟢 Logged in → app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
