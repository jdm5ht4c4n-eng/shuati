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
