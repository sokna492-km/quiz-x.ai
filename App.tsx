
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
        <header className="relative py-4 md:py-6 px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-2">
            <button 
              onClick={handleGoHome}
              className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity active:scale-95 text-left outline-none"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">Q</div>
              <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight hidden xs:block">
                Quiz X<span className="text-blue-600">.ai</span>
              </h1>
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm hover:scale-105 transition-all"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{currentUser.name}</p>
                      {currentUser.subscriptionTier === 'pro' && (
                        <span className="text-yellow-500" title="Pro Member">👑</span>
                      )}
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider mt-1">Logout</button>
                  </div>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner overflow-hidden border-2 border-white dark:border-slate-800">
                    {currentUser.avatar}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 md:px-6 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 border border-blue-400/20"
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
          <div className="space-y-10 md:space-y-16 pb-12">
            {!isLoading && (
              <div className="max-w-4xl mx-auto text-center py-8 md:py-12 animate-fade-in">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                  Quiz X<span className="text-blue-600">.ai</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed px-4">
                  {strings.tagline}
                </p>
              </div>
            )}
            
            <QuizSetup 
              onStart={handleStartQuiz} 
              isLoading={isLoading} 
              user={currentUser} 
              onOpenSubscription={() => setShowSubscriptionModal(true)} 
            />
            
            {!isLoading && userHistory.length > 0 && (
              <div className="space-y-10 md:space-y-16">
                <StatsDashboard history={userHistory} lang={currentLang} />
                <HistoryView history={userHistory} lang={currentLang} />
              </div>
            )}

            {!currentUser && !isLoading && (
               <div className="max-w-2xl mx-auto mt-6 md:mt-10 pb-6">
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
          <p className="text-[10px] md:text-sm text-slate-400 dark:text-slate-500 font-medium">Powered by Gemini 3 Flash & React</p>
        </footer>
      )}
    </div>
  );
};

export default App;
