// client/src/lib/wearableUtils.ts
import { WearableData } from '@/hooks/useWearableSync';

export interface HealthMetrics {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRateAvg: number;
  heartRateMax: number;
  heartRateMin: number;
  sleepScore: number;
  sleepDuration: number;
}

export interface HealthInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  recommendation?: string;
  score?: number;
}

export class WearableAnalyzer {
  static calculateHealthMetrics(data: WearableData): HealthMetrics {
    const heartRates = data.heartRate || [];
    const sleepSessions = data.sleepSessions || [];
    
    return {
      steps: data.steps || 0,
      calories: data.caloriesBurned || 0,
      distance: data.distance || 0,
      activeMinutes: data.activeMinutes || 0,
      heartRateAvg: heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : 0,
      heartRateMax: heartRates.length > 0 ? Math.max(...heartRates) : 0,
      heartRateMin: heartRates.length > 0 ? Math.min(...heartRates) : 0,
      sleepScore: this.calculateSleepScore(sleepSessions),
      sleepDuration: sleepSessions.length > 0 ? sleepSessions[0].duration : 0
    };
  }

  static calculateSleepScore(sleepSessions: any[]): number {
    if (sleepSessions.length === 0) return 0;
    
    const session = sleepSessions[0];
    let score = 0;
    
    // Durée du sommeil (0-40 points)
    const duration = session.duration;
    if (duration >= 420 && duration <= 540) { // 7-9 heures
      score += 40;
    } else if (duration >= 360 && duration < 420) { // 6-7 heures
      score += 30;
    } else if (duration >= 300 && duration < 360) { // 5-6 heures
      score += 20;
    } else {
      score += 10;
    }
    
    // Qualité du sommeil (0-30 points)
    switch (session.quality) {
      case 'excellent':
        score += 30;
        break;
      case 'good':
        score += 25;
        break;
      case 'fair':
        score += 15;
        break;
      case 'poor':
        score += 5;
        break;
    }
    
    // Sommeil profond (0-20 points)
    const deepSleepRatio = (session.deepSleepDuration || 0) / duration;
    if (deepSleepRatio >= 0.15) {
      score += 20;
    } else if (deepSleepRatio >= 0.10) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Réveils (0-10 points)
    const awakenings = session.awakenings || 0;
    if (awakenings <= 1) {
      score += 10;
    } else if (awakenings <= 3) {
      score += 7;
    } else {
      score += 3;
    }
    
    return Math.min(score, 100);
  }

