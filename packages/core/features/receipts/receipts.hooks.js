// packages/core/receipts/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listReceipts,
  getReceipt,
  createReceipt,
} from './receipts.api'

/**
 * List receipts
 */
export const useReceipts = (params) =>
  useQuery({
    queryKey: ['receipts', params],
    queryFn: () =>
      listReceipts(params).then(r => r?.data ?? r),
  })

/**
 * Get single receipt
 */
export const useReceipt = (id) =>
  useQuery({
    queryKey: ['receipt', id],
    enabled: !!id,
    queryFn: () =>
      getReceipt(id).then(r => r?.data ?? r),
  })

/**
 * Create receipt
 */
export const useCreateReceipt = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createReceipt,
    onSuccess: () => {
      qc.invalidateQueries(['receipts'])
    },
  })
}
