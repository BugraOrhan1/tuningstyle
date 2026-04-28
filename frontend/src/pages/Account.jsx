import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { useToast } from '../hooks/use-toast';
import { authApi } from '../api/client';
import { Save } from 'lucide-react';

export const Account = () => {
  const { user, updateUser, t } = useApp();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    company: user?.company || '', phone: user?.phone || '',
    country: user?.country || '', vatNumber: user?.vatNumber || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(form);
      toast({ title: 'Profile updated' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (pwForm.newPassword.length < 6) { toast({ title: 'Password too short', variant: 'destructive' }); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast({ title: 'Password updated' });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      toast({ title: 'Failed', description: e.response?.data?.detail || 'Error', variant: 'destructive' });
    }
    setPwSaving(false);
  };

  const Field = ({ label, k, type = 'text', state, setState }) => (
    <div>
      <label className="block text-sm font-medium text-fct-dark mb-1.5">{label}</label>
      <input type={type} value={state[k]} onChange={(e) => setState({ ...state, [k]: e.target.value })}
        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('profileSettings')}</h1>
        <p className="text-fct-muted mb-6">Manage your account information.</p>
        <form onSubmit={handleSave} className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-fct-dark mb-4">{t('personalInformation')}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field label={t('firstName')} k="firstName" state={form} setState={setForm} />
            <Field label={t('lastName')} k="lastName" state={form} setState={setForm} />
          </div>
          <div>
            <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('email')}</label>
            <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm bg-gray-50 text-fct-muted" />
          </div>
          <h2 className="font-semibold text-fct-dark mb-4 mt-6">{t('companyInformation')}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field label={t('company')} k="company" state={form} setState={setForm} />
            <Field label={t('phone')} k="phone" state={form} setState={setForm} />
            <Field label={t('country')} k="country" state={form} setState={setForm} />
            <Field label={t('vatNumber')} k="vatNumber" state={form} setState={setForm} />
          </div>
          <button type="submit" disabled={saving} className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-5 py-2.5 rounded flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />{saving ? '...' : t('save')}
          </button>
        </form>
        <form onSubmit={handlePassword} className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-fct-dark mb-4">{t('changePassword')}</h2>
          <div className="space-y-4 mb-4">
            <Field label={t('currentPassword')} k="currentPassword" type="password" state={pwForm} setState={setPwForm} />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t('newPassword')} k="newPassword" type="password" state={pwForm} setState={setPwForm} />
              <Field label={t('confirmPassword')} k="confirm" type="password" state={pwForm} setState={setPwForm} />
            </div>
          </div>
          <button type="submit" disabled={pwSaving} className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-5 py-2.5 rounded flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />{pwSaving ? '...' : t('changePassword')}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Account;
