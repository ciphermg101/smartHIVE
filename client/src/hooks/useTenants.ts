import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = '/api/v1/tenants'

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await axios.get(API)
      return data.data
    },
  })
}

export function useInviteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { unitId: string; expiration?: string }) => axios.post(`${API}/invite`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] })
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (payload: { token: string }) => axios.post(`${API}/accept-invite`, payload)
  })
}

export function useMyTenantDetails() {
  return useQuery({
    queryKey: ['myTenant'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/me`)
      return data.data
    },
  })
} 