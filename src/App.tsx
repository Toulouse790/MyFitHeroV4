
import React, { useState, useEffect, ReactNode } from 'react';
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
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import NotFound from './pages/NotFound';

import { Session, User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { UserProfile, useAppStore } from '@/stores/useAppStore'; 
import { UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  const { user: appStoreUser, updateProfile: updateAppStoreUserProfile } = useAppStore();

  const loadUserProfile = async (userId: string, userSession: Session) => {
    try {
      console.log('Loading user profile for:', userId);
      
      const { data: userProfileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Erreur chargement profil:", profileError);
        
        // Tentative de création du profil si il n'existe pas
        if (profileError.code === 'PGRST116') {
          console.log('Creating new profile for user:', userId);
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              username: userSession.user.user_metadata?.username || userSession.user.email?.split('@')[0] || 'User',
              full_name: userSession.user.user_metadata?.full_name || userSession.user.user_metadata?.username || 'Utilisateur',
              notifications_enabled: true
            })
            .select()
            .single();

          if (createError) {
            console.error("Erreur création profil:", createError);
            toast({
              title: "Erreur de profil",
              description: "Impossible de créer votre profil. Veuillez réessayer.",
              variant: "destructive"
            });
            return false;
          }

          if (newProfile) {
            console.log('New profile created:', newProfile);
            updateAppStoreUserProfile({
              ...newProfile,
              name: newProfile.full_name || newProfile.username || 'Non défini',
              email: userSession.user.email || '',
              goal: newProfile.fitness_goal || 'Non défini',
              level: appStoreUser.level,
              totalPoints: appStoreUser.totalPoints,
              joinDate: new Date(newProfile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            });
            setHasCompletedOnboarding(false);
          }
        }
        return false;
      }

      if (userProfileData) {
        console.log('Profile data loaded:', userProfileData);
        const onboardingCompleted = userProfileData.primary_goals && 
                                   Array.isArray(userProfileData.primary_goals) && 
                                   userProfileData.primary_goals.length > 0;
        
        console.log('Onboarding completed:', onboardingCompleted);
        setHasCompletedOnboarding(onboardingCompleted);

        updateAppStoreUserProfile({
          ...userProfileData,
          name: userProfileData.full_name || userProfileData.username || 'Non défini',
          email: userSession.user.email || '',
          goal: userProfileData.fitness_goal || 'Non défini',
          level: appStoreUser.level,
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(userProfileData.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
        return true;
      } else {
        console.log('No profile data found, onboarding needed');
        setHasCompletedOnboarding(false);
        return false;
      }
    } catch (error) {
      console.error("Erreur inattendue lors du chargement du profil:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors du chargement de votre profil.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Configurer le listener d'abord
        const { data: authListenerData } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state change:', event, newSession?.user?.id);
            
            if (!mounted) return;
            
            if (newSession?.user && event !== 'TOKEN_REFRESHED') {
              setSession(newSession);
              await loadUserProfile(newSession.user.id, newSession);
            } else if (!newSession) {
              console.log('No session, resetting state');
              setSession(null);
              setHasCompletedOnboarding(false);
              updateAppStoreUserProfile({
                id: '', username: null, full_name: null, avatar_url: null, age: null, height_cm: null, weight_kg: null,
                gender: null, activity_level: null, fitness_goal: null, timezone: null, notifications_enabled: null,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lifestyle: null,
                available_time_per_day: null, fitness_experience: null, injuries: null, primary_goals: null,
                motivation: null, sport: null, sport_position: null, sport_level: null, training_frequency: null,
                season_period: null, name: 'Invité', email: '', goal: 'Non défini', level: 1, totalPoints: 0,
                joinDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              });
            }
            
            if (!isInitialized) {
              setIsInitialized(true);
              setLoading(false);
            }
          }
        );

        // Puis vérifier la session existante
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted && currentSession?.user) {
          console.log('Current session found:', currentSession.user.id);
          setSession(currentSession);
          await loadUserProfile(currentSession.user.id, currentSession);
        }
        
        if (mounted && !isInitialized) {
          setIsInitialized(true);
          setLoading(false);
        }

        return () => {
          if (authListenerData?.subscription) {
            authListenerData.subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAuthSuccess = (user: SupabaseAuthUserType) => {
    console.log('Auth success for user:', user.id);
    // La gestion sera faite par onAuthStateChange
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
        setHasCompletedOnboarding(true);
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

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    console.log('PrivateRoute check - session:', !!session, 'hasCompletedOnboarding:', hasCompletedOnboarding);
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return React.cloneElement(children, { userProfile: session.user });
  };

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
          <Route path="/dashboard" element={<PrivateRoute><SmartDashboard userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/workout" element={<PrivateRoute><WorkoutPage userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/nutrition" element={<PrivateRoute><Nutrition userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/sleep" element={<PrivateRoute><Sleep userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/hydration" element={<PrivateRoute><Hydration userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile userProfile={session?.user} /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster /> 
    </Router>
  );
}

export default App;
