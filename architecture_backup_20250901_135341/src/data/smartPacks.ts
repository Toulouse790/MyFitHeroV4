// client/src/data/smartPacks.ts

import { ModuleId } from '@/data/packs';

export interface SmartPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  modules: ModuleId[];
  recommendedFor: string[];
  questionsToAsk: string[]; // IDs des étapes à inclure
  questionsToSkip: string[]; // IDs des étapes à exclure
  order: number;
  popular?: boolean;
}

export const SMART_PACKS: SmartPack[] = [
  {
    id: 'performance_athlete',
    name: 'Performance Sportive',
    description: 'Pour les athlètes cherchant à optimiser leurs performances',
    icon: '🏆',
    modules: ['sport', 'strength', 'nutrition'],
    recommendedFor: ['athletes', 'competitors', 'sports_enthusiasts'],
    questionsToAsk: [
      'welcome',
      'get_name',
      'main_objective',
      'personal_info',
      'sport_selection',
      'sport_position',
      'sport_level',
      'season_period',
      'training_frequency',
      'equipment_level',
      'strength_setup',
      'strength_experience',
      'nutrition_setup',
      'nutrition_objective',
      'final_questions',
      'privacy_consent',
    ],
    questionsToSkip: [
      'sleep_setup',
      'sleep_difficulties',
      'hydration_setup',
      'hydration_reminders',
      'wellness_assessment',
    ],
    order: 1,
    popular: true,
  },
  {
    id: 'wellness_balance',
    name: 'Bien-être Global',
    description: 'Équilibre parfait entre sommeil, hydratation et nutrition',
    icon: '🌟',
    modules: ['sleep', 'hydration', 'nutrition'],
    recommendedFor: ['health_conscious', 'busy_professionals', 'stress_management'],
    questionsToAsk: [
      'welcome',
      'get_name',
      'main_objective',
      'personal_info',
      'nutrition_setup',
      'nutrition_objective',
      'sleep_setup',
      'sleep_difficulties',
      'hydration_setup',
      'hydration_reminders',
      'final_questions',
      'privacy_consent',
    ],
    questionsToSkip: [
      'sport_selection',
      'sport_position',
      'sport_level',
      'season_period',
      'training_frequency',
      'equipment_level',
      'strength_setup',
      'strength_experience',
    ],
    order: 2,
    popular: true,
  },
  {
    id: 'complete_transformation',
    name: 'Transformation Complète',
    description: 'Programme holistique couvrant tous les aspects de votre santé',
    icon: '💪',
    modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'],
    recommendedFor: ['transformation_seekers', 'dedicated_individuals'],
    questionsToAsk: 'all', // Toutes les questions
    questionsToSkip: [],
    order: 3,
    popular: false,
  },
  {
    id: 'daily_health',
    name: 'Santé Quotidienne',
    description: "Focus sur l'hydratation et le sommeil pour une meilleure santé",
    icon: '💧',
    modules: ['hydration', 'sleep'],
    recommendedFor: ['beginners', 'health_basics', 'simple_approach'],
    questionsToAsk: [
      'welcome',
      'get_name',
      'main_objective',
      'personal_info',
      'sleep_setup',
      'sleep_difficulties',
      'hydration_setup',
      'hydration_reminders',
      'final_questions',
      'privacy_consent',
    ],
    questionsToSkip: [
      'sport_selection',
      'sport_position',
      'sport_level',
      'season_period',
      'training_frequency',
      'equipment_level',
      'strength_setup',
      'strength_experience',
      'nutrition_setup',
      'nutrition_objective',
      'wellness_assessment',
    ],
    order: 4,
    popular: false,
  },
  {
    id: 'muscle_building',
    name: 'Prise de Muscle',
    description: 'Musculation et nutrition optimisées pour la croissance musculaire',
    icon: '💯',
    modules: ['strength', 'nutrition'],
    recommendedFor: ['bodybuilders', 'muscle_gain', 'strength_focused'],
    questionsToAsk: [
      'welcome',
      'get_name',
      'main_objective',
      'personal_info',
      'equipment_level',
      'strength_setup',
      'strength_experience',
      'nutrition_setup',
      'nutrition_objective',
      'nutrition_allergies',
      'final_questions',
      'privacy_consent',
    ],
    questionsToSkip: [
      'sport_selection',
      'sport_position',
      'sport_level',
      'season_period',
      'training_frequency',
      'sleep_setup',
      'sleep_difficulties',
      'hydration_setup',
      'hydration_reminders',
      'wellness_assessment',
    ],
    order: 5,
    popular: true,
  },
  {
    id: 'custom',
    name: 'Sur Mesure',
    description: 'Choisissez exactement les modules qui vous intéressent',
    icon: '🎯',
    modules: [], // À définir par l'utilisateur
    recommendedFor: ['advanced_users', 'specific_needs'],
    questionsToAsk: [], // Sera défini dynamiquement
    questionsToSkip: [], // Sera défini dynamiquement
    order: 6,
    popular: false,
  },
];

