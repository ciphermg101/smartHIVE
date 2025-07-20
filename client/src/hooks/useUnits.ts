import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

const API = '/api/v1/units'

export function useUnits(apartmentProfileId: string) {
  return useQuery({
    queryKey: ['units', apartmentProfileId],
    queryFn: async () => {
      const { data } = await api.get(API, { params: { apartmentProfileId } })
      return data.data
    },
    enabled: !!apartmentProfileId,
  })
}

export function useUnit(id: string, apartmentProfileId: string) {
  return useQuery({
    queryKey: ['unit', id, apartmentProfileId],
    queryFn: async () => {
      const { data } = await api.get(`${API}/${id}`, { params: { apartmentProfileId } })
      return data.data
    },
    enabled: !!id && !!apartmentProfileId,
  })
}

export function useCreateUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { unitNo: string; rent: number }) => api.post(API, { ...payload, apartmentProfileId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] })
  })
}

export function useUpdateUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; unitNo?: string; rent?: number; tenantId?: string | null }) => api.patch(`${API}/${id}`, { ...payload, apartmentProfileId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] })
  })
}

export function useDeleteUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`${API}/${id}`, { data: { apartmentProfileId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] })
  })
} 