import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import WorkoutPage from './pages/WorkoutPage';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import AuthPages from './components/AuthPages';
import { supabase } from './lib/supabase';

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
  // ÉTAT SIMPLIFIÉ POUR FORCER L'AUTHENTIFICATION
  const [showAuth, setShowAuth] = useState(true); // FORCE l'affichage auth au début
  const [user, setUser] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  console.log('🔍 État App:', { showAuth, user: !!user, hasCompletedOnboarding });

  // Fonction appelée lors de la connexion/inscription réussie
  const handleAuthSuccess = (user: any) => {
    console.log('✅ Authentification réussie:', user.email);
    setUser(user);
    setShowAuth(false); // Masquer les pages d'auth
    // On passera au questionnaire après
  };

  // Fonction appelée quand l'onboarding est terminé
  const handleOnboardingComplete = async (profile: any) => {
    console.log('✅ Onboarding complété:', profile);
    setHasCompletedOnboarding(true);
  };

  // FORCER L'AFFICHAGE DES PAGES D'AUTH
  if (showAuth) {
    console.log('🔐 Affichage des pages d\'authentification');
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  // Si authentifié mais onboarding non complété, afficher le questionnaire
  if (user && !hasCompletedOnboarding) {
    console.log('📝 Affichage du questionnaire');
    return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
  }

  // Sinon, afficher l'application normale
  console.log('🏠 Affichage de l\'application principale');
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Index />} />
          
          {/* Les 4 piliers principaux */}
          <Route 
            path="/workout" 
            element={<WorkoutPage />} 
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
          <Route 
            path="/settings" 
            element={<TemporaryPage title="⚙️ Paramètres" />} 
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
      </Layout>
    </Router>
  );
}
          {/* Pages secondaires */}
          <Route 
            path="/dashboard" 
            element={<TemporaryPage title="📊 Dashboard" />} 
          />
          <Route 
            path="/profile" 
            element={<TemporaryPage title="👤 Mon Profil" />} 
          />
          <Route 
            path="/settings" 
            element={<TemporaryPage title="⚙️ Paramètres" />} 
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
      </Layout>
    </Router>
  );
}

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

export default App;
