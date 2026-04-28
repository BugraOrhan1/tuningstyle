import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { adminApi } from '../../api/client';
import { Search, Plus, Minus, Shield } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setUsers(await adminApi.users()); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = async () => {
    const n = parseInt(amount, 10);
    if (!n || isNaN(n)) return;
    try {
      await adminApi.adjustCredits(editing.id, n, reason);
      toast({ title: 'Credits updated' });
      setEditing(null);
      setAmount('');
      setReason('');
      load();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">Users</h1>
        <p className="text-fct-muted mb-6">Manage all registered users and their credits.</p>
        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
              <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-fct-muted uppercase border-b border-gray-100">
                  <th className="px-4 py-3">User</th><th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th><th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Credits</th><th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <tr><td colSpan={7} className="p-8 text-center text-fct-muted">Loading...</td></tr>}
                {!loading && filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-fct-dark">
                      <div className="flex items-center gap-2">
                        {u.firstName} {u.lastName}
                        {u.is_admin && <span className="inline-flex items-center gap-1 text-[10px] bg-fct-dark text-white px-1.5 py-0.5 rounded"><Shield className="w-2.5 h-2.5" />ADMIN</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fct-muted">{u.email}</td>
                    <td className="px-4 py-3 text-fct-muted">{u.company || '-'}</td>
                    <td className="px-4 py-3 text-fct-muted">{u.country || '-'}</td>
                    <td className="px-4 py-3 text-fct-orange font-semibold">{u.credits}</td>
                    <td className="px-4 py-3 text-xs text-fct-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditing(u); setAmount(''); setReason(''); }}
                        className="text-fct-orange hover:underline text-xs font-medium">Adjust credits</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adjust credits for {editing?.email}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div>Current balance: <span className="font-bold text-fct-orange">{editing?.credits}</span></div>
              <div>
                <label className="block text-xs font-medium mb-1">Amount (use negative to deduct)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 10 or -5"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Reason (optional)</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. promotional bonus"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setAmount(String(parseInt(amount || 0) + 10)); }} className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:border-fct-orange flex items-center gap-1"><Plus className="w-3 h-3" />10</button>
                <button onClick={() => { setAmount(String(parseInt(amount || 0) - 1)); }} className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:border-fct-orange flex items-center gap-1"><Minus className="w-3 h-3" />1</button>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 rounded text-sm">Cancel</button>
              <button onClick={handleAdjust} className="px-4 py-2 bg-fct-orange hover:bg-[#D45F25] text-white font-semibold rounded text-sm">Apply</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
