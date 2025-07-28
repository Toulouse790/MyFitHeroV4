// hooks/workout/useWorkoutPersistence.ts
import { useCallback } from 'react';
import { useSupabaseQuery } from '../use-supabase-query';
import { WorkoutSession, Set } from '@/types/workout';

export interface UseWorkoutPersistenceReturn {
  saveSession: (session: WorkoutSession) => Promise<void>;
  saveSet: (sessionId: string, exerciseId: string, set: Set) => Promise<void>;
  loadSession: (sessionId: string) => Promise<WorkoutSession | null>;
  deleteSession: (sessionId: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
}

export const useWorkoutPersistence = (): UseWorkoutPersistenceReturn => {
  const { supabase } = useSupabaseQuery();

  const saveSession = useCallback(async (session: WorkoutSession) => {
    const { error } = await supabase
      .from('workout_sessions')
      .upsert(session);
    
    if (error) throw error;
  }, [supabase]);

  const saveSet = useCallback(async (sessionId: string, exerciseId: string, set: Set) => {
    const { error } = await supabase
      .from('workout_sets')
      .insert({
        session_id: sessionId,
        exercise_id: exerciseId,
        ...set,
      });
    
    if (error) throw error;
  }, [supabase]);

  const loadSession = useCallback(async (sessionId: string): Promise<WorkoutSession | null> => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, workout_sets(*)')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  }, [supabase]);

  const deleteSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) throw error;
  }, [supabase]);

  const syncOfflineData = useCallback(async () => {
    // Logique de synchronisation des données offline
    // Récupérer les données du localStorage et les synchroniser
  }, []);

  return {
    saveSession,
    saveSet,
    loadSession,
    deleteSession,
    syncOfflineData,
  };
};
