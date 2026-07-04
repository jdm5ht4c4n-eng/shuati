import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { useStore } from '../store/useStore';
import QuestionCard from '../components/QuestionCard';

export default function Exam() {
  const {
    examConfig, setExamConfig,
    examQuestions, examAnswers, examTimeLeft,
    examMarked,
    startExam, setExamAnswer, toggleExamMarked,
    tickExam, submitExam, refreshStats,
  } = useStore();

  const [phase, setPhase] = useState<'config' | 'active' | 'result'>('config');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (phase === 'active' && examTimeLeft <= 0 && !submitting) {
      handleSubmit();
    }
  }, [examTimeLeft, phase]);

  const handleStart = useCallback(async () => {
    const allQuestions = await db.questions.toArray();
    startExam(allQuestions);
    setPhase('active');
    setCurrentIdx(0);
    setSubmitting(false);
  }, [startExam]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    const unanswered = examQuestions.length - Object.keys(examAnswers).length;
    if (unanswered > 0) {
      if (!confirm(`还有 ${unanswered} 道题未作答，确定交卷吗？`)) return;
    }
    setSubmitting(true);
    const s = await submitExam();
    setScore(s);
    setPhase('result');
    refreshStats();
  }, [submitting, examQuestions.length, examAnswers, submitExam, refreshStats]);

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
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
          >
            交卷
          </button>
        )}
      </div>

      {/* Submit button always visible at bottom */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-3 py-2 border border-red-300 text-red-500 rounded-xl text-sm disabled:opacity-50"
      >
        提前交卷
      </button>
    </div>
  );
}
