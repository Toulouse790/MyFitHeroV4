import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Apple, Moon, Droplets } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

// 4 PILIERS PRINCIPAUX du fitness
const navItems: NavItem[] = [
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
    id: 'sleep',
    label: 'Sommeil',
    icon: Moon,
    path: '/sleep',
    color: 'text-fitness-recovery'
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
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Ne pas afficher la nav sur la page d'accueil
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-2 transition-all duration-300 hover:scale-105 ${
                active 
                  ? `${item.color} scale-110` 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Icône avec effet */}
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'bg-white shadow-lg border-2 border-current' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <Icon 
                  size={24} 
                  className={`transition-all duration-300 ${
                    active ? 'animate-pulse' : ''
                  }`} 
                />
              </div>
              
              {/* Label */}
              <span className={`text-sm mt-2 font-semibold transition-all duration-300 text-center ${
                active ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {/* Indicateur actif */}
              {active && (
                <div className={`w-1 h-1 rounded-full mt-1 ${item.color.replace('text-', 'bg-')} animate-pulse`}></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Barre colorée selon page active */}
      <div className="h-1 bg-gradient-to-r from-fitness-energy via-fitness-growth via-fitness-recovery to-fitness-hydration"></div>
    </nav>
  );
};

export default BottomNav;
