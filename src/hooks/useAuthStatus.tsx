import { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useAuthStatus = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Fonction pour vérifier le profil utilisateur
    const checkUserProfile = async (userId: string) => {
      try {
        const { data: userProfileData, error } = await supabase
          .from('user_profiles')
          .select('primary_goals')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "Row not found" errors
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

    // Charger la session initiale
    const loadInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted.current) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            const profileCompleted = await checkUserProfile(initialSession.user.id);
            if (mounted.current) {
              setHasCompletedOnboarding(profileCompleted);
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur chargement session initiale:", error);
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    loadInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        
        if (!mounted.current) return;
        
        setSession(newSession);
        
        if (newSession?.user && event !== 'TOKEN_REFRESHED') {
          const profileCompleted = await checkUserProfile(newSession.user.id);
          if (mounted.current) {
            setHasCompletedOnboarding(profileCompleted);
          }
        } else if (!newSession) {
          setHasCompletedOnboarding(false);
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, hasCompletedOnboarding };
};
