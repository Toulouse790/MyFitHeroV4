import React from 'react';
import { useLocation, Link } from 'wouter';
import { Dumbbell, Apple, Droplets, Home, BarChart3, Users } from 'lucide-react';

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
    color: 'text-blue-600'
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
    id: 'social',
    label: 'Social',
    icon: Users,
    path: '/social',
    color: 'text-purple-600'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    color: 'text-indigo-600'
  },
  {
    id: 'hydration',
    label: 'Hydratation',
    icon: Droplets,
    path: '/hydration',
    color: 'text-fitness-hydration'
  }
];

const BottomNav = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  // Ne pas afficher sur les pages publiques
  const publicPaths = ['/', '/auth', '/onboarding'];
  if (publicPaths.includes(location)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300 ${
                active 
                  ? `${item.color} scale-110` 
                  : 'text-gray-400'
              }`}
            >
              <Icon 
                size={22} 
                className={`transition-all duration-300 ${
                  active ? 'mb-1' : ''
                }`} 
              />
              
              <span className={`text-xs font-medium transition-all duration-300 ${
                active ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {active && (
                <div className={`w-1 h-1 rounded-full mt-1 ${item.color.replace('text-', 'bg-')} animate-pulse`}></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
