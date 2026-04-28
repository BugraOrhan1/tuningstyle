import React from 'react';

export const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { circle: 'w-8 h-8', text: 'text-sm', sub: 'text-[8px]' },
    md: { circle: 'w-12 h-12', text: 'text-lg', sub: 'text-[10px]' },
    lg: { circle: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${s.circle} rounded-full bg-[#2A2A2A] flex items-center justify-center relative`}>
        <svg viewBox="0 0 24 24" className="w-2/3 h-2/3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 7c-1.5-2-4-3-7-3-4 0-7 2.5-7 5.5 0 2.5 2 4 5 4.5l3 0.5c2 0.5 3.5 1.5 3.5 3 0 2-2 3.5-5 3.5-3 0-5-1.5-6-3.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex flex-col fct-logo-text">
        <span className={`${s.text} text-fct-dark font-bold`}>FAST</span>
        <span className={`${s.sub} text-fct-dark tracking-widest font-semibold`}>CHIPTUNINGFILES</span>
      </div>
    </div>
  );
};

export default Logo;
