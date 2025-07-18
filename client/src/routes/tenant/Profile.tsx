import { useQuery } from '@tanstack/react-query';
import api from '@lib/axios';

export default function TenantProfilePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const res = await api.get('/tenants/me');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-4">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load profile.</div>;
  if (!data) return <div className="p-4 text-gray-400">No tenant profile found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">My Tenant Profile</h2>
      <div className="mb-2"><span className="font-semibold">Unit:</span> {data.unitId}</div>
      <div className="mb-2"><span className="font-semibold">Apartment:</span> {data.apartmentId}</div>
      <div className="mb-2"><span className="font-semibold">Status:</span> {data.status}</div>
      <div className="mb-2"><span className="font-semibold">Created:</span> {new Date(data.createdAt).toLocaleString()}</div>
    </div>
  );
} 