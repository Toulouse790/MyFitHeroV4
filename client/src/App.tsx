import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { authClient } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';

// Import pages
import AuthPages from '@/components/AuthPages';
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import Hydration from '@/pages/Hydration';
import Nutrition from '@/pages/Nutrition';
import Sleep from '@/pages/Sleep';
import Workout from '@/pages/Workout';
import Profile from '@/pages/Profile';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authClient.getUser();
        if (currentUser) {
          setUser(currentUser);
          await checkUserProfile(currentUser);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const checkUserProfile = async (user: AuthUser) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authClient.getToken()}`
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        setHasProfile(!!profile);
        setShowOnboarding(false);
      } else if (response.status === 404) {
        // User doesn't have a profile yet
        setHasProfile(false);
        setShowOnboarding(false); // Will be set to true after registration
      }
    } catch (error) {
      console.error('Profile check error:', error);
      setHasProfile(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser, isNewUser = false) => {
    setUser(authenticatedUser);
    
    if (isNewUser) {
      // New user registration - redirect to onboarding
      setHasProfile(false);
      setShowOnboarding(true);
      setLocation('/onboarding');
      toast({
        title: 'Inscription réussie',
        description: 'Configurons maintenant votre profil !',
        variant: 'success'
      });
    } else {
      // Existing user login - check profile
      checkUserProfile(authenticatedUser);
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

  if (!user) {
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/onboarding">
          {() => user ? <OnboardingQuestionnaire user={user} onComplete={handleOnboardingComplete} /> : <AuthPages onAuthSuccess={handleAuthSuccess} />}
        </Route>
        <Route path="/" component={() => {
          if (!user) {
            return <AuthPages onAuthSuccess={handleAuthSuccess} />;
          }
          // Show onboarding for new users without profile
          if (showOnboarding || (!hasProfile && !loading)) {
            setLocation('/onboarding');
            return null;
          }
          return (
            <Layout>
              <Index />
            </Layout>
          );
        }} />
        <Route path="/hydration" component={() => (
          <Layout><Hydration /></Layout>
        )} />
        <Route path="/nutrition" component={() => (
          <Layout><Nutrition /></Layout>
        )} />
        <Route path="/sleep" component={() => (
          <Layout><Sleep /></Layout>
        )} />
        <Route path="/workout" component={() => (
          <Layout><Workout /></Layout>
        )} />
        <Route path="/profile" component={() => (
          <Layout><Profile /></Layout>
        )} />
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