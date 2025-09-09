// client/src/App.tsx - Version propre et fonctionnelle
import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'wouter';
import { authClient } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import AuthPages from '@/features/auth/components/AuthPages';
import ConversationalOnboarding from '@/features/auth/components/ConversationalOnboarding';
import { useToast } from '@/shared/hooks/use-toast';

interface AppUser {
  id: string;
  email: string;
  profile?: any;
}

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { toast } = useToast();

  // Vérification de l'authentification au démarrage
  useEffect(() => {
    checkAuth();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur chargement profil:', error);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          profile: profile
        });

        // Vérifier si l'onboarding est nécessaire
        if (!profile?.onboarding_completed || !profile?.age || !profile?.gender) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleAuthSuccess = async (authUser: any, isNewUser = false) => {
    console.log('Auth success:', { authUser, isNewUser });
    
    // Attendre un peu que le trigger crée le profil si c'est un nouvel utilisateur
    if (isNewUser) {
      setTimeout(async () => {
        await loadUserProfile(authUser.id);
      }, 1500);
    } else {
      await loadUserProfile(authUser.id);
    }

    toast({
      title: isNewUser ? 'Compte créé !' : 'Connexion réussie !',
      description: isNewUser 
        ? 'Bienvenue sur MyFitHero ! Configurons votre profil.'
        : 'Bon retour sur MyFitHero !',
    });
  };

  const handleOnboardingComplete = async (data: any) => {
    console.log('Onboarding terminé:', data);
    
    try {
      // Marquer l'onboarding comme terminé
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) {
        console.error('Erreur finalisation onboarding:', error);
      }

      // Recharger le profil
      if (user?.id) {
        await loadUserProfile(user.id);
      }

      toast({
        title: 'Configuration terminée !',
        description: 'Votre profil MyFitHero est maintenant configuré.',
      });
    } catch (error) {
      console.error('Erreur onboarding:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setNeedsOnboarding(false);
      toast({
        title: 'Déconnexion',
        description: 'À bientôt sur MyFitHero !',
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de MyFitHero...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, afficher la page d'auth
  if (!user) {
    return (
      <Router>
        <Switch>
          <Route path="/auth">
            <AuthPages onAuthSuccess={handleAuthSuccess} />
          </Route>
          <Route>
            <Redirect to="/auth" />
          </Route>
        </Switch>
      </Router>
    );
  }

  // Si utilisateur connecté mais onboarding non terminé
  if (needsOnboarding) {
    return (
      <ConversationalOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={() => setNeedsOnboarding(false)}
        initialData={{
          firstName: user.profile?.first_name || '',
          age: user.profile?.age || null,
        }}
      />
    );
  }

  // Dashboard principal (version simple pour commencer)
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">MyFitHero</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Bonjour, {user.profile?.first_name || user.email} !
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Switch>
            <Route path="/">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bienvenue sur MyFitHero !
                </h2>
                <p className="text-gray-600 mb-8">
                  Votre dashboard sera bientôt disponible ici.
                </p>
                
                {/* Informations de debug */}
                <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
                  <h3 className="font-semibold mb-4">Informations de votre profil :</h3>
                  <div className="text-left space-y-2 text-sm">
                    <p><strong>Email :</strong> {user.email}</p>
                    <p><strong>Nom :</strong> {user.profile?.first_name || 'Non défini'}</p>
                    <p><strong>Âge :</strong> {user.profile?.age || 'Non défini'}</p>
                    <p><strong>Genre :</strong> {user.profile?.gender || 'Non défini'}</p>
                    <p><strong>Sport :</strong> {user.profile?.sport || 'Non défini'}</p>
                    <p><strong>Onboarding :</strong> {user.profile?.onboarding_completed ? '✅ Terminé' : '❌ À faire'}</p>
                  </div>
                  
                  {!user.profile?.onboarding_completed && (
                    <button
                      onClick={() => setNeedsOnboarding(true)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Terminer la configuration
                    </button>
                  )}
                </div>
              </div>
            </Route>
            
            {/* Route par défaut */}
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
