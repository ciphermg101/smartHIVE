import { useQuery } from '@tanstack/react-query';
import api from '@lib/axios';

export default function LandlordPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: async () => {
      const res = await api.get('/rent');
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Payments</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center text-gray-400">No payments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-900 rounded shadow min-w-[400px]">
            <thead>
              <tr>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Tenant</th>
                <th className="p-2 text-left">Unit</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-2">{p.amount}</td>
                  <td className="p-2">{new Date(p.date).toLocaleString()}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{p.tenantId}</td>
                  <td className="p-2">{p.unitId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 