
import React, { useState, useEffect } from 'react';
import { Language, Subject, Difficulty, User } from '../types';
import { UI_STRINGS, SUBJECTS, DIFFICULTIES } from '../constants';
import LanguageSelector from './LanguageSelector';

interface Props {
  onStart: (lang: Language, sub: Subject, diff: Difficulty) => void;
  isLoading: boolean;
  user: User | null;
  onOpenSubscription: () => void;
}

const SubjectIcon = ({ subject, active }: { subject: Subject; active: boolean }) => {
  const baseClasses = "w-10 h-10 md:w-14 md:h-14 mb-2 md:mb-3 transition-all duration-300";
  
  switch (subject) {
    case 'mathematics':
      return (
        <div className={`${baseClasses} ${active ? 'text-blue-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <circle cx="8" cy="14" r="1" />
            <circle cx="12" cy="14" r="1" />
            <circle cx="16" cy="14" r="1" />
            <circle cx="8" cy="18" r="1" />
            <circle cx="12" cy="18" r="1" />
            <circle cx="16" cy="18" r="1" />
          </svg>
        </div>
      );
    case 'physics':
      return (
        <div className={`${baseClasses} ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
          </svg>
        </div>
      );
    case 'chemistry':
      return (
        <div className={`${baseClasses} ${active ? 'text-pink-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M10 2v7.586l-4.586 4.586A2 2 0 005 15.586V19a2 2 0 002 2h10a2 2 0 002-2v-3.414a2 2 0 00-.586-1.414L14 9.586V2h-4z" />
            <path d="M8.5 2h7M7 16h10" />
          </svg>
        </div>
      );
    case 'biology':
      return (
        <div className={`${baseClasses} ${active ? 'text-green-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M4.5 7c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5-4.5-1.5-4.5-3.5z" />
            <path d="M4.5 7v10c0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5V7" />
            <path d="M10.5 3c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5-4.5-1.5-4.5-3.5z" />
            <path d="M10.5 3v10c0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5V3" />
            <path d="M4.5 12h15" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const QuizSetup: React.FC<Props> = ({ onStart, isLoading, user, onOpenSubscription }) => {
  const [lang, setLang] = useState<Language>('en');
  const [subject, setSubject] = useState<Subject>('mathematics');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [loadingStep, setLoadingStep] = useState(0);

  const strings = UI_STRINGS[lang];

  const loadingSteps = [
    { en: "Consulting the digital library...", km: "កំពុងពិគ្រោះជាមួយបណ្ណាល័យឌីជីថល...", th: "กำลังค้นหาข้อมูลในห้องสมุดดิจิทัล...", vi: "Đang tham khảo thư viện số..." },
    { en: "Synthesizing complex concepts...", km: "កំពុងសំយោគគោលគំនិតស្មុគស្មាញ...", th: "กำลังรวบรวมแนวคิดที่ซับซ้อน...", vi: "Đang tổng hợp các khái niệm phức tạp..." },
    { en: "Crafting challenging questions...", km: "កំពុងរៀបចំសំណួរដែលមានការប្រកួតប្រជែង...", th: "กำลังรวบรวมคำถามที่ท้าทาย...", vi: "Đang biên soạn các câu hỏi thử thách..." },
    { en: "Verifying scientific accuracy...", km: "កំពុងផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវនៃវិទ្យាសាស្ត្រ...", th: "กำลังตรวจสอบความถูกต้องทางวิทยาศาสตร์...", vi: "Đang xác minh tính chính xác khoa học..." },
    { en: "Finalizing your personalized quiz...", km: "កំពុងបញ្ចប់កម្រងសំណួរផ្ទាល់ខ្លួនរបស់អ្នក...", th: "กำลังสรุปควิซส่วนตัวของคุณ...", vi: "Đang hoàn tất bài kiểm tra của bạn..." }
  ];

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const isFree = !user || user.subscriptionTier === 'free';
  const remaining = user ? Math.max(0, 3 - user.quizUsage.count) : 3;

  if (isLoading) {
    const subjectIcons = ['📐', '⚛️', '🧪', '🧬'];
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 md:p-8 animate-fade-in">
        <div className="relative w-40 h-40 md:w-56 md:h-56 mb-8 md:mb-16">
          <div className="absolute inset-0 border-2 border-dashed border-blue-100 dark:border-blue-900 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-2 md:inset-4 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-blue-200 dark:shadow-blue-900/40 flex items-center justify-center animate-pulse">
              <span className="text-3xl md:text-5xl text-white font-bold">Q</span>
            </div>
          </div>

          {subjectIcons.map((icon, idx) => {
            const angle = (idx * 90) * (Math.PI / 180);
            const dist = window.innerWidth < 640 ? 70 : 100;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            return (
              <div 
                key={idx}
                className="absolute w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-md flex items-center justify-center text-xl md:text-2xl"
                style={{ 
                  left: `calc(50% + ${x}px - 20px)`, 
                  top: `calc(50% + ${y}px - 20px)`,
                  animation: `bounce 2s infinite ease-in-out ${idx * 0.5}s`
                }}
              >
                {icon}
              </div>
            );
          })}
        </div>

        <div className="space-y-4 md:space-y-6 max-w-xl">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {strings.generating}
          </h2>
          <div className="h-2 w-48 md:w-64 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden shadow-inner">
            <div className="h-full bg-blue-600 animate-[loading-bar_2s_infinite_ease-in-out]" />
          </div>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-base md:text-xl min-h-[1.5em] transition-all duration-500 opacity-90">
            {loadingSteps[loadingStep][lang as keyof typeof loadingSteps[0]]}
          </p>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes loading-bar {
            0% { transform: translateX(-100%); width: 30%; }
            50% { transform: translateX(50%); width: 60%; }
            100% { transform: translateX(200%); width: 30%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2 md:p-10 space-y-8 md:space-y-12 animate-fade-in">
      <section className="space-y-4 md:space-y-5">
        <h3 className="text-xs md:text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{strings.selectLanguage}</h3>
        <LanguageSelector selected={lang} onSelect={setLang} />
      </section>

      <section className="space-y-4 md:space-y-5">
        <h3 className="text-xs md:text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{strings.selectSubject}</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 text-center transition-all duration-300 flex flex-col items-center group ${
                subject === s
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-xl ring-1 ring-blue-100 dark:ring-blue-900 scale-[1.03]'
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg'
              }`}
            >
              <SubjectIcon subject={s} active={subject === s} />
              <span className="font-bold text-base md:text-xl leading-tight">{strings[s]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        <h3 className="text-xs md:text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{strings.selectDifficulty}</h3>
        <div className="flex gap-2 md:gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-3 md:py-5 px-3 md:px-6 rounded-xl md:rounded-3xl font-bold text-sm md:text-lg transition-all ${
                difficulty === d
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl scale-[1.05] z-10'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
              }`}
            >
              {strings[d]}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4 md:space-y-6">
        {isFree && (
          <div className="relative overflow-hidden p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md transition-all hover:shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6">
              <div className="space-y-2 md:space-y-2.5 flex-1 w-full">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                   <h4 className={`text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 ${lang === 'km' ? 'leading-relaxed tracking-wide' : 'uppercase tracking-[0.1em]'}`}>
                     {strings.quizzesRemaining}
                   </h4>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-2.5 md:h-3 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className={`h-full flex-1 transition-all duration-700 ${
                          i <= remaining 
                            ? (remaining === 1 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500') 
                            : 'bg-transparent opacity-20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-base md:text-xl font-black tabular-nums shrink-0 ${remaining === 0 ? 'text-red-500' : (remaining === 1 ? 'text-amber-500 animate-pulse' : 'text-blue-600')}`}>
                    {remaining} <span className="text-slate-300 dark:text-slate-700 font-bold">/</span> 3
                  </span>
                </div>
              </div>

              {remaining === 0 && (
                <button 
                  onClick={onOpenSubscription}
                  className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] md:text-sm font-black rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] border border-white/10"
                >
                  {strings.upgradePro}
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (isFree && remaining === 0) {
              onOpenSubscription();
            } else {
              onStart(lang, subject, difficulty);
            }
          }}
          className={`w-full py-5 md:py-8 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-bold text-xl md:text-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 md:gap-5 group ${
            isFree && remaining === 0 
              ? 'bg-slate-400 dark:bg-slate-700 cursor-pointer shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
          }`}
        >
          <span>{isFree && remaining === 0 ? strings.upgradePro : strings.startQuiz}</span>
          {!(isFree && remaining === 0) && (
            <svg className="w-6 h-6 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizSetup;
