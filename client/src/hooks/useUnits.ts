import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = '/api/v1/units'

export function useUnits(apartmentId: string) {
  return useQuery({
    queryKey: ['units', apartmentId],
    queryFn: async () => {
      const { data } = await axios.get(API, { params: { apartmentId } })
      return data.data
    },
    enabled: !!apartmentId,
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { unitNo: string; rent: number; apartmentId: string }) => axios.post(API, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] })
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; unitNo?: string; rent?: number; tenantId?: string | null }) => axios.patch(`${API}/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] })
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] })
  })
} 