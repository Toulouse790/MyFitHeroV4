import { Sun, Clock, Bed, Heart, Brain, Shield, Zap, Lightbulb, Phone, Target } from 'lucide-react';
import type { SportSleepConfig, SleepFactor } from '../types';

// Configuration du sommeil par sport
export const sportSleepConfigs: Record<string, SportSleepConfig> = {
  basketball: {
    emoji: '🏀',
    sleepGoalHours: 9,
    motivationalMessage: 'Le sommeil améliore votre temps de réaction et précision au tir.',
    benefits: [
      {
        icon: Zap,
        title: 'Temps de réaction',
        value: '+15%',
        color: 'text-yellow-500',
        priority: 'high',
      },
      {
        icon: Target,
        title: 'Précision tir',
        value: '+12%',
        color: 'text-blue-500',
        priority: 'high',
      },
      {
        icon: Brain,
        title: 'Prise de décision',
        value: '+20%',
        color: 'text-purple-500',
        priority: 'medium',
      },
      {
        icon: Heart,
        title: 'Endurance cardiaque',
        value: '+10%',
        color: 'text-red-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Clock,
        title: 'Horaires réguliers',
        description:
          'Couchez-vous et levez-vous à heures fixes pour optimiser votre rythme circadien.',
        priority: 'high',
      },
      {
        icon: Phone,
        title: "Pas d'écrans avant match",
        description: 'Évitez les écrans 2h avant un match pour une meilleure qualité de sommeil.',
        priority: 'high',
      },
      {
        icon: Bed,
        title: 'Sieste stratégique',
        description: 'Une sieste de 20-30min peut booster vos performances le jour du match.',
        priority: 'medium',
      },
    ],
  },

  football: {
    emoji: '⚽',
    sleepGoalHours: 9,
    motivationalMessage: 'Un sommeil optimal booste votre endurance et explosivité.',
    benefits: [
      {
        icon: Zap,
        title: 'Explosivité',
        value: '+18%',
        color: 'text-yellow-500',
        priority: 'high',
      },
      { icon: Heart, title: 'VO2 Max', value: '+8%', color: 'text-red-500', priority: 'high' },
      {
        icon: Shield,
        title: 'Récup. musculaire',
        value: 'Accélérée',
        color: 'text-green-500',
        priority: 'medium',
      },
      {
        icon: Brain,
        title: 'Vision de jeu',
        value: '+15%',
        color: 'text-purple-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Bed,
        title: 'Récupération post-match',
        description: 'Dormez 9h+ après un match pour optimiser la récupération musculaire.',
        priority: 'high',
      },
      {
        icon: Clock,
        title: 'Gestion du décalage',
        description: 'Adaptez progressivement vos horaires avant les déplacements.',
        priority: 'high',
      },
      {
        icon: Sun,
        title: 'Exposition lumineuse',
        description:
          'Exposez-vous à la lumière naturelle le matin pour réguler votre horloge interne.',
        priority: 'medium',
      },
    ],
  },

  tennis: {
    emoji: '🎾',
    sleepGoalHours: 8.5,
    motivationalMessage: 'La précision et la concentration exigent un sommeil de qualité.',
    benefits: [
      { icon: Target, title: 'Précision', value: '+22%', color: 'text-blue-500', priority: 'high' },
      {
        icon: Brain,
        title: 'Concentration',
        value: '+25%',
        color: 'text-purple-500',
        priority: 'high',
      },
      { icon: Zap, title: 'Réflexes', value: '+18%', color: 'text-yellow-500', priority: 'medium' },
      { icon: Heart, title: 'Endurance', value: '+12%', color: 'text-red-500', priority: 'medium' },
    ],
    tips: [
      {
        icon: Clock,
        title: 'Routine pré-sommeil',
        description:
          "Créez un rituel relaxant 1h avant le coucher pour optimiser l'endormissement.",
        priority: 'high',
      },
      {
        icon: Lightbulb,
        title: 'Gestion du stress',
        description: "Pratiquez la méditation pour réduire l'anxiété de performance.",
        priority: 'high',
      },
      {
        icon: Bed,
        title: 'Environnement optimal',
        description: 'Maintenez votre chambre entre 18-20°C pour un sommeil réparateur.',
        priority: 'medium',
      },
    ],
  },

  running: {
    emoji: '🏃‍♂️',
    sleepGoalHours: 8,
    motivationalMessage: 'Chaque heure de sommeil améliore votre endurance et récupération.',
    benefits: [
      { icon: Heart, title: 'Endurance', value: '+20%', color: 'text-red-500', priority: 'high' },
      {
        icon: Shield,
        title: 'Récup. tendons',
        value: 'Optimisée',
        color: 'text-green-500',
        priority: 'high',
      },
      {
        icon: Zap,
        title: 'Glycogène',
        value: '+15%',
        color: 'text-yellow-500',
        priority: 'medium',
      },
      {
        icon: Brain,
        title: 'Motivation',
        value: '+25%',
        color: 'text-purple-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Clock,
        title: 'Timing des entraînements',
        description: 'Évitez les courses intenses 4h avant le coucher.',
        priority: 'high',
      },
      {
        icon: Bed,
        title: 'Récupération active',
        description: 'Priorisez le sommeil après les séances longues ou intenses.',
        priority: 'high',
      },
      {
        icon: Sun,
        title: 'Courses matinales',
        description: 'Courir le matin aide à réguler votre cycle circadien.',
        priority: 'medium',
      },
    ],
  },

  strength: {
    emoji: '💪',
    sleepGoalHours: 9,
    motivationalMessage: "Optimisez votre récupération physique pour l'impact.",
    benefits: [
      {
        icon: Shield,
        title: 'Récup. Musculaire',
        value: 'Maximale',
        color: 'text-green-500',
        priority: 'high',
      },
      {
        icon: Heart,
        title: 'Réduction Inflam.',
        value: 'Élevée',
        color: 'text-red-500',
        priority: 'high',
      },
      {
        icon: Brain,
        title: 'Prise de décision',
        value: '+15%',
        color: 'text-purple-500',
        priority: 'medium',
      },
      {
        icon: Zap,
        title: 'Puissance',
        value: '+10%',
        color: 'text-yellow-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Bed,
        title: 'Priorité à la durée',
        description:
          'Visez 9h+ pour permettre à votre corps de réparer les micro-déchirures musculaires.',
        priority: 'high',
      },
      {
        icon: Clock,
        title: 'Fenêtre post-training',
        description: 'Couchez-vous dans les 8h suivant un entraînement intense.',
        priority: 'high',
      },
      {
        icon: Shield,
        title: 'Sommeil profond',
        description: 'Les phases de sommeil profond sont cruciales pour la synthèse protéique.',
        priority: 'medium',
      },
    ],
  },

  endurance: {
    emoji: '🚴‍♂️',
    sleepGoalHours: 8.5,
    motivationalMessage: "L'endurance se construit aussi pendant votre sommeil.",
    benefits: [
      {
        icon: Heart,
        title: 'Capacité aérobie',
        value: '+15%',
        color: 'text-red-500',
        priority: 'high',
      },
      {
        icon: Brain,
        title: 'Endurance Mentale',
        value: '+20%',
        color: 'text-purple-500',
        priority: 'high',
      },
      {
        icon: Shield,
        title: 'Système Immunitaire',
        value: 'Renforcé',
        color: 'text-green-500',
        priority: 'medium',
      },
      {
        icon: Zap,
        title: 'Métabolisme',
        value: 'Optimisé',
        color: 'text-yellow-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Clock,
        title: 'Consistance des horaires',
        description: 'Se coucher et se lever à la même heure stabilise votre rythme circadien.',
        priority: 'high',
      },
      {
        icon: Sun,
        title: 'Exposition à la lumière',
        description: 'La lumière du jour le matin aide à réguler votre horloge interne.',
        priority: 'medium',
      },
      {
        icon: Bed,
        title: 'Qualité > Quantité',
        description: 'Un sommeil profond et ininterrompu est plus réparateur.',
        priority: 'high',
      },
    ],
  },

  precision: {
    emoji: '🎯',
    sleepGoalHours: 8,
    motivationalMessage: 'La précision millimétrique exige un cerveau parfaitement reposé.',
    benefits: [
      {
        icon: Target,
        title: 'Précision fine',
        value: '+30%',
        color: 'text-blue-500',
        priority: 'high',
      },
      {
        icon: Brain,
        title: 'Concentration',
        value: '+28%',
        color: 'text-purple-500',
        priority: 'high',
      },
      {
        icon: Zap,
        title: 'Coordination',
        value: '+20%',
        color: 'text-yellow-500',
        priority: 'medium',
      },
      {
        icon: Shield,
        title: 'Contrôle émotionnel',
        value: '+15%',
        color: 'text-green-500',
        priority: 'medium',
      },
    ],
    tips: [
      {
        icon: Brain,
        title: 'Méditation pré-sommeil',
        description: 'Calmez votre mental avec 10min de méditation avant le coucher.',
        priority: 'high',
      },
      {
        icon: Clock,
        title: 'Horaires stricts',
        description: 'La régularité est cruciale pour maintenir la précision cognitive.',
        priority: 'high',
      },
      {
        icon: Lightbulb,
        title: 'Environnement zen',
        description: 'Créez un espace de sommeil minimaliste et apaisant.',
        priority: 'medium',
      },
    ],
  },
};

