import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { uploadImageToCloudinary } from '@/utils/imageUpload';

const API = '/api/v1/units';

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
  unitNo: string;
  rent: number;
  imageUrl?: string;
  apartmentProfileId: string;
}

interface UpdateUnitPayload {
  id: string;
  unitNo?: string;
  rent?: number;
  tenantId?: string | null;
  imageUrl?: string | null;
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
}

export function useUnits(apartmentProfileId: string) {
  return useQuery<Unit[]>({
    queryKey: ['units', apartmentProfileId],
    queryFn: async () => {
      const { data } = await api.get(API, { params: { apartmentProfileId } });
      return data.data;
    },
    enabled: !!apartmentProfileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUnit(id: string, apartmentProfileId: string) {
  return useQuery<Unit>({
    queryKey: ['unit', id],
    queryFn: async () => {
      const { data } = await api.get(`${API}/${id}`, { params: { apartmentProfileId } });
      return data.data;
    },
    enabled: !!id && !!apartmentProfileId,
  });
}

export function useCreateUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Omit<CreateUnitPayload, 'apartmentProfileId'>) => {
      const { data } = await api.post(API, { ...payload, apartmentProfileId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] });
    },
  });
}

export function useUpdateUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateUnitPayload) => {
      const { data } = await api.patch(`${API}/${id}`, { ...payload, apartmentProfileId });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] });
      queryClient.invalidateQueries({ queryKey: ['unit', id] });
    },
  });
}

export function useDeleteUnit(apartmentProfileId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      api.delete(`${API}/${id}`, { data: { apartmentProfileId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', apartmentProfileId] });
    },
  });
}

export function useUploadUnitImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadImageToCloudinary(file, {
        uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL as string,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string,
      });
      return { imageUrl };
    },
  });
}