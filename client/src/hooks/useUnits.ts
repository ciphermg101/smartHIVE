import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';

export interface Unit {
  _id: string;
  unitNo: string;
  rent: number;
  tenantId?: string | null;
  apartmentId: string;
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUnitPayload {
  apartmentId: string;
  unitNo: string;
  rent: number;
  imageUrl?: string;
}

interface UpdateUnitPayload {
  id: string;
  unitNo?: string;
  rent?: number;
  tenantId?: string | null;
  imageUrl?: string | null;
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
}

export function useUnits(apartmentId?: string) {
  return useQuery<Unit[]>({
    queryKey: ['units', apartmentId],
    queryFn: async () => {
      const { data } = await api.get(`/units`, { params: { apartmentId } });
      return data.data;
    },
    enabled: !!apartmentId && apartmentId.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUnit(id: string, apartmentId: string) {
  return useQuery<Unit>({
    queryKey: ['unit', id],
    queryFn: async () => {
      const { data } = await api.get(`/units/${id}`, { params: { apartmentId } });
      return data.data;
    },
    enabled: !!id && !!apartmentId,
  });
}

export function useCreateUnit(apartmentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateUnitPayload) => {
      const { data } = await api.post(`/units`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentId] });
    },
  });
}

export function useUpdateUnit(apartmentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateUnitPayload) => {
      const { data } = await api.patch(`/units/${id}`, { ...payload, apartmentId });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentId] });
      queryClient.invalidateQueries({ queryKey: ['unit', id] });
    },
  });
}

export function useDeleteUnit(apartmentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      api.delete(`/units/${id}`, { data: { apartmentId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentId] });
    },
  });
}
