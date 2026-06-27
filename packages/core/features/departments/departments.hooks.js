// packages/core/departments/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './departments.api'

/**
 * List departments
 */
export const useDepartments = (params) =>
  useQuery({
    queryKey: ['departments', params],
    queryFn: () => listDepartments(params).then(r => r?.data ?? r),
  })

/**
 * Get single department
 */
export const useDepartment = (id) =>
  useQuery({
    queryKey: ['department', id],
    enabled: !!id,
    queryFn: () => getDepartment(id).then(r => r?.data ?? r),
  })

/**
 * Create department
 */
export const useCreateDepartment = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      qc.invalidateQueries(['departments'])
    },
  })
}

/**
 * Update department
 */
export const useUpdateDepartment = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['departments'])
    },
  })
}

/**
 * Delete department
 */
export const useDeleteDepartment = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      qc.invalidateQueries(['departments'])
    },
  })
}
