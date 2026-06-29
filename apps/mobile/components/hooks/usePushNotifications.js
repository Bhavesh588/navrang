import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { useRegisterDeviceToken } from '@navrang/core'

let notificationHandlerConfigured = false
let NotificationsModule = null
const EAS_PROJECT_ID = '449b4037-c9c4-4423-b33b-88e081a807b4'

function getNotificationsModule() {
  if (!NotificationsModule) {
    NotificationsModule = require('expo-notifications')
  }

  return NotificationsModule
}

function usePushNotifications(enabled = true) {
  const registerDeviceTokenMutation = useRegisterDeviceToken()
  const listenerRefsRef = useRef({})
  const hasRegisteredTokenRef = useRef(false)
  const hasShownErrorRef = useRef(false)
  const isExpoGo = Constants.appOwnership === 'expo'

  useEffect(() => {
    if (!enabled || isExpoGo || notificationHandlerConfigured) return

    try {
      const Notifications = getNotificationsModule()

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })
      notificationHandlerConfigured = true
      console.log('Notification handler configured')
    } catch (error) {
      console.error('Failed to configure notification handler:', error)
    }
  }, [enabled, isExpoGo])

  useEffect(() => {
    if (!enabled || isExpoGo || !Device.isDevice || !notificationHandlerConfigured) return

    try {
      const Notifications = getNotificationsModule()

      listenerRefsRef.current.notification = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification)
        }
      )

      listenerRefsRef.current.response = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Notification tapped:', response)
        }
      )
    } catch (error) {
      console.error('Failed to add notification listeners:', error)
    }

    return () => {
      listenerRefsRef.current.notification?.remove()
      listenerRefsRef.current.response?.remove()
    }
  }, [enabled, isExpoGo])

  useEffect(() => {
    if (!enabled) return

    if (isExpoGo) {
      console.log('Skipping push setup in Expo Go. Use an APK/development build for remote push notifications.')
      return
    }

    if (!Device.isDevice) {
      console.log('Skipping push setup: not running on a physical device')
      return
    }

    if (hasRegisteredTokenRef.current) return

    const setupToken = async () => {
      try {
        console.log('Starting push token registration')
        const Notifications = getNotificationsModule()

        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== 'granted') {
          console.warn('Notification permission not granted')
          return
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ||
          Constants.easConfig?.projectId ||
          EAS_PROJECT_ID

        console.log('Push setup context:', {
          appOwnership: Constants.appOwnership,
          projectId,
          isDevice: Device.isDevice,
        })

        if (!projectId) {
          throw new Error('No EAS projectId found in app config')
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
        const token = tokenData?.data

        if (!token) {
          throw new Error('Expo push token was empty')
        }

        console.log(`Expo push token obtained: ${token.substring(0, 24)}...`)

        const response = await registerDeviceTokenMutation.mutateAsync({
          token,
          platform: 'expo',
        })

        hasRegisteredTokenRef.current = true
        console.log('Push token registered with backend:', response?.data?.message || response?.message)
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Unknown push notification setup error'

        console.error('Push token setup failed:', {
          message,
          status: error?.response?.status,
          data: error?.response?.data,
        })

        if (!hasShownErrorRef.current) {
          hasShownErrorRef.current = true
          Alert.alert('Push setup failed', message)
        }
      }
    }

    setupToken()
  }, [enabled, isExpoGo, registerDeviceTokenMutation])
}

export default usePushNotifications