// Facteurs de sommeil prédéfinis
export const defaultSleepFactors: SleepFactor[] = [
  // Facteurs positifs
  {
    id: 'meditation',
    name: 'Méditation/Relaxation',
    type: 'positive',
    impact: 'high',
    category: 'mental',
  },
  {
    id: 'regular_schedule',
    name: 'Horaires réguliers',
    type: 'positive',
    impact: 'high',
    category: 'lifestyle',
  },
  {
    id: 'cool_room',
    name: 'Chambre fraîche (18-20°C)',
    type: 'positive',
    impact: 'medium',
    category: 'environment',
  },
  {
    id: 'no_screens',
    name: "Pas d'écrans 1h avant",
    type: 'positive',
    impact: 'medium',
    category: 'lifestyle',
  },
  {
    id: 'exercise',
    name: 'Exercice dans la journée',
    type: 'positive',
    impact: 'medium',
    category: 'physical',
  },
  {
    id: 'comfortable_bed',
    name: 'Literie confortable',
    type: 'positive',
    impact: 'medium',
    category: 'environment',
  },

  // Facteurs négatifs
  {
    id: 'caffeine_late',
    name: 'Caféine après 14h',
    type: 'negative',
    impact: 'high',
    category: 'lifestyle',
  },
  {
    id: 'stress',
    name: 'Stress/Anxiété',
    type: 'negative',
    impact: 'high',
    category: 'mental',
  },
  {
    id: 'noise',
    name: 'Bruit environnant',
    type: 'negative',
    impact: 'medium',
    category: 'environment',
  },
  {
    id: 'alcohol',
    name: 'Alcool',
    type: 'negative',
    impact: 'medium',
    category: 'lifestyle',
  },
  {
    id: 'large_meal',
    name: 'Repas copieux tardif',
    type: 'negative',
    impact: 'medium',
    category: 'physical',
  },
  {
    id: 'light_pollution',
    name: 'Pollution lumineuse',
    type: 'negative',
    impact: 'medium',
    category: 'environment',
  },
];

