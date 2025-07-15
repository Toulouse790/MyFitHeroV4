// client/src/App.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';

// Pages avec lazy loading optimisé
import {
  LazyIndex,
  LazyNutrition,
  LazyHydration,
  LazySleep,
  LazyWorkout,
  LazyProfile,
  LazySocial,
  OptimizedSuspenseFallback
} from '@/components/LazyComponents';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';

// Components (composants réutilisables)
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import AuthPages from '@/components/AuthPages';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatedToastContainer } from '@/components/AnimatedToast';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { updateAppStoreUserProfile } = useAppStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authClient.getUser(); // ✅ CORRIGÉ : getUser() au lieu de getSession()
        if (user) {
          setUser(user);
          await checkUserProfile(user);
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkUserProfile = async (authenticatedUser: any) => {
    try {
      console.log('🟡 Vérification du profil pour:', authenticatedUser.id);
      
      // Utiliser Supabase pour récupérer le profil
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authenticatedUser.id)  // Changé de user_id à id
        .single();

      console.log('🟡 Données profil récupérées:', profileData);
      console.log('🟡 Erreur profil:', error);

      if (!error && profileData && profileData.age && profileData.gender) {
        console.log('🟢 Profil complet trouvé');
        setHasProfile(true);
        updateAppStoreUserProfile({
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          username: profileData.username,
          ...profileData
        });
      } else {
        console.log('🟡 Profil incomplet, affichage de l\'onboarding');
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('🔴 Erreur vérification profil:', error);
      setShowOnboarding(true);
    }
  };

  const handleAuthSuccess = async (authenticatedUser: any, isNewUser: boolean = false) => {
    setUser(authenticatedUser);
    
    if (isNewUser) {
      setShowOnboarding(true);
      setHasProfile(false);
      toast({
        title: 'Inscription réussie !',
        description: 'Configurons votre profil pour une expérience personnalisée',
        variant: 'success'
      });
    } else {
      await checkUserProfile(authenticatedUser);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur MyFitHero !',
        variant: 'success'
      });
    }
  };

  const handleOnboardingComplete = async () => {
    console.log('🟡 handleOnboardingComplete démarré');
    
    try {
      // Vérifier que l'utilisateur est toujours connecté
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('🟡 Utilisateur après onboarding:', currentUser?.id);
      
      if (!currentUser) {
        console.error('🔴 Utilisateur non connecté après onboarding');
        return;
      }
      
      // Recharger le profil utilisateur pour mettre à jour l'état global
      await checkUserProfile(currentUser);
      
      setShowOnboarding(false);
      setHasProfile(true);
      
      console.log('🟢 Onboarding terminé avec succès');
      
      toast({
        title: 'Profil configuré',
        description: 'Votre profil a été créé avec succès !',
        variant: 'success'
      });
    } catch (error) {
      console.error('🔴 Erreur dans handleOnboardingComplete:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Switch>
        {/* Route d'authentification */}
        <Route path="/auth">
          <AuthPages onAuthSuccess={handleAuthSuccess} />
        </Route>
        
        {/* Route d'onboarding */}
        <Route path="/onboarding">
          {user ? (
            <OnboardingQuestionnaire user={user} onComplete={handleOnboardingComplete} />
          ) : (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          )}
        </Route>
        
        {/* Route principale */}
        <Route path="/">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (showOnboarding || (!hasProfile && !loading)) ? (
            <OnboardingQuestionnaire user={user} onComplete={handleOnboardingComplete} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement du tableau de bord..." />}>
                <LazyIndex />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        {/* Routes des modules */}
        <Route path="/hydration">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement de l'hydratation..." />}>
                <LazyHydration />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        <Route path="/nutrition">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement de la nutrition..." />}>
                <LazyNutrition />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        <Route path="/sleep">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement du sommeil..." />}>
                <LazySleep />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        <Route path="/workout">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement des entraînements..." />}>
                <LazyWorkout />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        <Route path="/profile">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement du profil..." />}>
                <LazyProfile />
              </Suspense>
            </Layout>
          )}
        </Route>

        <Route path="/analytics">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Analytics /></Layout>
          )}
        </Route>

        <Route path="/social">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement du social..." />}>
                <LazySocial />
              </Suspense>
            </Layout>
          )}
        </Route>
        
        {/* Route 404 */}
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="auto">
      <Router>
        <AppContent />
        <Toaster />
        <AnimatedToastContainer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
