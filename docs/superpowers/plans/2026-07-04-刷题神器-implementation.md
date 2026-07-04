# 刷题神器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA question-practice app for the 路桥交通工程中级考试 with 1000 questions, supporting practice mode, wrong-answer review, and timed mock exams.

**Architecture:** Vite + React 18 SPA with HashRouter for client-side routing. IndexedDB (via Dexie.js) stores questions, progress, and exam results. Zustand manages UI state. Tailwind CSS for responsive mobile-first styling. PWA via vite-plugin-pwa for offline support.

**Tech Stack:** Vite 5, React 18, TypeScript, Zustand, Dexie.js, Tailwind CSS 3, react-router-dom (HashRouter), vite-plugin-pwa

## Global Constraints

- 1000 questions total: 单选 850, 多选 50, 判断 100
- 6 categories mapped to 6 source PDFs
- Difficulty distribution: 简单 40%, 中等 40%, 困难 20%
- All data stored locally in IndexedDB; no backend server
- Mobile-first responsive design; PWA installable
- Compatible: iOS Safari 14+, Chrome Android 90+, Chrome/Edge/Firefox 90+

---

## File Structure Map

| File | Responsibility |
|---|---|
| `src/types/index.ts` | Shared TypeScript interfaces (Question, Progress, ExamResult) |
| `src/db/db.ts` | Dexie.js database schema and instance |
| `src/db/seed.ts` | Bulk-insert questions.json into IndexedDB with transaction |
| `src/store/useStore.ts` | Zustand store: practice/exam state, actions, computed stats |
| `src/components/Layout.tsx` | Bottom tab bar navigation (Home/Practice/WrongReview/Exam) |
| `src/components/QuestionCard.tsx` | Renders a question with options; handles selection + feedback |
| `src/components/ProgressBar.tsx` | Simple horizontal progress indicator |
| `src/pages/Home.tsx` | Dashboard with three mode-entry cards + stats overview |
| `src/pages/Practice.tsx` | Practice mode: filter config → sequential/random question flow → summary |
| `src/pages/WrongReview.tsx` | Wrong-answer list → re-practice flow → clear-all |
| `src/pages/Exam.tsx` | Exam config → timed exam with question palette → scoring → results |
| `src/data/questions.json` | Pre-generated 1000 questions (committed as JSON) |
| `src/App.tsx` | HashRouter with routes mapped to pages, wrapped in Layout |
| `src/main.tsx` | React entry: seed IndexedDB on first load, render App |
| `index.html` | HTML shell with viewport meta for mobile |
| `vite.config.ts` | Vite + React plugin + PWA plugin config |
| `tailwind.config.js` | Tailwind with content paths |
| `postcss.config.js` | PostCSS with tailwind and autoprefixer |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: `package.json` with all dependencies, Vite + Tailwind build pipeline

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "shuati-shenqi",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "dexie": "^4.0.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.1"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#1e40af" />
    <meta name="description" content="路桥交通工程中级考试刷题神器" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <title>路桥交通工程刷题</title>
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '路桥交通工程刷题',
        short_name: '刷题神器',
        description: '路桥交通工程中级考试备考刷题工具',
        theme_color: '#1e40af',
        background_color: '#f9fafb',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [],
      },
    }),
  ],
});
```

- [ ] **Step 4: Create `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 5: Create `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 7: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 8: Create `src/vite-env.d.ts`**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 9: Install dependencies and verify build**

```bash
cd "c:\Users\62525\Desktop\claude code-gcs\刷题神器"
npm install
```

- [ ] **Step 10: Verify project compiles (expect error about missing main.tsx)**

```bash
npx tsc --noEmit
```

---

### Task 2: Shared Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `Question`, `Progress`, `ExamResult` interfaces used by all other modules

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
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
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

---

### Task 3: IndexedDB Database Setup

**Files:**
- Create: `src/db/db.ts`

**Interfaces:**
- Consumes: `Question`, `Progress`, `ExamResult` from `src/types/index.ts`
- Produces: `db` (Dexie instance with `questions`, `progress`, `examResults` tables)

- [ ] **Step 1: Create `src/db/db.ts`**

```typescript
import Dexie, { type Table } from 'dexie';
import type { Question, Progress, ExamResult } from '../types';

export class ShuatiDB extends Dexie {
  questions!: Table<Question, number>;
  progress!: Table<Progress, number>;
  examResults!: Table<ExamResult, number>;

