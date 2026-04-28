import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AuthLayout } from '../components/AuthLayout';
import { ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Register = () => {
  const { register, t } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    company: '', phone: '', country: 'Netherlands', vatNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Password too short', description: 'At least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register(form);
      toast({ title: 'Account created!', description: 'Welcome to Fast Chiptuningfiles.' });
      navigate('/dashboard');
      setLoading(false);
    }, 600);
  };

  const Field = ({ label, k, type = 'text', required = true }) => (
    <div>
      <label className="block text-sm font-medium text-fct-dark mb-1.5">{label}{required && ' *'}</label>
      <input
        type={type}
        required={required}
        value={form[k]}
        onChange={update(k)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
      />
    </div>
  );

  return (
    <AuthLayout>
      <div className="max-w-3xl mx-auto bg-white rounded p-8 lg:p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-fct-dark mb-2">{t('createAccount')}</h1>
        <p className="text-sm text-fct-muted mb-6">{t('alreadyHaveAccount')} <Link to="/login" className="text-fct-orange hover:underline">{t('login')}</Link></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label={t('firstName')} k="firstName" />
            <Field label={t('lastName')} k="lastName" />
          </div>
          <Field label={t('email')} k="email" type="email" />
          <div className="grid md:grid-cols-2 gap-4">
            <Field label={t('password')} k="password" type="password" />
            <Field label={t('confirmPassword')} k="confirmPassword" type="password" />
          </div>
          <hr className="my-6 border-gray-200" />
          <h2 className="text-lg font-semibold text-fct-dark">{t('companyInformation')}</h2>
          <Field label={t('company')} k="company" required={false} />
          <div className="grid md:grid-cols-2 gap-4">
            <Field label={t('phone')} k="phone" required={false} />
            <Field label={t('country')} k="country" required={false} />
          </div>
          <Field label={t('vatNumber')} k="vatNumber" required={false} />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? '...' : t('createAccount')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
