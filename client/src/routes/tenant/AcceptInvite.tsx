import { useState } from 'react';
import api from '@lib/axios';
import { showToast } from '@components/ui/Toast';

export default function AcceptInvitePage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tenants/accept-invite', { token });
      setTenant(res.data.data);
      setAccepted(true);
      showToast({ message: 'Invite accepted!', type: 'success' });
    } catch (err: any) {
      showToast({ message: err?.response?.data?.message || 'Failed to accept invite', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (accepted && tenant) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Invite Accepted</h2>
        <div className="mb-2"><span className="font-semibold">Unit:</span> {tenant.unitId}</div>
        <div className="mb-2"><span className="font-semibold">Apartment:</span> {tenant.apartmentId}</div>
        <div className="mb-2"><span className="font-semibold">Status:</span> {tenant.status}</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">Accept Tenant Invite</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Enter invite token"
          className="border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition" disabled={loading}>
          {loading ? 'Accepting...' : 'Accept Invite'}
        </button>
      </form>
    </div>
  );
} 