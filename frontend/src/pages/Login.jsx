import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AuthLayout } from '../components/AuthLayout';
import { Check, ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Login = () => {
  const { login, t } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast({ title: 'Welcome back!' });
      navigate(result.user.is_admin ? '/admin' : '/dashboard');
    } else {
      toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
    }
  };

  const features = ['feature1', 'feature2', 'feature3', 'feature4'];

  return (
    <AuthLayout>
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="bg-white rounded p-8 lg:p-10 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-fct-dark flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 7c-1.5-2-4-3-7-3-4 0-7 2.5-7 5.5 0 2.5 2 4 5 4.5l3 0.5c2 0.5 3.5 1.5 3.5 3 0 2-2 3.5-5 3.5-3 0-5-1.5-6-3.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex flex-col fct-logo-text">
                <span className="text-xl text-fct-dark font-bold">FAST</span>
                <span className="text-[10px] text-fct-dark tracking-widest font-semibold">CHIPTUNINGFILES</span>
              </div>
            </div>
          </div>
          <hr className="border-gray-200 mb-8" />
          <h1 className="text-2xl font-bold text-fct-dark mb-6">{t('login')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('email')}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('password')}</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? '...' : t('login')}<ChevronRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 space-y-2 text-sm">
            <Link to="/forgot-password" className="text-fct-orange hover:underline block">{t('forgotPassword')}</Link>
            <Link to="/register" className="text-fct-orange hover:underline block">{t('register')}</Link>
          </div>
        </div>
        <div className="bg-white rounded p-8 lg:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-fct-dark mb-6">{t('noAccountYet')}</h2>
          <p className="font-semibold text-fct-dark mb-4">{t('asRegisteredUser')}</p>
          <ul className="space-y-3 mb-8">
            {features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-fct-dark">{t(f)}</span>
              </li>
            ))}
          </ul>
          <Link to="/register" className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2">
            {t('register')}<ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
