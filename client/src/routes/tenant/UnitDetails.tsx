import { useQuery } from '@tanstack/react-query';
import api from '@lib/axios';
import { useEffect, useState } from 'react';

export default function UnitDetails() {
  const [unitId, setUnitId] = useState<string | null>(null);

  // Fetch tenant profile to get unitId
  useEffect(() => {
    api.get('/tenants/me').then(res => setUnitId(res.data.data.unitId)).catch(() => setUnitId(null));
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      if (!unitId) throw new Error('No unitId');
      const res = await api.get(`/units/${unitId}`);
      return res.data.data;
    },
    enabled: !!unitId,
  });

  if (!unitId) return <div className="p-4 text-gray-400">No unit assigned.</div>;
  if (isLoading) return <div className="p-4">Loading unit details...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load unit details.</div>;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">My Unit Details</h2>
      <div className="mb-2"><span className="font-semibold">Unit No:</span> {data.unitNo}</div>
      <div className="mb-2"><span className="font-semibold">Rent:</span> {data.rent}</div>
      <div className="mb-2"><span className="font-semibold">Status:</span> {data.status}</div>
      <div className="mb-2"><span className="font-semibold">Apartment:</span> {data.apartmentId}</div>
      {/* Optionally fetch and show more apartment info */}
    </div>
  );
} 