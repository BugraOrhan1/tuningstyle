import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AuthLayout } from '../components/AuthLayout';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const ForgotPassword = () => {
  const { t } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast({ title: 'Check your inbox', description: 'If the email exists, a reset link was sent.' });
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto bg-white rounded p-8 lg:p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-fct-dark mb-6">{t('resetPassword')}</h1>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
              />
            </div>
            <button type="submit" className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-3 rounded flex items-center justify-center gap-2">
              {t('sendResetLink')}<ChevronRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            A reset link has been sent if the email is registered.
          </div>
        )}
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-fct-orange hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" />{t('backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
