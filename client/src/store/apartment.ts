import { create } from 'zustand'
import type { ApartmentProfile } from '@/store/user'

interface ApartmentState {
  selectedApartment: string | null
  selectedProfile: ApartmentProfile | null
  setSelectedApartment: (id: string | null) => void
  setSelectedProfile: (profile: ApartmentProfile | null) => void
}

export const useApartmentStore = create<ApartmentState>((set) => ({
  selectedApartment: null,
  selectedProfile: null,
  setSelectedApartment: (id) => set({ selectedApartment: id }),
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
})) 