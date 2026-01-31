
import React, { useMemo, useState } from 'react';
import { QuizAttempt, Language, Subject } from '../types';
import { UI_STRINGS, SUBJECTS } from '../constants';

interface Props {
  history: QuizAttempt[];
  lang: Language;
}

const StatsDashboard: React.FC<Props> = ({ history, lang }) => {
  const strings = UI_STRINGS[lang];
  const [hoveredSubject, setHoveredSubject] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const subjectColors: Record<Subject, string> = {
    mathematics: '#3b82f6', // blue-500
    physics: '#6366f1',     // indigo-500
    chemistry: '#ec4899',   // pink-500
    biology: '#22c55e'      // green-500
  };

  const subjectIcons: Record<Subject, string> = {
    mathematics: '📐',
    physics: '⚛️',
    chemistry: '🧪',
    biology: '🧬'
  };

  const overallStats = useMemo(() => {
    if (history.length === 0) return null;

    const totalQuizzes = history.length;
    const subjectBreakdown = history.reduce((acc, curr) => {
      acc[curr.subject] = (acc[curr.subject] || 0) + 1;
      return acc;
    }, {} as Record<Subject, number>);

    // Calculate segments for Donut Chart
    let cumulativePercent = 0;
    const segments = SUBJECTS.map((sub) => {
      const count = subjectBreakdown[sub] || 0;
      const percent = (count / totalQuizzes) * 100;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return { subject: sub, percent, startPercent };
    });

    return {
      totalQuizzes,
      subjectBreakdown,
      segments
    };
  }, [history]);

  const displayStats = useMemo(() => {
    const filteredHistory = selectedSubject 
      ? history.filter(h => h.subject === selectedSubject)
      : history;

    if (filteredHistory.length === 0) return { count: 0, accuracy: 0 };

    const count = filteredHistory.length;
    const totalPossiblePoints = filteredHistory.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const totalEarnedPoints = filteredHistory.reduce((acc, curr) => acc + curr.score, 0);
    const accuracy = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);

    return { count, accuracy };
  }, [history, selectedSubject]);

  if (!overallStats) return null;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const handleToggleSubject = (sub: Subject) => {
    setSelectedSubject(prev => prev === sub ? null : sub);
  };

  return (
    <div className="max-w-2xl mx-auto p-2 md:p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
            {selectedSubject ? `${strings[selectedSubject]} ${strings.stats}` : strings.stats}
          </h2>
          {selectedSubject && (
            <button 
              onClick={() => setSelectedSubject(null)}
              className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border transition-all text-center group ${
          selectedSubject ? 'border-blue-200 dark:border-blue-800 ring-2 ring-blue-50 dark:ring-blue-900/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 shadow-sm'
        }`}>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            {selectedSubject ? 'Subject Quizzes' : 'Total Quizzes'}
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
            {displayStats.count}
          </p>
        </div>
        <div className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border transition-all text-center group ${
          selectedSubject ? 'border-green-200 dark:border-green-800 ring-2 ring-green-50 dark:ring-green-900/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 shadow-sm'
        }`}>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            {selectedSubject ? 'Accuracy' : strings.accuracy}
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-green-600 dark:text-green-400 transition-transform group-hover:scale-110">
            {displayStats.accuracy}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Donut Chart Container */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
            <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
              {overallStats.segments.map((seg) => {
                if (seg.percent === 0) return null;
                const [startX, startY] = getCoordinatesForPercent(seg.startPercent / 100);
                const [endX, endY] = getCoordinatesForPercent((seg.startPercent + seg.percent) / 100);
                const largeArcFlag = seg.percent > 50 ? 1 : 0;
                const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                
                const isSelected = selectedSubject === seg.subject;
                const isDimmed = selectedSubject && !isSelected;

                return (
                  <path
                    key={seg.subject}
                    d={pathData}
                    fill={subjectColors[seg.subject]}
                    className={`transition-all duration-300 cursor-pointer ${
                      isDimmed ? 'opacity-20 grayscale' : 'hover:opacity-80'
                    }`}
                    onClick={() => handleToggleSubject(seg.subject)}
                    onMouseEnter={() => setHoveredSubject(seg.subject)}
                    onMouseLeave={() => setHoveredSubject(null)}
                    style={{
                      transform: (hoveredSubject === seg.subject || isSelected) ? 'scale(1.08)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                );
              })}
              <circle cx="0" cy="0" r="0.65" className="fill-white dark:fill-slate-900 transition-colors" />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none truncate w-full">
                {hoveredSubject ? strings[hoveredSubject] : selectedSubject ? strings[selectedSubject] : 'Total'}
              </span>
              <span className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200 leading-tight">
                {hoveredSubject 
                  ? overallStats.subjectBreakdown[hoveredSubject] 
                  : selectedSubject 
                    ? overallStats.subjectBreakdown[selectedSubject] 
                    : overallStats.totalQuizzes
                }
              </span>
            </div>
          </div>

          {/* Subject Legend & Detailed Breakdown */}
          <div className="flex-1 w-full space-y-2 md:space-y-3">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Subject Distribution</p>
            {SUBJECTS.map((sub) => {
              const count = overallStats.subjectBreakdown[sub] || 0;
              const percentage = Math.round((count / overallStats.totalQuizzes) * 100);
              const isSelected = selectedSubject === sub;
              const isDimmed = selectedSubject && !isSelected;
              const isHighlighted = hoveredSubject === sub || isSelected;

              return (
                <button 
                  key={sub} 
                  onClick={() => handleToggleSubject(sub)}
                  className={`relative w-full text-left group flex items-center justify-between p-2 md:p-2 rounded-xl transition-all ${
                    isHighlighted ? 'bg-slate-50 dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' : ''
                  } ${isDimmed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
                  onMouseEnter={() => setHoveredSubject(sub)}
                  onMouseLeave={() => setHoveredSubject(null)}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div 
                      className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-transform ${isSelected ? 'scale-125 ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700' : ''}`} 
                      style={{ backgroundColor: subjectColors[sub] }}
                    />
                    <span className={`text-xs md:text-sm font-medium flex items-center gap-1 transition-colors ${isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {subjectIcons[sub]} {strings[sub]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">{count}</span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300 dark:text-slate-700">|</span>
                    <span className={`text-xs md:text-sm font-extrabold w-8 text-right transition-colors ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {percentage}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
