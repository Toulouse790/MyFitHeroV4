import { supabase } from '@/lib/supabase';

// Types pour l'intelligence artificielle
export interface AIAnalysis {
  pillar: string;
  trend: 'improving' | 'stable' | 'declining';
  consistency_score: number;
  predictions?: any;
  recommendations: string[];
  confidence: number;
}

export interface CoachingResponse {
  message: string;
  priority: 'low' | 'medium' | 'high';
  type: 'motivational' | 'corrective' | 'educational';
  actions: Array<{
    title: string;
    description: string;
    pillar: string;
  }>;
  next_check_in: string;
}

export interface Anomaly {
  type: 'deviation' | 'pattern_break' | 'outlier';
  pillar: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  detected_at: string;
}

export interface ContextualRecommendation {
  type: string;
  title: string;
  message: string;
  actions: string[];
  priority: 'low' | 'medium' | 'high';
}

class AIService {
  private baseUrl = '/api/ai';

  // Analyse prédictive des patterns utilisateur
  async analyzePatterns(pillar: string, timeframe: string = '7d'): Promise<AIAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ pillar, timeframe }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze patterns');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Pattern analysis error:', error);
      throw error;
    }
  }

  // Coaching adaptatif en temps réel
  async getAdaptiveCoaching(
    userContext: any,
    currentState: any,
    goal: string
  ): Promise<CoachingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/adaptive-coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ user_context: userContext, current_state: currentState, goal }),
      });

      if (!response.ok) {
        throw new Error('Failed to get adaptive coaching');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Adaptive coaching error:', error);
      throw error;
    }
  }

  // Détection intelligente d'anomalies
  async detectAnomalies(dataPoints: unknown[], pillar?: string): Promise<{ anomalies: Anomaly[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/detect-anomalies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ data_points: dataPoints, pillar }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect anomalies');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Anomaly detection error:', error);
      throw error;
    }
  }

  // Prédictions personnalisées
  async getPredictions(horizon: string = '7d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ horizon }),
      });

      if (!response.ok) {
        throw new Error('Failed to get predictions');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Predictions error:', error);
      throw error;
    }
  }

  // Recommandations contextuelles (n8n style)
  async getContextualRecommendations(
    context: any,
    userProfile: any
  ): Promise<{ recommendations: ContextualRecommendation[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/contextual-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          context,
          user_profile: userProfile,
          current_time: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get contextual recommendations');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Contextual recommendations error:', error);
      throw error;
    }
  }

  // Analyse des habitudes et insights
  async getHabitsInsights(userId: string, pillar: string): Promise<any> {
    try {
      // Récupération des données historiques via Supabase
      const { data: logs } = await supabase
        .from(`${pillar}_logs`)
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!logs) return null;

      // Analyse des patterns localement
      const insights = this.analyzeHabitsLocally(logs);

      return {
        pillar,
        insights,
        data_points: logs.length,
        analysis_period: '30d',
        generated_at: new Date().toISOString(),
      };
    } catch {
      // Erreur silencieuse
      console.error('Habits insights error:', error);
      throw error;
    }
  }

  // Coaching proactif basé sur les prédictions
  async getProactiveCoaching(): Promise<any> {
    try {
      // Combinaison de plusieurs analyses pour un coaching proactif
      const [patterns, predictions, anomalies] = await Promise.all([
        this.analyzePatterns('general'),
        this.getPredictions('3d'),
        this.detectAnomalies([]),
      ]);

      const proactiveAdvice = this.generateProactiveAdvice(patterns, predictions, anomalies);

      return {
        advice: proactiveAdvice,
        confidence: 0.85,
        next_action: this.getNextRecommendedAction(proactiveAdvice),
        generated_at: new Date().toISOString(),
      };
    } catch {
      // Erreur silencieuse
      console.error('Proactive coaching error:', error);
      throw error;
    }
  }

  // Helpers privés
  private getAuthToken(): string {
    // Récupération du token d'authentification
    return localStorage.getItem('auth_token') || '';
  }

  private analyzeHabitsLocally(logs: unknown[]): any {
    // Analyse locale des habitudes pour réduire les appels API
    const dayStats = logs.reduce((acc, log) => {
      const day = new Date(log.created_at).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const hourStats = logs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return {
      best_days: Object.entries(dayStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3),
      best_hours: Object.entries(hourStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3),
      consistency_score: this.calculateConsistency(logs),
      total_actions: logs.length,
      avg_per_day: logs.length / 30,
    };
  }

  private calculateConsistency(logs: unknown[]): number {
    // Calcul du score de consistance basé sur la régularité
    const dailyCounts = logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const days = Object.keys(dailyCounts).length;
    const totalDays = 30;
    return Math.round((days / totalDays) * 100);
  }

  private generateProactiveAdvice(patterns: any, predictions: any, anomalies: any): any {
    // Génération de conseils proactifs basés sur l'analyse croisée
    const advice: {
      immediate: Array<{ type: string; message: string; action: string }>;
      short_term: Array<{ type: string; message: string; action: string }>;
      long_term: Array<{ type: string; message: string; action: string }>;
    } = {
      immediate: [],
      short_term: [],
      long_term: [],
    };

    // Conseils immédiats basés sur les anomalies
    if (anomalies.anomalies?.length > 0) {
      advice.immediate.push({
        type: 'correction',
        message: 'Anomalie détectée dans vos habitudes',
        action: anomalies.anomalies[0].suggestion,
      });
    }

    // Conseils à court terme basés sur les prédictions
    if (predictions.predictions?.performance?.expected_improvement > 10) {
      advice.short_term.push({
        type: 'optimization',
        message: "Potentiel d'amélioration élevé détecté",
        action: 'Intensifiez vos efforts cette semaine',
      });
    }

    // Conseils à long terme basés sur les patterns
    if (patterns.analysis?.consistency_score < 70) {
      advice.long_term.push({
        type: 'habit_building',
        message: 'Travaillons sur la consistance',
        action: 'Établissez une routine quotidienne fixe',
      });
    }

    return advice;
  }

  private getNextRecommendedAction(advice: any): string {
    // Détermine la prochaine action recommandée
    if (advice.immediate?.length > 0) {
      return advice.immediate[0].action;
    }
    if (advice.short_term?.length > 0) {
      return advice.short_term[0].action;
    }
    return 'Continuez votre excellent travail !';
  }
}

export const aiService = new AIService();
