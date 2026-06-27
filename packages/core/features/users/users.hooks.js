// packages/core/users/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
} from './users.api.js'

/**
 * List users
 */
export const useUsers = (params) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => listUsers(params).then(r => r?.data ?? r),
  })

/**
 * Get single user
 */
export const useUser = (id) =>
  useQuery({
    queryKey: ['user', id],
    enabled: !!id,
    queryFn: () => getUser(id).then(r => r?.data ?? r),
  })

/**
 * Create user
 */
export const useCreateUser = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries(['users'])
    },
  })
}

/**
 * Update user
 */
export const useUpdateUser = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['users'])
    },
  })
}