// Utilitaires de calcul
export const calculateSleepDuration = (bedtime: string, wakeTime: string): number => {
  const bedTimeParts = bedtime.split(':').map(Number);
  const wakeTimeParts = wakeTime.split(':').map(Number);

  if (bedTimeParts.length !== 2 || wakeTimeParts.length !== 2) {
    return 0; // Return 0 if invalid format
  }

  const [bedHour = 0, bedMin = 0] = bedTimeParts;
  const [wakeHour = 0, wakeMin = 0] = wakeTimeParts;

  let bedTimeMinutes = bedHour * 60 + bedMin;
  let wakeTimeMinutes = wakeHour * 60 + wakeMin;

  // Si l'heure de réveil est le lendemain
  if (wakeTimeMinutes < bedTimeMinutes) {
    wakeTimeMinutes += 24 * 60;
  }

  return wakeTimeMinutes - bedTimeMinutes;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

export const getSleepQualityLabel = (quality: number): { label: string; color: string } => {
  if (quality >= 8) return { label: 'Excellent', color: 'text-green-600' };
  if (quality >= 6) return { label: 'Bon', color: 'text-blue-600' };
  if (quality >= 4) return { label: 'Moyen', color: 'text-yellow-600' };
  return { label: 'Faible', color: 'text-red-600' };
};

export const getSleepDeficit = (
  currentGoal: { targetDuration: number } | null,
  averageDuration: number
): number => {
  if (!currentGoal) return 0;
  return Math.max(0, currentGoal.targetDuration - averageDuration);
};

export const getPersonalizedSleepMessage = (
  userSport: string | undefined,
  sleepDeficit: number
): string => {
  const sport = userSport || 'sport';

  if (sleepDeficit > 60) {
    return `Pour optimiser vos performances en ${sport}, couchez-vous ${Math.round(sleepDeficit)} minutes plus tôt.`;
  }
  if (sleepDeficit > 30) {
    return `Votre sommeil est presque optimal pour vos besoins en ${sport}. Encore ${Math.round(sleepDeficit)} minutes !`;
  }
  return `Votre sommeil est parfaitement adapté à vos besoins en ${sport} !`;
};
