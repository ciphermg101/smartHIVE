import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = '/api/v1/rent'

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await axios.get(API)
      return data.data
    },
  })
}

export function useTenantPayments() {
  return useQuery({
    queryKey: ['tenantPayments'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/history`)
      return data.data
    },
  })
}

export function useSimulatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { unitId: string; amount: number }) => axios.post(`${API}/simulate`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenantPayments'] })
  })
} 