  constructor() {
    super('shuati-db');
    this.version(1).stores({
      questions: 'id, type, category, difficulty',
      progress: '++id, questionId, isCorrect, timestamp',
      examResults: '++id, score, date',
    });
  }
}

export const db = new ShuatiDB();
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 4: Database Seed Logic

**Files:**
- Create: `src/db/seed.ts`

**Interfaces:**
- Consumes: `db` from `src/db/db.ts`, `Question` from `src/types/index.ts`
- Produces: `seedQuestions()` function — call once on app startup to populate IndexedDB

- [ ] **Step 1: Create `src/db/seed.ts`**

```typescript
import { db } from './db';
import type { Question } from '../types';

export async function seedQuestions(questions: Question[]): Promise<void> {
  const count = await db.questions.count();
  if (count > 0) return; // already seeded

  await db.transaction('rw', db.questions, async () => {
    await db.questions.bulkAdd(questions);
  });
}
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 5: Zustand Store

**Files:**
- Create: `src/store/useStore.ts`

**Interfaces:**
- Consumes: `db` from `src/db/db.ts`, types from `src/types/index.ts`
- Produces: `useStore` hook — all UI state + actions

- [ ] **Step 1: Create `src/store/useStore.ts`**

```typescript
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
    await db.progress.where('isCorrect').equals(false).delete();
    await get().refreshStats();
  },
}));

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 6: Layout Component (Bottom Navigation)

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/index.css`

**Interfaces:**
- Consumes: Nothing from store (pure presentational routing)
- Produces: `<Layout>` component wrapping page content with bottom tab bar

- [ ] **Step 1: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}
```

- [ ] **Step 2: Create `src/components/Layout.tsx`**

```typescript
import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/practice', label: '刷题', icon: '📝' },
  { to: '/wrong', label: '错题', icon: '❌' },
  { to: '/exam', label: '考试', icon: '📋' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="max-w-2xl mx-auto px-4 py-4">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-2xl mx-auto flex justify-around">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
```

---

### Task 7: ProgressBar Component

**Files:**
- Create: `src/components/ProgressBar.tsx`

**Interfaces:**
- Consumes: `value: number`, `max: number` props
- Produces: `<ProgressBar>` — thin colored bar

- [ ] **Step 1: Create `src/components/ProgressBar.tsx`**

```typescript
interface Props {
  value: number;
  max: number;
}

export default function ProgressBar({ value, max }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

---

### Task 8: QuestionCard Component

**Files:**
- Create: `src/components/QuestionCard.tsx`

**Interfaces:**
- Consumes: `Question` from types, callback props
- Produces: `<QuestionCard>` — renders question + options + feedback

- [ ] **Step 1: Create `src/components/QuestionCard.tsx`**

```typescript
import { useState } from 'react';
import type { Question } from '../types';

const typeLabels: Record<string, string> = {
  single: '单选题',
  multi: '多选题',
  judge: '判断题',
};

const diffLabels: Record<number, string> = { 1: '简单', 2: '中等', 3: '困难' };
const diffColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
};

interface Props {
  question: Question;
  selected: number[];
  showResult: boolean;
  onSelect: (indices: number[]) => void;
}

