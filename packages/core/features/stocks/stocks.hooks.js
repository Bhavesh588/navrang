import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listStocks,
  createStock,
  addStock,
  removeStock,
  deleteStock,
  getUserStocks,
} from './stocks.api'

/**
 * List stocks
 */
export const useStocks = (filters) =>
  useQuery({
    queryKey: ['stocks', filters],
    queryFn: () => listStocks(filters).then(r => r?.data.data ?? r)
  })

/**
 * List user stocks
 */
export const useUserStocks = (filters) =>
  useQuery({
    queryKey: ['stocks', filters],
    queryFn: () => getUserStocks().then(r => r?.data.data ?? r)
  })

/**
 * Create stock
 */
export const useCreateStock = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload) => {
      console.log('Old payload:', payload)
      return createStock(payload)
    },
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['stocks'], exact: false })
    },
  })
}

/**
 * Add stock
 */
export const useAddStock = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ stockId, quantity, remarks }) =>
      addStock(stockId, { quantity, remarks }),
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['stocks'], exact: false })
      qc.invalidateQueries({ queryKey: ['notifications'], exact: false })
    },
  })
}

/**
 * Remove stock
 */
export const useRemoveStock = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ stockId, quantity, remarks }) =>
      removeStock(stockId, { quantity, remarks }),
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['stocks'], exact: false })
      qc.invalidateQueries({ queryKey: ['notifications'], exact: false })
    },
  })
}

/**
 * Delete stock
 */
export const useDeleteStock = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ stockId }) => deleteStock(stockId),
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['stocks'], exact: false })
      qc.invalidateQueries({ queryKey: ['notifications'], exact: false })
    },
  })
}