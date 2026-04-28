import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminApi } from '../../api/client';
import { Search, Eye } from 'lucide-react';

export const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.files(filter);
        if (!cancelled) setFiles(data);
      } catch {
        if (!cancelled) setFiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const filtered = files.filter(f =>
    !search ||
    f.fileName?.toLowerCase().includes(search.toLowerCase()) ||
    f.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    f.vehicle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">All Files</h1>
        <p className="text-fct-muted mb-6">Manage all customer file submissions.</p>
        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
              <input placeholder="Search by file, user, vehicle..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm bg-white">
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-fct-muted uppercase border-b border-gray-100">
                  <th className="px-4 py-3">File</th><th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Status</th><th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <tr><td colSpan={7} className="p-8 text-center text-fct-muted">Loading...</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-fct-muted">No files.</td></tr>}
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{f.fileName}</td>
                    <td className="px-4 py-3 text-fct-muted">{f.userEmail}</td>
                    <td className="px-4 py-3 text-fct-muted">{f.vehicle}</td>
                    <td className="px-4 py-3 text-fct-orange font-semibold">{f.credits}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded bg-gray-100">{f.status}</span></td>
                    <td className="px-4 py-3 text-xs text-fct-muted">{new Date(f.uploadedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/files/${f.id}`} className="inline-flex items-center gap-1 text-fct-orange hover:underline text-xs font-medium">
                        <Eye className="w-3 h-3" />Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFiles;
