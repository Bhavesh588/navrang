import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteSaleGroup, getSaleGroup, listSales, listUserSales } from './sales.api'

export const useSales = (filters) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const res = await listSales(filters)
      return res?.data ?? res
    },
  })
}

export const useUserSales = (userId) => {
  return useQuery({
    queryKey: ['userSales', userId],
    queryFn: async () => {
      const res = await listUserSales(userId)
      return res?.data ?? res
    },
    enabled: !!userId,
  })
}

export const useSaleGroup = (saleGroupId) => {
  return useQuery({
    queryKey: ['saleGroup', saleGroupId],
    queryFn: async () => {
      const res = await getSaleGroup(saleGroupId)
      return res?.data ?? res
    },
    enabled: !!saleGroupId,
  })
}

export const useDeleteSaleGroup = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (saleGroupId) => deleteSaleGroup(saleGroupId),
    onSuccess: async (_, saleGroupId) => {
      await qc.invalidateQueries({ queryKey: ['sales'], exact: false })
      await qc.invalidateQueries({ queryKey: ['userSales'], exact: false })
      await qc.invalidateQueries({ queryKey: ['saleGroup', saleGroupId], exact: false })
      await qc.invalidateQueries({ queryKey: ['stocks'], exact: false })
    },
  })
}
