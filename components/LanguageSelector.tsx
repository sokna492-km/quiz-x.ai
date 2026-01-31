
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
    <div className="flex gap-2 flex-wrap">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            selected === lang
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-xl">{flags[lang]}</span>
          <span className="font-medium">{names[lang]}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
