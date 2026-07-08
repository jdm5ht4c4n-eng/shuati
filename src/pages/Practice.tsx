import { useState, useCallback } from 'react';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import type { PracticeFilter } from '../types';

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
    practiceQuestions, practiceIndex,
    startPractice, nextQuestion, prevQuestion,
    recordProgress, refreshStats,
  } = useStore();

  const [phase, setPhase] = useState<'config' | 'active' | 'summary'>('config');
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [startIndex, setStartIndex] = useState('1');

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
    const idx = parseInt(startIndex) || 1;
    const startIdx = practiceOrder === 'sequential' ? Math.max(1, Math.min(idx, questions.length)) - 1 : 0;
    startPractice(questions, startIdx);
    setPhase('active');
    setResults({ correct: 0, total: 0 });
  }, [practiceFilter, startPractice, practiceOrder, startIndex]);

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
            {practiceOrder === 'sequential' && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">从第</span>
                <input
                  type="number"
                  min={1}
                  value={startIndex}
                  onChange={(e) => setStartIndex(e.target.value)}
                  className="w-20 border rounded-lg px-3 py-1.5 text-sm text-center"
                />
                <span className="text-sm text-gray-600">题开始</span>
              </div>
            )}
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
