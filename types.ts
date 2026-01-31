
export type Language = 'en' | 'km' | 'th' | 'vi';
export type Subject = 'mathematics' | 'physics' | 'chemistry' | 'biology';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: number;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: number;
  quizUsage: {
    count: number;
    resetAt: number;
  };
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  difficulty: Difficulty;
  language: Language;
  questions: Question[];
  durationSeconds: number;
  createdAt: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  answers: number[]; // Index of selected option
  timestamp: number;
  subject: Subject;
  difficulty: Difficulty;
}

export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  subjectBreakdown: Record<Subject, number>;
  totalTimeSpentSeconds: number;
}
