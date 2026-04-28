import React, { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminApi } from '../../api/client';
import { Users, FileText, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, files] = await Promise.all([adminApi.stats(), adminApi.files()]);
      setStats(s);
      setRecentFiles(files.slice(0, 10));
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark">Admin Dashboard</h1>
            <p className="text-fct-muted">Overview of platform activity</p>
          </div>
          <button onClick={load} className="px-3 py-2 border border-gray-300 hover:border-fct-orange rounded text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={stats?.totalUsers ?? '-'} color="blue" />
          <StatCard icon={FileText} label="Total files" value={stats?.totalFiles ?? '-'} color="gray" />
          <StatCard icon={Clock} label="Pending" value={stats?.pending ?? '-'} color="yellow" />
          <StatCard icon={Clock} label="In progress" value={stats?.inProgress ?? '-'} color="blue" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats?.completed ?? '-'} color="green" />
        </div>
        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-fct-dark">Recent submissions</h2>
            <Link to="/admin/files" className="text-sm text-fct-orange hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentFiles.length === 0 && <div className="p-8 text-center text-sm text-fct-muted">No files yet.</div>}
            {recentFiles.map(f => (
              <Link key={f.id} to={`/admin/files/${f.id}`} className="block px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-fct-dark truncate">{f.fileName}</div>
                    <div className="text-xs text-fct-muted">{f.userEmail} • {f.vehicle}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">{f.status}</span>
                    <span className="text-xs text-fct-muted">{new Date(f.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600', gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="bg-white rounded p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-fct-dark">{value}</div>
      <div className="text-xs text-fct-muted">{label}</div>
    </div>
  );
};

export default AdminDashboard;
