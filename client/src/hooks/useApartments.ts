import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = '/api/v1/apartments'

export function useApartments() {
  return useQuery({
    queryKey: ['apartments'],
    queryFn: async () => {
      const { data } = await axios.get(API)
      return data.data
    },
  })
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => axios.post(API, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
}

export function useUpdateApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string }) => axios.patch(`${API}/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
}

export function useDeleteApartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apartments'] })
  })
} 