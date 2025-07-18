import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';
import { useState, useEffect } from 'react';
import { showToast } from '@components/ui/Toast';

export default function TenantRentPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['rent-history'],
    queryFn: async () => {
      const res = await api.get('/rent/history');
      return res.data.data;
    },
  });

  const [unitId, setUnitId] = useState('');
  const [amount, setAmount] = useState('');

  // Fetch tenant's unitId for payment simulation
  useEffect(() => {
    api.get('/tenants/me').then(res => setUnitId(res.data.data.unitId)).catch(() => setUnitId(''));
  }, []);

  const simulateMutation = useMutation({
    mutationFn: async (values: { unitId: string; amount: number }) => {
      const res = await api.post('/rent/simulate', values);
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Payment simulated', type: 'success' });
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['rent-history'] });
    },
    onError: () => showToast({ message: 'Failed to simulate payment', type: 'error' }),
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Rent</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!unitId || !amount) return;
          simulateMutation.mutate({ unitId, amount: parseFloat(amount) });
        }}
        className="flex flex-col md:flex-row gap-2 mb-6"
      >
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          className="border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition" disabled={!unitId || !amount || simulateMutation.isLoading}>
          {simulateMutation.isLoading ? 'Simulating...' : 'Simulate Payment'}
        </button>
      </form>
      <h3 className="text-lg font-semibold mb-2">Payment History</h3>
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
              </tr>
            </thead>
            <tbody>
              {data?.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-2">{p.amount}</td>
                  <td className="p-2">{new Date(p.date).toLocaleString()}</td>
                  <td className="p-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 