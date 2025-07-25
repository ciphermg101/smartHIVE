import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@lib/axios'
import type { UserProfile } from '@/interfaces/user.interface'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data } = await axios.get(`/users`)
      return data.data
    },
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile> => {
      const { data } = await axios.get(`/users/me`)
      return data.data
    },
  })
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserProfile> => {
      const { data } = await axios.get(`/users/${userId}`)
      return data.data
    },
    enabled: !!userId,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => 
      axios.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    }
  })
}

export function useClerkSync() {
  return useMutation({
    mutationFn: (payload: any) => axios.post(`/users/clerk-sync`, payload)
  })
}