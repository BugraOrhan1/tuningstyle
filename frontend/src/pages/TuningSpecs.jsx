import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockTuningSpecs, mockBrands } from '../mock';
import { Search, TrendingUp, Coins } from 'lucide-react';

export const TuningSpecs = () => {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const filtered = mockTuningSpecs.filter(s => {
    const matchSearch = !search ||
      s.brand.toLowerCase().includes(search.toLowerCase()) ||
      s.model.toLowerCase().includes(search.toLowerCase()) ||
      s.engine.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || s.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('tuningSpecs')}</h1>
        <p className="text-fct-muted mb-6">Browse our database to see expected gains for your vehicle.</p>

        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
              <input
                type="text"
                placeholder="Search brand, model or engine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
              />
            </div>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange bg-white">
              <option value="">All brands</option>
              {mockBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-fct-muted uppercase border-b border-gray-100">
                  <th className="px-4 py-3">{t('brand')}</th>
                  <th className="px-4 py-3">{t('model')}</th>
                  <th className="px-4 py-3">{t('engine')}</th>
                  <th className="px-4 py-3">Stage 1 HP</th>
                  <th className="px-4 py-3">Stage 1 Nm</th>
                  <th className="px-4 py-3">{t('credits')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-fct-muted">No results.</td></tr>
                )}
                {filtered.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-fct-dark">{s.brand}</td>
                    <td className="px-4 py-3">{s.model}</td>
                    <td className="px-4 py-3 text-fct-muted">{s.engine}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-green-700 font-semibold"><TrendingUp className="w-3 h-3" />{s.stage1Hp}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-green-700 font-semibold"><TrendingUp className="w-3 h-3" />{s.stage1Nm}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-fct-orange font-semibold"><Coins className="w-3 h-3" />{s.credits}</span></td>
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

export default TuningSpecs;
