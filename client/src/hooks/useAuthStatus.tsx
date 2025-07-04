import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import type { Session } from '@supabase/supabase-js';

export const useAuthStatus = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { appStoreUser } = useAppStore();

  useEffect(() => {
    // Vérifier la session existante
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur session:', error);
        } else {
          setSession(session);
          // Vérifier l'onboarding basé sur les données du store
          if (session && appStoreUser.id && appStoreUser.age && appStoreUser.gender) {
            setHasCompletedOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Erreur récupération session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session && appStoreUser.id && appStoreUser.age && appStoreUser.gender) {
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [appStoreUser]);

  return {
    session,
    loading,
    hasCompletedOnboarding,
    isAuthenticated: !!session,
    userId: session?.user?.id || null
  };
};
