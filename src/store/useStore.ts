import { create } from 'zustand';
import { db } from '../db/db';
import type {
  Question,
  PracticeFilter,
  PracticeOrder,
  ExamConfig,
  AppStats,
} from '../types';

interface AppState {
  // Practice
  practiceFilter: PracticeFilter;
  practiceOrder: PracticeOrder;
  practiceQuestions: Question[];
  practiceIndex: number;
  practiceStartTime: number | null;
  practiceDone: boolean;

  // Exam
  examConfig: ExamConfig;
  examQuestions: Question[];
  examAnswers: Record<number, number[]>;
  examStartTime: number | null;
  examTimeLeft: number;
  examSubmitted: boolean;
  examMarked: Set<number>;

  // Stats
  stats: AppStats;

  // Actions - Practice
  setPracticeFilter: (filter: Partial<PracticeFilter>) => void;
  setPracticeOrder: (order: PracticeOrder) => void;
  startPractice: (questions: Question[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishPractice: () => void;
  recordProgress: (questionId: number, isCorrect: boolean, userAnswer: number[]) => Promise<void>;

  // Actions - Exam
  setExamConfig: (config: Partial<ExamConfig>) => void;
  startExam: (questions: Question[]) => void;
  setExamAnswer: (questionId: number, answer: number[]) => void;
  toggleExamMarked: (questionId: number) => void;
  tickExam: () => void;
  submitExam: () => Promise<number>;

  // Actions - Stats
  refreshStats: () => Promise<void>;
  clearWrongQuestions: () => Promise<void>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useStore = create<AppState>((set, get) => ({
  practiceFilter: {},
  practiceOrder: 'sequential',
  practiceQuestions: [],
  practiceIndex: 0,
  practiceStartTime: null,
  practiceDone: false,

  examConfig: { count: 100, duration: 90 },
  examQuestions: [],
  examAnswers: {},
  examStartTime: null,
  examTimeLeft: 0,
  examSubmitted: false,
  examMarked: new Set(),

  stats: { todayCount: 0, correctRate: 0, wrongCount: 0, lastExamScore: null },

  setPracticeFilter: (filter) =>
    set((s) => ({ practiceFilter: { ...s.practiceFilter, ...filter } })),

  setPracticeOrder: (order) => set({ practiceOrder: order }),

  startPractice: (questions) =>
    set({
      practiceQuestions: get().practiceOrder === 'random' ? shuffle(questions) : questions,
      practiceIndex: 0,
      practiceStartTime: Date.now(),
      practiceDone: false,
    }),

  nextQuestion: () => {
    const { practiceIndex, practiceQuestions } = get();
    if (practiceIndex < practiceQuestions.length - 1) {
      set({ practiceIndex: practiceIndex + 1 });
    } else {
      set({ practiceDone: true });
    }
  },

  prevQuestion: () =>
    set((s) => ({
      practiceIndex: Math.max(0, s.practiceIndex - 1),
    })),

  finishPractice: () => set({ practiceDone: true }),

  recordProgress: async (questionId, isCorrect, userAnswer) => {
    await db.progress.add({
      questionId,
      isCorrect,
      userAnswer,
      timestamp: Date.now(),
    });
  },

  setExamConfig: (config) =>
    set((s) => ({ examConfig: { ...s.examConfig, ...config } })),

  startExam: (questions) => {
    const { examConfig } = get();
    set({
      examQuestions: shuffle(questions).slice(0, examConfig.count),
      examAnswers: {},
      examStartTime: Date.now(),
      examTimeLeft: examConfig.duration * 60,
      examSubmitted: false,
      examMarked: new Set(),
    });
  },

  setExamAnswer: (questionId, answer) =>
    set((s) => ({
      examAnswers: { ...s.examAnswers, [questionId]: answer },
    })),

  toggleExamMarked: (questionId) =>
    set((s) => {
      const next = new Set(s.examMarked);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return { examMarked: next };
    }),

  tickExam: () =>
    set((s) => ({
      examTimeLeft: Math.max(0, s.examTimeLeft - 1),
    })),

  submitExam: async () => {
    const { examQuestions, examAnswers } = get();
    let correct = 0;
    for (const q of examQuestions) {
      const userAns = examAnswers[q.id] || [];
      if (arraysEqual(userAns, q.answer)) correct++;
    }
    const score = Math.round((correct / examQuestions.length) * 100);
    await db.examResults.add({
      score,
      total: examQuestions.length,
      date: Date.now(),
      answers: examAnswers,
    });
    set({ examSubmitted: true });
    return score;
  },

  refreshStats: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const allProgress = await db.progress.toArray();
    const todayProgress = allProgress.filter((p) => p.timestamp >= todayTs);
    const wrongSet = new Set<number>();
    for (const p of allProgress) {
      if (!p.isCorrect) wrongSet.add(p.questionId);
    }

    const correctCount = todayProgress.filter((p) => p.isCorrect).length;
    const todayCount = todayProgress.length;

    const exams = await db.examResults.orderBy('date').reverse().limit(1).toArray();

    set({
      stats: {
        todayCount,
        correctRate: todayCount > 0 ? Math.round((correctCount / todayCount) * 100) : 0,
        wrongCount: wrongSet.size,
        lastExamScore: exams.length > 0 ? exams[0].score : null,
      },
    });
  },

  clearWrongQuestions: async () => {
    await db.progress.where('isCorrect').equals(0).delete();
    await get().refreshStats();
  },
}));

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
