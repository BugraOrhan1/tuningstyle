import React from 'react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#EEF1F4]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="text-center py-8 text-sm text-fct-muted">
        <p>© {new Date().getFullYear()} Fast Chiptuningfiles. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
