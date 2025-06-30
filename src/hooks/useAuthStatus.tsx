
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useAuthStatus = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Fonction pour vérifier le profil utilisateur
    const checkUserProfile = async (userId: string) => {
      try {
        const { data: userProfileData, error } = await supabase
          .from('user_profiles')
          .select('primary_goals')
          .eq('id', userId)
          .single();

        if (error) {
          console.error("Erreur chargement profil:", error);
          return false;
        }

        return userProfileData?.primary_goals && 
               Array.isArray(userProfileData.primary_goals) && 
               userProfileData.primary_goals.length > 0;
      } catch (error) {
        console.error("Erreur vérification profil:", error);
        return false;
      }
    };

    // Fonction pour gérer les changements de session
    const handleSessionChange = async (newSession: Session | null) => {
      if (!mounted) return;

      setSession(newSession);
      
      if (newSession?.user) {
        const profileCompleted = await checkUserProfile(newSession.user.id);
        if (mounted) {
          setHasCompletedOnboarding(profileCompleted);
        }
      } else {
        if (mounted) {
          setHasCompletedOnboarding(false);
        }
      }
    };

    // Charger la session initiale
    const loadInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        await handleSessionChange(initialSession);
      } catch (error) {
        console.error("Erreur chargement session initiale:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        if (mounted && event !== 'TOKEN_REFRESHED') {
          await handleSessionChange(newSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Pas de dépendances pour éviter les boucles

  return { session, loading, hasCompletedOnboarding };
};
