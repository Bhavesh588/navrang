import { useQuery } from '@tanstack/react-query'
import { listReports, runReport } from './reports.api'

export const useReports = () => {
  const list = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await listReports()
      return res?.data ?? res
    },
  })

  const run = async (name, params) => {
    const res = await runReport(name, params)
    return res?.data ?? res
  }

  return {
    ...list,
    run,
  }
}

export const useStockReport = () => {
  return async (filters) => {
    const res = await runReport('stock', filters)
    return res?.data ?? res
  }
}
