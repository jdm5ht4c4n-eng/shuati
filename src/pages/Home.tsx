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
