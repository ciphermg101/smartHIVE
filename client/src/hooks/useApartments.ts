import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@lib/axios'
import type { ApartmentForm, ApartmentWithProfile } from '@/interfaces/apartments'

export function useCreateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApartmentForm) => {
      return api.post('/apartments', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-apartments'] })
    },
  })
}

export function useApartment(apartmentId: string) {
  return useQuery<ApartmentWithProfile>({
    queryKey: ['apartment', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/apartments/${apartmentId}`)
      const response = data.data.data;
      return response;
    },
  })
}

export function useUpdateApartment(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string }) => api.patch(`/apartments/${apartmentId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] })
    },
  })
}

export function useDeleteApartment(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/apartments/${apartmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
}

export function useMyApartments() {
  return useQuery({
    queryKey: ['my-apartments'],
    queryFn: async () => {
      const res = await api.get('/apartments/my-apartments')
      const response = res.data.data.data;
      return response;
    },
  })
}

export function useApartmenTenants(apartmentId: string) {
  return useQuery({
    queryKey: ['apartment-tenants', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/apartments/${apartmentId}/tenants`)
      const response = data.data.data;
      return response;
    },
  })
}

export function useInviteApartmentUser(apartmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; role: string; unitId: string }) => {
      return api.post(`/apartments/${apartmentId}/apartment-invite`, { ...payload, apartmentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-tenants', apartmentId] })
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
      return api.delete(`/apartments/${apartmentId}/tenants/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-tenants', apartmentId] })
    },
  })
}