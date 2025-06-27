import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import WorkoutPage from './pages/WorkoutPage';
import Nutrition from './pages/Nutrition';
import Sleep from './pages/Sleep';
import Hydration from './pages/Hydration';
import Profile from './pages/Profile'; // CORRIGÉ: Importe Profile comme exportation par défaut
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire';
import AuthPages from './components/AuthPages';
import SmartDashboard from './components/SmartDashboard';
import { supabase } from './lib/supabase'; // Importe l'instance supabase
import { Toaster } from './components/ui/toaster';
import NotFound from './pages/NotFound'; // Importe NotFound

// Import des types Supabase spécifiques pour une meilleure typification
import { Session, User as SupabaseAuthUserType } from '@supabase/supabase-js'; // Renommé User en SupabaseAuthUserType
import { UserProfile as AppStoreUserProfileType } from '@/stores/useAppStore'; // Import du type UserProfile complet du store
import { UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase'; // Import du type UserProfile de la DB

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Utiliser le store pour le profil utilisateur local
  const { user: appStoreUser, updateProfile: updateAppStoreUserProfile } = useAppStore();

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        // Charger le profil utilisateur de la DB
        const { data: userProfileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error("Erreur chargement profil App.tsx:", profileError);
          setHasCompletedOnboarding(false);
        } else if (userProfileData) {
          // Si le profil existe, vérifier si l'onboarding est complété
          const onboardingCompleted = userProfileData.primary_goals && userProfileData.primary_goals.length > 0;
          setHasCompletedOnboarding(onboardingCompleted);

          // Mettre à jour le profil dans le store Zustand
          updateAppStoreUserProfile({
            ...userProfileData,
            name: userProfileData.full_name || userProfileData.username || 'Non défini',
            email: currentSession.user.email || '',
            goal: userProfileData.fitness_goal || 'Non défini',
            level: appStoreUser.level, // Conserver le niveau du store
            totalPoints: appStoreUser.totalPoints, // Conserver les points du store
            joinDate: new Date(userProfileData.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          });

        } else {
          // Pas de profil trouvé, donc onboarding non complété
          setHasCompletedOnboarding(false);
        }
      } else {
        // Pas de session, donc pas d'onboarding complété
        setHasCompletedOnboarding(false);
      }
      setLoading(false);
    };

    checkSessionAndProfile();

    // S'abonner aux changements d'état d'authentification
    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          const { data: userProfileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (profileError) {
            console.error("Erreur chargement profil onAuthStateChange:", profileError);
            setHasCompletedOnboarding(false);
          } else if (userProfileData) {
            const onboardingCompleted = userProfileData.primary_goals && userProfileData.primary_goals.length > 0;
            setHasCompletedOnboarding(onboardingCompleted);

            updateAppStoreUserProfile({
              ...userProfileData,
              name: userProfileData.full_name || userProfileData.username || 'Non défini',
              email: newSession.user.email || '',
              goal: userProfileData.fitness_goal || 'Non défini',
              level: appStoreUser.level,
              totalPoints: appStoreUser.totalPoints,
              joinDate: new Date(userProfileData.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            });

          } else {
            setHasCompletedOnboarding(false);
          }
        } else {
          setHasCompletedOnboarding(false); // Réinitialiser si déconnecté
          // Réinitialiser le profil dans le store à l'initialUser par défaut
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
        setLoading(false);
      }
    );

    return () => {
      if (authListenerData && authListenerData.subscription) {
        authListenerData.subscription.unsubscribe(); 
      }
    };
  }, [appStoreUser.level, appStoreUser.totalPoints, updateAppStoreUserProfile, appStoreUser.joinDate]);


  const handleAuthSuccess = (user: SupabaseAuthUserType) => { // Type User de Supabase
    setSession({ user, access_token: '', token_type: '' } as Session); // Crée un objet session minimal
    // La logique de l'useEffect va maintenant charger le profil et gérer l'onboarding
  };

  const handleOnboardingComplete = async (profileData: AppStoreUserProfileType) => {
    if (!session?.user) {
      console.error('Aucune session utilisateur trouvée pour la complétion de l\'onboarding');
      return;
    }
    try {
      // Les données sont déjà formatées pour la DB dans OnboardingQuestionnaire
      // et le type AppStoreUserProfileType est un sur-ensemble du type DB
      const updatesToDb: Partial<SupabaseDBUserProfileType> = { // Utilise le type de la DB
        age: profileData.age,
        gender: profileData.gender,
        lifestyle: profileData.lifestyle,
        available_time_per_day: profileData.available_time_per_day,
        fitness_experience: profileData.fitness_experience,
        injuries: profileData.injuries, // Doit être un tableau JSONB ou géré comme tel
        primary_goals: profileData.primary_goals, // Doit être un tableau JSONB
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
        setHasCompletedOnboarding(true);
        // Mettre à jour le store Zustand avec les nouvelles données du profil de la DB
        updateAppStoreUserProfile({
          ...data[0], // Données Supabase mises à jour
          name: data[0].full_name || data[0].username || 'Non défini',
          email: session.user.email || '',
          goal: data[0].fitness_goal || 'Non défini',
          level: appStoreUser.level, // Conserver les valeurs locales
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(data[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
      }
      console.log('Onboarding data saved and onboarding marked as complete:', data);

    } catch (error: unknown) {
      console.error('Error saving onboarding data:', error);
      alert('Une erreur inattendue s\'est produite lors de la sauvegarde de l\'onboarding: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Chargement de l'application...</p>
      </div>
    );
  }

  // Composant de route privée
  const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    // Passe l'objet User (authentification) de Supabase aux pages des piliers
    return React.cloneElement(children, { userProfile: session.user });
  };

  return (
    <Router>
      <Routes>
        {/* Route publique pour la page d'accueil */}
        <Route path="/" element={<Index />} />

        {/* Route pour l'authentification */}
        <Route path="/auth" element={<AuthPages onAuthSuccess={handleAuthSuccess} />} />

        {/* Route pour le questionnaire d'onboarding (accessible si authentifié mais onboarding non complet) */}
        <Route 
          path="/onboarding" 
          element={session && !hasCompletedOnboarding ? <OnboardingQuestionnaire onComplete={handleOnboardingComplete} /> : <Navigate to={session ? "/dashboard" : "/auth"} replace />} 
        />

        {/* Routes privées nécessitant authentification et onboarding */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/dashboard" element={<PrivateRoute><SmartDashboard userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/workout" element={<PrivateRoute><WorkoutPage userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/nutrition" element={<PrivateRoute><Nutrition userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/sleep" element={<PrivateRoute><Sleep userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/hydration" element={<PrivateRoute><Hydration userProfile={session?.user} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile userProfile={session?.user} /></PrivateRoute>} />
        </Route>

        {/* Route 404 - doit être la dernière */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster /> 
    </Router>
  );
}

export default App;