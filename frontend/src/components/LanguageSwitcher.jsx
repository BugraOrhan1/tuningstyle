import React from 'react';
import { useApp } from '../context/AppContext';
import { supportedLanguages } from '../data/translations';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const LanguageSwitcher = ({ variant = 'light' }) => {
  const { language, setLanguage } = useApp();
  const current = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];
  const isDark = variant === 'dark';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium outline-none ${isDark ? 'text-white hover:bg-white/10' : 'text-fct-dark hover:bg-gray-100'}`}>
        <span className="font-semibold">{current.name}</span>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {supportedLanguages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-orange-50 text-fct-orange font-semibold' : ''}`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
