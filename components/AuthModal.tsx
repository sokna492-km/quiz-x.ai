
import React, { useState } from 'react';
import { User } from '../types';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../services/authService';

interface Props {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AVATARS = ['🎓', '🧠', '🚀', '🧪', '🔭', '🧬', '⚛️', '📐'];

const AuthModal: React.FC<Props> = ({ onLogin, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  const validateEmail = (e: string) => {
    return String(e)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const user = await signInWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Required fields missing.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password too short.');
      return;
    }

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name.');
          return;
        }

        const user = await signUpWithEmail(email.trim(), password.trim(), name.trim());
        onLogin(user);
      } else {
        const user = await signInWithEmail(email.trim(), password.trim());
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[400px] p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 animate-[zoom-in_0.3s_ease-out] my-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6 md:mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 text-3xl shadow-inner">
            {isSignUp ? selectedAvatar : '🔐'}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {isSignUp ? 'Join Quiz X.ai' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 font-medium">
            {isSignUp ? 'Start your learning journey today' : 'Pick up where you left off'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 animate-shake text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.98] text-sm md:text-base shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.414 1.127-3.99 1.127-2.91 0-5.382-1.954-6.264-4.609l-4.102 3.17c1.996 3.99 6.132 6.723 10.96 6.723 3.027 0 5.854-1.01 8.045-2.713l-4.65-3.7z" />
              <path fill="#4285F4" d="M19.833 12.045c0-.79-.072-1.545-.208-2.273H12v4.309h4.39c-.19 1.022-.764 1.89-1.627 2.468l4.65 3.704c2.718-2.504 4.286-6.19 4.286-9.914l.134-1.294z" />
              <path fill="#FBBC05" d="M5.266 14.235A7.086 7.086 0 0 1 4.909 12c0-.782.136-1.536.377-2.235L1.26 6.65A11.933 11.933 0 0 0 0 12c0 1.92.455 3.727 1.26 5.35l4.006-3.115z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 rounded-2xl outline-none text-slate-900 dark:text-white text-base transition-all shadow-inner"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 rounded-2xl outline-none text-slate-900 dark:text-white text-base transition-all shadow-inner"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-950 rounded-2xl outline-none text-slate-900 dark:text-white text-base transition-all shadow-inner"
            />

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="ml-2 font-black text-blue-600 hover:text-blue-700 transition-colors decoration-2 underline-offset-4 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default AuthModal;
