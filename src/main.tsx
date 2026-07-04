import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { db } from './db/db';
import { seedQuestions } from './db/seed';
import type { Question } from './types';
import questionsData from './data/questions.json';

async function init() {
  try {
    const count = await db.questions.count();
    if (count === 0) {
      const questions = (questionsData as any).default || questionsData;
      await seedQuestions(Array.isArray(questions) ? questions as Question[] : []);
    }
  } catch (e) {
    console.warn('数据库初始化失败，应用仍可运行:', e);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();
