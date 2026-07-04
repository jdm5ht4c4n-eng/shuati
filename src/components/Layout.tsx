import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/practice', label: '刷题', icon: '📝' },
  { to: '/wrong', label: '错题', icon: '❌' },
  { to: '/exam', label: '考试', icon: '📋' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="max-w-2xl mx-auto px-4 py-4">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-2xl mx-auto flex justify-around">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
