import React, { Suspense } from 'react';
import { Router, Route } from 'wouter';
import IndexPage from '@/pages/index';

// Composant de chargement élégant
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-2 opacity-60" 
             style={{animationDelay: '0.2s', animationDuration: '0.8s'}}></div>
      </div>
      <p className="text-xl font-medium text-gray-700 animate-pulse">Chargement...</p>
      <p className="text-sm text-gray-500 mt-2">MyFitHero V4</p>
    </div>
  </div>
);

// Page 404 stylée professionnelle
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
    <div className="text-center max-w-lg mx-auto p-8">
      {/* Animation d'icône */}
      <div className="text-8xl mb-6 animate-bounce">🚀</div>
      
      <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-4">
        404
      </h1>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Page non trouvée
      </h2>
      
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Oops ! Cette page n'existe pas encore dans <strong>MyFitHero V4</strong>. 
        Mais ne t'inquiète pas, ton parcours fitness continue !
      </p>
      
      {/* Informations de debug */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-lg">
        <p className="text-sm text-gray-600 mb-2">
          <strong>URL demandée :</strong>
        </p>
        <code className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-mono text-gray-800">
          {window.location.pathname}
        </code>
      </div>
      
      {/* Actions */}
      <div className="space-y-4">
        <button 
          onClick={() => window.location.href = '/'}
          className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
        >
          🏠 Retour à l'accueil
        </button>
        
        <p className="text-xs text-gray-400 mt-4">
          MyFitHero V4 - Votre compagnon fitness intelligent
        </p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const currentPath = window.location.pathname;
  console.log("🟢 MyFitHero V4 - Route actuelle:", currentPath);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Router>
        {/* Page d'accueil avec interface d'authentification */}
        <Route path="/">
          <IndexPage />
        </Route>
        
        {/* Routes d'authentification - toutes redirigent vers IndexPage */}
        <Route path="/login">
          <IndexPage />
        </Route>
        
        <Route path="/register">
          <IndexPage />
        </Route>
        
        <Route path="/auth">
          <IndexPage />
        </Route>
        
        {/* Route catch-all pour 404 */}
        <Route>
          {() => {
            // Ne pas afficher 404 pour les routes connues
            if (currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/auth') {
              return null;
            }
            return <NotFoundPage />;
          }}
        </Route>
      </Router>
    </Suspense>
  );
};

export default App;
