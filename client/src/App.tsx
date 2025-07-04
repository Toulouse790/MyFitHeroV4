import React, { useState, useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import { authClient } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';

// Import pages
import AuthPages from '@/components/AuthPages';
import Hydration from '@/pages/Hydration';
import Nutrition from '@/pages/Nutrition';
import Sleep from '@/pages/Sleep';
import Workout from '@/pages/Workout';
import Profile from '@/pages/Profile';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authClient.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    toast({
      title: 'Connexion réussie',
      description: 'Bienvenue sur MyFitHero !',
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
      <Router>
        <Layout>
          <Switch>
            <Route path="/" component={Index} />
            <Route path="/hydration" component={Hydration} />
            <Route path="/nutrition" component={Nutrition} />
            <Route path="/sleep" component={Sleep} />
            <Route path="/workout" component={Workout} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
};

export default App;