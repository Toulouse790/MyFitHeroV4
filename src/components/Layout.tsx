import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  Moon, 
  Droplets, 
  BarChart3, 
  User, 
  Settings,
  ArrowLeft
} from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Détermine si on affiche le header/footer selon la page
  const isHomePage = location.pathname === '/';
  const showBackButton = !isHomePage;
  
  // Navigation items pour le footer
  const navigationItems = [
    { path: '/', icon: Home, label: 'Accueil', emoji: '🏠' },
    { path: '/workout', icon: Dumbbell, label: 'Sport', emoji: '🏋️' },
    { path: '/nutrition', icon: Apple, label: 'Nutrition', emoji: '🍎' },
    { path: '/sleep', icon: Moon, label: 'Sommeil', emoji: '😴' },
    { path: '/hydration', icon: Droplets, label: 'Hydratation', emoji: '💧' },
  ];

  const quickActions = [
    { path: '/dashboard', icon: BarChart3, label: 'Stats' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header conditionnel */}
      {showBackButton && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Bouton retour + Titre */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Retour</span>
                </button>
                
                <div className="h-6 w-px bg-gray-300" />
                
                <div>
                  <h1 className="text-xl font-bold text-gray-800">MyFitHero</h1>
                  <p className="text-sm text-gray-500">
                    {getPageTitle(location.pathname)}
                  </p>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center space-x-2">
                {quickActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    <action.icon size={16} />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Footer de navigation (seulement sur mobile et pages internes) */}
      {!isHomePage && (
        <footer className="bg-white border-t border-gray-200 md:hidden">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-around py-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg">{item.emoji}</div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </footer>
      )}

      {/* Floating Action Button pour accès rapide (pages internes) */}
      {!isHomePage && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          >
            <Home size={24} />
            <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Accueil
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour obtenir le titre de la page
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/workout': 'Espace Sport & Entraînement',
    '/nutrition': 'Espace Nutrition & Alimentation',
    '/sleep': 'Espace Sommeil & Récupération',
    '/hydration': 'Espace Hydratation',
    '/dashboard': 'Tableau de Bord',
    '/profile': 'Mon Profil',
  };
  
  return titles[pathname] || 'MyFitHero';
}

export default Layout;
