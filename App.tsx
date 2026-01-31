
import React, { useState, useEffect } from 'react';
import { Quiz, Language, Subject, Difficulty, QuizAttempt, User, SubscriptionTier } from './types';
import { generateQuiz } from './services/geminiService';
import QuizSetup from './components/QuizSetup';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import HistoryView from './components/HistoryView';
import StatsDashboard from './components/StatsDashboard';
import AuthModal from './components/AuthModal';
import SubscriptionModal from './components/SubscriptionModal';
import { UI_STRINGS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omni_quiz_user');
    if (saved) {
      const user = JSON.parse(saved);
      const now = Date.now();
      if (user.quizUsage.resetAt < now) {
        user.quizUsage.count = 0;
        user.quizUsage.resetAt = now + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('omni_quiz_user', JSON.stringify(user));
      }
      return user;
    }
    return null;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('omni_quiz_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const saved = localStorage.getItem('omni_quiz_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omni_quiz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omni_quiz_theme', 'light');
    }
  }, [isDarkMode]);

  const handleStartQuiz = async (lang: Language, subject: Subject, difficulty: Difficulty) => {
    if (currentUser && currentUser.subscriptionTier === 'free') {
      if (currentUser.quizUsage.count >= 3) {
        setShowSubscriptionModal(true);
        return;
      }
    }

    setIsLoading(true);
    setCurrentLang(lang);
    try {
      const quiz = await generateQuiz(subject, difficulty, lang);
      
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          quizUsage: {
            ...currentUser.quizUsage,
            count: currentUser.quizUsage.count + 1
          }
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('omni_quiz_user', JSON.stringify(updatedUser));
      }

      setActiveQuiz(quiz);
      setView('quiz');
    } catch (error) {
      console.error("Failed to generate quiz", error);
      alert("Something went wrong generating the quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (answers: number[], finalTime: number) => {
    setUserAnswers(answers);
    setTimeTaken(finalTime);
    setView('result');

    if (activeQuiz && currentUser) {
      saveScore(answers, finalTime, currentUser.id);
    }
  };

  const saveScore = (answers: number[], finalTime: number, userId: string) => {
    if (!activeQuiz) return;
    const score = answers.reduce((acc, ans, idx) => {
      return acc + (ans === activeQuiz.questions[idx].correctIndex ? 1 : 0);
    }, 0);

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      quizId: activeQuiz.id,
      userId: userId,
      score,
      totalQuestions: activeQuiz.questions.length,
      timeTakenSeconds: finalTime,
      answers,
      timestamp: Date.now(),
      subject: activeQuiz.subject,
      difficulty: activeQuiz.difficulty
    };

    const newHistory = [...history, attempt];
    setHistory(newHistory);
    localStorage.setItem('omni_quiz_history', JSON.stringify(newHistory));
  };

  const handleRetry = () => {
    setUserAnswers([]);
    setTimeTaken(0);
    setView('quiz');
  };

  const handleGoHome = () => {
    setView('setup');
    setActiveQuiz(null);
    setUserAnswers([]);
  };

  const handleLogin = (user: User) => {
    const userWithUsage = {
      ...user,
      subscriptionTier: user.subscriptionTier || 'free',
      quizUsage: user.quizUsage || {
        count: 0,
        resetAt: Date.now() + 7 * 24 * 60 * 60 * 1000
      }
    };
    setCurrentUser(userWithUsage);
    localStorage.setItem('omni_quiz_user', JSON.stringify(userWithUsage));
    setShowAuthModal(false);
    
    if (view === 'result' && activeQuiz) {
      saveScore(userAnswers, timeTaken, userWithUsage.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omni_quiz_user');
  };

  const handleUpgrade = (plan: 'monthly' | 'annually') => {
    if (!currentUser) {
      setShowSubscriptionModal(false);
      setShowAuthModal(true);
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      subscriptionTier: 'pro',
      subscriptionExpiry: Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('omni_quiz_user', JSON.stringify(updatedUser));
    setShowSubscriptionModal(false);
    alert(`Success! You are now a PRO member. Plan: ${plan}`);
  };

  const strings = UI_STRINGS[currentLang];
  const userHistory = history.filter(h => h.userId === (currentUser?.id || 'guest'));

  return (
    <div className="min-h-screen pb-20 dark:bg-slate-950 transition-colors duration-300">
      {view !== 'quiz' && (
        <header className="relative py-4 md:py-6 px-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
            <button 
              onClick={handleGoHome}
              className="flex items-center gap-3 md:gap-5 hover:opacity-90 transition-all active:scale-95 text-left outline-none group"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-3xl shadow-xl shadow-blue-500/30 group-hover:rotate-3 transition-transform">
                Q
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                Quiz X<span className="text-blue-600">.ai</span>
              </h1>
            </button>

            <div className="flex items-center gap-3 md:gap-6">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-90"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-3 md:gap-5 pl-4 md:pl-6 border-l border-slate-200 dark:border-slate-800">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1.5 justify-end">
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{currentUser.name}</p>
                      {currentUser.subscriptionTier === 'pro' && (
                        <span className="text-yellow-500 text-lg" title="Pro Member">👑</span>
                      )}
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest mt-1.5">Logout</button>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl md:text-3xl shadow-inner overflow-hidden border-2 border-white dark:border-slate-800">
                    {currentUser.avatar}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 md:px-8 py-2.5 md:py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl hover:scale-[1.03] transition-all active:scale-95"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="px-4 md:px-0">
        {view === 'setup' && (
          <div className="space-y-4 md:space-y-6 pb-12">
            {!isLoading && (
              <div className="max-w-4xl mx-auto text-center pt-6 md:pt-8 pb-1 animate-[fade-in-up_0.6s_ease-out]">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 shadow-sm backdrop-blur-sm">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base font-bold tracking-tight">
                    {strings.tagline.split('AI-powered').map((part: string, i: number) => (
                      <React.Fragment key={i}>
                        {i > 0 && (
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent px-0.5">
                            AI-powered
                          </span>
                        )}
                        {part}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            )}
            
            <QuizSetup 
              onStart={handleStartQuiz} 
              isLoading={isLoading} 
              user={currentUser} 
              onOpenSubscription={() => setShowSubscriptionModal(true)} 
            />
            
            {!isLoading && userHistory.length > 0 && (
              <div className="space-y-8 md:space-y-12">
                <StatsDashboard history={userHistory} lang={currentLang} />
                <HistoryView history={userHistory} lang={currentLang} />
              </div>
            )}

            {!currentUser && !isLoading && (
               <div className="max-w-2xl mx-auto pb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group transition-all duration-500">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10 space-y-2 max-w-md text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight">Save your achievements!</h3>
                      <p className="text-blue-100 text-sm md:text-base opacity-90 leading-relaxed">Create a profile to track scores and download personalized certificates.</p>
                    </div>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="relative z-10 whitespace-nowrap px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 font-extrabold text-base md:text-lg rounded-xl md:rounded-2xl hover:shadow-lg hover:scale-[1.03] transition-all active:scale-95 flex items-center gap-2 md:gap-3 group/btn shadow-md w-full md:w-auto justify-center"
                    >
                      <span>Join Quiz X.ai</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}
        
        {view === 'quiz' && activeQuiz && (
          <QuizView quiz={activeQuiz} onComplete={handleQuizComplete} />
        )}
        
        {view === 'result' && activeQuiz && (
          <ResultView 
            quiz={activeQuiz} 
            userAnswers={userAnswers} 
            timeTaken={timeTaken} 
            onHome={handleGoHome} 
            onRetry={handleRetry}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal 
          lang={currentLang} 
          onClose={() => setShowSubscriptionModal(false)} 
          onUpgrade={handleUpgrade} 
        />
      )}

      {view === 'setup' && !isLoading && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-center items-center z-40">
          <p className="text-[10px] md:text-sm text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Powered by Gemini 3 Flash & React</p>
        </footer>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
