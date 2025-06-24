import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';

// Import des pages (à créer ensuite)
// import WorkoutPage from './pages/WorkoutPage';
// import NutritionPage from './pages/NutritionPage';
// import SleepPage from './pages/SleepPage';
// import HydrationPage from './pages/HydrationPage';
// import DashboardPage from './pages/DashboardPage';
// import ProfilePage from './pages/ProfilePage';

// Pages temporaires pour tester le routing
const TemporaryPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">Cette page sera développée prochainement</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        ← Retour
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Index />} />
          
          {/* Les 4 piliers principaux */}
          <Route 
            path="/workout" 
            element={<TemporaryPage title="🏋️ Espace Sport" />} 
          />
          <Route 
            path="/nutrition" 
            element={<TemporaryPage title="🍎 Espace Nutrition" />} 
          />
          <Route 
            path="/sleep" 
            element={<TemporaryPage title="😴 Espace Sommeil" />} 
          />
          <Route 
            path="/hydration" 
            element={<TemporaryPage title="💧 Espace Hydratation" />} 
          />
          
          {/* Pages secondaires */}
          <Route 
            path="/dashboard" 
            element={<TemporaryPage title="📊 Dashboard" />} 
          />
          <Route 
            path="/profile" 
            element={<TemporaryPage title="👤 Mon Profil" />} 
          />
          
          {/* Route 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    ← Retour à l'accueil
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
