import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@lib/axios';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/forms/Input';
import { showToast } from '@components/ui/Toast';
import { Pagination } from '@components/ui/Pagination';
import { useState, useEffect } from 'react';
import { UnitsForm } from './UnitsForm';

const PAGE_SIZE = 10;

const ApartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type ApartmentForm = z.infer<typeof ApartmentSchema>;

type Apartment = {
  _id: string;
  name: string;
  description?: string;
};

type ApartmentListResponse = {
  data: Apartment[];
  total: number;
};

type Unit = {
  _id: string;
  unitNo: string;
  rent: number;
  tenantId?: string | null;
  apartmentId: string;
  status: string;
};

function UnitsTable({ apartmentId }: { apartmentId: string }) {
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const fetchUnits = () => {
    setLoading(true);
    api.get(`/units?apartmentId=${apartmentId}`)
      .then(res => setUnits(res.data.data))
      .catch(() => setError('Failed to load units'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line
  }, [apartmentId]);

  const createMutation = useMutation({
    mutationFn: async (values: { unitNo: string; rent: number }) => {
      const res = await api.post('/units', { ...values, apartmentId });
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Unit created', type: 'success' });
      setShowCreate(false);
      fetchUnits();
    },
    onError: () => showToast({ message: 'Failed to create unit', type: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { unitNo: string; rent: number } }) => {
      const res = await api.patch(`/units/${id}`, values);
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Unit updated', type: 'success' });
      setEditingUnit(null);
      fetchUnits();
    },
    onError: () => showToast({ message: 'Failed to update unit', type: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/units/${id}`);
      return id;
    },
    onSuccess: () => {
      showToast({ message: 'Unit deleted', type: 'success' });
      fetchUnits();
    },
    onError: () => showToast({ message: 'Failed to delete unit', type: 'error' }),
  });

  if (loading) return <div className="p-4">Loading units...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto mt-2">
      <div className="mb-2">
        {showCreate ? (
          <UnitsForm
            onSubmit={values => createMutation.mutate(values)}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create"
          />
        ) : (
          <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition">Add Unit</button>
        )}
      </div>
      <table className="w-full bg-gray-50 dark:bg-gray-900 rounded shadow min-w-[400px]">
        <thead>
          <tr>
            <th className="p-2 text-left">Unit No</th>
            <th className="p-2 text-left">Rent</th>
            <th className="p-2 text-left">Tenant</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units && units.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-gray-400">No units for this apartment.</td></tr>
          )}
          {units?.map(unit => (
            <tr key={unit._id} className="border-t border-gray-200 dark:border-gray-800">
              <td className="p-2">
                {editingUnit?._id === unit._id ? (
                  <UnitsForm
                    initialValues={{ unitNo: unit.unitNo, rent: unit.rent }}
                    onSubmit={values => updateMutation.mutate({ id: unit._id, values })}
                    onCancel={() => setEditingUnit(null)}
                    submitLabel="Save"
                  />
                ) : (
                  unit.unitNo
                )}
              </td>
              <td className="p-2">{unit.rent}</td>
              <td className="p-2">{unit.tenantId || '-'}</td>
              <td className="p-2">{unit.status}</td>
              <td className="p-2 flex gap-2">
                {editingUnit?._id === unit._id ? null : (
                  <>
                    <button onClick={() => setEditingUnit(unit)} className="bg-blue-500 text-white px-2 py-1 rounded focus:ring-2 focus:ring-blue-400 hover:bg-blue-600 transition">Edit</button>
                    <button onClick={() => deleteMutation.mutate(unit._id)} className="bg-red-500 text-white px-2 py-1 rounded focus:ring-2 focus:ring-red-400 hover:bg-red-600 transition">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ApartmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<ApartmentListResponse>({
    queryKey: ['apartments', page],
    queryFn: async () => {
      const res = await api.get(`/apartments?page=${page}&limit=${PAGE_SIZE}`);
      return { data: res.data.data, total: res.data.total || res.data.count || 0 };
    },
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: async (values: ApartmentForm) => {
      const res = await api.post('/apartments', values);
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Apartment created', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      reset();
    },
    onError: (err: any) => {
      showToast({ message: err?.response?.data?.message || 'Failed to create apartment', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ApartmentForm }) => {
      const res = await api.patch(`/apartments/${id}`, values);
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Apartment updated', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setEditingId(null);
    },
    onError: (err: any) => {
      showToast({ message: err?.response?.data?.message || 'Failed to update apartment', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/apartments/${id}`);
      return id;
    },
    onSuccess: () => {
      showToast({ message: 'Apartment deleted', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
    onError: (err: any) => {
      showToast({ message: err?.response?.data?.message || 'Failed to delete apartment', type: 'error' });
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApartmentForm>({
    resolver: zodResolver(ApartmentSchema),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ApartmentForm>({ name: '', description: '' });
  const [expandedApartmentId, setExpandedApartmentId] = useState<string | null>(null);

  const onSubmit = (values: ApartmentForm) => {
    createMutation.mutate(values);
  };

  const onEdit = (apt: Apartment) => {
    setEditingId(apt._id);
    setEditValues({ name: apt.name, description: apt.description || '' });
  };

  const onEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, values: editValues });
    }
  };

  const onDelete = (id: string) => {
    if (window.confirm('Delete this apartment?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Apartments</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-white dark:bg-gray-900 p-4 rounded shadow">
        <div className="flex gap-4">
          <FormField label="Name" name="name" error={errors.name}>
            <Input {...register('name')} placeholder="Apartment name" />
          </FormField>
          <FormField label="Description" name="description" error={errors.description}>
            <Input {...register('description')} placeholder="Description (optional)" />
          </FormField>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded self-end">Create</button>
        </div>
      </form>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : (data?.data.length === 0 ? (
        <div className="text-center text-gray-400">No apartments found. Create your first apartment!</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-900 rounded shadow min-w-[400px]">
              <thead>
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((apt) => (
                  <>
                    <tr
                      key={apt._id}
                      className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-100 dark:focus-within:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => setExpandedApartmentId(expandedApartmentId === apt._id ? null : apt._id)}
                    >
                      <td className="p-2">
                        {editingId === apt._id ? (
                          <input
                            name="name"
                            value={editValues.name}
                            onChange={onEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          apt.name
                        )}
                      </td>
                      <td className="p-2">
                        {editingId === apt._id ? (
                          <input
                            name="description"
                            value={editValues.description}
                            onChange={onEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          apt.description
                        )}
                      </td>
                      <td className="p-2 flex gap-2">
                        {editingId === apt._id ? (
                          <>
                            <button onClick={onEditSubmit} className="bg-green-500 text-white px-2 py-1 rounded focus:ring-2 focus:ring-green-400 hover:bg-green-600 transition">Save</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 py-1 rounded focus:ring-2 focus:ring-gray-400 hover:bg-gray-400 transition">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onEdit(apt)} className="bg-blue-500 text-white px-2 py-1 rounded focus:ring-2 focus:ring-blue-400 hover:bg-blue-600 transition">Edit</button>
                            <button onClick={() => onDelete(apt._id)} className="bg-red-500 text-white px-2 py-1 rounded focus:ring-2 focus:ring-red-400 hover:bg-red-600 transition">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                    {expandedApartmentId === apt._id && (
                      <tr>
                        <td colSpan={3} className="bg-gray-100 dark:bg-gray-800">
                          <UnitsTable apartmentId={apt._id} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={Math.ceil((data?.total || 0) / PAGE_SIZE)}
            onPageChange={setPage}
          />
        </>
      ))}
    </div>
  );
} 