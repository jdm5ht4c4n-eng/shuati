import { db } from './db';
import type { Question } from '../types';

export async function seedQuestions(questions: Question[]): Promise<void> {
  const count = await db.questions.count();
  if (count > 0) return; // already seeded

  await db.transaction('rw', db.questions, async () => {
    await db.questions.bulkAdd(questions);
  });
}
