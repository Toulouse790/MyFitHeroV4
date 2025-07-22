// client/src/data/conversationalFlow.ts
import { ConversationalFlow, ConversationalStep } from '@/types/conversationalOnboarding';
import {
  MAIN_OBJECTIVES,
  AVAILABLE_MODULES,
  AVAILABLE_SPORTS,
  DIETARY_PREFERENCES,
  STRENGTH_OBJECTIVES,
  NUTRITION_OBJECTIVES,
  EQUIPMENT_LEVELS,
  SPORT_LEVELS,
  FITNESS_EXPERIENCE_LEVELS,
} from './onboardingData';
import { ModuleId } from './packs';               // ✅ nouveau

/* -------------------------------------------------------------------------- */
/*                                FLOW GLOBAL                                 */
/* -------------------------------------------------------------------------- */

export const CONVERSATIONAL_ONBOARDING_FLOW: ConversationalFlow = {
  id: 'myfithero_onboarding_v4',
  name: 'MyFitHero - AI-Powered Wellness Journey',
  description: 'Personalized onboarding powered by AI',
  estimatedDuration: 15, // n’est plus affiché, conservé pour référence
  modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'],
  initialStep: 'welcome',
  steps: [
    /* ------------------------------- WELCOME ------------------------------ */
    {
      id: 'welcome',
      type: 'info',
      title: 'Welcome to MyFitHero! 🎉',
      subtitle: 'Your AI-Powered Wellness Coach',
      description: "I'll help you build your personalized program in just a few minutes.",
      illustration: '🏆',
      tips: [
        'Answer honestly for best results',
        'You can change your choices anytime',
        'Takes about 10‑15 minutes',
      ],
      estimatedTime: 1,
      nextStep: 'get_name',
    },

    /* ------------------------------- NAME -------------------------------- */
    {
      id: 'get_name',
      type: 'question',
      title: "Let's get acquainted!",
      question: 'What should I call you?',
      description: 'Your name helps us personalize your experience',
      illustration: '👋',
      inputType: 'text',
      validation: [
        { type: 'required', message: 'Please enter your name' },
        { type: 'min', value: 2, message: 'Name must be at least 2 characters' },
      ],
      nextStep: 'main_objective',
      estimatedTime: 1,
    },

    /* --------------------------- MAIN OBJECTIVE -------------------------- */
    {
      id: 'main_objective',
      type: 'question',
      title: 'Great {firstName}! 🌟',
      question: "What's your primary goal?",
      description: 'This helps me recommend the perfect modules for you',
      illustration: '🎯',
      inputType: 'single-select',
      options: MAIN_OBJECTIVES.map((obj) => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
        icon: obj.icon,
        triggers: obj.modules,
      })),
      validation: [{ type: 'required', message: 'Please select your main goal' }],
      nextStep: 'module_selection',
      estimatedTime: 2,
    },

    /* --------------------------- MODULE SELECTION ------------------------ */
    {
      id: 'module_selection',
      type: 'question',
      title: 'Build Your Perfect Program',
      question: 'Which areas would you like to focus on?',
      description:
        'Based on your goals, here are our AI‑powered recommendations. Each module adapts to your progress.',
      illustration: '📋',
      inputType: 'multi-select',
      options: AVAILABLE_MODULES.map((module) => ({
        id: module.id,
        label: module.name,
        value: module.id,
        description: module.description,
        icon: module.icon,
        color: getModuleColor(module.id),
      })),
      validation: [{ type: 'required', message: 'Please select at least one module' }],
      nextStep: (response) => {
        const selectedModules = response as string[];
        if (!selectedModules.includes('nutrition') || !selectedModules.includes('sleep')) {
          return 'module_upsell';
        }
        return 'personal_info';
      },
      estimatedTime: 3,
    },

    /* ------------------------------ UPSELL ------------------------------- */
    {
      id: 'module_upsell',
      type: 'question',
      title: 'Unlock 3x Faster Results! 🚀',
      question: 'Our AI agents work together for maximum impact',
      description: 'Studies show combining modules increases success rate by 73%',
      illustration: '🎁',
      inputType: 'single-select',
      options: [
        {
          id: 'accept_trial',
          label: '✅ Yes! Activate my 15‑day FREE trial',
          value: 'accept',
          description: '🔥 No credit card • Cancel anytime • $0 today',
          icon: '🎯',
        },
        {
          id: 'decline_trial',
          label: 'No thanks, continue with selected modules',
          value: 'decline',
          description: 'You can always upgrade later',
          icon: '➡️',
        },
      ],
      nextStep: 'personal_info',
      estimatedTime: 1,
    },

    /* ---------------------------- PERSONAL INFO -------------------------- */
    {
      id: 'personal_info',
      type: 'question',
      title: 'Tell me about yourself',
      question: 'Help me personalize your programs',
      description: 'Your information is secure and private',
      illustration: '📊',
      inputType: 'single-select',
      options: [
        { id: 'age', label: 'Age', value: 'age' },
        { id: 'gender', label: 'Gender', value: 'gender' },
        { id: 'lifestyle', label: 'Lifestyle', value: 'lifestyle' },
        { id: 'time', label: 'Available time', value: 'time' },
      ],
      nextStep: (_, data) => getNextStepForModules(data.selectedModules ?? []),
      estimatedTime: 3,
    },

    /* ========================= SPORT MODULE ============================= */
    {
      id: 'sport_selection',
      requiredModules: ['sport'],                // ✅ nouveau
      type: 'question',
      title: 'Your main sport',
      question: 'What sport do you primarily practice?',
      description: 'This helps me create sport‑specific programs',
      illustration: '🏃‍♂️',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: AVAILABLE_SPORTS.map((sport) => ({
        id: sport.id,
        label: sport.name,
        value: sport.id,
        icon: sport.emoji,
      })),
      validation: [{ type: 'required', message: 'Please select your sport' }],
      nextStep: 'sport_position',
      estimatedTime: 2,
    },

    {
      id: 'sport_position',
      requiredModules: ['sport'],                // ✅
      type: 'question',
      title: 'Your position/specialty',
      question: "What's your position or specialty?",
      description: 'For even more targeted programs',
      illustration: '🎯',
      inputType: 'single-select',
      condition: (data) =>
        !!(data.selectedModules?.includes('sport') && data.sport !== 'other'),
      options: [], // Filled dynamically
      nextStep: 'sport_level',
      estimatedTime: 1,
    },

    {
      id: 'sport_level',
      requiredModules: ['sport'],                // ✅
      type: 'question',
      title: 'Your sport level',
      question: 'How would you describe your level?',
      description: 'Be honest, this determines your program intensity',
      illustration: '📊',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: SPORT_LEVELS.map((level) => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
      })),
      validation: [{ type: 'required', message: 'Please select your level' }],
      nextStep: 'sport_equipment',
      estimatedTime: 1,
    },

    {
      id: 'sport_equipment',
      requiredModules: ['sport'],                // ✅
      type: 'question',
      title: 'Your equipment',
      question: 'What equipment do you have access to?',
      description: "I'll adapt programs to your available equipment",
      illustration: '🏋️‍♂️',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('sport') || false,
      options: EQUIPMENT_LEVELS.map((level) => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
      })),
      validation: [{ type: 'required', message: 'Please select your equipment level' }],
      nextStep: (_, data) => getNextStepForModules(data.selectedModules ?? [], 'sport'),
      estimatedTime: 1,
    },

    /* ========================= STRENGTH MODULE ========================== */
    {
      id: 'strength_setup',
      requiredModules: ['strength'],             // ✅
      type: 'question',
      title: 'Strength training goal',
      question: "What's your main strength objective?",
      description: 'This determines your training style',
      illustration: '💪',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('strength') || false,
      options: STRENGTH_OBJECTIVES.map((obj) => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
      })),
      validation: [{ type: 'required', message: 'Please select your objective' }],
      nextStep: 'strength_experience',
      estimatedTime: 2,
    },

    {
      id: 'strength_experience',
      requiredModules: ['strength'],             // ✅
      type: 'question',
      title: 'Your experience',
      question: 'How long have you been strength training?',
      description: 'This helps adjust exercise complexity',
      illustration: '📈',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('strength') || false,
      options: FITNESS_EXPERIENCE_LEVELS.map((level) => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
      })),
      validation: [{ type: 'required', message: 'Please select your experience level' }],
      nextStep: (_, data) => getNextStepForModules(data.selectedModules ?? [], 'strength'),
      estimatedTime: 1,
    },

    /* ======================== NUTRITION MODULE ========================== */
    {
      id: 'nutrition_setup',
      requiredModules: ['nutrition'],            // ✅
      type: 'question',
      title: 'Your dietary preferences',
      question: 'What type of diet suits you?',
      description: 'I\'ll personalize meal plans to your preferences',
      illustration: '🥗',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      options: DIETARY_PREFERENCES.map((pref) => ({
        id: pref.id,
        label: pref.name,
        value: pref.id,
        description: pref.description,
      })),
      validation: [{ type: 'required', message: 'Please select your dietary preference' }],
      nextStep: 'nutrition_objective',
      estimatedTime: 2,
    },

    {
      id: 'nutrition_objective',
      requiredModules: ['nutrition'],            // ✅
      type: 'question',
      title: 'Nutrition goal',
      question: 'What do you want to achieve with nutrition?',
      description: 'This determines your caloric and macro approach',
      illustration: '🎯',
      inputType: 'single-select',
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      options: NUTRITION_OBJECTIVES.map((obj) => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
      })),
      validation: [{ type: 'required', message: 'Please select your nutrition goal' }],
      nextStep: (_, data) => getNextStepForModules(data.selectedModules ?? [], 'nutrition'),
      estimatedTime: 1,
    },

    /* ========================== SLEEP MODULE ============================ */
    {
      id: 'sleep_setup',
      requiredModules: ['sleep'],                // ✅
      type: 'question',
      title: 'Your sleep habits',
      question: 'How many hours do you sleep on average?',
      description: 'Sleep is crucial for recovery and performance',
      illustration: '😴',
      inputType: 'slider',
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      validation: [
        { type: 'required', message: 'Please indicate your sleep duration' },
        { type: 'min', value: 4, message: 'Minimum: 4 hours' },
        { type: 'max', value: 12, message: 'Maximum: 12 hours' },
      ],
      nextStep: 'sleep_difficulties',
      estimatedTime: 1,
    },

    {
      id: 'sleep_difficulties',
      requiredModules: ['sleep'],                // ✅
      type: 'question',
      title: 'Sleep quality',
      question: 'Do you have trouble sleeping?',
      description: 'I can provide tips to improve your sleep',
      illustration: '🌙',
      inputType: 'toggle',
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      nextStep: (_, data) => getNextStepForModules(data.selectedModules ?? [], 'sleep'),
      estimatedTime: 1,
    },

    /* ======================== HYDRATION MODULE ========================== */
    {
      id: 'hydration_setup',
      requiredModules: ['hydration'],            // ✅
      type: 'question',
      title: 'Your hydration',
      question: "What's your daily hydration goal?",
      description: 'Good hydration improves performance and recovery',
      illustration: '💧',
      inputType: 'slider',
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      validation: [
        { type: 'required', message: 'Please set your hydration goal' },
        { type: 'min', value: 1, message: 'Minimum: 1 liter per day' },
        { type: 'max', value: 5, message: 'Maximum: 5 liters per day' },
      ],
      nextStep: 'hydration_reminders',
      estimatedTime: 1,
    },

    {
      id: 'hydration_reminders',
      requiredModules: ['hydration'],            // ✅
      type: 'question',
      title: 'Hydration reminders',
      question: 'Would you like smart hydration reminders?',
      description: 'I can send notifications based on your activity',
      illustration: '🔔',
      inputType: 'toggle',
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      nextStep: 'final_questions',
      estimatedTime: 1,
    },

    /* --------------------------- FINAL QUESTIONS ------------------------ */
    {
      id: 'final_questions',
      type: 'question',
      title: 'Last questions',
      question: 'Share your main motivation',
      description: 'What drives you most in this journey?',
      illustration: '🔥',
      inputType: 'text',
      validation: [{ type: 'required', message: 'Please share your motivation' }],
      nextStep: 'privacy_consent',
      estimatedTime: 2,
    },

    /* ------------------------------ CONSENT ----------------------------- */
    {
      id: 'privacy_consent',
      type: 'question',
      title: 'Privacy & Terms',
      question: 'Accept our terms of service?',
      description: 'Your data is secure and never sold',
      illustration: '🔒',
      inputType: 'toggle',
      validation: [{ type: 'required', message: 'You must accept the terms to continue' }],
      nextStep: 'summary',
      estimatedTime: 1,
    },

    /* ------------------------------ SUMMARY ----------------------------- */
    {
      id: 'summary',
      type: 'summary',
      title: 'Your profile is ready! 🎉',
      description: "Here's your configuration summary",
      illustration: '✨',
      nextStep: 'completion',
      estimatedTime: 2,
    },

    /* ---------------------------- COMPLETION --------------------------- */
    {
      id: 'completion',
      type: 'confirmation',
      title: 'Welcome to MyFitHero!',
      description: 'Your personalized journey awaits',
      illustration: '🚀',
      estimatedTime: 1,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                          HELPERS ET UTILITAIRES                            */
/* -------------------------------------------------------------------------- */

// Couleur par module (badge UI)
function getModuleColor(moduleId: string): string {
  const colors: Record<string, string> = {
    sport: '#3B82F6',
    strength: '#EF4444',
    nutrition: '#10B981',
    sleep: '#8B5CF6',
    hydration: '#06B6D4',
    wellness: '#F59E0B',
  };
  return colors[moduleId] || '#6B7280';
}

/**
 * Renvoie l’identifiant de la prochaine étape spécifique à un module
 * en fonction de l’ordre prédéfini.
 */
export function getNextStepForModules(
  selectedModules: string[],
  currentModule?: string
): string {
  const moduleOrder = ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'];

  if (!currentModule) {
    for (const mod of moduleOrder) {
      if (selectedModules.includes(mod)) return `${mod}_setup`;
    }
    return 'final_questions';
  }

  const idx = moduleOrder.indexOf(currentModule);
  for (let i = idx + 1; i < moduleOrder.length; i++) {
    if (selectedModules.includes(moduleOrder[i])) return `${moduleOrder[i]}_setup`;
  }
  return 'final_questions';
}

/* ----------- Filtrage dynamique des étapes selon les modules ------------- */
export const filterStepsByModules = (steps: ConversationalStep[], modules: ModuleId[]) =>
  steps.filter(
    (s) => !('requiredModules' in s) || !s.requiredModules || s.requiredModules.some((m) => modules.includes(m as ModuleId))
  );
