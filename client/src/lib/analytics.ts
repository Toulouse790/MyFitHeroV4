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
    const { data: uploadData, error: uploadError } = await supabase.storage
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
