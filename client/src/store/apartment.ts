import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApartmentWithProfile } from '@/interfaces/apartments'

interface ApartmentState {
  selectedApartment: string | null
  selectedProfile: ApartmentWithProfile | null
  setSelectedApartment: (id: string | null) => void
  setSelectedProfile: (profile: ApartmentWithProfile | null) => void
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