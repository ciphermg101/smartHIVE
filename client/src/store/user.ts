import { create } from 'zustand'
import type { ClerkUser } from '@/types/clerk'
import type { ApartmentProfile } from '@/interfaces/apartments'

interface UserState {
  user: ClerkUser | null
  profiles: ApartmentProfile[]
  selectedProfile: ApartmentProfile | null
  setUser: (user: ClerkUser | null) => void
  setProfiles: (profiles: ApartmentProfile[]) => void
  setSelectedProfile: (profile: ApartmentProfile | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profiles: [],
  selectedProfile: null,
  setUser: (user) => set({ user }),
  setProfiles: (profiles) => set({ profiles }),
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
}))
