
import React from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import NotFound from './pages/NotFound';

import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useAppStore } from '@/stores/useAppStore';
import { UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase';
import { useAuthStatus } from '@/hooks/useAuthStatus';

function App() {
  const { session, loading, hasCompletedOnboarding } = useAuthStatus();
  const { user: appStoreUser, updateProfile: updateAppStoreUserProfile } = useAppStore();
  const { toast } = useToast();

  const handleAuthSuccess = (user: SupabaseAuthUserType) => {
    console.log('Auth success for user:', user.id);
  };

  const handleOnboardingComplete = async (profileData: UserProfileOnboarding) => {
    if (!session?.user) {
      console.error('No user session found for onboarding completion');
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route path="/auth" element={
          session ? 
            <Navigate to={hasCompletedOnboarding ? "/dashboard" : "/onboarding"} replace /> : 
            <AuthPages onAuthSuccess={handleAuthSuccess} />
        } />
        
        <Route 
          path="/onboarding" 
          element={
            session ? 
              (hasCompletedOnboarding ? 
                <Navigate to="/dashboard" replace /> : 
                <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />
              ) : 
              <Navigate to="/auth" replace />
          } 
        />
        
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/dashboard" element={<ProtectedRoute><SmartDashboard /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
          <Route path="/sleep" element={<ProtectedRoute><Sleep /></ProtectedRoute>} />
          <Route path="/hydration" element={<ProtectedRoute><Hydration /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster /> 
    </Router>
  );
}

export default App;
