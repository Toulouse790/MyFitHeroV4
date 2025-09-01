import { supabase } from '@/lib/supabase';
import { WorkoutSession, WorkoutTemplate, WorkoutStats } from '@/shared/types/workout.types';

export class WorkoutService {
  // Sessions
  static async createSession(
    session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        ...session,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformSessionFromDB(data);
  }

  static async updateSession(
    id: string,
    updates: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformSessionFromDB(data);
  }

  static async getSession(id: string): Promise<WorkoutSession | null> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.transformSessionFromDB(data);
  }

  static async getUserSessions(userId: string, limit = 20): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(this.transformSessionFromDB);
  }

  static async deleteSession(id: string): Promise<void> {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id);

    if (error) throw error;
  }

  // Templates
  static async createTemplate(
    template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed'>
  ): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        ...template,
        times_used: 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformTemplateFromDB(data);
  }

  static async getTemplates(userId?: string, isPublic = false): Promise<WorkoutTemplate[]> {
    let query = supabase.from('workout_templates').select('*');

    if (isPublic) {
      query = query.eq('is_public', true);
    } else if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  static async getPopularTemplates(limit = 10): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('is_public', true)
      .order('times_used', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(this.transformTemplateFromDB);
  }

  static async incrementTemplateUsage(templateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId,
    });

    if (error) throw error;
  }

  // Statistiques
  static async getUserStats(userId: string): Promise<WorkoutStats> {
    // Requête complexe pour obtenir toutes les statistiques
    const [sessionsData, personalRecordsData, monthlyData] = await Promise.all([
      this.getUserBasicStats(userId),
      this.getPersonalRecords(userId),
      this.getMonthlyStats(userId),
    ]);

    return {
      ...sessionsData,
      personalRecords: personalRecordsData,
      monthlyStats: monthlyData,
      weeklyGoal: 4, // TODO: récupérer depuis les préférences utilisateur
      weeklyProgress: await this.getWeeklyProgress(userId),
    };
  }

  private static async getUserBasicStats(userId: string) {
    const { data, error } = await supabase.rpc('get_user_workout_stats', {
      user_id: userId,
    });

    if (error) throw error;

    return {
      totalWorkouts: data.total_workouts || 0,
      totalTimeSpent: data.total_time_spent || 0,
      totalCaloriesBurned: data.total_calories_burned || 0,
      averageWorkoutDuration: data.average_duration || 0,
      mostUsedExercises: data.most_used_exercises || [],
    };
  }

  private static async getPersonalRecords(userId: string) {
    const { data, error } = await supabase.rpc('get_personal_records', {
      user_id: userId,
    });

    if (error) throw error;
    return data || [];
  }

  private static async getMonthlyStats(userId: string) {
    const { data, error } = await supabase.rpc('get_monthly_workout_stats', {
      user_id: userId,
      months_back: 12,
    });

    if (error) throw error;
    return data || [];
  }

  private static async getWeeklyProgress(userId: string): Promise<number> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfWeek.toISOString());

    if (error) throw error;
    return count || 0;
  }

  // Transformers
  private static transformSessionFromDB(data: any): WorkoutSession {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      exercises: data.exercises || [],
      status: data.status,
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      totalTime: data.total_time,
      estimatedCalories: data.estimated_calories,
      actualCalories: data.actual_calories,
      notes: data.notes,
      rating: data.rating,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformTemplateFromDB(data: any): WorkoutTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      difficulty: data.difficulty,
      duration: data.duration,
      exercises: data.exercises || [],
      tags: data.tags || [],
      isPublic: data.is_public,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      timesUsed: data.times_used,
    };
  }

  // Méthodes utilitaires
  static calculateCalories(session: WorkoutSession): number {
    // Formule simple basée sur le type d'entraînement et la durée
    const baseCaloriesPerMinute = {
      strength: 8,
      cardio: 12,
      mixed: 10,
      flexibility: 4,
    };

    const minutes = (session.totalTime || 0) / 60;
    const rate = baseCaloriesPerMinute[session.type] || 8;

    return Math.round(minutes * rate);
  }

  static estimateSessionDuration(exercises: any[]): number {
    // Estimation basée sur le nombre d'exercices et de sets
    let totalMinutes = 0;

    exercises.forEach(exercise => {
      const sets = exercise.sets?.length || 3;
      const restTime = 1; // minute de repos entre sets
      const exerciseTime = 2; // minutes par set

      totalMinutes += sets * exerciseTime + (sets - 1) * restTime;
    });

    return Math.max(totalMinutes, 15); // Minimum 15 minutes
  }
}
