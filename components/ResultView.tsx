
import React, { useState } from 'react';
import { Quiz, Language, User, QuestionType } from '../types';
import { UI_STRINGS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface Props {
  quiz: Quiz;
  userAnswers: number[];
  timeTaken: number;
  onHome: () => void;
  onRetry: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

const ResultView: React.FC<Props> = ({ quiz, userAnswers, timeTaken, onHome, onRetry, currentUser, onOpenAuth }) => {
  const strings = UI_STRINGS[quiz.language];
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const score = userAnswers.reduce((acc, ans, idx) => {
    return acc + (ans === quiz.questions[idx].correctIndex ? 1 : 0);
  }, 0);
  const percentage = Math.round((score / quiz.questions.length) * 100);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleExplanation = (idx: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'true-false': return 'True / False';
      case 'fill-in-the-blank': return 'Fill in the Blank';
      case 'matching': return 'Matching / Sequence';
      default: return 'Multiple Choice';
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'Quiz X.ai Achievement',
      text: `I scored ${score}/${quiz.questions.length} (${percentage}%) in ${strings[quiz.subject]} on Quiz X.ai!`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} Check it out here: ${shareData.url}`);
        alert('Results copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleGenerateCard = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const userName = currentUser ? currentUser.name : "Learner";
      
      const prompt = `A professional, clean, ultra-minimalist white academic certificate of achievement for "${userName}". 
      Text to include: "Quiz X.ai Excellence Award", "${userName}", "Subject: ${quiz.subject}", "Score: ${score}/${quiz.questions.length}".
      Visual style: White pure background, elegant black thin serif or sans-serif typography, high-end museum/gallery aesthetic. 
      Center a very simple, single-line geometric icon representing ${quiz.subject}. 
      Absolutely no busy patterns, no dark colors, no glows. Just pure white, clean lines, and sophisticated minimalism. High-resolution 4K.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64 = part.inlineData.data;
          const dataUrl = `data:image/png;base64,${base64}`;
          setShareImageUrl(dataUrl);
          break;
        }
      }
    } catch (error) {
      console.error("Failed to generate certificate image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const triggerDownload = (url: string, type: 'png' | 'pdf') => {
    if (type === 'png') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `QuizX_Certificate_${currentUser?.name || 'Learner'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Certificate - ${currentUser?.name || 'Learner'}</title></head>
            <body style="margin:0; display:flex; align-items:center; justify-content:center;">
              <img src="${url}" style="max-width:100%; height:auto;">
              <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10 md:space-y-12 animate-fade-in transition-colors duration-300">
      <div className="text-center space-y-4 md:space-y-6">
        <div className="inline-block p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-2 md:mb-4 shadow-md">
          <svg className="w-10 h-10 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 20 20">
             <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">{strings.quizComplete}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-2xl font-bold">{quiz.title}</p>
      </div>

      {!currentUser && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl">
          <div className="space-y-2 md:space-y-3 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-200">{strings.saveScoreCTA}</h3>
            <p className="text-blue-700/70 dark:text-blue-400/70 text-base md:text-lg font-bold italic">Unlock history tracking and certificates forever.</p>
          </div>
          <button 
            onClick={onOpenAuth}
            className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl md:rounded-3xl font-black text-lg md:text-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 md:gap-4 justify-center"
          >
            <span>Sign Up Now</span>
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
        <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 md:mb-2">{strings.score}</p>
          <p className="text-2xl md:text-5xl font-black text-blue-600 dark:text-blue-400">{score}/{quiz.questions.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 md:mb-2">{strings.accuracy}</p>
          <p className="text-2xl md:text-5xl font-black text-green-600 dark:text-green-400">{percentage}%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg text-center col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 md:mb-2">Duration</p>
          <p className="text-2xl md:text-5xl font-black text-slate-800 dark:text-slate-200">{formatTime(timeTaken)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-14 items-center">
          <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="space-y-3 md:space-y-4">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">Certificate of Achievement</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl leading-relaxed">
                Highlight your dedication to {strings[quiz.subject]} with a custom minimalist certificate.
              </p>
            </div>
            
            {!shareImageUrl ? (
              <button
                onClick={handleGenerateCard}
                disabled={isGeneratingImage}
                className={`w-full py-4 md:py-6 px-8 md:px-10 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl flex items-center justify-center gap-4 md:gap-5 transition-all shadow-2xl ${
                  isGeneratingImage 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 hover:scale-[1.03] active:scale-95'
                }`}
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-6 h-6 md:w-8 md:h-8 border-3 md:border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    <span className="text-sm md:text-2xl">{strings.generatingCard}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {strings.generateCard}
                  </>
                )}
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 animate-fade-in">
                <button
                  onClick={() => triggerDownload(shareImageUrl, 'png')}
                  className="py-4 md:py-5 bg-blue-600 text-white rounded-2xl md:rounded-3xl font-black text-base md:text-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-blue-700 transition-all shadow-xl"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  {strings.downloadPNG}
                </button>
                <button
                  onClick={() => triggerDownload(shareImageUrl, 'pdf')}
                  className="py-4 md:py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl md:rounded-3xl font-black text-base md:text-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-2 border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  {strings.downloadPDF}
                </button>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-[450px] aspect-[4/3] bg-white rounded-2xl md:rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative group">
            {shareImageUrl ? (
              <img src={shareImageUrl} alt="Certificate" className="w-full h-full object-contain p-2 md:p-4" />
            ) : isGeneratingImage ? (
              <div className="flex flex-col items-center gap-4 md:gap-6">
                 <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                 <span className="text-sm md:text-lg font-black text-slate-400 animate-pulse uppercase tracking-[0.1em]">Designing...</span>
              </div>
            ) : (
              <div className="text-slate-100 dark:text-slate-800 flex flex-col items-center gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-900 rounded-xl md:rounded-[2rem] flex items-center justify-center">
                   <svg className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">Preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">Review Your Answers</h2>
          <span className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">PEDAGOGICAL INSIGHTS</span>
        </div>
        
        {quiz.questions.map((q, idx) => {
          const isCorrect = userAnswers[idx] === q.correctIndex;
          const isExpanded = expandedExplanations[idx];

          return (
            <div key={idx} className={`bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 border-l-[8px] md:border-l-[12px] shadow-lg transition-all ${
              isCorrect ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                    {getTypeLabel(q.type)}
                  </span>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">{q.text}</h3>
                </div>
                <span className={`px-4 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] shrink-0 ${
                  isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                }`}>
                  {isCorrect ? strings.correct : strings.incorrect}
                </span>
              </div>
              
              <div className="grid gap-3 md:gap-4 mb-6 md:mb-8">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`px-4 md:px-6 py-3 md:py-5 rounded-xl md:rounded-2xl text-base md:text-lg font-bold flex justify-between items-center border-2 transition-all ${
                    oIdx === q.correctIndex 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                      : oIdx === userAnswers[idx]
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-transparent dark:border-slate-800'
                  }`}>
                    <span className="flex gap-3 md:gap-4">
                      <span className="font-black opacity-40">{String.fromCharCode(65 + oIdx)}.</span>
                      {opt}
                    </span>
                    {oIdx === q.correctIndex && <svg className="w-5 h-5 md:w-7 md:h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </div>
                ))}
              </div>

              <div className={`border-t-2 pt-4 md:pt-6 transition-all duration-300 ${isExpanded ? 'border-blue-100 dark:border-blue-900' : 'border-slate-50 dark:border-slate-800'}`}>
                <button 
                  onClick={() => toggleExplanation(idx)}
                  className="flex items-center justify-between w-full group focus:outline-none"
                >
                  <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] transition-colors ${isExpanded ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`}>
                    {strings.explanation}
                  </span>
                  <svg 
                    className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="mt-4 md:mt-6 bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 animate-[slide-down_0.3s_ease-out] flex gap-4 md:gap-6">
                    <div className="shrink-0 hidden xs:block">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center">
                         <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 11a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed italic font-medium">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12 md:pb-16">
        <button
          onClick={handleNativeShare}
          className="py-5 md:py-6 bg-blue-600 text-white rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-3 md:gap-4 shadow-2xl shadow-blue-500/30"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {strings.share}
        </button>
        <button
          onClick={onRetry}
          className="py-5 md:py-6 bg-green-600 text-white rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl transition-all hover:bg-green-700 active:scale-95 flex items-center justify-center gap-3 md:gap-4 shadow-2xl shadow-green-500/30"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {strings.retry}
        </button>
        <button
          onClick={onHome}
          className="w-full py-5 md:py-6 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl transition-all hover:bg-black dark:hover:bg-slate-700 active:scale-95"
        >
          {strings.backToHome}
        </button>
      </div>
    </div>
  );
};

export default ResultView;
