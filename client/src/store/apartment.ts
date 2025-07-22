import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApartmentProfile } from '@/interfaces/apartments'

interface ApartmentState {
  selectedApartment: string | null
  selectedProfile: ApartmentProfile | null
  setSelectedApartment: (id: string | null) => void
  setSelectedProfile: (profile: ApartmentProfile | null) => void
}

export const useApartmentStore = create<ApartmentState>()(
  persist(
    (set) => ({
      selectedApartment: null,
      selectedProfile: null,
      setSelectedApartment: (id) => set({ selectedApartment: id }),
      setSelectedProfile: (profile) => set({ selectedProfile: profile }),
    }),
    {
      name: 'apartment-store',
    }
  )
) 