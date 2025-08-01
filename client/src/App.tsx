import React, { Suspense } from 'react';
import { Router, Route, Switch } from 'wouter'; 
import IndexPage from '@/pages/index';

// Composant de chargement
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg font-medium text-gray-600">Chargement...</p>
      <p className="text-sm text-gray-400 mt-1">MyFitHero V4</p>
    </div>
  </div>
);

// Page 404 stylée
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="text-8xl mb-6">🚫</div>
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Page non trouvée
      </h2>
      <p className="text-gray-600 mb-8 text-lg">
        Cette page n'existe pas dans MyFitHero V4
      </p>
      
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          URL demandée : <code className="bg-gray-200 px-2 py-1 rounded text-xs">{window.location.pathname}</code>
        </p>
      </div>
      
      <button 
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
      >
        🏠 Retour à l'accueil
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  console.log("🟢 MyFitHero V4 - Route:", window.location.pathname);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Router>
        <Switch>
          {/* Page d'accueil avec authentification */}
          <Route path="/" exact>
            <IndexPage />
          </Route>
          
          {/* Routes d'authentification - redirigent vers IndexPage */}
          <Route path="/login" exact>
            <IndexPage />
          </Route>
          
          <Route path="/register" exact>
            <IndexPage />
          </Route>
          
          <Route path="/auth" exact>
            <IndexPage />
          </Route>
          
          {/* Route catch-all pour 404 */}
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </Router>
    </Suspense>
  );
};

export default App;
