import React, { useState } from 'react';
import { useApartmentStore } from '@store/apartment';
import { useApartment, useApartmenTenants, useInviteApartmentUser, useRemoveApartmentUser, useUpdateApartment } from '@/hooks/useApartments';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { toast } from 'sonner';

const TABS = [
  { label: 'General' },
  { label: 'Tenants' },
];

const roles = [
  { value: 'Tenant', label: 'Tenant' },
  { value: 'Caretaker', label: 'Caretaker' },
];

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const ManageApartmentSection: React.FC = () => {
  const selectedApartment = useApartmentStore((s) => s.selectedApartment) || '';
  const { data: apartment, isLoading: apartmentLoading, error: apartmentError } = useApartment(selectedApartment);
  const { data: users = [], isLoading: usersLoading, error: usersError } = useApartmenTenants(selectedApartment);
  const inviteUser = useInviteApartmentUser(selectedApartment);
  const removeUser = useRemoveApartmentUser(selectedApartment);
  const updateApartment = useUpdateApartment(selectedApartment);

  const [tab, setTab] = useState('General');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [inviteList, setInviteList] = useState([{ email: '', role: 'Tenant' }]);
  const [inviting, setInviting] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General Tab
  function openEdit() {
    setEditForm(apartment);
    setEditOpen(true);
  }
  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    updateApartment.mutate(
      { id: apartment._id, ...editForm },
      {
        onSuccess: () => {
          setEditOpen(false);
          setSaving(false);
          toast.success('Apartment updated');
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || 'Failed to update apartment');
          setSaving(false);
        },
      }
    );
  }

  function handleInviteChange(idx: number, field: string, value: string) {
    setInviteList(list => list.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }
  function addInviteField() {
    setInviteList(list => [...list, { email: '', role: 'Member' }]);
  }
  function removeInviteField(idx: number) {
    setInviteList(list => list.filter((_, i) => i !== idx));
  }
  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    Promise.all(inviteList.map(inv =>
      inviteUser.mutateAsync({ email: inv.email, role: inv.role })
    ))
      .then(() => {
        setInviteList([{ email: '', role: 'Member' }]);
        toast.success('Invites sent');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to invite user');
      })
      .finally(() => setInviting(false));
  }
  function confirmRemoveUser(userId: string) {
    setRemoveId(userId);
  }
  function handleRemoveUser() {
    if (!removeId) return;
    setRemoving(true);
    setError(null);
    removeUser.mutate(removeId, {
      onSuccess: () => {
        setRemoveId(null);
        setRemoving(false);
        toast.success('User removed');
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || 'Failed to remove user');
        setRemoving(false);
      },
    });
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.label}
            className={`px-4 py-2 rounded-t-lg border-b-2 transition-all font-medium ${tab === t.label ? 'border-blue-500 bg-white dark:bg-zinc-900' : 'border-transparent bg-muted'}`}
            onClick={() => setTab(t.label)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'General' && (
        <div className="bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 rounded-xl p-6">
          <h3 className="text-gray-900 dark:text-white font-semibold">Apartment Details</h3>
          {apartmentLoading ? (
            <div>Loading apartment...</div>
          ) : apartmentError ? (
            <div className="text-red-600">{String(apartmentError)}</div>
          ) : apartment && (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 shadow-sm border border-gray-300 dark:border-zinc-700 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{apartment.name}</h2>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{apartment.location}</span>
                    </div>
                  </div>
                  <button 
                    onClick={openEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-5 border border-gray-300 dark:border-zinc-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Property Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {apartment.description || 'No description provided. Add a description to tell tenants more about this property.'}
                      </p>
                    </div>
                  </div>
                  
                  {apartment.imageUrl && (
                    <div className="relative h-64 lg:h-auto rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700">
                      <img 
                        src={apartment.imageUrl} 
                        alt="Apartment" 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                        <span className="text-white text-sm font-medium">Property Image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Edit Apartment</DialogTitle>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" value={editForm?.name || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input name="location" value={editForm?.location || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={editForm?.description || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input name="imageUrl" value={editForm?.imageUrl || ''} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded bg-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenants Tab */}
      {tab === 'Tenants' && (
  <div className="space-y-6">
          {/* Invite New Member */}
          <div className="bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 rounded-xl p-6 mb-2">
            <h3 className="text-lg font-semibold mb-2">Invite New Member</h3>
            <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {inviteList.map((invite, idx) => (
                <div key={idx} className="flex space-x-2 items-end">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={invite.email}
                    onChange={e => handleInviteChange(idx, 'email', e.target.value)}
                    className="px-3 py-2 border rounded w-48"
                    required
                  />
                  <select
                    value={invite.role}
                    onChange={e => handleInviteChange(idx, 'role', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  {inviteList.length > 1 && (
                    <button type="button" onClick={() => removeInviteField(idx)} className="text-red-500 text-lg">&times;</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addInviteField} className="text-blue-600 text-sm underline">Add More</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={inviting}>{inviting ? 'Inviting...' : 'Invite'}</button>
            </form>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>


          {/* Tenants Table */}
          <div className="bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 rounded-xl p-4">
            {usersLoading ? (
              <div>Loading Tenants...</div>
            ) : usersError ? (
              <div className="text-red-600">{String(usersError)}</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Date Added</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id || user.email} className="border-t">
                      <td className="py-2 flex items-center space-x-2">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name || user.email} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                            {getInitials(user.name || user.email)}
                          </span>
                        )}
                        <div>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-2 capitalize">{user.role}</td>
                      <td className="py-2">{user.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : ''}</td>
                      <td className="py-2 flex space-x-2">
                        <button className="text-blue-600 hover:underline text-sm">✏️</button>
                        <button className="text-red-500 hover:underline text-sm" onClick={() => confirmRemoveUser(user.userId)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      <Dialog open={removeId !== null} onOpenChange={() => { if (!removing) setRemoveId(null); }}>
        <DialogContent>
          <DialogTitle>Remove User</DialogTitle>
          <div className="mb-4">Are you sure you want to remove this user?</div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setRemoveId(null)} className="px-4 py-2 rounded bg-muted">Cancel</button>
            <button type="button" onClick={handleRemoveUser} className="px-4 py-2 rounded bg-red-600 text-white" disabled={removing}>{removing ? 'Removing...' : 'Remove'}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageApartmentSection; 