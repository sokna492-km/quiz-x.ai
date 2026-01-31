
import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ selected, onSelect }) => {
  const flags: Record<Language, string> = {
    en: '🇺🇸',
    km: '🇰🇭',
    th: '🇹🇭',
    vi: '🇻🇳'
  };

  const names: Record<Language, string> = {
    en: 'English',
    km: 'ភាសាខ្មែរ',
    th: 'ไทย',
    vi: 'Tiếng Việt'
  };

  return (
    <div className="flex flex-row w-full gap-1.5 md:gap-3">
      {LANGUAGES.map((lang) => {
        const isSelected = selected === lang;
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`flex-1 relative flex items-center justify-center sm:justify-start gap-1.5 md:gap-3 px-2 md:px-6 py-2 md:py-2.5 rounded-full border-2 transition-all duration-300 group ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] z-10'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className={`text-lg md:text-2xl transition-transform duration-300 shrink-0 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
              {flags[lang]}
            </span>
            
            <div className="flex flex-col items-start leading-none min-w-0 overflow-hidden">
              <span className={`font-black text-[10px] md:text-sm tracking-tight truncate w-full ${
                isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
              }`}>
                {names[lang]}
              </span>
              <span className={`hidden sm:block text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60 ${
                isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {lang === 'en' ? 'US' : lang === 'km' ? 'Khmer' : lang === 'th' ? 'Thai' : 'Viet'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
