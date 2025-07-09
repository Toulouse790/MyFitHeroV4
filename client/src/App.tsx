// client/src/App.tsx
import React, { useEffect, useState } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth';
import { useAppStore } from '@/stores/useAppStore';

// Pages (tous les composants de page)
import Index from '@/pages/Index';
import Nutrition from '@/pages/Nutrition';
import Hydration from '@/pages/Hydration';
import Sleep from '@/pages/Sleep';
import Workout from '@/pages/Workout';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

// Components (composants réutilisables)
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import AuthPages from '@/components/AuthPages';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();

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
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // ✅ Maintenant cohérent avec auth.ts
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && profileData.age && profileData.gender) {
          setHasProfile(true);
          updateAppStoreUserProfile({
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            username: authenticatedUser.username,
            ...profileData
          });
        } else {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Erreur vérification profil:', error);
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasProfile(true);
    toast({
      title: 'Profil configuré',
      description: 'Votre profil a été créé avec succès !',
      variant: 'success'
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setUser(null);
    toast({
      title: 'Déconnexion',
      description: 'À bientôt !',
      variant: 'default'
    });
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
              <Index />
            </Layout>
          )}
        </Route>
        
        {/* Routes des modules */}
        <Route path="/hydration">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Hydration /></Layout>
          )}
        </Route>
        
        <Route path="/nutrition">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Nutrition /></Layout>
          )}
        </Route>
        
        <Route path="/sleep">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Sleep /></Layout>
          )}
        </Route>
        
        <Route path="/workout">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Workout /></Layout>
          )}
        </Route>
        
        <Route path="/profile">
          {!user ? (
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Layout><Profile /></Layout>
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
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
