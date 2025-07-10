// client/src/data/conversationalFlow.ts
import { ConversationalFlow } from '@/types/conversationalOnboarding';
import { 
  MAIN_OBJECTIVES, 
  AVAILABLE_MODULES, 
  AVAILABLE_SPORTS, 
  DIETARY_PREFERENCES,
  STRENGTH_OBJECTIVES,
  NUTRITION_OBJECTIVES,
  EQUIPMENT_LEVELS,
  SPORT_LEVELS,
  FITNESS_EXPERIENCE_LEVELS
} from './onboardingData';

export const CONVERSATIONAL_ONBOARDING_FLOW: ConversationalFlow = {
  id: 'myfithero_onboarding_v4',
  name: 'MyFitHero - Onboarding Conversationnel',
  description: 'Parcours d\'onboarding personnalisé et adaptatif',
  estimatedDuration: 15,
  modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'],
  initialStep: 'welcome',
  steps: [
    // 🚀 ÉTAPE 1: ACCUEIL ET PRÉSENTATION
    {
      id: 'welcome',
      type: 'info',
      title: 'Bienvenue dans MyFitHero ! 🎉',
      subtitle: 'Votre coach personnel IA',
      description: 'Je vais vous accompagner pour créer votre programme personnalisé en quelques minutes.',
      illustration: '🏆',
      tips: [
        'Répondez honnêtement pour de meilleurs résultats',
        'Vous pouvez modifier vos choix plus tard',
        'Environ 10-15 minutes nécessaires'
      ],
      estimatedTime: 1,
      nextStep: 'get_name'
    },

    // 📝 ÉTAPE 2: COLLECTE DU PRÉNOM
    {
      id: 'get_name',
      type: 'question',
      title: 'Faisons connaissance !',
      question: 'Comment puis-je vous appeler ?',
      description: 'Votre prénom nous aide à personnaliser votre expérience',
      illustration: '👋',
      inputType: 'text',
      validation: [
        { type: 'required', message: 'Veuillez entrer votre prénom' },
        { type: 'min', value: 2, message: 'Votre prénom doit contenir au moins 2 caractères' }
      ],
      nextStep: 'main_objective',
      estimatedTime: 1
    },

    // 🎯 ÉTAPE 3: OBJECTIF PRINCIPAL
    {
      id: 'main_objective',
      type: 'question',
      title: 'Parfait {firstName} ! 🌟',
      question: 'Quel est votre objectif principal ?',
      description: 'Cela m\'aidera à vous proposer les modules les plus adaptés',
      illustration: '🎯',
      inputType: 'single-select',
      options: MAIN_OBJECTIVES.map(obj => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
        icon: obj.icon,
        triggers: obj.modules
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif principal' }
      ],
      nextStep: 'module_selection',
      estimatedTime: 2
    },

    // 📦 ÉTAPE 4: SÉLECTION DES MODULES
    {
      id: 'module_selection',
      type: 'question',
      title: 'Modules recommandés pour vous',
      question: 'Quels aspects souhaitez-vous travailler ?',
      description: 'Basé sur votre objectif, voici mes recommandations. Vous pouvez ajuster selon vos besoins.',
      illustration: '📋',
      inputType: 'multi-select',
      options: AVAILABLE_MODULES.map(module => ({
        id: module.id,
        label: module.name,
        value: module.id,
        description: module.description,
        icon: module.icon,
        color: getModuleColor(module.id)
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner au moins un module' }
      ],
      nextStep: 'personal_info',
      estimatedTime: 3
    },

    // 👤 ÉTAPE 5: INFORMATIONS PERSONNELLES
    {
      id: 'personal_info',
      type: 'question',
      title: 'Quelques infos sur vous',
      question: 'Parlez-moi de vous pour personnaliser vos programmes',
      description: 'Ces informations sont confidentielles et sécurisées',
      illustration: '�',
      inputType: 'single-select', // On va gérer ça comme un formulaire personnalisé
      options: [
        { id: 'age', label: 'Âge', value: 'age' },
        { id: 'gender', label: 'Genre', value: 'gender' },
        { id: 'lifestyle', label: 'Style de vie', value: 'lifestyle' },
        { id: 'time', label: 'Temps disponible', value: 'time' }
      ],
      nextStep: (_, data) => {
        if (data.selectedModules?.includes('sport')) {
          return 'sport_selection';
        } else if (data.selectedModules?.includes('strength')) {
          return 'strength_setup';
        } else if (data.selectedModules?.includes('nutrition')) {
          return 'nutrition_setup';
        } else if (data.selectedModules?.includes('sleep')) {
          return 'sleep_setup';
        } else if (data.selectedModules?.includes('hydration')) {
          return 'hydration_setup';
        } else {
          return 'wellness_setup';
        }
      },
      estimatedTime: 3
    },

    // 🏃‍♂️ MODULE SPORT
    {
      id: 'sport_selection',
      type: 'question',
      title: 'Votre sport principal',
      question: 'Quel sport pratiquez-vous principalement ?',
      description: 'Cela m\'aidera à créer des programmes spécifiques',
      illustration: '🏃‍♂️',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: AVAILABLE_SPORTS.map(sport => ({
        id: sport.id,
        label: sport.name,
        value: sport.id,
        icon: sport.emoji
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre sport' }
      ],
      nextStep: 'sport_position',
      estimatedTime: 2
    },

    {
      id: 'sport_position',
      type: 'question',
      title: 'Votre position/spécialité',
      question: 'Quelle est votre position ou spécialité ?',
      description: 'Pour des programmes encore plus ciblés',
      illustration: '🎯',
      inputType: 'single-select',
      condition: (data) => !!(data.selectedModules?.includes('sport') && data.sport !== 'other'),
      options: [], // Sera rempli dynamiquement selon le sport
      nextStep: 'sport_level',
      estimatedTime: 1
    },

    {
      id: 'sport_level',
      type: 'question',
      title: 'Votre niveau sportif',
      question: 'Comment décririez-vous votre niveau ?',
      description: 'Soyez honnête, cela détermine l\'intensité de vos programmes',
      illustration: '📊',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: SPORT_LEVELS.map(level => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau' }
      ],
      nextStep: 'sport_equipment',
      estimatedTime: 1
    },

    {
      id: 'sport_equipment',
      type: 'question',
      title: 'Votre équipement',
      question: 'Quel équipement avez-vous à disposition ?',
      description: 'Je vais adapter vos programmes selon votre matériel',
      illustration: '🏋️‍♂️',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: EQUIPMENT_LEVELS.map(level => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau d\'équipement' }
      ],
      nextStep: (_, data) => {
        if (data.selectedModules?.includes('strength')) {
          return 'strength_setup';
        } else if (data.selectedModules?.includes('nutrition')) {
          return 'nutrition_setup';
        } else if (data.selectedModules?.includes('sleep')) {
          return 'sleep_setup';
        } else if (data.selectedModules?.includes('hydration')) {
          return 'hydration_setup';
        } else {
          return 'final_questions';
        }
      },
      estimatedTime: 1
    },

    // 💪 MODULE MUSCULATION
    {
      id: 'strength_setup',
      type: 'question',
      title: 'Objectif musculation',
      question: 'Quel est votre objectif principal en musculation ?',
      description: 'Cela déterminera le type d\'entraînement que je vous proposerai',
      illustration: '💪',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('strength') || false,
      options: STRENGTH_OBJECTIVES.map(obj => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif' }
      ],
      nextStep: 'strength_experience',
      estimatedTime: 2
    },

    {
      id: 'strength_experience',
      type: 'question',
      title: 'Votre expérience',
      question: 'Depuis combien de temps pratiquez-vous la musculation ?',
      description: 'Cela m\'aide à ajuster la complexité des exercices',
      illustration: '📈',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('strength') || false,
      options: FITNESS_EXPERIENCE_LEVELS.map(level => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau d\'expérience' }
      ],
      nextStep: (_, data) => {
        if (data.selectedModules?.includes('nutrition')) {
          return 'nutrition_setup';
        } else if (data.selectedModules?.includes('sleep')) {
          return 'sleep_setup';
        } else if (data.selectedModules?.includes('hydration')) {
          return 'hydration_setup';
        } else {
          return 'final_questions';
        }
      },
      estimatedTime: 1
    },

    // 🥗 MODULE NUTRITION
    {
      id: 'nutrition_setup',
      type: 'question',
      title: 'Vos préférences alimentaires',
      question: 'Quel type d\'alimentation vous correspond ?',
      description: 'Je vais personnaliser vos plans de repas selon vos préférences',
      illustration: '🥗',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      options: DIETARY_PREFERENCES.map(pref => ({
        id: pref.id,
        label: pref.name,
        value: pref.id,
        description: pref.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre préférence alimentaire' }
      ],
      nextStep: 'nutrition_objective',
      estimatedTime: 2
    },

    {
      id: 'nutrition_objective',
      type: 'question',
      title: 'Objectif nutritionnel',
      question: 'Que souhaitez-vous atteindre avec la nutrition ?',
      description: 'Cela détermine votre approche calorique et macro-nutritionnelle',
      illustration: '🎯',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      options: NUTRITION_OBJECTIVES.map(obj => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description
      })),
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif nutritionnel' }
      ],
      nextStep: (_, data) => {
        if (data.selectedModules?.includes('sleep')) {
          return 'sleep_setup';
        } else if (data.selectedModules?.includes('hydration')) {
          return 'hydration_setup';
        } else {
          return 'final_questions';
        }
      },
      estimatedTime: 1
    },

    // 😴 MODULE SOMMEIL
    {
      id: 'sleep_setup',
      type: 'question',
      title: 'Vos habitudes de sommeil',
      question: 'Combien d\'heures dormez-vous en moyenne par nuit ?',
      description: 'Le sommeil est crucial pour votre récupération et vos performances',
      illustration: '😴',
      inputType: 'slider',
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      validation: [
        { type: 'required', message: 'Veuillez indiquer votre durée de sommeil' },
        { type: 'min', value: 4, message: 'Durée minimum: 4 heures' },
        { type: 'max', value: 12, message: 'Durée maximum: 12 heures' }
      ],
      nextStep: 'sleep_difficulties',
      estimatedTime: 1
    },

    {
      id: 'sleep_difficulties',
      type: 'question',
      title: 'Qualité du sommeil',
      question: 'Rencontrez-vous des difficultés pour dormir ?',
      description: 'Je peux vous proposer des conseils pour améliorer votre sommeil',
      illustration: '🌙',
      inputType: 'toggle',
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      nextStep: (_, data) => {
        if (data.selectedModules?.includes('hydration')) {
          return 'hydration_setup';
        } else {
          return 'final_questions';
        }
      },
      estimatedTime: 1
    },

    // 💧 MODULE HYDRATATION
    {
      id: 'hydration_setup',
      type: 'question',
      title: 'Votre hydratation',
      question: 'Quel est votre objectif d\'hydratation quotidien ?',
      description: 'Une bonne hydratation améliore vos performances et votre récupération',
      illustration: '💧',
      inputType: 'slider',
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      validation: [
        { type: 'required', message: 'Veuillez définir votre objectif d\'hydratation' },
        { type: 'min', value: 1, message: 'Minimum: 1 litre par jour' },
        { type: 'max', value: 5, message: 'Maximum: 5 litres par jour' }
      ],
      nextStep: 'hydration_reminders',
      estimatedTime: 1
    },

    {
      id: 'hydration_reminders',
      type: 'question',
      title: 'Rappels d\'hydratation',
      question: 'Souhaitez-vous recevoir des rappels pour boire ?',
      description: 'Je peux vous envoyer des notifications intelligentes',
      illustration: '🔔',
      inputType: 'toggle',
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      nextStep: 'final_questions',
      estimatedTime: 1
    },

    // 📝 QUESTIONS FINALES
    {
      id: 'final_questions',
      type: 'question',
      title: 'Dernières questions',
      question: 'Partagez votre motivation principale',
      description: 'Qu\'est-ce qui vous motive le plus dans cette démarche ?',
      illustration: '🔥',
      inputType: 'text',
      validation: [
        { type: 'required', message: 'Veuillez partager votre motivation' }
      ],
      nextStep: 'privacy_consent',
      estimatedTime: 2
    },

    // 🔒 CONSENTEMENTS
    {
      id: 'privacy_consent',
      type: 'question',
      title: 'Confidentialité et consentements',
      question: 'Acceptez-vous nos conditions d\'utilisation ?',
      description: 'Vos données sont sécurisées et ne sont jamais vendues',
      illustration: '🔒',
      inputType: 'toggle',
      validation: [
        { type: 'required', message: 'Vous devez accepter les conditions pour continuer' }
      ],
      nextStep: 'summary',
      estimatedTime: 1
    },

    // 📋 RÉSUMÉ FINAL
    {
      id: 'summary',
      type: 'summary',
      title: 'Votre profil est prêt ! 🎉',
      description: 'Voici un résumé de votre configuration',
      illustration: '✨',
      nextStep: 'completion',
      estimatedTime: 2
    },

    // ✅ FINALISATION
    {
      id: 'completion',
      type: 'confirmation',
      title: 'Bienvenue dans MyFitHero !',
      description: 'Votre parcours personnalisé vous attend',
      illustration: '🚀',
      estimatedTime: 1
    }
  ]
};

// Fonction utilitaire pour les couleurs des modules
function getModuleColor(moduleId: string): string {
  const colors: Record<string, string> = {
    sport: '#3B82F6',
    strength: '#EF4444',
    nutrition: '#10B981',
    sleep: '#8B5CF6',
    hydration: '#06B6D4',
    wellness: '#F59E0B'
  };
  return colors[moduleId] || '#6B7280';
}

// Fonction pour obtenir les prochaines étapes selon les modules sélectionnés
export function getNextStepForModules(selectedModules: string[], currentModule?: string): string {
  const moduleOrder = ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'];
  
  if (!currentModule) {
    // Trouve le premier module sélectionné
    for (const module of moduleOrder) {
      if (selectedModules.includes(module)) {
        return `${module}_setup`;
      }
    }
    return 'final_questions';
  }
  
  // Trouve le prochain module sélectionné
  const currentIndex = moduleOrder.indexOf(currentModule);
  for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
    if (selectedModules.includes(moduleOrder[i])) {
      return `${moduleOrder[i]}_setup`;
    }
  }
  
  return 'final_questions';
}

// Fonction pour calculer le temps estimé selon les modules sélectionnés
export function calculateEstimatedTime(selectedModules: string[]): number {
  const baseTime = 5; // Minutes pour les étapes de base
  const moduleTime: Record<string, number> = {
    sport: 4,
    strength: 2,
    nutrition: 3,
    sleep: 2,
    hydration: 2,
    wellness: 2
  };
  
  let totalTime = baseTime;
  selectedModules.forEach(module => {
    totalTime += moduleTime[module] || 0;
  });
  
  return totalTime;
}
