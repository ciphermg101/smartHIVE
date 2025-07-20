import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

const API = '/api/v1/issues'

export function useIssues(apartmentProfileId: string) {
  return useQuery({
    queryKey: ['issues', apartmentProfileId],
    queryFn: async () => {
      const { data } = await api.get(API, { params: { apartmentProfileId } })
      return data.data
    },
    enabled: !!apartmentProfileId,
  })
}

export function useReportIssue(apartmentProfileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; description: string; unitId: string; imageUrl?: string }) => {
      return api.post(API, { ...payload, apartmentProfileId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues', apartmentProfileId] })
  })
}

export function useUpdateIssueStatus(apartmentProfileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`${API}/${id}/status`, { status, apartmentProfileId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues', apartmentProfileId] })
  })
} 