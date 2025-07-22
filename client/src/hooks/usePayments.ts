import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@lib/axios'

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await axios.get(`/rent`)
      return data.data
    },
  })
}

export function useTenantPayments() {
  return useQuery({
    queryKey: ['tenantPayments'],
    queryFn: async () => {
      const { data } = await axios.get(`/rent/history`)
      return data.data
    },
  })
}

export function useSimulatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { unitId: string; amount: number }) => axios.post(`/rent/simulate`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenantPayments'] })
  })
} 