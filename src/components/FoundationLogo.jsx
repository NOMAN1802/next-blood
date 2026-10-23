import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
const FoundationLogo = () => {
  const {
    t
  } = useLanguage();
  return <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
      <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 shrink-0">
        <img src="/logo.svg" alt="Innovix Next Blood Logo" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col">
        <span className="block text-base md:text-lg font-bold text-white tracking-tight leading-none group-hover:text-red-400 transition-colors duration-300">Next Blood</span> 
        <span className="text-[9px] md:text-[10px] text-neutral-500 font-medium uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
          Est. 2025
        </span>
      </div>
    </Link>;
};
export default FoundationLogo;