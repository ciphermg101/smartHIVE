import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = '/api/v1/issues'

export function useIssues() {
  return useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data } = await axios.get(API)
      return data.data
    },
  })
}

export function useReportIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { title: string; description: string; unitId: string; file?: File }) => {
      const formData = new FormData()
      formData.append('title', payload.title)
      formData.append('description', payload.description)
      formData.append('unitId', payload.unitId)
      if (payload.file) formData.append('file', payload.file)
      return axios.post(API, formData)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] })
  })
}

export function useUpdateIssueStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => axios.patch(`${API}/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] })
  })
} 