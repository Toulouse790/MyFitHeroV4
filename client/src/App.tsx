// client/src/App.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
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
  LazyAnalytics,
  LazySettings,
  LazyNotFound,
  OptimizedSuspenseFallback
} from '@/components/LazyComponents';

// Import direct pour les pages critiques (éviter lazy loading)
import ProfileComplete from '@/pages/ProfileComplete';

// Components (composants réutilisables)
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import AuthPages from '@/components/AuthPages';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatedToastContainer } from '@/components/AnimatedToast';

const AppContent: React.FC = () => {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { updateAppStoreUserProfile } = useAppStore();

  // ✅ FONCTION DE REDIRECTION ROBUSTE
  const forceNavigate = (path: string) => {
    console.log(`🔄 Tentative de navigation vers: ${path}`);
    try {
      navigate(path);
      // Fallback si wouter échoue
      setTimeout(() => {
        if (window.location.pathname !== path) {
          console.log(`🔄 Fallback redirection vers: ${path}`);
          window.location.href = path;
        }
      }, 200);
    } catch (error) {
      console.error('Erreur navigation wouter:', error);
      window.location.href = path;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authClient.getUser();
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
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .single();

      console.log('🟡 Données profil récupérées:', profileData);
      console.log('🟡 Erreur profil:', error);

      if (!error && profileData && profileData.age && profileData.gender && profileData.onboarding_completed) {
        console.log('🟢 Profil complet trouvé');
        setHasProfile(true);
        setShowOnboarding(false);
        updateAppStoreUserProfile({
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          username: profileData.username,
          ...profileData
        });
      } else {
        console.log('🟡 Profil incomplet, affichage de l\'onboarding');
        setShowOnboarding(true);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('🔴 Erreur vérification profil:', error);
      setShowOnboarding(true);
      setHasProfile(false);
    }
  };

  const handleAuthSuccess = async (authenticatedUser: any, isNewUser: boolean = false) => {
    console.log('🚀 handleAuthSuccess appelé', { isNewUser, userId: authenticatedUser.id });
    
    setUser(authenticatedUser);
    
    if (isNewUser) {
      console.log('🟡 Nouvel utilisateur détecté - redirection onboarding');
      setShowOnboarding(true);
      setHasProfile(false);
      
      // ✅ REDIRECTION IMMÉDIATE ET ROBUSTE
      forceNavigate('/onboarding');
      
      toast({
        title: 'Inscription réussie !',
        description: 'Redirection vers le questionnaire...',
        variant: 'success'
      });
    } else {
      console.log('🟡 Utilisateur existant - vérification profil');
      await checkUserProfile(authenticatedUser);
      
      // ✅ VÉRIFICATION ET REDIRECTION SI PROFIL INCOMPLET
      setTimeout(() => {
        if (showOnboarding && !hasProfile) {
          console.log('🔄 Profil incomplet détecté - redirection onboarding');
          forceNavigate('/onboarding');
        }
      }, 100);
      
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('🟡 Utilisateur après onboarding:', currentUser?.id);
      
      if (!currentUser) {
        console.error('🔴 Utilisateur non connecté après onboarding');
        return;
      }
      
      // ✅ MARQUER L'ONBOARDING COMME TERMINÉ DANS LA BASE
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', currentUser.id);
      
      await checkUserProfile(currentUser);
      
      setShowOnboarding(false);
      setHasProfile(true);
      
      // ✅ REDIRECTION VERS LE DASHBOARD
      console.log('🔄 Redirection vers dashboard principal');
      forceNavigate('/');
      
      console.log('🟢 Onboarding terminé avec succès');
      
      toast({
        title: 'Profil configuré ! 🎉',
        description: 'Bienvenue dans MyFitHero',
        variant: 'success'
      });
    } catch (error) {
      console.error('🔴 Erreur dans handleOnboardingComplete:', error);
    }
  };

  // ✅ EFFECT DE SURVEILLANCE POUR FORCER LA REDIRECTION
  useEffect(() => {
    if (user && showOnboarding && !hasProfile && !loading) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/onboarding') {
        console.log('🔄 Effect de surveillance - Force redirection onboarding');
        setTimeout(() => forceNavigate('/onboarding'), 300);
      }
    }
  }, [user, showOnboarding, hasProfile, loading]);

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
        
        {/* Routes des modules avec lazy loading */}
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
        
        {/* Route profil - import direct (pas de lazy) */}
        <Route path="/profile">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <ProfileComplete />
            </Layout>
          )}
        </Route>

        {/* Route paramètres - lazy loading */}
        <Route path="/settings">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement des paramètres..." />}>
                <LazySettings />
              </Suspense>
            </Layout>
          )}
        </Route>

        {/* Route profil ancien - lazy loading */}
        <Route path="/profile-old">
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

        {/* Route analytics - lazy loading */}
        <Route path="/analytics">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout>
              <Suspense fallback={<OptimizedSuspenseFallback text="Chargement des analytics..." />}>
                <LazyAnalytics />
              </Suspense>
            </Layout>
          )}
        </Route>

        {/* Route social - lazy loading */}
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
        
        {/* Route 404 - lazy loading */}
        <Route>
          <Suspense fallback={<OptimizedSuspenseFallback text="Chargement..." />}>
            <LazyNotFound />
          </Suspense>
        </Route>
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
