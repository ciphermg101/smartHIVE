import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@lib/axios';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/forms/Input';
import { Textarea } from '@components/forms/Textarea';
import { showToast } from '@components/ui/Toast';
import { Pagination } from '@components/ui/Pagination';
import { useState } from 'react';

const PAGE_SIZE = 10;

const IssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  unitId: z.string().min(1, 'Unit is required'),
  file: z.any().optional(),
});

type IssueForm = z.infer<typeof IssueSchema>;

type Issue = {
  _id: string;
  title: string;
  description: string;
  status: string;
  fileUrl?: string;
  unitId: string;
  createdAt: string;
};

type IssueListResponse = {
  data: Issue[];
  total: number;
};

export default function TenantIssuesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<IssueListResponse>({
    queryKey: ['issues', page],
    queryFn: async () => {
      const res = await api.get(`/issues?page=${page}&limit=${PAGE_SIZE}`);
      return { data: res.data.data, total: res.data.total || res.data.count || 0 };
    },
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: async (values: IssueForm) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('unitId', values.unitId);
      if (values.file && values.file[0]) formData.append('file', values.file[0]);
      const res = await api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Issue reported', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      reset();
    },
    onError: (err: any) => {
      showToast({ message: err?.response?.data?.message || 'Failed to report issue', type: 'error' });
    },
  });

  // Fetch units for select (could be optimized)
  const { data: units } = useQuery<{ _id: string; unitNo: string }[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IssueForm>({
    resolver: zodResolver(IssueSchema),
  });

  const onSubmit = (values: IssueForm) => {
    createMutation.mutate(values);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Report an Issue</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-white dark:bg-gray-900 p-4 rounded shadow" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title" name="title" error={errors.title}>
            <Input {...register('title')} placeholder="Issue title" />
          </FormField>
          <FormField label="Unit" name="unitId" error={errors.unitId}>
            <select {...register('unitId')} className="border rounded px-2 py-1 w-full">
              <option value="">Select unit</option>
              {units?.map((u) => (
                <option key={u._id} value={u._id}>{u.unitNo}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Description" name="description" error={errors.description}>
          <Textarea {...register('description')} placeholder="Describe the issue" rows={3} />
        </FormField>
        <FormField label="File (optional)" name="file" error={errors.file}>
          <Input type="file" {...register('file')} />
        </FormField>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Submit</button>
      </form>
      <h2 className="text-xl font-bold mb-4">My Issues</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : (data?.data.length === 0 ? (
        <div className="text-center text-gray-400">No issues reported yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-900 rounded shadow min-w-[400px]">
              <thead>
                <tr>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">File</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((issue) => (
                  <tr key={issue._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-100 dark:focus-within:bg-gray-700 transition-colors">
                    <td className="p-2">{issue.title}</td>
                    <td className="p-2">{issue.description}</td>
                    <td className="p-2">{issue.status}</td>
                    <td className="p-2">{new Date(issue.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      {issue.fileUrl ? <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline focus:ring-2 focus:ring-blue-400 hover:text-blue-700 transition">File</a> : '-'}
                    </td>
                  </tr>
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