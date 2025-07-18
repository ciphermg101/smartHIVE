import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';
import { useState } from 'react';
import { showToast } from '@components/ui/Toast';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/forms/Input';

interface Tenant {
  _id: string;
  userId: string;
  apartmentId: string;
  unitId: string;
  status: string;
}

interface Unit {
  _id: string;
  unitNo: string;
  apartmentId: string;
}

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await api.get('/tenants');
      return res.data.data;
    },
  });
  const { data: units } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    },
  });

  const [showInvite, setShowInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: async (values: { unitId: string; expiration?: string; email?: string }) => {
      const res = await api.post('/tenants/invite', values);
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      showToast({ message: 'Invite created', type: 'success' });
      setInviteToken(data.token);
      setShowInvite(false);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      if (variables.email) {
        showToast({ message: `Invite sent to ${variables.email} (simulated)`, type: 'info' });
      }
    },
    onError: () => showToast({ message: 'Failed to create invite', type: 'error' }),
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tenants</h2>
      <div className="mb-4">
        <button onClick={() => { setShowInvite(true); setInviteToken(null); }} className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition">Invite Tenant</button>
      </div>
      {showInvite && (
        <InviteTenantForm
          units={units || []}
          onSubmit={values => inviteMutation.mutate(values)}
          onCancel={() => setShowInvite(false)}
        />
      )}
      {inviteToken && (
        <div className="mb-4 p-4 bg-green-100 rounded">
          <div className="font-semibold">Invite Token:</div>
          <div className="font-mono break-all">{inviteToken}</div>
          <button onClick={() => { navigator.clipboard.writeText(inviteToken); showToast({ message: 'Copied!', type: 'success' }); }} className="mt-2 bg-blue-500 text-white px-2 py-1 rounded">Copy</button>
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : tenants?.length === 0 ? (
        <div className="text-center text-gray-400">No tenants found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-900 rounded shadow min-w-[400px]">
            <thead>
              <tr>
                <th className="p-2 text-left">Tenant ID</th>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-left">Apartment</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map(t => (
                <tr key={t._id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-2">{t.userId}</td>
                  <td className="p-2">{units?.find(u => u._id === t.unitId)?.unitNo || t.unitId}</td>
                  <td className="p-2">{t.apartmentId}</td>
                  <td className="p-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InviteTenantForm({ units, onSubmit, onCancel }: { units: Unit[]; onSubmit: (values: { unitId: string; expiration?: string; email: string }) => void; onCancel: () => void }) {
  const [unitId, setUnitId] = useState('');
  const [expiration, setExpiration] = useState('');
  const [email, setEmail] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ unitId, expiration: expiration || undefined, email }); }} className="flex flex-col md:flex-row gap-2 mb-4">
      <FormField label="Unit" name="unitId" error={undefined}>
        <select value={unitId} onChange={e => setUnitId(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="">Select unit</option>
          {units.map(u => (
            <option key={u._id} value={u._id}>{u.unitNo}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Tenant Email" name="email" error={undefined}>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tenant@email.com" />
      </FormField>
      <FormField label="Expiration (optional)" name="expiration" error={undefined}>
        <Input type="date" value={expiration} onChange={e => setExpiration(e.target.value)} />
      </FormField>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition">Send Invite</button>
      <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-gray-400 hover:bg-gray-400 transition">Cancel</button>
    </form>
  );
} 