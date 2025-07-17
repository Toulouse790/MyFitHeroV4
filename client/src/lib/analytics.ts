// client/src/lib/analytics.ts
import { supabase } from './supabase';

export class AnalyticsService {
  // 📊 Analytics d'engagement utilisateur
  static async updateLastLogin(userId: string) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (error) console.error('Erreur mise à jour login:', error);
  }

  // 🎯 Filtrage recommandations IA par confiance
  static async getHighConfidenceRecommendations(userId: string, minConfidence = 0.8) {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .gte('confidence_score', minConfidence)
      .eq('is_applied', false)
      .order('confidence_score', { ascending: false });
    
    return { data, error };
  }

  // 🏋️ Templates de workout populaires
  static async getPopularWorkoutTemplates(limit = 10) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, user_profiles(username)')
      .eq('is_template', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }

  // 📱 Scan code-barres pour aliments
  static async getFoodByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('foods_library')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    return { data, error };
  }

  // 😴 Analytics sommeil avec données objets connectés
  static async analyzeSleepPatterns(userId: string, days = 30) {
    const { data, error } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('sleep_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('sleep_date', { ascending: false });
    
    if (data) {
      // Analyse des patterns avec sleep_stage_data
      const patternsAnalysis = data.map(session => ({
        date: session.sleep_date,
        quality: session.quality_rating,
        duration: session.duration_minutes,
        stages: session.sleep_stage_data,
        // Analyse des phases de sommeil
        deepSleepPercentage: session.sleep_stage_data?.deep_sleep_minutes / session.duration_minutes * 100
      }));
      
      return { data: patternsAnalysis, error: null };
    }
    
    return { data: null, error };
  }

  // 💧 Analytics hydratation par contexte
  static async getHydrationPatterns(userId: string, days = 7) {
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('logged_at', { ascending: true });
    
    if (data) {
      // Groupement par contexte
      const contextStats = data.reduce((acc, log) => {
        const context = log.hydration_context;
        if (!acc[context]) {
          acc[context] = { total: 0, count: 0, average: 0 };
        }
        acc[context].total += log.amount_ml;
        acc[context].count += 1;
        acc[context].average = acc[context].total / acc[context].count;
        return acc;
      }, {} as Record<string, { total: number; count: number; average: number }>);
      
      return { data: contextStats, error: null };
    }
    
    return { data: null, error };
  }

  // 🎯 Mise à jour progression objectifs
  static async updateGoalProgress(goalId: string, newValue: number) {
    // Récupérer l'objectif actuel
    const { data: goal, error: fetchError } = await supabase
      .from('user_goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (fetchError || !goal) return { error: fetchError };
    
    // Préparer l'historique
    const currentHistory = goal.progress_history as any[] || [];
    const newHistoryEntry = {
      date: new Date().toISOString(),
      value: newValue,
      percentage: (newValue / goal.target_value) * 100
    };
    
    const updatedHistory = [...currentHistory, newHistoryEntry];
    
    // Mettre à jour l'objectif
    const { error } = await supabase
      .from('user_goals')
      .update({
        current_value: newValue,
        progress_history: updatedHistory,
        // Marquer comme atteint si nécessaire
        achieved_at: newValue >= goal.target_value ? new Date().toISOString() : null
      })
      .eq('id', goalId);
    
    return { error };
  }

  // 💰 Vérification statut premium
  static async checkPremiumAccess(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();
    
    if (error) return { hasPremium: false, status: 'free' };
    
    const isPremium = ['premium', 'pro', 'enterprise'].includes(data.subscription_status);
    return { hasPremium: isPremium, status: data.subscription_status };
  }

  // 📸 Upload photo de repas
  static async uploadMealPhoto(mealId: string, file: File) {
    // Upload vers Supabase Storage
    const fileName = `meals/${mealId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('meal-photos')
      .upload(fileName, file);
    
    if (uploadError) return { error: uploadError };
    
    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('meal-photos')
      .getPublicUrl(fileName);
    
    // Mettre à jour le repas
    const { error: updateError } = await supabase
      .from('meals')
      .update({ meal_photo_url: urlData.publicUrl })
      .eq('id', mealId);
    
    return { error: updateError, url: urlData.publicUrl };
  }

  // 🤖 Création requête IA avec source
  static async createAIRequest(
    userId: string, 
    pillarType: string, 
    prompt: string, 
    source: string = 'app',
    context?: any
  ) {
    const { data, error } = await supabase
      .from('ai_requests')
      .insert({
        user_id: userId,
        pillar_type: pillarType,
        prompt,
        source,
        context,
        status: 'pending'
      })
      .select()
      .single();
    
    return { data, error };
  }

  // 📱 Synchronisation appareils connectés
  static async saveWearableSteps(userId: string, steps: number, date: Date = new Date()) {
    const { error } = await supabase
      .from('wearable_steps')
      .upsert({
        user_id: userId,
        steps,
        date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
        synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, date'
      });
    
    if (error) console.error('Erreur sauvegarde steps:', error);
    return { error };
  }

  static async saveHeartRateData(userId: string, heartRateReadings: number[], recordedAt: Date = new Date()) {
    const records = heartRateReadings.map(rate => ({
      user_id: userId,
      heart_rate: rate,
      recorded_at: recordedAt.toISOString(),
      synced_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('heart_rate_logs')
      .insert(records);
    
    if (error) console.error('Erreur sauvegarde heart rate:', error);
    return { error };
  }

  static async saveSleepSession(userId: string, sleepData: {
    startTime: Date;
    endTime: Date;
    duration: number;
    quality: string;
    deepSleepDuration?: number;
    remSleepDuration?: number;
    awakenings?: number;
  }) {
    const { error } = await supabase
      .from('sleep_sessions')
      .insert({
        user_id: userId,
        start_time: sleepData.startTime.toISOString(),
        end_time: sleepData.endTime.toISOString(),
        duration_minutes: sleepData.duration,
        quality_score: sleepData.quality,
        deep_sleep_minutes: sleepData.deepSleepDuration,
        rem_sleep_minutes: sleepData.remSleepDuration,
        awakenings_count: sleepData.awakenings,
        synced_at: new Date().toISOString()
      });
    
    if (error) console.error('Erreur sauvegarde sleep session:', error);
    return { error };
  }

  static async saveWearableWorkout(userId: string, workoutData: {
    type: string;
    startTime: Date;
    endTime: Date;
    calories: number;
    distance?: number;
    source: 'apple_health' | 'google_fit' | 'manual';
  }) {
    const { error } = await supabase
      .from('wearable_workouts')
      .insert({
        user_id: userId,
        workout_type: workoutData.type,
        start_time: workoutData.startTime.toISOString(),
        end_time: workoutData.endTime.toISOString(),
        calories_burned: workoutData.calories,
        distance_meters: workoutData.distance,
        data_source: workoutData.source,
        synced_at: new Date().toISOString()
      });
    
    if (error) console.error('Erreur sauvegarde wearable workout:', error);
    return { error };
  }

  // 📊 Récupération des données wearables
  static async getWearableSteps(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('wearable_steps')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    return { data, error };
  }

  static async getHeartRateData(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('heart_rate_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at', { ascending: true });
    
    return { data, error };
  }

  static async getSleepSessions(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });
    
    return { data, error };
  }

  static async getWearableWorkouts(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('wearable_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });
    
    return { data, error };
  }

  // 📈 Statistiques wearables
  static async getWearableStats(userId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [stepsResult, heartRateResult, sleepResult] = await Promise.allSettled([
      this.getWearableSteps(userId, startDate, endDate),
      this.getHeartRateData(userId, startDate, endDate),
      this.getSleepSessions(userId, startDate, endDate)
    ]);

    const stats = {
      totalSteps: 0,
      avgHeartRate: 0,
      avgSleepDuration: 0,
      avgSleepQuality: 0,
      totalWorkouts: 0,
      lastSync: null as Date | null
    };

    // Calculer les statistiques des pas
    if (stepsResult.status === 'fulfilled' && stepsResult.value.data) {
      stats.totalSteps = stepsResult.value.data.reduce((sum, record) => sum + record.steps, 0);
    }

    // Calculer les statistiques de fréquence cardiaque
    if (heartRateResult.status === 'fulfilled' && heartRateResult.value.data) {
      const heartRateData = heartRateResult.value.data;
      if (heartRateData.length > 0) {
        stats.avgHeartRate = heartRateData.reduce((sum, record) => sum + record.heart_rate, 0) / heartRateData.length;
      }
    }

    // Calculer les statistiques de sommeil
    if (sleepResult.status === 'fulfilled' && sleepResult.value.data) {
      const sleepData = sleepResult.value.data;
      if (sleepData.length > 0) {
        stats.avgSleepDuration = sleepData.reduce((sum, record) => sum + record.duration_minutes, 0) / sleepData.length;
        
        // Calculer la qualité moyenne du sommeil (conversion text -> number)
        const qualityScores = sleepData.map(record => {
          switch (record.quality_score) {
            case 'excellent': return 4;
            case 'good': return 3;
            case 'fair': return 2;
            case 'poor': return 1;
            default: return 2;
          }
        });
        stats.avgSleepQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      }
    }

    return stats;
  }

  // ...existing code...
}

// 🎛️ Hooks React pour utilisation facile
export const useAnalytics = () => {
  return {
    updateLastLogin: AnalyticsService.updateLastLogin,
    getHighConfidenceRecommendations: AnalyticsService.getHighConfidenceRecommendations,
    getPopularWorkoutTemplates: AnalyticsService.getPopularWorkoutTemplates,
    getFoodByBarcode: AnalyticsService.getFoodByBarcode,
    analyzeSleepPatterns: AnalyticsService.analyzeSleepPatterns,
    getHydrationPatterns: AnalyticsService.getHydrationPatterns,
    updateGoalProgress: AnalyticsService.updateGoalProgress,
    checkPremiumAccess: AnalyticsService.checkPremiumAccess,
    uploadMealPhoto: AnalyticsService.uploadMealPhoto,
    createAIRequest: AnalyticsService.createAIRequest
  };
};