export default function QuestionCard({
  question,
  selected,
  showResult,
  onSelect,
}: Props) {
  const [localSelected, setLocalSelected] = useState<number[]>(selected);

  const handleClick = (idx: number) => {
    if (showResult) return;
    let next: number[];
    if (question.type === 'single' || question.type === 'judge') {
      next = [idx];
    } else {
      next = localSelected.includes(idx)
        ? localSelected.filter((i) => i !== idx)
        : [...localSelected, idx];
    }
    setLocalSelected(next);
    onSelect(next);
  };

  const optionStyle = (idx: number): string => {
    if (!showResult) {
      return localSelected.includes(idx)
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 bg-white';
    }
    const isCorrect = question.answer.includes(idx);
    const isUserSelected = localSelected.includes(idx);
    if (isCorrect && isUserSelected) return 'border-green-500 bg-green-50';
    if (isCorrect && !isUserSelected) return 'border-green-500 bg-green-50';
    if (!isCorrect && isUserSelected) return 'border-red-500 bg-red-50';
    return 'border-gray-200 bg-white opacity-60';
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
          {typeLabels[question.type]}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${diffColors[question.difficulty]}`}
        >
          {diffLabels[question.difficulty]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {question.category}
        </span>
      </div>

      <p className="text-base font-medium text-gray-900 mb-4 leading-relaxed">
        {question.question}
      </p>

      <div className="space-y-2">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${optionStyle(
              idx
            )}`}
          >
            <span className="font-semibold text-gray-400 mr-2">
              {String.fromCharCode(65 + idx)}.
            </span>
            <span className="text-gray-800">{opt}</span>
            {showResult && question.answer.includes(idx) && (
              <span className="float-right text-green-600">✓</span>
            )}
            {showResult &&
              localSelected.includes(idx) &&
              !question.answer.includes(idx) && (
                <span className="float-right text-red-600">✗</span>
              )}
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
          <strong>解析：</strong>
          {question.explanation}
        </div>
      )}

      {question.type === 'multi' && !showResult && (
        <p className="text-xs text-gray-400 mt-2">多选题，点击多个选项</p>
      )}
    </div>
  );
}
```

---

### Task 9: App Entry + Router

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/pages/Home.tsx` (stub)
- Create: `src/pages/Practice.tsx` (stub)
- Create: `src/pages/WrongReview.tsx` (stub)
- Create: `src/pages/Exam.tsx` (stub)

**Interfaces:**
- Consumes: Layout, pages
- Produces: Working app skeleton with navigation

- [ ] **Step 1: Create `src/App.tsx`**

```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Practice from './pages/Practice';
import WrongReview from './pages/WrongReview';
import Exam from './pages/Exam';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="practice" element={<Practice />} />
          <Route path="wrong" element={<WrongReview />} />
          <Route path="exam" element={<Exam />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Create stub pages (all identical structure)**

Create `src/pages/Home.tsx`:
```typescript
export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">路桥交通工程刷题</h1>
      <p className="text-gray-500">首页 — 待实现</p>
    </div>
  );
}
```

Create `src/pages/Practice.tsx`:
```typescript
export default function Practice() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">刷题模式</h1>
      <p className="text-gray-500">待实现</p>
    </div>
  );
}
```

Create `src/pages/WrongReview.tsx`:
```typescript
export default function WrongReview() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">错题回顾</h1>
      <p className="text-gray-500">待实现</p>
    </div>
  );
}
```

Create `src/pages/Exam.tsx`:
```typescript
export default function Exam() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">模拟考试</h1>
      <p className="text-gray-500">待实现</p>
    </div>
  );
}
```

- [ ] **Step 4: Verify build compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Run dev server and check navigation works**

```bash
npm run dev
```
Open `http://localhost:5173` — verify 4 tabs navigate between pages.

---

### Task 10: Home Page

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/main.tsx` (add seed + stats refresh on load)

**Interfaces:**
- Consumes: `useStore`, `db`, `seedQuestions`
- Produces: Full home page with entry cards + stats

- [ ] **Step 1: Rewrite `src/pages/Home.tsx`**

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Home() {
  const stats = useStore((s) => s.stats);
  const refreshStats = useStore((s) => s.refreshStats);
  const navigate = useNavigate();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">路桥交通工程刷题</h1>
      <p className="text-sm text-gray-500 mb-6">中级考试备考神器</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: '今日刷题', value: stats.todayCount, unit: '题' },
          { label: '正确率', value: stats.correctRate, unit: '%' },
          { label: '错题', value: stats.wrongCount, unit: '题' },
          { label: '最近考试', value: stats.lastExamScore ?? '-', unit: stats.lastExamScore ? '分' : '' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-lg p-3 text-center shadow">
            <p className="text-lg font-bold text-blue-600">{item.value}</p>
            <p className="text-xs text-gray-500">
              {item.label}
              {item.unit ? ` (${item.unit})` : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Entry Cards */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/practice')}
          className="w-full bg-white rounded-xl shadow p-5 text-left hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mr-3">📝</span>
          <div className="inline-block align-middle">
            <p className="text-lg font-semibold text-gray-900">刷题模式</p>
            <p className="text-sm text-gray-500">按分类/题型/难度自由刷题</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/wrong')}
          className="w-full bg-white rounded-xl shadow p-5 text-left hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mr-3">❌</span>
          <div className="inline-block align-middle">
            <p className="text-lg font-semibold text-gray-900">
              错题回顾
              {stats.wrongCount > 0 && (
                <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {stats.wrongCount}
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">针对性复习错题，查漏补缺</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/exam')}
          className="w-full bg-white rounded-xl shadow p-5 text-left hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mr-3">📋</span>
          <div className="inline-block align-middle">
            <p className="text-lg font-semibold text-gray-900">模拟考试</p>
            <p className="text-sm text-gray-500">限时模拟，检验真实水平</p>
          </div>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/main.tsx` to seed database on first load**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { db } from './db/db';
