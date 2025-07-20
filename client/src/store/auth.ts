import { create } from 'zustand'
import type { ClerkUser } from '@/types/clerk'

interface AuthState {
  user: ClerkUser | null
  role: string | null
  setUser: (user: ClerkUser | null) => void
  setRole: (role: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
}))
