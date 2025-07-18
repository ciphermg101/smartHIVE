import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@lib/axios';
import { showToast } from '@components/ui/Toast';
import { Pagination } from '@components/ui/Pagination';
import { useState } from 'react';

const PAGE_SIZE = 10;

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'ignored', label: 'Ignored' },
];

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

export default function LandlordIssuesPage() {
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/issues/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      showToast({ message: 'Issue status updated', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (err: any) => {
      showToast({ message: err?.response?.data?.message || 'Failed to update status', type: 'error' });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Issues</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : (data?.data.length === 0 ? (
        <div className="text-center text-gray-400">No issues found.</div>
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
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((issue) => (
                  <tr key={issue._id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-100 dark:focus-within:bg-gray-700 transition-colors">
                    <td className="p-2">{issue.title}</td>
                    <td className="p-2">{issue.description}</td>
                    <td className="p-2">
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                        className="border rounded px-2 py-1 focus:ring-2 focus:ring-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">{new Date(issue.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      {issue.fileUrl ? <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline focus:ring-2 focus:ring-blue-400 hover:text-blue-700 transition">File</a> : '-'}
                    </td>
                    <td className="p-2">
                      {/* Future: add more actions */}
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