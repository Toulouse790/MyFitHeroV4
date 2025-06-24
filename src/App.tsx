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
  // États pour gérer l'authentification et l'onboarding
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    // Vérifier s'il y a une session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        checkOnboardingStatus(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        checkOnboardingStatus(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier si l'utilisateur a complété l'onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      // Vérifier en base de données si le profil est complet
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setIsLoading(false);
        return;
      }

      // Vérifier si l'onboarding est complété (par exemple, si age est renseigné)
      if (profile && profile.age !== null) {
        setUserProfile(profile);
        setHasCompletedOnboarding(true);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setIsLoading(false);
    }
  };

  // Fonction appelée lors de la connexion/inscription réussie
  const handleAuthSuccess = (user: any) => {
    setUser(user);
    setIsAuthenticated(true);
    checkOnboardingStatus(user.id);
  };

  // Fonction appelée quand l'onboarding est terminé
  const handleOnboardingComplete = async (profile: any) => {
    try {
      if (!user) return;

      // Sauvegarder le profil en base de données
      const { error } = await supabase
        .from('user_profiles')
        .update({
          age: profile.age,
          gender: profile.gender,
          activity_level: profile.lifestyle,
          fitness_goal: profile.primary_goals[0], // Premier objectif comme principal
          // Ajouter d'autres champs selon le profil
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde du profil:', error);
        return;
      }

      console.log('Profil utilisateur complété:', profile);
      setUserProfile({ ...userProfile, ...profile });
      setHasCompletedOnboarding(true);

    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de MyFitHero...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher les pages d'authentification
  if (!isAuthenticated) {
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  // Si authentifié mais onboarding non complété, afficher le questionnaire
  if (!hasCompletedOnboarding) {
    return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
  }

  // Sinon, afficher l'application normale
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
