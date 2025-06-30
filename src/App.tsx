import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import WorkoutPage from './pages/WorkoutPage';
import Nutrition from './pages/Nutrition';
import Sleep from './pages/Sleep';
import Hydration from './pages/Hydration';
import Profile from './pages/Profile';
import OnboardingQuestionnaire, { UserProfileOnboarding } from './components/OnboardingQuestionnaire';
import AuthPages from './components/AuthPages';
import SmartDashboard from './components/SmartDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Assurez-vous que ce chemin est correct
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { useAuthStatus } from './hooks/useAuthStatus'; // Assurez-vous que ce chemin est correct
import NotFound from './pages/NotFound';

import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useAppStore } from '@/stores/useAppStore';
import { UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase';


function App() {
  const { session, loading, hasCompletedOnboarding } = useAuthStatus();
  const { user: appStoreUser, updateProfile: updateAppStoreUserProfile } = useAppStore();
  const { toast } = useToast();

  // Cette fonction n'est plus utilisée directement pour la redirection mais peut rester pour le log
  const handleAuthSuccess = (user: SupabaseAuthUserType) => {
    console.log('Auth success for user:', user.id);
    // La gestion de l'état global et la redirection sont maintenant prises en charge par useAuthStatus
    // et les redirections de route définies ci-dessous.
  };

  const handleOnboardingComplete = async (profileData: UserProfileOnboarding) => {
    if (!session?.user) {
      console.error('Aucune session utilisateur trouvée pour la complétion de l\'onboarding');
      toast({
        title: "Erreur",
        description: "Session utilisateur introuvable. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Completing onboarding with data:', profileData);
      
      const updatesToDb: Partial<SupabaseDBUserProfileType> = {
        age: profileData.age,
        gender: profileData.gender,
        lifestyle: profileData.lifestyle,
        available_time_per_day: profileData.available_time_per_day,
        fitness_experience: profileData.fitness_experience,
        injuries: profileData.injuries,
        primary_goals: profileData.primary_goals,
        motivation: profileData.motivation,
        fitness_goal: profileData.fitness_goal,
        sport: profileData.sport,
        sport_position: profileData.sport_position,
        sport_level: profileData.sport_level,
        training_frequency: profileData.training_frequency,
        season_period: profileData.season_period,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatesToDb)
        .eq('id', session.user.id)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        console.log('Onboarding completed successfully:', data[0]);
        // Mise à jour du store Zustand, useAuthStatus va redétecter le changement
        updateAppStoreUserProfile({
          ...data[0],
          name: data[0].full_name || data[0].username || 'Non défini',
          email: session.user.email || '',
          goal: data[0].fitness_goal || 'Non défini',
          level: appStoreUser.level,
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(data[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
        
        toast({
          title: "Profil complété !",
          description: "Bienvenue dans MyFitHero ! Votre profil a été configuré avec succès.",
        });
        // Pas besoin de redirection explicite ici, useAuthStatus se mettra à jour
        // et la logique de routage globale prendra le relais.
      }

    } catch (error: unknown) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur s'est produite lors de la sauvegarde de votre profil. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Affichage du spinner de chargement global tant que l'état d'authentification n'est pas résolu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Logique de redirection centralisée après que 'loading' est passé à false
  // C'est le point de décision principal pour les redirections initiales
  if (session && !hasCompletedOnboarding) {
    // Si l'utilisateur est connecté mais n'a pas complété l'onboarding, on le dirige vers l'onboarding
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  } else if (session && hasCompletedOnboarding) {
    // Si l'utilisateur est connecté et a complété l'onboarding, on le dirige vers le tableau de bord
    if (window.location.pathname === '/auth' || window.location.pathname === '/onboarding' || window.location.pathname === '/') {
        return <Navigate to="/dashboard" replace />;
    }
  } else if (!session) {
    // Si l'utilisateur n'est pas connecté, on le dirige vers l'authentification
    if (window.location.pathname !== '/auth' && window.location.pathname !== '/') { // Évite la redirection si déjà sur /auth ou /
        return <Navigate to="/auth" replace />;
    }
  }


  return (
    <Router>
      <Routes>
        {/* Route publique pour la page d'accueil (Index) */}
        <Route path="/" element={<Index />} />

        {/* Route pour l'authentification - rend TOUJOURS AuthPages */}
        <Route path="/auth" element={<AuthPages onAuthSuccess={handleAuthSuccess} />} />

        {/* Route pour le questionnaire d'onboarding - rend TOUJOURS OnboardingQuestionnaire */}
        {/* Les redirections vers /dashboard ou /auth sont gérées par la logique centrale ci-dessus ou ProtectedRoute. */}
        <Route 
          path="/onboarding" 
          element={<OnboardingQuestionnaire onComplete={handleOnboardingComplete} />} 
        />
        
        {/* Routes protégées - utilisent le ProtectedRoute wrapper */}
        {/* ProtectedRoute gérera les redirections si l'utilisateur n'est pas connecté ou si l'onboarding n'est pas fait */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/dashboard" element={<ProtectedRoute><SmartDashboard /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
          <Route path="/sleep" element={<ProtectedRoute><Sleep /></ProtectedRoute>} />
          <Route path="/hydration" element={<ProtectedRoute><Hydration /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        {/* Route 404 - doit être la dernière */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster /> 
    </Router>
  );
}

export default App;