
import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  quiz: Quiz;
  onComplete: (answers: number[], timeTaken: number) => void;
}

const QuizView: React.FC<Props> = ({ quiz, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(quiz.durationSeconds);
  const strings = UI_STRINGS[quiz.language];
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onComplete(answers, quiz.durationSeconds);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, answers, onComplete]);

  const currentQuestion = quiz.questions[currentIndex];
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 md:space-y-8 animate-fade-in relative">
      <div className="fixed top-0 left-0 w-full h-1.5 md:h-2 bg-slate-200 dark:bg-slate-800 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(37,99,235,0.6)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <h3 className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
             Quiz X<span className="text-blue-500">.ai</span>
           </h3>
           <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
             {strings[quiz.subject]}
           </span>
        </div>

        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 dark:border-slate-800">
          <div className="space-y-1 md:space-y-2">
            <p className="text-[10px] md:text-[12px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">{strings.timeRemaining}</p>
            <div className="flex items-center gap-2 md:gap-3">
              <svg className={`w-5 h-5 md:w-7 md:h-7 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-xl md:text-3xl font-mono font-black ${timeLeft < 60 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] md:text-[12px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">Progress</p>
            <p className="text-xl md:text-3xl font-black text-slate-700 dark:text-slate-200">
              {currentIndex + 1}<span className="text-slate-300 dark:text-slate-700 font-bold mx-1 md:mx-2">/</span>{quiz.questions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 md:space-y-10 min-h-[300px] md:min-h-[400px] flex flex-col justify-center">
        <h2 className="text-xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
          {currentQuestion.text}
        </h2>

        <div className="grid gap-3 md:gap-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentIndex] = idx;
                setAnswers(newAnswers);
              }}
              className={`group flex items-center p-4 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all text-left ${
                answers[currentIndex] === idx
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 md:ring-4 ring-blue-50 dark:ring-blue-900/30'
                  : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-lg'
              }`}
            >
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mr-3 md:mr-6 shrink-0 font-black text-base md:text-xl transition-all ${
                answers[currentIndex] === idx
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-base md:text-xl font-bold transition-colors ${
                answers[currentIndex] === idx ? 'text-blue-900 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 md:pt-6 gap-3 md:gap-6">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="flex-1 py-4 md:py-5 rounded-2xl md:rounded-3xl font-bold text-base md:text-xl text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden xs:inline">{strings.previous}</span>
        </button>

        {currentIndex === quiz.questions.length - 1 ? (
          <button
            onClick={() => onComplete(answers, quiz.durationSeconds - timeLeft)}
            className="flex-2 py-4 md:py-5 px-6 md:px-10 bg-green-600 hover:bg-green-700 text-white rounded-2xl md:rounded-3xl font-black text-base md:text-xl shadow-xl shadow-green-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 md:gap-3"
          >
            {strings.finish}
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button
            disabled={answers[currentIndex] === -1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex-2 py-4 md:py-5 px-6 md:px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl md:rounded-3xl font-black text-base md:text-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3"
          >
            {strings.next}
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
