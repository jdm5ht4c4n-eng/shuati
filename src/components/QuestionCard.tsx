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
