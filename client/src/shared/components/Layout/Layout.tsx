import React from 'react';
import { Outlet } from 'react-router-dom';

export interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// Header Component
const Header: React.FC<{
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}> = ({ onSidebarToggle, sidebarCollapsed }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MF</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">MyFitHero</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5v-5zM12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">U</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  collapsed?: boolean;
  className?: string;
}> = ({ collapsed = false, className = '' }) => {
  const navigationItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '💪', label: 'Workouts', path: '/workout' },
    { icon: '🥗', label: 'Nutrition', path: '/nutrition' },
    { icon: '😴', label: 'Recovery', path: '/recovery' },
    { icon: '📊', label: 'Analytics', path: '/analytics' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <aside
      className={`
        bg-gray-900 text-white h-full transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      <nav className="mt-8">
        <ul className="space-y-2 px-3">
          {navigationItems.map(item => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white
                  transition-colors duration-200
                  ${collapsed ? 'justify-center' : 'space-x-3'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>© 2025 MyFitHero. All rights reserved.</div>
        <div className="flex items-center space-x-4">
          <a href="/privacy" className="hover:text-gray-900">
            Privacy
          </a>
          <a href="/terms" className="hover:text-gray-900">
            Terms
          </a>
          <a href="/support" className="hover:text-gray-900">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

// Main Layout Component
export const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  showHeader = true,
  showSidebar = true,
  showFooter = false,
  sidebarCollapsed = false,
  onSidebarToggle,
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <Header onSidebarToggle={onSidebarToggle} sidebarCollapsed={sidebarCollapsed} />
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {showSidebar && <Sidebar collapsed={sidebarCollapsed} className="hidden lg:block" />}

        {/* Mobile Sidebar Overlay */}
        {showSidebar && !sidebarCollapsed && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onSidebarToggle} />
            <Sidebar className="relative z-50" />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children || <Outlet />}</div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

// Layout variants
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">MF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MyFitHero</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <Layout
      showHeader={true}
      showSidebar={true}
      showFooter={false}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {children}
    </Layout>
  );
};

export const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout showHeader={true} showSidebar={false} showFooter={true}>
      {children}
    </Layout>
  );
};

export default Layout;
