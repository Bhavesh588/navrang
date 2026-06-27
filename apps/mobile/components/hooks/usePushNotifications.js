import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import * as Device from 'expo-device';
import { use, useEffect, useRef } from 'react'
import { useRegisterDeviceToken } from '@navrang/core'
import { StyleSheet } from 'react-native'

/**
 * Simple push notification setup hook
 * 
 * Flow (from NOTIFICATION_SETUP.md):
 * 1. Request notification permissions
 * 2. Get Expo push token
 * 3. Register token with backend
 * 4. Set up notification handler (one-time)
 * 5. Listen for incoming notifications
 */

// Track if we've already configured the handler (globally, once)
let notificationHandlerConfigured = false

function usePushNotifications() {
  const registerDeviceTokenMutation = useRegisterDeviceToken()
  const listenerRefsRef = useRef({})
  // console.log('usePushNotifications hook initialized')

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== 'granted') {
        console.warn('Notification permissions not granted')
        return
      }
    })
  }, [])

  const triggerNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        console.warn('Cannot trigger notification: permissions not granted')
        return
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification triggered from the app.',
        },
        trigger: null,
      })
      console.log('Test notification triggered immediately')
    } catch (error) {
      console.error('Error triggering notification:', error)
    }
  }

  // Step 4: Set up notification handler FIRST (one-time, global)
  useEffect(() => {
    if (notificationHandlerConfigured) {
      return
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })
      console.log('✅ Notification handler configured successfully')
      notificationHandlerConfigured = true
    } catch (error) {
      console.error('❌ Failed to configure notification handler:', error)
    }
  }, [])

  // Step 5: Listen for incoming notifications (ONLY after handler is set up)
  useEffect(() => {
    // Skip if not on device or handler not yet configured
    if (!Device.isDevice) {
      console.log('Skipping notification listeners: not on physical device')
      return
    }

    if (!notificationHandlerConfigured) {
      console.log('Skipping notification listeners: handler not configured yet')
      return
    }

    try {
      console.log('Setting up notification listeners...')

      // Listen for notifications when app is in foreground
      listenerRefsRef.current.notification = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('📬 Notification received:', notification)
        }
      )

      // Listen for notification interactions (user tapped notification)
      listenerRefsRef.current.response = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('👆 User tapped notification:', response)
        }
      )

      console.log('✅ Notification listeners registered')
      triggerNotification() // Trigger a test notification on setup
    } catch (error) {
      console.error('❌ Failed to add notification listeners:', error)
    }

    // Cleanup
    return () => {
      console.log('Cleaning up notification listeners')
      listenerRefsRef.current.notification?.remove()
      listenerRefsRef.current.response?.remove()
    }
  }, [])

  // Step 1-3: Request permissions, get token, and register with backend
  useEffect(() => {
    if (!Device.isDevice) {
      console.log('Skipping token registration: not on physical device')
      return
    }

    const setupToken = async () => {
      try {
        console.log('🔔 Starting token registration...')

        // Step 1: Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
          console.log('Requesting notification permissions...')
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== 'granted') {
          console.warn('⚠️ Notification permission denied or not granted')
          return
        }

        console.log('✅ Notification permission granted')
        
        // Step 2: Get Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId
        console.log('Project ID for push token:', projectId)
        if (!projectId) {
          console.error('❌ No projectId found for push token')
          return
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
        const token = tokenData?.data
        console.log('Raw token data:', tokenData)

        if (!token) {
          console.warn('⚠️ Failed to get Expo push token')
          return
        }

        console.log(`✅ Expo push token obtained: ${token.substring(0, 20)}...`)

        // Step 3: Register token with backend
        console.log('Registering token with backend...')
        registerDeviceTokenMutation.mutate({
          token,
          platform: 'expo',
        })
      } catch (error) {
        console.error('❌ Error during token setup:', error)
      }
    }

    setupToken()
  }, [])

  // return (
  //   <View style={styles.container}>
  //     <Text>Push Notifications Setup</Text>
  //     <Button title="Trigger Test Notification" onPress={triggerNotification} />
  //   </View>
  // )

  // return { triggerNotification }
}

export default usePushNotifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})