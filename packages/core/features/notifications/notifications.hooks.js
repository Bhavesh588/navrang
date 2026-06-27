// packages/core/notifications/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listNotifications,
  getNotification,
  createNotification,
  markNotificationRead,
} from './notifications.api.js'

/**
 * List notifications
 */
export const useNotifications = (params) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: () =>
      listNotifications(params).then(r => r?.data ?? r),
  })

/**
 * Get single notification
 */
export const useNotification = (id) =>
  useQuery({
    queryKey: ['notification', id],
    enabled: !!id,
    queryFn: () =>
      getNotification(id).then(r => r?.data ?? r),
  })

/**
 * Create notification
 */
export const useCreateNotification = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
    },
  })
}

/**
 * Mark a notification as read
 */
export const useMarkNotificationRead = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
    },
  })
}
