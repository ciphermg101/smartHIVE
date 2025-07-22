import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApartmentForm } from '@/interfaces/apartments'

export function useCreateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApartmentForm) => {
      return api.post('/api/v1/apartments', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-apartments'] })
    },
  })
}

export function useApartments() {
  return useQuery({
    queryKey: ['apartments'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/apartments')
      return data.data
    },
  })
}

export function useApartment(apartmentId: string) {
  return useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/apartments/${apartmentId}`)
      return data.data
    },
    enabled: !!apartmentId,
  })
}

export function useUpdateApartment(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string }) => api.patch(`/api/v1/apartments/${apartmentId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] })
    },
  })
}

export function useDeleteApartment(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/api/v1/apartments/${apartmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
}

export function useMyApartments() {
  return useQuery({
    queryKey: ['my-apartments'],
    queryFn: async () => {
      const res = await api.get('/api/v1/apartments/my-apartments')
      return res.data.data
    },
  })
}

export function useApartmenTenants(apartmentId: string) {
  return useQuery({
    queryKey: ['apartment-users', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/apartments/${apartmentId}/users`)
      return data.data
    },
    enabled: !!apartmentId,
  })
}

export function useInviteApartmentUser(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; role: string; unitId?: string }) => {
      return api.post(`/api/v1/apartments/${apartmentId}/apartment-invite`, { ...payload, apartmentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-users', apartmentId] })
    },
    onError: (error: any) => {
      throw error.response?.data?.message || 'Failed to send invitation';
    }
  })
}

export function useRemoveApartmentUser(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!apartmentId) throw new Error('apartmentId is required');
      return api.delete(`/api/v1/apartments/${apartmentId}/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-users', apartmentId] })
    },
  })
}