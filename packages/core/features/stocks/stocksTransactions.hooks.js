// packages/core/stocks/transactions.hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listStockTransactions,
  createStockTransaction,
} from './stocksTransactions.api'

export const useStockTransactions = (filters) => {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['stockTransactions', filters],
    queryFn: () =>
      listStockTransactions(filters).then(r => r?.data ?? r),
  })

  const create = useMutation({
    mutationFn: createStockTransaction,
    onSuccess: () => {
      qc.invalidateQueries(['stockTransactions'])
    },
  })

  return { ...query, create }
}
