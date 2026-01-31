
import React from 'react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  lang: Language;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'annually') => void;
}

const SubscriptionModal: React.FC<Props> = ({ lang, onClose, onUpgrade }) => {
  const strings = UI_STRINGS[lang];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-blue-500/20 animate-[zoom-in_0.3s_ease-out] my-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-600 text-white rounded-3xl mb-5 shadow-2xl shadow-blue-500/40">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Level Up to Pro</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium max-w-md mx-auto">{strings.limitDescription}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Monthly Plan */}
          <button 
            onClick={() => onUpgrade('monthly')}
            className="flex flex-col p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all text-left group bg-white dark:bg-slate-800/50"
          >
            <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{strings.monthly}</span>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">$4.99</span>
              <span className="text-slate-400 dark:text-slate-500 font-bold">/mo</span>
            </div>
            <ul className="text-sm md:text-base text-slate-600 dark:text-slate-400 space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
                Unlimited Quizzes
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
                Save Progress
              </li>
            </ul>
            <div className="w-full py-4 bg-slate-900 dark:bg-slate-700 group-hover:bg-blue-600 text-white rounded-2xl text-center font-black text-lg transition-all active:scale-95">
              {strings.subscribe}
            </div>
          </button>

          {/* Annual Plan */}
          <button 
            onClick={() => onUpgrade('annually')}
            className="relative flex flex-col p-6 md:p-8 rounded-[2rem] border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 hover:shadow-2xl transition-all text-left group"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
              {strings.bestValue}
            </div>
            <span className="text-[10px] md:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">{strings.annually}</span>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">$39.99</span>
              <span className="text-blue-400 dark:text-blue-500 font-bold">/yr</span>
            </div>
            <ul className="text-sm md:text-base text-slate-600 dark:text-slate-400 space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
                Unlimited Quizzes
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </div>
                Save 30% Every Year
              </li>
            </ul>
            <div className="w-full py-4 bg-blue-600 text-white rounded-2xl text-center font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-95 group-hover:scale-[1.02]">
              {strings.subscribe}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
