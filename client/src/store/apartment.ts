import { create } from 'zustand'
import type { Apartment } from '@/interfaces/apartments'

interface ApartmentState {
  selectedApartment: Apartment | null
  setSelectedApartment: (apartment: Apartment) => void
  clearSelectedApartment: () => void
}

export const useApartmentStore = create<ApartmentState>((set) => ({
  selectedApartment: null,
  setSelectedApartment: (apartment) => set({ selectedApartment: apartment }),
  clearSelectedApartment: () => set({ selectedApartment: null }),
})) 