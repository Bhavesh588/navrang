import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarActiveTintColor: '#111',
          tabBarInactiveTintColor: '#888',

          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },

          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any

            switch (route.name) {
              case 'dashboard':
                iconName = focused ? 'grid' : 'grid-outline'
                break
              case 'stocks':
                iconName = focused ? 'cube' : 'cube-outline'
                break
              case 'sales':
                iconName = focused ? 'cash' : 'cash-outline'
                break
              case 'notifications':
                iconName = focused ? 'notifications' : 'notifications-outline'
                break
              case 'profile':
                iconName = focused ? 'person' : 'person-outline'
                break
            }

            return <Ionicons name={iconName} size={20} color={color} />
          },
        })}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="stocks" options={{ title: 'Stocks' }} />
        <Tabs.Screen name="sales" options={{ title: 'Sales' }} />
        <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  )
}