  static generateHealthInsights(data: WearableData): HealthInsight[] {
    const metrics = this.calculateHealthMetrics(data);
    const insights: HealthInsight[] = [];
    
    // Analyse des pas
    if (metrics.steps >= 10000) {
      insights.push({
        type: 'positive',
        title: '🎯 Objectif pas atteint !',
        description: `Excellent ! Vous avez fait ${metrics.steps.toLocaleString()} pas aujourd'hui.`,
        recommendation: 'Maintenez ce rythme pour une santé optimale.',
        score: 95
      });
    } else if (metrics.steps >= 7500) {
      insights.push({
        type: 'neutral',
        title: '👍 Bonne activité',
        description: `${metrics.steps.toLocaleString()} pas aujourd'hui, proche de l'objectif.`,
        recommendation: 'Essayez d\'ajouter une petite marche pour atteindre 10 000 pas.',
        score: 75
      });
    } else {
      insights.push({
        type: 'warning',
        title: '⚠️ Activité faible',
        description: `Seulement ${metrics.steps.toLocaleString()} pas aujourd'hui.`,
        recommendation: 'Planifiez des pauses actives dans votre journée.',
        score: 45
      });
    }
    
    // Analyse du sommeil
    if (metrics.sleepScore >= 80) {
      insights.push({
        type: 'positive',
        title: '😴 Excellent sommeil',
        description: `Score de sommeil: ${metrics.sleepScore}/100`,
        recommendation: 'Votre routine de sommeil est optimale !',
        score: metrics.sleepScore
      });
    } else if (metrics.sleepScore >= 60) {
      insights.push({
        type: 'neutral',
        title: '🌙 Sommeil correct',
        description: `Score de sommeil: ${metrics.sleepScore}/100`,
        recommendation: 'Essayez de vous coucher 30 minutes plus tôt.',
        score: metrics.sleepScore
      });
    } else {
      insights.push({
        type: 'warning',
        title: '❌ Sommeil à améliorer',
        description: `Score de sommeil: ${metrics.sleepScore}/100`,
        recommendation: 'Établissez une routine de sommeil régulière.',
        score: metrics.sleepScore
      });
    }
    
    // Analyse de la fréquence cardiaque
    if (metrics.heartRateAvg > 0) {
      if (metrics.heartRateMin < 60 && metrics.heartRateMax < 180) {
        insights.push({
          type: 'positive',
          title: '❤️ Fréquence cardiaque saine',
          description: `FC repos: ${Math.round(metrics.heartRateMin)} BPM, FC max: ${Math.round(metrics.heartRateMax)} BPM`,
          recommendation: 'Votre condition cardiovasculaire est excellente.',
          score: 90
        });
      } else if (metrics.heartRateMax > 180) {
        insights.push({
          type: 'warning',
          title: '⚠️ Fréquence cardiaque élevée',
          description: `FC max détectée: ${Math.round(metrics.heartRateMax)} BPM`,
          recommendation: 'Modérez l\'intensité de vos entraînements.',
          score: 60
        });
      }
    }
    
    // Analyse des calories
    if (metrics.calories >= 400) {
      insights.push({
        type: 'positive',
        title: '🔥 Excellente dépense énergétique',
        description: `${metrics.calories} calories brûlées aujourd'hui`,
        recommendation: 'Continuez sur cette lancée !',
        score: 85
      });
    } else if (metrics.calories >= 200) {
      insights.push({
        type: 'neutral',
        title: '⚡ Dépense énergétique modérée',
        description: `${metrics.calories} calories brûlées aujourd'hui`,
        recommendation: 'Ajoutez une activité physique pour optimiser la combustion.',
        score: 65
      });
    }
    
    return insights.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  static calculateFitnessScore(data: WearableData): number {
    const metrics = this.calculateHealthMetrics(data);
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Score basé sur les pas (25% du total)
    const stepsScore = Math.min((metrics.steps / 10000) * 25, 25);
    totalScore += stepsScore;
    maxScore += 25;
    
    // Score basé sur le sommeil (25% du total)
    const sleepScore = (metrics.sleepScore / 100) * 25;
    totalScore += sleepScore;
    maxScore += 25;
    
    // Score basé sur l'activité (25% du total)
    const activityScore = Math.min((metrics.activeMinutes / 30) * 25, 25);
    totalScore += activityScore;
    maxScore += 25;
    
    // Score basé sur les calories (25% du total)
    const caloriesScore = Math.min((metrics.calories / 400) * 25, 25);
    totalScore += caloriesScore;
    maxScore += 25;
    
    return Math.round((totalScore / maxScore) * 100);
  }

  static getHealthTrend(currentData: WearableData, previousData?: WearableData): 'up' | 'down' | 'stable' {
    if (!previousData) return 'stable';
    
    const currentScore = this.calculateFitnessScore(currentData);
    const previousScore = this.calculateFitnessScore(previousData);
    
    if (currentScore > previousScore + 5) return 'up';
    if (currentScore < previousScore - 5) return 'down';
    return 'stable';
  }

  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }

  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  static getHeartRateZone(heartRate: number): { zone: string; color: string } {
    if (heartRate >= 170) return { zone: 'Maximum', color: 'text-red-600' };
    if (heartRate >= 150) return { zone: 'Intense', color: 'text-orange-600' };
    if (heartRate >= 120) return { zone: 'Modérée', color: 'text-yellow-600' };
    if (heartRate >= 90) return { zone: 'Légère', color: 'text-green-600' };
    return { zone: 'Repos', color: 'text-blue-600' };
  }

  static calculateCaloriesBurned(steps: number, weight: number = 70): number {
    // Formule approximative : 1 pas = 0.04 calories pour une personne de 70kg
    const caloriesPerStep = 0.04 * (weight / 70);
    return Math.round(steps * caloriesPerStep);
  }

  static isDataFresh(lastSync: Date | null, maxAgeMinutes: number = 30): boolean {
    if (!lastSync) return false;
    const now = new Date();
    const ageMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
    return ageMinutes <= maxAgeMinutes;
  }
}

export default WearableAnalyzer;
