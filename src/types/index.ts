export interface Question {
  id: number;
  type: 'single' | 'multi' | 'judge';
  category: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  answer: number[];
  explanation: string;
}

export interface Progress {
  id?: number;
  questionId: number;
  isCorrect: boolean;
  userAnswer: number[];
  timestamp: number;
}

export interface ExamResult {
  id?: number;
  score: number;
  total: number;
  date: number;
  answers: Record<number, number[]>;
}

export type PracticeFilter = {
  category?: string;
  type?: Question['type'];
  difficulty?: number;
};

export type PracticeOrder = 'sequential' | 'random';

export interface ExamConfig {
  count: number;
  duration: number; // minutes
  categories?: string[];
}

export interface AppStats {
  todayCount: number;
  correctRate: number;
  wrongCount: number;
  lastExamScore: number | null;
}