// Fonction pour obtenir les questions selon le pack choisi
export function getQuestionsForPack(packId: string, customModules?: ModuleId[]): string[] {
  const pack = SMART_PACKS.find(p => p.id === packId);

  if (!pack) {
    console.error(`Pack ${packId} non trouvé`);
    return [];
  }

  // Si c'est un pack custom, on génère les questions selon les modules
  if (pack.id === 'custom' && customModules) {
    return generateQuestionsForModules(customModules);
  }

  // Si questionsToAsk est 'all', on retourne toutes les questions
  if (pack.questionsToAsk === 'all') {
    return getAllQuestions();
  }

  return pack.questionsToAsk as string[];
}

// Générer les questions pour des modules spécifiques
function generateQuestionsForModules(modules: ModuleId[]): string[] {
  const baseQuestions = [
    'welcome',
    'get_name',
    'main_objective',
    'personal_info',
    'final_questions',
    'privacy_consent',
  ];

  const moduleQuestions: Record<ModuleId, string[]> = {
    sport: [
      'sport_selection',
      'sport_position',
      'sport_level',
      'season_period',
      'training_frequency',
    ],
    strength: ['equipment_level', 'strength_setup', 'strength_experience'],
    nutrition: ['nutrition_setup', 'nutrition_objective', 'nutrition_allergies'],
    sleep: ['sleep_setup', 'sleep_difficulties'],
    hydration: ['hydration_setup', 'hydration_reminders'],
    wellness: ['wellness_assessment'],
  };

  let questions = [...baseQuestions];

  // Ajouter les questions spécifiques à chaque module
  modules.forEach(module => {
    if (moduleQuestions[module]) {
      // Insérer les questions du module avant 'final_questions'
      const finalIndex = questions.indexOf('final_questions');
      questions.splice(finalIndex, 0, ...moduleQuestions[module]);
    }
  });

  return questions;
}

// Obtenir toutes les questions possibles
function getAllQuestions(): string[] {
  return [
    'welcome',
    'get_name',
    'main_objective',
    'personal_info',
    'sport_selection',
    'sport_position',
    'sport_level',
    'season_period',
    'training_frequency',
    'equipment_level',
    'strength_setup',
    'strength_experience',
    'nutrition_setup',
    'nutrition_objective',
    'nutrition_allergies',
    'sleep_setup',
    'sleep_difficulties',
    'hydration_setup',
    'hydration_reminders',
    'wellness_assessment',
    'final_questions',
    'privacy_consent',
  ];
}

// Fonction pour vérifier si une question doit être posée
export function shouldAskQuestion(
  questionId: string,
  selectedPack: string,
  customModules?: ModuleId[]
): boolean {
  const questionsToAsk = getQuestionsForPack(selectedPack, customModules);
  return questionsToAsk.includes(questionId);
}

// Obtenir les packs recommandés selon l'objectif principal
export function getRecommendedPacks(mainObjective: string): string[] {
  const recommendations: Record<string, string[]> = {
    performance: ['performance_athlete', 'complete_transformation'],
    health_wellness: ['wellness_balance', 'daily_health'],
    body_composition: ['muscle_building', 'performance_athlete'],
    energy_sleep: ['wellness_balance', 'daily_health'],
    strength_building: ['muscle_building', 'performance_athlete'],
    weight_loss: ['wellness_balance', 'muscle_building'],
    muscle_gain: ['muscle_building', 'performance_athlete'],
    holistic: ['complete_transformation'],
  };

  return recommendations[mainObjective] || ['custom'];
}

// Calculer le temps estimé selon le pack
export function getEstimatedTimeForPack(packId: string): number {
  const pack = SMART_PACKS.find(p => p.id === packId);
  if (!pack) return 15;

  const timePerQuestion = 0.5; // 30 secondes par question en moyenne
  const questionsCount =
    pack.questionsToAsk === 'all'
      ? getAllQuestions().length
      : (pack.questionsToAsk as string[]).length;

  return Math.ceil(questionsCount * timePerQuestion);
}
