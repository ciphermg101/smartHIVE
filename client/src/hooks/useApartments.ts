import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { Apartment, ApartmentForm } from '@/interfaces/apartments'

export function useMyApartments() {
  return useQuery({
    queryKey: ['my-apartments'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/tenants/my-apartments')
      return res.data.data as Apartment[]
    },
  })
}

export function useApartments() {
  return useQuery({
    queryKey: ['apartments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/apartments')
      return data.data
    },
  })
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/v1/apartments/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApartmentForm) => {
      return axios.post('/api/v1/apartments', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-apartments'] })
    },
  })
}

export function useUpdateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string }) => axios.patch(`/api/v1/apartments/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
}

export function useDeleteApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/apartments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
} 