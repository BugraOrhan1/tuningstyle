import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { creditsApi } from '../api/client';
import { Coins, ShoppingCart, Star } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Credits = () => {
  const { user, transactions, purchaseCredits, t } = useApp();
  const { toast } = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    creditsApi.packages().then(setPackages).catch(() => {});
  }, []);

  const handlePurchase = async (pkg) => {
    setLoading(pkg.id);
    try {
      await purchaseCredits(pkg.id);
      toast({ title: 'Credits added!', description: `${pkg.credits} credits added.` });
    } catch {
      toast({ title: 'Purchase failed', variant: 'destructive' });
    }
    setLoading(null);
  };

  const popularId = 'pkg_25';

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('buyCredits')}</h1>
        <p className="text-fct-muted mb-6">You currently have <span className="font-bold text-fct-orange">{user?.credits || 0}</span> {t('credits').toLowerCase()}.</p>
        <h2 className="text-lg font-semibold text-fct-dark mb-4">{t('chooseCreditPackage')}</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {packages.map(pkg => {
            const popular = pkg.id === popularId;
            return (
              <div key={pkg.id} className={`relative bg-white rounded shadow-sm border p-6 flex flex-col ${popular ? 'border-fct-orange ring-2 ring-fct-orange' : 'border-gray-100'}`}>
                {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fct-orange text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3" />{t('mostPopular')}</div>}
                <div className="text-center mb-4">
                  <Coins className="w-8 h-8 text-fct-orange mx-auto mb-2" />
                  <div className="text-3xl font-bold text-fct-dark">{pkg.credits}</div>
                  <div className="text-xs text-fct-muted">{t('credits').toLowerCase()}</div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-fct-dark">€{pkg.price}</div>
                  <div className="text-xs text-fct-muted mt-1">€{(pkg.price / pkg.credits).toFixed(2)} per credit</div>
                </div>
                <button onClick={() => handlePurchase(pkg)} disabled={loading === pkg.id}
                  className="mt-auto bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-2.5 rounded flex items-center justify-center gap-2 disabled:opacity-60">
                  <ShoppingCart className="w-4 h-4" />{loading === pkg.id ? '...' : t('purchase_action')}
                </button>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-fct-dark">{t('transactionHistory')}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-fct-muted uppercase border-b border-gray-100">
                  <th className="px-6 py-3">Date</th><th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th><th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-fct-muted">No transactions yet.</td></tr>}
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-fct-muted">{new Date(tx.date).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${tx.type === 'purchase' ? 'bg-green-100 text-green-800' : tx.type === 'adjustment' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {tx.type === 'purchase' ? t('purchase') : tx.type === 'adjustment' ? 'Adjustment' : t('usage')}
                      </span>
                    </td>
                    <td className={`px-6 py-3 font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-fct-dark'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</td>
                    <td className="px-6 py-3 text-fct-muted text-xs">{tx.method || tx.fileId || ''}</td>
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

export default Credits;
