import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Search, Download, Clock, CheckCircle2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../components/ui/dialog';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800', icon: X },
};

export const MyFiles = () => {
  const { files, t } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = files.filter(f => {
    const matchesSearch = !search || f.fileName.toLowerCase().includes(search.toLowerCase()) || f.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('myFiles')}</h1>
        <p className="text-fct-muted mb-6">All your uploaded files and their tuning status.</p>

        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange bg-white">
              <option value="all">All status</option>
              <option value="pending">{t('pending')}</option>
              <option value="in_progress">{t('in_progress')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="rejected">{t('rejected')}</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-fct-muted uppercase border-b border-gray-100">
                  <th className="px-4 py-3">{t('fileName')}</th>
                  <th className="px-4 py-3">{t('vehicle')}</th>
                  <th className="px-4 py-3">{t('options')}</th>
                  <th className="px-4 py-3">{t('credits')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('uploaded')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-fct-muted">No files match your filters.</td></tr>
                )}
                {filtered.map(f => {
                  const sc = statusConfig[f.status] || statusConfig.pending;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-fct-dark">{f.fileName}</td>
                      <td className="px-4 py-3 text-fct-muted">{f.vehicle}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {f.tuningOptions?.slice(0, 2).map(o => (
                            <span key={o} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{o}</span>
                          ))}
                          {f.tuningOptions?.length > 2 && <span className="text-xs text-fct-muted">+{f.tuningOptions.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-fct-orange font-semibold">{f.credits}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${sc.color}`}>{t(f.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-fct-muted text-xs">{new Date(f.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(f)} className="text-fct-orange hover:underline text-xs font-medium">View</button>
                          {f.status === 'completed' && (
                            <button className="text-green-600 hover:text-green-700" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected?.fileName}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <div><span className="text-fct-muted">Vehicle: </span><span className="font-medium">{selected.vehicle}</span></div>
                <div><span className="text-fct-muted">ECU: </span><span className="font-medium">{selected.ecu}</span></div>
                <div><span className="text-fct-muted">Status: </span><span className="font-medium">{t(selected.status)}</span></div>
                <div><span className="text-fct-muted">Credits used: </span><span className="font-medium text-fct-orange">{selected.credits}</span></div>
                <div>
                  <span className="text-fct-muted">Options: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.tuningOptions?.map(o => <span key={o} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{o}</span>)}
                  </div>
                </div>
                {selected.note && (
                  <div><span className="text-fct-muted">Note: </span><span>{selected.note}</span></div>
                )}
                {selected.status === 'completed' && (
                  <button className="w-full mt-4 bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-2.5 rounded flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />Download tuned file
                  </button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MyFiles;
