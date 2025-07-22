import React, { useState } from 'react';
import { useApartmentStore } from '@store/apartment';
import { useApartment, useApartmenTenants, useInviteApartmentUser, useRemoveApartmentUser, useUpdateApartment } from '@/hooks/useApartments';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { toast } from 'sonner';
import {
  uploadImageToCloudinary,
  validateImageFile,
  createPreviewUrl,
  cleanupPreviewUrl,
  type ImageUploadProgress
} from '@utils/imageUpload';

const imageUploadConfig = {
  uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [inviteList, setInviteList] = useState([{ email: '', role: 'Tenant' }]);
  const [inviting, setInviting] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General Tab
  function openEdit() {
    setEditForm(apartment);
    setPreviewUrl(apartment?.imageUrl || "");
    setSelectedFile(null);
    setEditOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, { maxSizeBytes: 3 * 1024 * 1024 });
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }

    setSelectedFile(file);
    setError(null);

    const newPreviewUrl = createPreviewUrl(file);
    setPreviewUrl(newPreviewUrl);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let imageUrl = editForm?.imageUrl || '';
      if (selectedFile) {
        try {
          setUploading(true);
          const folderName = apartment?.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
            
          imageUrl = await uploadImageToCloudinary(
            selectedFile,
            imageUploadConfig,
            {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.8,
              maxSizeBytes: 3 * 1024 * 1024,
              folder: `apartments/${folderName}`
            },
            (progress) => setUploadProgress(progress)
          );
        } catch (error) {
          setError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUploading(false);
          setSaving(false);
          return;
        }
      }

      updateApartment.mutate(
        {
          id: apartment._id,
          ...editForm,
          imageUrl
        },
        {
          onSuccess: () => {
            setEditOpen(false);
            setSaving(false);
            setUploading(false);
            setUploadProgress(null);
            toast.success('Apartment updated');
          },
          onError: (err: any) => {
            setError(err?.response?.data?.message || 'Failed to update apartment');
            setSaving(false);
            setUploading(false);
            setUploadProgress(null);
          },
        }
      );
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setSaving(false);
      setUploading(false);
      setUploadProgress(null);
    }
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
  
    type InviteResult = { success: boolean; email: string; error?: string };
    
    Promise.all(
      inviteList.map(invite =>
        inviteUser.mutateAsync({ email: invite.email, role: invite.role })
          .then(() => ({ success: true, email: invite.email }))
          .catch((err): InviteResult => ({
            success: false,
            email: invite.email,
            error: err.response?.data?.message || 'Failed to send invite'
          }))
      )
    )
      .then((results: InviteResult[]) => {
        const failedInvites = results.filter(r => !r.success);
        if (failedInvites.length > 0) {
          const errorMessages = failedInvites
            .map(f => `${f.email}: ${f.error || 'Unknown error'}`)
            .join('\n');
          setError(`Some invites failed:\n${errorMessages}`);
        } else {
          setInviteList([{ email: '', role: 'Tenant' }]);
          toast.success('Invites sent successfully');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to send invites');
      })
      .finally(() => {
        setInviting(false);
      });
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
      <Dialog open={editOpen} onOpenChange={(open) => {
        if (!open && previewUrl) {
          cleanupPreviewUrl(previewUrl);
          setPreviewUrl("");
          setSelectedFile(null);
          setUploadProgress(null);
        }
        setEditOpen(open);
      }}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full rounded-xl shadow-2xl p-8 bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
          <DialogTitle className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Apartment Details
          </DialogTitle>
          <p className="mb-6 text-sm text-muted-foreground">
            Update your apartment information
          </p>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Apartment Name
              </label>
              <input
                type="text"
                name="name"
                value={editForm?.name || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editForm?.location || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={editForm?.description || ''}
                onChange={handleEditChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Apartment Image (optional, max 3MB - optimized for faster upload)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading || saving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-800/50"
              />

              {uploadProgress && (
                <div className="space-y-2 mt-2">
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {uploadProgress.stage === 'compressing' && "Compressing image for faster upload..."}
                    {uploadProgress.stage === 'uploading' && `Uploading ${Math.round(uploadProgress.progress)}%`}
                    {uploadProgress.stage === 'complete' && "Upload complete!"}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {(previewUrl || editForm?.imageUrl) && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {selectedFile ? 'New Image Preview:' : 'Current Image:'}
                  </p>
                  <img
                    src={previewUrl || editForm.imageUrl}
                    alt="Apartment preview"
                    className="rounded-md border h-32 w-full object-cover mt-1"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenants Tab */}
      {tab === 'Tenants' && (
        <div className="space-y-6">
          {/* Invite New Members Section */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite New Members</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add new members to your apartment by their email addresses</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-3">
                  {inviteList.map((invite, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 sm:col-span-7">
                        <label htmlFor={`email-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          id={`email-${idx}`}
                          type="email"
                          placeholder="member@example.com"
                          value={invite.email}
                          onChange={e => handleInviteChange(idx, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
                          required
                        />
                      </div>
                      <div className="col-span-8 sm:col-span-4">
                        <label htmlFor={`role-${idx}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Role
                        </label>
                        <select
                          id={`role-${idx}`}
                          value={invite.role}
                          onChange={e => handleInviteChange(idx, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
                        >
                          {roles.map(r => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4 sm:col-span-1 flex items-end h-10">
                        {inviteList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInviteField(idx)}
                            className="w-full h-10 flex items-center justify-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label="Remove field"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={addInviteField}
                    className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another
                  </button>

                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {inviting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Invites...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Send Invites
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-3 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>


          {/* Members List */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Members</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {users.length} {users.length === 1 ? 'member' : 'members'} in this apartment
                </p>
              </div>
              {users.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => { /* Handle export */ }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              )}
            </div>

            {usersLoading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : usersError ? (
              <div className="p-6 text-red-600 dark:text-red-400">
                Error loading members. Please try again later.
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium">No members yet</h3>
                <p className="mt-1 text-sm">Invite members to join your apartment.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                {users.map((user: any) => (
                  <div key={user._id || user.email} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name || user.email}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(user.name || user.email)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name || user.email}
                            {user.role === 'admin' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                {user.role}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Joined {user.dateJoined ? new Date(user.dateJoined).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { /* Handle edit */ }}
                          className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label="Edit member"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmRemoveUser(user.userId)}
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          aria-label="Remove member"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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