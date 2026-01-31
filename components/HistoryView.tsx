
import React from 'react';
import { QuizAttempt, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  history: QuizAttempt[];
  lang: Language;
}

const HistoryView: React.FC<Props> = ({ history, lang }) => {
  const strings = UI_STRINGS[lang];

  if (history.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-0 space-y-6">
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white px-2">
        {strings.history}
      </h2>
      <div className="space-y-4">
        {history.slice().reverse().map((attempt) => (
          <div 
            key={attempt.id} 
            className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-row justify-between items-center transition-all hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md group"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] md:text-xs font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg uppercase tracking-wider">
                  {strings[attempt.subject]}
                </span>
                <span className={`text-[10px] md:text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                  attempt.difficulty === 'hard' 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600' 
                    : attempt.difficulty === 'medium' 
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' 
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600'
                }`}>
                  {strings[attempt.difficulty]}
                </span>
              </div>
              <p className="text-[11px] md:text-xs font-medium text-slate-400 dark:text-slate-500">
                {new Date(attempt.timestamp).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
                {attempt.score}<span className="text-slate-300 dark:text-slate-700 mx-1">/</span>{attempt.totalQuestions}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                <p className="text-xs md:text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
