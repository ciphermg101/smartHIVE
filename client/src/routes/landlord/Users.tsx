import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';
import { showToast } from '@components/ui/Toast';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch(`/users/${id}/role`, { role });
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'User role updated', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => showToast({ message: 'Failed to update user role', type: 'error' }),
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center text-gray-400">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-900 rounded shadow min-w-[400px]">
            <thead>
              <tr>
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Apartment</th>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((u: any) => (
                <tr key={u._id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-2">{u.clerkUserId}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={e => updateRoleMutation.mutate({ id: u._id, role: e.target.value })}
                      className="border rounded px-2 py-1 focus:ring-2 focus:ring-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <option value="landlord">landlord</option>
                      <option value="tenant">tenant</option>
                    </select>
                  </td>
                  <td className="p-2">{u.apartmentId || '-'}</td>
                  <td className="p-2">{u.unitId || '-'}</td>
                  <td className="p-2">{/* Future: more actions */}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 