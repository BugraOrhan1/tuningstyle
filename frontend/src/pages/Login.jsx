import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AuthLayout } from '../components/AuthLayout';
import { Check, ChevronRight, Lock, Mail, Sparkles } from 'lucide-react';
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
        {/* Login card */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-8 lg:p-10">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-fct-dark flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 7c-1.5-2-4-3-7-3-4 0-7 2.5-7 5.5 0 2.5 2 4 5 4.5l3 0.5c2 0.5 3.5 1.5 3.5 3 0 2-2 3.5-5 3.5-3 0-5-1.5-6-3.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col fct-logo-text">
                <span className="text-xl text-fct-dark font-bold">FAST</span>
                <span className="text-[10px] text-fct-dark tracking-widest font-semibold">CHIPTUNINGFILES</span>
              </div>
            </div>
            <p className="text-xs text-fct-muted">Welcome back. Please sign in to continue.</p>
          </div>
          <hr className="border-gray-200 mb-7" />
          <h1 className="text-2xl font-bold text-fct-dark mb-5">{t('login')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
              {loading ? '...' : t('login')}<ChevronRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-fct-orange hover:underline">{t('forgotPassword')}</Link>
            <Link to="/register" className="text-fct-orange hover:underline">{t('register')}</Link>
          </div>
        </div>

        {/* Right side - Register CTA */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-8 lg:p-10 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-fct-orange text-xs font-semibold rounded-full self-start mb-3">
            <Sparkles className="w-3 h-3" />New here?
          </div>
          <h2 className="text-2xl font-bold text-fct-dark mb-3">{t('noAccountYet')}</h2>
          <p className="font-semibold text-fct-dark mb-4 text-sm">{t('asRegisteredUser')}</p>
          <ul className="space-y-3 mb-7 flex-1">
            {features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-fct-dark leading-relaxed">{t(f)}</span>
              </li>
            ))}
          </ul>
          <Link to="/register" className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2 shadow-sm">
            {t('register')}<ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
