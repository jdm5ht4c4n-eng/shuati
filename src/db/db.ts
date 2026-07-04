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
