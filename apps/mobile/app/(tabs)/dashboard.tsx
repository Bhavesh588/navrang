import { View, Button } from 'react-native'
import { useLogout } from '@navrang/core'
import { storage } from '@navrang/core/services/storage'

export default function DashboardScreen() {
  const logout = useLogout()

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Button
        title="Logout"
        onPress={async () => {
          await storage.remove("user")
          await logout()
        }}
      />
    </View>
  )
}
