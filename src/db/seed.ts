import { db } from './db';
import type { Question } from '../types';

function shuffleOptions(question: Question): Question {
  // Pair each option with its original index
  const pairs = question.options.map((opt, i) => [opt, i] as const);
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  // Build mapping: old index -> new index
  const oldToNew = new Map<number, number>();
  pairs.forEach(([, oldIdx], newIdx) => oldToNew.set(oldIdx, newIdx));
  // Remap answers
  const newAnswer = question.answer
    .map((oldIdx) => oldToNew.get(oldIdx) ?? oldIdx)
    .sort((a, b) => a - b);

  return {
    ...question,
    options: pairs.map(([opt]) => opt),
    answer: newAnswer,
  };
}

export async function seedQuestions(questions: Question[]): Promise<void> {
  const count = await db.questions.count();
  if (count > 0) return; // already seeded

  const shuffled = questions.map(shuffleOptions);

  await db.transaction('rw', db.questions, async () => {
    await db.questions.bulkAdd(shuffled);
  });
}
