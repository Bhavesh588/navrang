// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="stock" />
      <Tabs.Screen name="reports" />
    </Tabs>
  )
}
