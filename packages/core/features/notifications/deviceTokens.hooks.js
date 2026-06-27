import { useMutation, useQuery } from '@tanstack/react-query'
import { registerDeviceToken, unregisterDeviceToken, listMyDeviceTokens } from './deviceTokens.api.js'

export const useRegisterDeviceToken = () =>
  useMutation({
    mutationFn: registerDeviceToken,
  })

export const useUnregisterDeviceToken = () =>
  useMutation({
    mutationFn: unregisterDeviceToken,
  })

export const useMyDeviceTokens = () =>
  useQuery({
    queryKey: ['device-tokens'],
    queryFn: () => listMyDeviceTokens().then((r) => r?.data ?? r),
  })
