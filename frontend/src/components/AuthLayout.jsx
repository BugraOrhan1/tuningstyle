import React from 'react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Mail, Phone, Shield, Zap, Award } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#EEF1F4] flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-xs text-fct-muted">
              <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-fct-orange" /> 5-10 min delivery</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-600" /> Dyno-tested</span>
              <span className="inline-flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-blue-600" /> Premium quality</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 lg:py-14 w-full">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-fct-muted mt-3 max-w-xs">Premium ECU tuning files, custom-made and dyno-tested for the best results.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-fct-dark uppercase tracking-wide mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-fct-muted">
              <li>Stage 1, 2 & 3 Tuning</li>
              <li>TCU / Gearbox Tuning</li>
              <li>EGR / DPF / AdBlue</li>
              <li>ECU Clone Service</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-fct-dark uppercase tracking-wide mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-fct-muted">
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@fast-chiptuningfiles.com</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +31 78 783 00 13</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-fct-dark uppercase tracking-wide mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-fct-muted">
              <li><a href="#" className="hover:text-fct-orange">Terms and conditions</a></li>
              <li><a href="#" className="hover:text-fct-orange">Refund policy</a></li>
              <li><a href="#" className="hover:text-fct-orange">Privacy policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-fct-muted text-center">
            &copy; {new Date().getFullYear()} Fast Chiptuningfiles. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
