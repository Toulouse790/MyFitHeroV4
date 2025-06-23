import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Apple, BarChart3, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
    path: '/',
    color: 'text-blue-500'
  },
  {
    id: 'workout',
    label: 'Sport',
    icon: Dumbbell,
    path: '/workout',
    color: 'text-fitness-energy'
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: Apple,
    path: '/nutrition',
    color: 'text-fitness-growth'
  },
  {
    id: 'dashboard',
    label: 'Stats',
    icon: BarChart3,
    path: '/dashboard',
    color: 'text-fitness-hydration'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    path: '/profile',
    color: 'text-fitness-motivation'
  }
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-200 ${
                active 
                  ? `${item.color} scale-105` 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all duration-200 ${
                active ? 'bg-gray-100' : ''
              }`}>
                <Icon 
                  size={20} 
                  className={`transition-all duration-200 ${
                    active ? 'animate-bounce-soft' : ''
                  }`} 
                />
              </div>
              <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
                active ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
