import {
  RecoveryData,
  RecoveryMetrics,
  RecoveryActivity,
  RecoveryRecommendation,
  RecoveryTrendData,
} from '../types';

export class RecoveryService {
  private static readonly BASE_URL = '/api/recovery';

  /**
   * Récupère le statut de récupération d'un utilisateur
   */
  static async getRecoveryStatus(userId: string): Promise<RecoveryData> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/status`);
      if (!response.ok) throw new Error('Erreur lors de la récupération du statut');
      return await response.json();
    } catch {
      // Erreur silencieuse
      // Mode mock pour le développement
      return this.getMockRecoveryData(userId);
    }
  }

  /**
   * Récupère les métriques de récupération
   */
  static async getRecoveryMetrics(userId: string): Promise<RecoveryMetrics> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/metrics`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des métriques');
      return await response.json();
    } catch {
      // Erreur silencieuse
      return this.getMockMetrics(userId);
    }
  }

  /**
   * Met à jour les métriques de récupération
   */
  static async updateRecoveryMetrics(
    userId: string,
    metrics: Partial<RecoveryMetrics>
  ): Promise<RecoveryMetrics> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch {
      // Erreur silencieuse
      // Return updated mock data
      return { ...this.getMockMetrics(userId), ...metrics };
    }
  }

  /**
   * Enregistre une activité de récupération
   */
  static async logRecoveryActivity(userId: string, activity: RecoveryActivity): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
    } catch {
      // Erreur silencieuse
      // Mock success
      console.log('Activité enregistrée (mode mock):', activity);
    }
  }

  /**
   * Récupère les recommandations de récupération
   */
  static async getRecoveryRecommendations(userId: string): Promise<RecoveryRecommendation[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/recommendations`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des recommandations');
      return await response.json();
    } catch {
      // Erreur silencieuse
      return this.getMockRecommendations();
    }
  }

  /**
   * Calcule le score de récupération
   */
  static calculateRecoveryScore(metrics: RecoveryMetrics): number {
    const {
      sleepQuality = 0,
      restingHeartRate = 60,
      hrVariability = 30,
      stressLevel = 5,
      muscleStiffness = 5,
      energyLevel = 5,
    } = metrics;

    // Normalisation des scores (0-100)
    const sleepScore = sleepQuality * 10;
    const hrScore = Math.max(0, 100 - Math.abs(restingHeartRate - 60) * 2);
    const hrvScore = Math.min(100, hrVariability * 2);
    const stressScore = Math.max(0, 100 - stressLevel * 10);
    const stiffnessScore = Math.max(0, 100 - muscleStiffness * 10);
    const energyScore = energyLevel * 10;

    return Math.round(
      sleepScore * 0.25 +
        hrScore * 0.2 +
        hrvScore * 0.2 +
        stressScore * 0.15 +
        stiffnessScore * 0.1 +
        energyScore * 0.1
    );
  }

  /**
   * Récupère les données de tendance
   */
  static async getRecoveryTrend(userId: string, days: number = 30): Promise<RecoveryTrendData[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/trend?days=${days}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération de la tendance');
      return await response.json();
    } catch {
      // Erreur silencieuse
      return this.getMockTrendData(days);
    }
  }

  // Méthodes mock pour le développement
  private static getMockRecoveryData(userId: string): RecoveryData {
    return {
      userId,
      currentScore: 75,
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
      history: [
        { date: '2024-01-01', overallScore: 70, sleepScore: 75, stressScore: 65, energyScore: 80 },
        { date: '2024-01-02', overallScore: 72, sleepScore: 78, stressScore: 68, energyScore: 82 },
        { date: '2024-01-03', overallScore: 75, sleepScore: 80, stressScore: 70, energyScore: 85 },
      ],
      recentActivities: [
        {
          userId,
          type: 'stretching',
          duration: 15,
          intensity: 3,
          timestamp: new Date().toISOString(),
          benefits: ['flexibilité', 'relaxation'],
        },
      ],
    };
  }

  private static getMockMetrics(userId: string): RecoveryMetrics {
    return {
      userId,
      date: new Date().toISOString().split('T')[0]!,
      sleepQuality: 7,
      sleepDuration: 7.5,
      restingHeartRate: 62,
      hrVariability: 35,
      stressLevel: 4,
      muscleStiffness: 3,
      energyLevel: 7,
      moodScore: 8,
      overallScore: 75,
      readinessScore: 80,
    };
  }

  private static getMockRecommendations(): RecoveryRecommendation[] {
    return [
      {
        id: '1',
        type: 'sleep',
        priority: 'high',
        title: 'Améliorer la qualité du sommeil',
        description: 'Votre score de sommeil peut être amélioré',
        action: 'Essayez de vous coucher 30 minutes plus tôt',
        estimatedBenefit: '+10% récupération',
        timeToComplete: 480,
        difficulty: 'easy',
      },
      {
        id: '2',
        type: 'stress',
        priority: 'medium',
        title: 'Réduire le stress',
        description: 'Niveau de stress légèrement élevé détecté',
        action: 'Pratiquez 10 minutes de méditation',
        estimatedBenefit: '+5% bien-être',
        timeToComplete: 10,
        difficulty: 'easy',
      },
    ];
  }

  private static getMockTrendData(days: number): RecoveryTrendData[] {
    const data: RecoveryTrendData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0]!,
        overall: 60 + Math.random() * 30,
        sleep: 50 + Math.random() * 40,
        stress: 40 + Math.random() * 50,
        energy: 55 + Math.random() * 35,
        hrv: 20 + Math.random() * 40,
      });
    }

    return data;
  }
}
