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