import { seedQuestions } from './db/seed';

async function init() {
  const count = await db.questions.count();
  if (count === 0) {
    try {
      const mod = await import('./data/questions.json');
      const questions = mod.default || mod;
      await seedQuestions(Array.isArray(questions) ? questions : []);
    } catch {
      console.warn('questions.json not found, skipping seed');
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();
```

- [ ] **Step 3: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 11: Practice Page

**Files:**
- Modify: `src/pages/Practice.tsx`

**Interfaces:**
- Consumes: `useStore`, `db`, `QuestionCard`, `ProgressBar`
- Produces: Full practice mode: filter → questions → feedback → summary

- [ ] **Step 1: Rewrite `src/pages/Practice.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import type { Question, PracticeFilter } from '../types';

const CATEGORIES = [
  '交通流理论',
  '交通管理与控制',
  '公路工程技术标准',
  '高速公路交通工程通用规范',
  '公路隧道设计规范',
  '公路交通安全',
];

export default function Practice() {
  const {
    practiceFilter, setPracticeFilter,
    practiceOrder, setPracticeOrder,
    practiceQuestions, practiceIndex, practiceDone,
    startPractice, nextQuestion, prevQuestion,
    recordProgress, refreshStats,
  } = useStore();

  const [phase, setPhase] = useState<'config' | 'active' | 'summary'>('config');
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const loadQuestions = useCallback(async () => {
    let collection = db.questions.toCollection();
    const f: PracticeFilter = practiceFilter;
    if (f.category) collection = collection.filter((q) => q.category === f.category);
    if (f.type) collection = collection.filter((q) => q.type === f.type);
    if (f.difficulty) collection = collection.filter((q) => q.difficulty === f.difficulty);
    const questions = await collection.toArray();
    if (questions.length === 0) {
      alert('没有匹配的题目，请调整筛选条件');
      return;
    }
    startPractice(questions);
    setPhase('active');
    setResults({ correct: 0, total: 0 });
  }, [practiceFilter, startPractice]);

  const current = practiceQuestions[practiceIndex];

  const handleSelect = (indices: number[]) => {
    setSelected(indices);
  };

  const handleConfirm = async () => {
    if (!current || answered) return;
    const isCorrect =
      [...selected].sort().join(',') === [...current.answer].sort().join(',');
    setShowResult(true);
    setAnswered(true);
    setResults((r) => ({
      correct: r.correct + (isCorrect ? 1 : 0),
      total: r.total + 1,
    }));
    await recordProgress(current.id, isCorrect, selected);
  };

  const handleNext = () => {
    if (practiceIndex >= practiceQuestions.length - 1) {
      setPhase('summary');
      refreshStats();
      return;
    }
    setSelected([]);
    setShowResult(false);
    setAnswered(false);
    nextQuestion();
  };

  if (phase === 'config') {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">刷题模式</h1>
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {/* Category */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">知识点分类</p>
            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={practiceFilter.category || ''}
              onChange={(e) =>
                setPracticeFilter({ category: e.target.value || undefined })
              }
            >
              <option value="">全部</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">题型</p>
            <div className="flex gap-2">
              {[
                { label: '全部', value: undefined },
                { label: '单选', value: 'single' as const },
                { label: '多选', value: 'multi' as const },
                { label: '判断', value: 'judge' as const },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setPracticeFilter({ type: opt.value })}
                  className={`px-3 py-1 rounded-full text-sm ${
                    practiceFilter.type === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">难度</p>
            <div className="flex gap-2">
              {[
                { label: '全部', value: undefined },
                { label: '简单', value: 1 },
                { label: '中等', value: 2 },
                { label: '困难', value: 3 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setPracticeFilter({ difficulty: opt.value })}
                  className={`px-3 py-1 rounded-full text-sm ${
                    practiceFilter.difficulty === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">刷题顺序</p>
            <div className="flex gap-2">
              {[
                { label: '顺序刷', value: 'sequential' as const },
                { label: '随机刷', value: 'random' as const },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setPracticeOrder(opt.value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    practiceOrder === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={loadQuestions}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
          >
            开始刷题
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">本轮结束</h2>
        <p className="text-3xl font-bold text-blue-600 mb-1">
          {results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0}%
        </p>
        <p className="text-gray-500 mb-6">
          正确 {results.correct} / {results.total} 题
        </p>
        <button
          onClick={() => setPhase('config')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
        >
          再来一轮
        </button>
      </div>
    );
  }

  if (!current) {
    return <p className="text-gray-500">加载中...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-900">刷题模式</h1>
        <span className="text-sm text-gray-500">
          {practiceIndex + 1} / {practiceQuestions.length}
        </span>
      </div>
      <ProgressBar value={practiceIndex + 1} max={practiceQuestions.length} />

      <div className="mt-4">
        <QuestionCard
          question={current}
          selected={selected}
          showResult={showResult}
          onSelect={handleSelect}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={prevQuestion}
          disabled={practiceIndex === 0}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold disabled:opacity-30"
        >
          上一题
        </button>
        {!answered ? (
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            确认答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            {practiceIndex < practiceQuestions.length - 1 ? '下一题' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 12: Wrong Review Page

**Files:**
- Modify: `src/pages/WrongReview.tsx`

**Interfaces:**
- Consumes: `useStore`, `db`, `QuestionCard`
- Produces: Wrong-answer list + inline re-practice + clear all

- [ ] **Step 1: Rewrite `src/pages/WrongReview.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import QuestionCard from '../components/QuestionCard';
import type { Question } from '../types';

interface WrongItem {
  question: Question;
  wrongCount: number;
  lastWrongTime: number;
}

export default function WrongReview() {
  const { refreshStats, clearWrongQuestions, recordProgress } = useStore();
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWrong = async () => {
    setLoading(true);
    const allProgress = await db.progress.toArray();
    const wrongMap = new Map<number, { count: number; lastTime: number }>();
    for (const p of allProgress) {
      if (!p.isCorrect) {
        const existing = wrongMap.get(p.questionId);
        wrongMap.set(p.questionId, {
          count: (existing?.count || 0) + 1,
          lastTime: Math.max(existing?.lastTime || 0, p.timestamp),
        });
      }
    }

    const items: WrongItem[] = [];
    for (const [qid, info] of wrongMap) {
      const q = await db.questions.get(qid);
      if (q) {
        items.push({ question: q, wrongCount: info.count, lastWrongTime: info.lastTime });
      }
    }
    items.sort((a, b) => b.lastWrongTime - a.lastWrongTime);
    setWrongItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadWrong();
  }, []);

  const handleCorrect = async (questionId: number) => {
    await recordProgress(questionId, true, selected);
    // Remove from list
    setWrongItems((prev) => prev.filter((w) => w.question.id !== questionId));
    setActiveId(null);
    setSelected([]);
    setShowResult(false);
    refreshStats();
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有错题记录吗？此操作不可撤销。')) return;
    await clearWrongQuestions();
    setWrongItems([]);
  };

  const activeQuestion = activeId
    ? wrongItems.find((w) => w.question.id === activeId)?.question
    : null;

  if (activeQuestion) {
    const isCorrect =
      [...selected].sort().join(',') === [...activeQuestion.answer].sort().join(',');

    return (
      <div>
        <button
          onClick={() => { setActiveId(null); setSelected([]); setShowResult(false); }}
          className="text-blue-600 text-sm mb-3"
        >
          ← 返回错题列表
        </button>
        <QuestionCard
          question={activeQuestion}
          selected={selected}
          showResult={showResult}
          onSelect={setSelected}
        />
        <div className="flex gap-3 mt-4">
          {!showResult ? (
            <button
              onClick={() => setShowResult(true)}
              disabled={selected.length === 0}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              确认答案
            </button>
          ) : isCorrect ? (
            <button
              onClick={() => handleCorrect(activeQuestion.id)}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold"
            >
              ✓ 做对了，移出错题本
            </button>
          ) : (
            <button
              onClick={() => { setShowResult(false); setSelected([]); }}
              className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold"
            >
              重新作答
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">错题回顾</h1>
        {wrongItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-500"
          >
            清空错题本
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">加载中...</p>
      ) : wrongItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500">暂无错题，继续保持！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {wrongItems.map((item) => (
            <button
              key={item.question.id}
              onClick={() => setActiveId(item.question.id)}
              className="w-full bg-white rounded-lg shadow p-3 text-left"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-900 line-clamp-2 flex-1 mr-2">
                  {item.question.question}
                </p>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                  错{item.wrongCount}次
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {item.question.category} · {new Date(item.lastWrongTime).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 13: Exam Page

**Files:**
- Modify: `src/pages/Exam.tsx`

**Interfaces:**
- Consumes: `useStore`, `db`, `QuestionCard`
- Produces: Exam config → timed exam with question palette → scoring → results

- [ ] **Step 1: Rewrite `src/pages/Exam.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import QuestionCard from '../components/QuestionCard';

const CATEGORIES = [
  '交通流理论',
  '交通管理与控制',
  '公路工程技术标准',
  '高速公路交通工程通用规范',
  '公路隧道设计规范',
  '公路交通安全',
];

export default function Exam() {
  const {
    examConfig, setExamConfig,
    examQuestions, examAnswers, examTimeLeft,
    examSubmitted, examMarked,
    startExam, setExamAnswer, toggleExamMarked,
    tickExam, submitExam, refreshStats,
  } = useStore();

  const [phase, setPhase] = useState<'config' | 'active' | 'result'>('config');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const timer = setInterval(() => {
      tickExam();
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, tickExam]);

  // Auto-submit on time up
  useEffect(() => {
    if (phase === 'active' && examTimeLeft <= 0) {
      handleSubmit();
    }
  }, [examTimeLeft, phase]);

  const handleStart = useCallback(async () => {
    const allQuestions = await db.questions.toArray();
    startExam(allQuestions);
    setPhase('active');
    setCurrentIdx(0);
  }, [startExam]);

  const handleSubmit = async () => {
    const unanswered = examQuestions.length - Object.keys(examAnswers).length;
    if (unanswered > 0) {
      if (!confirm(`还有 ${unanswered} 道题未作答，确定交卷吗？`)) return;
    }
    const s = await submitExam();
    setScore(s);
    setPhase('result');
    refreshStats();
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (phase === 'config') {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-4">模拟考试</h1>
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">题量</p>
            <div className="flex gap-2">
              {[50, 100, 150].map((n) => (
                <button
                  key={n}
                  onClick={() => setExamConfig({ count: n })}
                  className={`px-4 py-2 rounded-full text-sm ${
                    examConfig.count === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {n}题
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">时间限制</p>
            <div className="flex gap-2">
              {[60, 90, 120].map((n) => (
                <button
                  key={n}
                  onClick={() => setExamConfig({ duration: n })}
                  className={`px-4 py-2 rounded-full text-sm ${
                    examConfig.duration === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {n}分钟
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
          >
            开始考试
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const total = examQuestions.length;
    const answered = Object.keys(examAnswers).length;
    let correctCount = 0;
    for (const q of examQuestions) {
      const ua = examAnswers[q.id] || [];
      if ([...ua].sort().join(',') === [...q.answer].sort().join(',')) correctCount++;
    }

    return (
      <div className="text-center py-6">
        <p className="text-4xl mb-3">{score !== null && score >= 60 ? '🎉' : '📋'}</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">考试成绩</h2>
        <p className="text-5xl font-bold text-blue-600 mb-1">{score}分</p>
        <p className="text-gray-500 mb-6">
          正确 {correctCount} / 错误 {answered - correctCount} / 未答 {total - answered}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { setPhase('config'); setScore(null); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold w-full"
          >
            再来一次
          </button>
          <button
            onClick={() => setPhase('active')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold w-full"
          >
            查看试卷
          </button>
        </div>
      </div>
    );
  }

  const current = examQuestions[currentIdx];

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-lg font-bold ${examTimeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatTime(examTimeLeft)}
        </span>
        <span className="text-sm text-gray-500">
          已答 {Object.keys(examAnswers).length} / {examQuestions.length}
        </span>
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="text-sm text-blue-600"
        >
          题号
        </button>
      </div>

      {/* Question palette */}
      {showPalette && (
        <div className="bg-white rounded-xl shadow p-3 mb-3 flex flex-wrap gap-1.5">
          {examQuestions.map((q, i) => {
            const isAnswered = q.id in examAnswers;
            const isMarked = examMarked.has(q.id);
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => { setCurrentIdx(i); setShowPalette(false); }}
                className={`w-8 h-8 rounded text-xs font-medium ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 bg-blue-100 text-blue-700'
                    : isAnswered
                    ? 'bg-blue-600 text-white'
                    : isMarked
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question */}
      {current && (
        <QuestionCard
          question={current}
          selected={examAnswers[current.id] || []}
          showResult={false}
          onSelect={(ans) => setExamAnswer(current.id, ans)}
        />
      )}

      {/* Bottom actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold disabled:opacity-30"
        >
          上一题
        </button>
        {current && (
          <button
            onClick={() => toggleExamMarked(current.id)}
            className={`py-3 px-4 rounded-xl font-semibold text-sm ${
              examMarked.has(current.id)
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : 'border border-gray-300 text-gray-500'
            }`}
          >
            {examMarked.has(current.id) ? '取消标记' : '标记待定'}
          </button>
        )}
        {currentIdx < examQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            下一题
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold"
          >
            交卷
          </button>
        )}
      </div>

      {/* Submit button always visible at bottom */}
      <button
        onClick={handleSubmit}
        className="w-full mt-3 py-2 border border-red-300 text-red-500 rounded-xl text-sm"
      >
        提前交卷
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify with TypeScript**

```bash
npx tsc --noEmit
```

---

### Task 14: Question Generation — Research + Generate 1000 Questions

**Files:**
- Create: `src/data/questions.json`
- Modify: `src/data/questions.json` (progressively as batches are generated)

**Interfaces:**
- Consumes: 6 PDFs in `交通工程/` directory, web search results
- Produces: `questions.json` — 1000 valid Question objects

**Strategy:** Generate in 10 batches of ~100 questions each to manage token limits. Each batch covers a subset of categories. Write each batch to the JSON file incrementally.

- [ ] **Step 1: Web search for exam syllabus and past exam patterns**

Search queries to run in parallel:
1. "路桥交通工程中级职称考试大纲 2024 2025"
2. "交通工程中级职称考试 历年真题 题型分布"
3. "路桥交通工程工程师考试 知识点 考点"
4. "交通工程学 中级职称考试 常见考题"

Compile findings into a shared research note (not committed to repo) covering:
- Exam structure (number of questions, time, subjects)
- High-frequency knowledge points
- Question style examples
- Common pitfalls tested

- [ ] **Step 2: Extract knowledge points from 6 PDFs**

Read each PDF and extract structured knowledge points:
1. 《交通工程学》王炜 → 交通流理论 (流量/密度/速度关系、通行能力、服务水平)
2. 《交通管理与控制》杨佩昆 → 信号控制 (配时计算、感应控制、干线协调)
3. JTG B01-2014 → 公路技术等级、设计速度、横断面、视距
4. JTG D80-2006 → 交通安全设施、监控系统、收费系统、通信系统
5. 隧道设计规范 → 隧道通风、照明、消防、监控
6. 《公路交通安全》 → 事故分析、安全评价、防护设施

For each knowledge point, note:
- Key definitions, formulas, thresholds
- Common misconceptions (great for distractor options)
- Related specification article numbers

- [ ] **Step 3: Generate questions batch 1/10 (IDs 1-100): 交通流理论**

Generate 100 questions on 交通流理论:
- 单选 85: traffic flow parameters, speed-density-flow relationships, capacity, level of service
- 多选 5: comprehensive questions on traffic flow theory
- 判断 10: common misconceptions

Each question must follow the Question interface:
```json
{
  "id": 1,
  "type": "single",
  "category": "交通流理论",
  "difficulty": 1,
  "question": "交通量、速度和密度三参数的基本关系式为？",
  "options": ["Q=KV", "Q=K/V", "Q=V/K", "Q=K+V"],
  "answer": [0],
  "explanation": "交通流基本模型：流量Q=密度K×速度V，这是交通流理论最基本的关系式。"
}
```

Write to `src/data/questions.json` as an array.

- [ ] **Step 4: Generate questions batch 2/10 (IDs 101-200): 交通流理论 + 交通管理与控制**

- [ ] **Step 5: Generate questions batch 3/10 (IDs 201-300): 交通管理与控制**

- [ ] **Step 6: Generate questions batch 4/10 (IDs 301-400): 公路工程技术标准 JTG B01**

- [ ] **Step 7: Generate questions batch 5/10 (IDs 401-500): 公路工程技术标准 JTG B01 + 高速公路通用规范**

- [ ] **Step 8: Generate questions batch 6/10 (IDs 501-600): 高速公路交通工程通用规范 JTG D80**

- [ ] **Step 9: Generate questions batch 7/10 (IDs 601-700): 公路隧道设计规范 + 公路交通安全**

- [ ] **Step 10: Generate questions batch 8/10 (IDs 701-800): 公路交通安全**

- [ ] **Step 11: Generate questions batch 9/10 (IDs 801-900): Cross-category comprehensive + fill gaps**

- [ ] **Step 12: Generate questions batch 10/10 (IDs 901-1000): Fill remaining gaps to reach 850/50/100 distribution**

- [ ] **Step 13: Validate questions.json**

Checklist:
- [ ] Total count = 1000
- [ ] 单选 = 850, 多选 = 50, 判断 = 100
- [ ] All 6 categories represented
- [ ] Difficulty: 简单 ~400, 中等 ~400, 困难 ~200
- [ ] All IDs 1-1000 unique
- [ ] All questions have 3-5 options
- [ ] All answer arrays contain valid indices
- [ ] All questions have non-empty explanation
- [ ] `npx tsc --noEmit` passes (JSON is valid and importable)

Run validation script:
```bash
node -e "
const q = require('./src/data/questions.json');
console.log('Total:', q.length);
console.log('Single:', q.filter(x=>x.type==='single').length);
console.log('Multi:', q.filter(x=>x.type==='multi').length);
console.log('Judge:', q.filter(x=>x.type==='judge').length);
const cats = {};
q.forEach(x => { cats[x.category] = (cats[x.category]||0)+1; });
console.log('Categories:', cats);
const diffs = {};
q.forEach(x => { diffs[x.difficulty] = (diffs[x.difficulty]||0)+1; });
console.log('Difficulty:', diffs);
const ids = q.map(x=>x.id);
console.log('Unique IDs:', new Set(ids).size);
"
```

---

### Task 15: PWA Icons + Final Polish

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`

**Interfaces:**
- None (static assets)

- [ ] **Step 1: Generate PWA icons**

Create a simple SVG-based icon and convert to PNG. Use a minimal design: blue background (#1e40af) with white "路" character or a pen icon.

Using Node.js or a simple approach to generate placeholder icons. For MVP, create simple colored squares with text using canvas via script:

```bash
node -e "
const { createCanvas } = require('canvas'); // skip if not available
// Alternatively, just create a simple placeholder
"
```

If canvas not available, create a minimal valid PNG manually or download a placeholder. The app will function without icons during development.

- [ ] **Step 2: Build and verify production output**

```bash
npm run build
```

Verify `dist/` contains:
- `index.html`
- `manifest.webmanifest`
- `sw.js` (service worker)
- JS/CSS bundles
- `icons/` directory

- [ ] **Step 3: Test production build locally**

```bash
npm run preview
```

Open `http://localhost:4173` and verify:
- All 4 tabs navigate correctly
- Practice mode works end-to-end
- Wrong review page loads
- Exam timer and submission work
- PWA manifest is served (check DevTools → Application → Manifest)

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "feat: complete 刷题神器 v1.0 — 1000 questions, practice, wrong review, exam, PWA"
```

---

### Task 16: Responsive Testing + Mobile QA

**Files:**
- Modify: Any files needing responsive fixes

- [ ] **Step 1: Test on mobile viewport**

Open Chrome DevTools → Device Toolbar → select iPhone 14 / Pixel 7:
- Verify all pages fit without horizontal scroll
- Verify bottom nav is accessible
- Verify QuestionCard options are tappable (min tap target 44px)
- Verify exam question palette is usable on small screen
- Verify timer is readable

- [ ] **Step 2: Fix any responsive issues found**

Common fixes (apply as needed):
- Reduce padding on small screens with `px-3 sm:px-4`
- Stack buttons vertically on mobile with `flex-col sm:flex-row`
- Ensure font sizes are readable (min `text-sm` for body text)

- [ ] **Step 3: Install as PWA on mobile and test offline**

- Open on mobile browser → "Add to Home Screen"
- Launch installed PWA → verify no browser chrome
- Turn on airplane mode → verify all features still work (questions loaded from IndexedDB)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: responsive polish and mobile QA"
```
