
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';

export const useAuthStatus = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const { user: appStoreUser, updateProfile: updateAppStoreUserProfile } = useAppStore();

  const fetchSessionAndProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setSession(null);
      setHasCompletedOnboarding(false);
      updateAppStoreUserProfile({
        id: '', username: null, full_name: null, avatar_url: null, age: null, height_cm: null, weight_kg: null,
        gender: null, activity_level: null, fitness_goal: null, timezone: null, notifications_enabled: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), lifestyle: null,
        available_time_per_day: null, fitness_experience: null, injuries: null, primary_goals: null,
        motivation: null, sport: null, sport_position: null, sport_level: null, training_frequency: null,
        season_period: null, name: 'Invité', email: '', goal: 'Non défini', level: 1, totalPoints: 0,
        joinDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
      return;
    }

    setSession(currentSession);
    
    try {
      const { data: userProfileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Erreur chargement profil useAuthStatus:", profileError);
        setHasCompletedOnboarding(false);
      } else if (userProfileData) {
        const onboardingCompleted = userProfileData.primary_goals && 
                                   Array.isArray(userProfileData.primary_goals) && 
                                   userProfileData.primary_goals.length > 0;
        setHasCompletedOnboarding(onboardingCompleted);

        updateAppStoreUserProfile({
          ...userProfileData,
          name: userProfileData.full_name || userProfileData.username || 'Non défini',
          email: currentSession.user.email || '',
          goal: userProfileData.fitness_goal || 'Non défini',
          level: appStoreUser.level,
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(userProfileData.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error("Erreur inattendue lors du chargement du profil:", error);
      setHasCompletedOnboarding(false);
    }
  }, [appStoreUser.level, appStoreUser.totalPoints, updateAppStoreUserProfile]);

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          await fetchSessionAndProfile(initialSession);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.id);
        if (mounted && event !== 'TOKEN_REFRESHED') {
          await fetchSessionAndProfile(newSession);
        }
      }
    );

    return () => {
      mounted = false;
      if (authListenerData?.subscription) {
        authListenerData.subscription.unsubscribe();
      }
    };
  }, [fetchSessionAndProfile]);

  return { session, loading, hasCompletedOnboarding };
};
