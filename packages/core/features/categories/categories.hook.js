// packages/core/categories/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserCategories,
} from './categories.api'

/**
 * List categories
 */
export const useCategories = (params) =>
  useQuery({
    queryKey: ['categories', params],
    queryFn: () =>
      listCategories(params).then(r => r?.data ?? r),
  })

/**
 * List user categories
 */
export const useUserCategories = (filters) =>
  useQuery({
    queryKey: ['categories', filters],
    queryFn: () => getUserCategories().then(r => r?.data.data ?? r)
  })

/**
 * Get single category
 */
export const useCategory = (id) =>
  useQuery({
    queryKey: ['category', id],
    enabled: !!id,
    queryFn: () =>
      getCategory(id).then(r => r?.data ?? r),
  })

/**
 * Create category
 */
export const useCreateCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries(['categories'])
    },
  })
}

/**
 * Update category
 */
export const useUpdateCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['categories'])
    },
  })
}

/**
 * Delete category
 */
export const useDeleteCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries(['categories'])
    },
  })
}
