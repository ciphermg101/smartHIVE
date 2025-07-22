import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@lib/axios'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get(`/users`)
      return data.data
    },
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data } = await axios.get(`/users/me`)
      return data.data
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => axios.patch(`/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export function useClerkSync() {
  return useMutation({
    mutationFn: (payload: any) => axios.post(`/users/clerk-sync`, payload)
  })
} 