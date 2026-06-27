import { useQuery } from '@tanstack/react-query'
import { listRoles } from './roles.api'

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await listRoles()
      return res?.data ?? res
    },
  })
}
