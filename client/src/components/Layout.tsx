import React from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, User, Dumbbell } from 'lucide-react';
import BottomNav from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { ActiveSessionIndicator } from './ActiveSessionIndicator';
import { useIntelligentPreloading, useNetworkAdaptation } from '@/hooks/useIntelligentPreloading';

interface LayoutProps {
  children?: React.ReactNode;
}

function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/': 'Accueil',
    '/hydration': 'Hydratation',
    '/nutrition': 'Nutrition',
    '/sleep': 'Sommeil',
    '/workout': 'Entraînement',
    '/profile': 'Profil',
    '/social': 'Social'
  };
  return titles[pathname] || 'MyFitHero';
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  
  // Hooks d'optimisation
  useIntelligentPreloading();
  useNetworkAdaptation();
  
  const isHomePage = location === '/';
  const showBackButton = !isHomePage;
  
  const quickActions = [
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header conditionnel */}
      {!isHomePage && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Partie gauche */}
              <div className="flex items-center space-x-4">
                {showBackButton && (
                  <>
                    <button
                      onClick={handleBack}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft size={20} />
                      <span className="font-medium hidden sm:inline">Retour</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300" />
                  </>
                )}
                
                <div>
                  <h1 className="text-xl font-bold text-gray-800">MyFitHero</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    {getPageTitle(location)}
                  </p>
                </div>
              </div>

              {/* Actions rapides - desktop uniquement */}
              <div className="hidden md:flex items-center space-x-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.path}
                    to={action.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      location === action.path
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <action.icon size={16} />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Indicateur de session active */}
      <ActiveSessionIndicator />

      {/* Navigation mobile */}
      <BottomNav />
      
      {/* Bouton d'action flottant */}
      <FloatingActionButton />
    </div>
  );
};

export default Layout;