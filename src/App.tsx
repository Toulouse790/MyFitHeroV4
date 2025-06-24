import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import WorkoutPage from './pages/WorkoutPage';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import AuthPages from './components/AuthPages';
import { supabase } from './lib/supabase';

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
    console.log('✅ Onboarding - Données reçues:', profile);
    
    if (!user) {
      console.error('❌ Pas d\'utilisateur connecté');
      return;
    }

    try {
      // Sauvegarder le profil COMPLET en base de données
      const updateData = {
        // Données personnelles
        age: profile.age,
        gender: profile.gender,
        lifestyle: profile.lifestyle,
        available_time_per_day: profile.available_time_per_day,
        fitness_experience: profile.fitness_experience,
        injuries: profile.injuries || [],
        
        // Objectifs et motivation
        primary_goals: profile.primary_goals || [],
        motivation: profile.motivation || '',
        fitness_goal: profile.primary_goals?.[0] || null, // Premier objectif comme principal
        
        // Données sportives (si applicable)
        sport: profile.sport,
        sport_position: profile.sport_position,
        sport_level: profile.sport_level,
        training_frequency: profile.training_frequency,
        season_period: profile.season_period,
        
        // Métadonnées
        updated_at: new Date().toISOString()
      };

      console.log('💾 Sauvegarde des données:', updateData);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select(); // Récupérer les données mises à jour

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        alert('Erreur lors de la sauvegarde du profil. Veuillez réessayer.');
        return;
      }

      console.log('✅ Profil sauvegardé avec succès:', data);
      
      // Mettre à jour l'état local
      if (data && data[0]) {
        setHasCompletedOnboarding(true);
      }

    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      alert('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
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

export default App;
