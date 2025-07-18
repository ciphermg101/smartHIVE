import { useQuery } from '@tanstack/react-query';
import api from '@lib/axios';

export default function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-4">Loading user profile...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load user profile.</div>;
  if (!data) return <div className="p-4 text-gray-400">No user profile found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">My User Profile</h2>
      <div className="mb-2"><span className="font-semibold">Role:</span> {data.role}</div>
      <div className="mb-2"><span className="font-semibold">Apartment:</span> {data.apartmentId || '-'}</div>
      <div className="mb-2"><span className="font-semibold">Unit:</span> {data.unitId || '-'}</div>
      <div className="mb-2"><span className="font-semibold">Created:</span> {new Date(data.createdAt).toLocaleString()}</div>
    </div>
  );
} 