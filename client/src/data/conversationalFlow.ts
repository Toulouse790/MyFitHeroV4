// client/src/data/conversationalFlow.ts
import type { 
  ConversationalFlow, 
  ConversationalStep, 
  OnboardingData,
  StepNextFunction,
  StepConditionFunction,
  QuestionOption
} from '@/types/conversationalOnboarding';
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
  LIFESTYLE_OPTIONS,
  SEASON_PERIODS,
  TRAINING_AVAILABILITY,
  HEALTH_CONDITIONS,
  DEFAULT_ONBOARDING_CONFIG
} from './onboardingData';
import { ModuleId } from './packs';

/* ================================================================== */
/*                     CONFIGURATION PRINCIPALE                        */
/* ================================================================== */

export const CONVERSATIONAL_ONBOARDING_FLOW: ConversationalFlow = {
  id: 'myfithero_onboarding_v4_ai',
  name: 'MyFitHero - AI-Powered Wellness Journey',
  version: '4.2.0',
  description: 'Onboarding conversationnel optimisé par IA avec recommandations personnalisées et flux adaptatifs',
  author: 'MyFitHero Team',
  modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'],
  languages: ['fr', 'en'],
  initialStep: 'welcome',
  fallbackStep: 'error_recovery',
  errorStep: 'technical_error',
  
  // Configuration IA intégrée
  aiConfig: {
    enabled: true,
    model: 'gpt-4',
    prompts: {
      recommendation: 'Analyze user profile and suggest optimal modules',
      personalization: 'Customize flow based on user responses',
      validation: 'Validate user inputs for consistency'
    },
    confidenceThreshold: 0.8
  },
  
  // Analytics et tracking
  analytics: {
    enabled: true,
    events: [
      'step_started',
      'step_completed', 
      'step_skipped',
      'validation_error',
      'ai_recommendation_shown',
      'flow_completed',
      'flow_abandoned'
    ],
    customDimensions: {
      user_segment: 'fitness_level',
      acquisition_source: 'utm_source',
      device_type: 'mobile_desktop'
    }
  },
  
  // Branding et personnalisation
  theme: 'myfithero_v4',
  branding: {
    logo: '/assets/myfithero-logo.svg',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626'
    },
    fonts: {
      primary: 'Inter',
      heading: 'Cal Sans'
    }
  },
  
  createdAt: new Date('2024-07-01'),
  updatedAt: new Date('2025-07-23'),
  publishedAt: new Date('2025-07-01'),
  
  steps: [
    /* ============================= WELCOME ============================= */
    {
      id: 'welcome',
      type: 'welcome',
      version: '1.0.0',
      title: 'Bienvenue dans MyFitHero ! 🎉',
      subtitle: 'Votre Coach Bien-être Personnel alimenté par IA',
      description: "Je vais vous aider à créer votre programme personnalisé en quelques minutes grâce à l'intelligence artificielle.",
      illustration: '🏆',
      
      tips: [
        'Répondez honnêtement pour obtenir les meilleurs résultats',
        'L\'IA s\'adapte à vos réponses en temps réel',
        'Vous pourrez modifier vos choix à tout moment',
        'Toutes vos données sont chiffrées et sécurisées'
      ],
      
      nextStep: 'get_name',
      estimatedTime: 60,
      backable: false,
      skippable: false,
      
      trackingEvents: ['onboarding_started', 'welcome_screen_viewed'],
      aiHints: ['user_acquisition_context', 'device_capabilities'],
      
      ariaLabel: 'Page d\'accueil de l\'onboarding MyFitHero',
      mobileLayout: 'stack',
      desktopLayout: 'cards'
    },

    /* ============================== NAME =============================== */
    {
      id: 'get_name',
      type: 'question',
      title: "Faisons connaissance ! 👋",
      question: 'Comment souhaitez-vous que je vous appelle ?',
      description: 'Votre prénom m\'aide à personnaliser votre expérience',
      illustration: '😊',
      inputType: 'text',
      placeholder: 'Votre prénom...',
      maxLength: 50,
      minLength: 2,
      
      validation: [
        { type: 'required', message: 'Veuillez saisir votre prénom' },
        { type: 'minLength', value: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
        { type: 'maxLength', value: 50, message: 'Le prénom ne peut pas dépasser 50 caractères' },
        { type: 'pattern', regex: /^[a-zA-ZÀ-ÿ\\s\\-']+$/, message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes' }
      ],
      
      nextStep: 'main_objective',
      estimatedTime: 30,
      backable: true,
      
      tips: [
        'Utilisez le prénom que vous préférez',
        'Il sera utilisé dans tous vos programmes personnalisés'
      ],
      
      trackingEvents: ['name_entered'],
      aiHints: ['personalization_start'],
      
      ariaLabel: 'Saisie du prénom utilisateur',
      sensitive: false
    },

    /* ========================= MAIN OBJECTIVE ========================== */
    {
      id: 'main_objective',
      type: 'question',
      title: 'Parfait {firstName} ! 🌟',
      question: "Quel est votre objectif principal ?",
      description: 'L\\'IA va analyser votre réponse pour recommander les modules parfaits pour vous',
      illustration: '🎯',
      inputType: 'single-select',
      searchable: false,
      
      options: MAIN_OBJECTIVES.map((objective): QuestionOption => ({
        id: objective.id,
        label: objective.name,
        value: objective.id,
        description: objective.description,
        icon: objective.icon,
        category: 'objective',
        metadata: {
          recommendedModules: objective.recommended_modules,
          priority: objective.priority
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif principal' }
      ],
      
      nextStep: 'ai_analysis',
      estimatedTime: 120,
      backable: true,
      
      tips: [
        'Choisissez l\\'objectif qui vous motive le plus',
        'L\\'IA adaptera automatiquement les recommandations',
        'Vous pourrez avoir des objectifs secondaires plus tard'
      ],
      
      trackingEvents: ['main_objective_selected', 'ai_recommendation_triggered'],
      aiHints: ['analyze_user_motivation', 'predict_module_preferences'],
      
      ariaLabel: 'Sélection de l\'objectif principal',
      mobileLayout: 'stack',
      desktopLayout: 'grid'
    },

    /* ========================= PACK SELECTION ========================== */
    {
      id: 'pack_selection',
      type: 'question',
      title: 'Choisissez votre programme',
      question: 'Quel type de programme vous correspond le mieux ?',
      description: 'Nous avons préparé des packs adaptés à différents objectifs',
      inputType: 'custom',
      customComponent: 'PackSelector',
      illustration: '📦',
      importance: 'critical',
      skippable: false,
      validation: [
        { type: 'required', message: 'Veuillez sélectionner un pack' }
      ],
      nextStep: (packId: string) => {
        return packId === 'custom' ? 'module_selection' : 'personal_info';
      },
      estimatedTime: 90,
      backable: true,
      
      trackingEvents: ['pack_selected'],
      aiHints: ['track_pack_preference'],
      
      ariaLabel: 'Sélection du pack de programme'
    },

    /* ========================== AI ANALYSIS ========================== */
    {
      id: 'ai_analysis',
      type: 'loading',
      title: 'L\'IA analyse votre profil... 🤖',
      description: 'Création de recommandations personnalisées basées sur votre objectif',
      illustration: '⚡',
      
      nextStep: 'ai_recommendations',
      estimatedTime: 15,
      autoAdvance: true,
      autoAdvanceDelay: 3000,
      backable: false,
      skippable: false,
      
      trackingEvents: ['ai_analysis_started'],
      aiHints: ['process_user_objective', 'generate_recommendations'],
      
      ariaLabel: 'Traitement des recommandations par IA'
    },

    /* ======================= AI RECOMMENDATIONS ==================== */
    {
      id: 'ai_recommendations',
      type: 'question',
      title: 'Recommandations IA Personnalisées 🎯',
      question: 'Basé sur votre objectif, voici mes recommandations intelligentes',
      description: 'L\\'IA a analysé des milliers de profils similaires pour ces suggestions optimales',
      illustration: '🧠',
      inputType: 'multi-select',
      maxSelections: 6,
      
      options: AVAILABLE_MODULES.map((module): QuestionOption => ({
        id: module.id,
        label: module.name,
        value: module.id,
        description: module.description,
        icon: module.icon,
        badge: getAIRecommendationBadge(module.id),
        color: getModuleColor(module.id),
        priority: getModulePriority(module.id),
        category: 'module',
        metadata: {
          aiScore: getAIScore(module.id),
          benefits: module.benefits,
          estimatedImpact: getEstimatedImpact(module.id)
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner au moins un module' },
        { type: 'array', minItems: 1, maxItems: 6, message: 'Sélectionnez entre 1 et 6 modules' }
      ],
      
      nextStep: createConditionalNextStep([
        { condition: (data) => !data.selectedModules?.includes('nutrition'), step: 'nutrition_upsell' },
        { condition: (data) => !data.selectedModules?.includes('sleep'), step: 'sleep_upsell' },
        { condition: () => true, step: 'personal_info' }
      ]),
      
      estimatedTime: 180,
      backable: true,
      
      tips: [
        'Les modules recommandés sont basés sur l\\'analyse IA de votre profil',
        'Plus vous sélectionnez de modules, plus les résultats sont synergiques',
        'Vous pourrez activer d\'autres modules plus tard dans l\'application'
      ],
      
      warnings: [
        'Sélectionner trop de modules peut diviser votre attention'
      ],
      
      trackingEvents: ['ai_recommendations_shown', 'modules_selected'],
      aiHints: ['track_selection_patterns', 'optimize_recommendations'],
      
      ariaLabel: 'Sélection des modules recommandés par IA',
      importance: 'critical',
      mobileLayout: 'stack',
      desktopLayout: 'grid'
    },

    /* ========================== UPSELLS ========================== */
    {
      id: 'nutrition_upsell',
      type: 'question',
      title: 'Boostez vos résultats de 67% ! 🚀',
      question: 'La nutrition représente 70% de vos résultats',
      description: 'L\'IA peut créer des plans alimentaires personnalisés qui s\'adaptent à vos goûts et contraintes',
      illustration: '🥗',
      inputType: 'single-select',
      
      condition: (data) => !data.selectedModules?.includes('nutrition'),
      
      options: [
        {
          id: 'add_nutrition',
          label: '✅ Oui ! Ajouter la Nutrition IA',
          value: 'add_nutrition',
          description: '🔥 Plans personnalisés • Recettes adaptées • Suivi intelligent',
          icon: '🎯',
          badge: 'Recommandé IA',
          color: '#10B981'
        },
        {
          id: 'skip_nutrition',
          label: 'Non merci, continuer sans nutrition',
          value: 'skip_nutrition',
          description: 'Vous pourrez l\\'ajouter plus tard',
          icon: '➡️',
          color: '#6B7280'
        }
      ],
      
      nextStep: createConditionalNextStep([
        { 
          condition: (response) => response === 'add_nutrition', 
          step: 'personal_info',
          action: (data) => ({
            ...data,
            selectedModules: [...(data.selectedModules || []), 'nutrition']
          })
        },
        { condition: () => true, step: 'personal_info' }
      ]),
      
      estimatedTime: 45,
      backable: true,
      skippable: true,
      
      trackingEvents: ['nutrition_upsell_shown', 'upsell_response'],
      aiHints: ['track_upsell_effectiveness', 'personalize_upsell_message'],
      
      ariaLabel: 'Proposition d\\'ajout du module nutrition'
    },

    {
      id: 'sleep_upsell',
      type: 'question',
      title: 'Optimisez votre récupération ! 😴',
      question: 'Le sommeil améliore vos performances de 43%',
      description: 'L\'IA peut analyser votre sommeil et suggérer des améliorations personnalisées',
      illustration: '🌙',
      inputType: 'single-select',
      
      condition: (data) => !data.selectedModules?.includes('sleep'),
      
      options: [
        {
          id: 'add_sleep',
          label: '✅ Oui ! Optimiser mon Sommeil IA',
          value: 'add_sleep',
          description: '🌟 Analyse personnalisée • Conseils adaptatifs • Suivi automatique',
          icon: '🎯',
          badge: 'Recommandé IA',
          color: '#8B5CF6'
        },
        {
          id: 'skip_sleep',
          label: 'Non merci, continuer sans optimisation du sommeil',
          value: 'skip_sleep',
          description: 'Disponible plus tard dans l\'application',
          icon: '➡️',
          color: '#6B7280'
        }
      ],
      
      nextStep: createConditionalNextStep([
        { 
          condition: (response) => response === 'add_sleep', 
          step: 'personal_info',
          action: (data) => ({
            ...data,
            selectedModules: [...(data.selectedModules || []), 'sleep']
          })
        },
        { condition: () => true, step: 'personal_info' }
      ]),
      
      estimatedTime: 45,
      backable: true,
      skippable: true,
      
      trackingEvents: ['sleep_upsell_shown', 'upsell_response'],
      aiHints: ['track_upsell_effectiveness', 'personalize_sleep_benefits'],
      
      ariaLabel: 'Proposition d\'ajout du module sommeil'
    },

    /* ========================= PERSONAL INFO ======================= */
    {
      id: 'personal_info',
      type: 'form',
      title: 'Parlons de vous 📊',
      question: 'Aidez l\'IA à personnaliser vos programmes',
      description: 'Ces informations permettent des recommandations ultra-précises et sécurisées',
      illustration: '👤',
      inputType: 'single-select',
      customComponent: 'PersonalInfoForm',
      
      customProps: {
        fields: ['age', 'gender', 'height', 'currentWeight', 'lifestyle', 'availableTimePerDay'],
        layout: 'adaptive',
        validation: 'strict'
      },
      
      validation: [
        { type: 'required', message: 'Veuillez compléter les informations demandées' },
        { type: 'custom', message: 'Âge invalide', validator: (data) => data.age >= 13 && data.age <= 100 },
        { type: 'custom', message: 'Temps disponible requis', validator: (data) => data.availableTimePerDay >= 15 }
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || []),
      estimatedTime: 180,
      backable: true,
      
      tips: [
        'Vos données sont chiffrées et ne sont jamais partagées',
        'Plus les informations sont précises, meilleurs sont les résultats',
        'Vous pouvez modifier ces informations à tout moment'
      ],
      
      trackingEvents: ['personal_info_completed', 'user_profile_created'],
      aiHints: ['calculate_user_profile', 'determine_program_intensity'],
      
      ariaLabel: 'Formulaire d\'informations personnelles',
      sensitive: true,
      encrypted: true,
      gdprCategory: 'personal_data',
      
      importance: 'high'
    },

    /* ========================= MODULE: SPORT ========================= */
    {
      id: 'sport_selection',
      type: 'question',
      requiredModules: ['sport'],
      title: 'Votre sport principal 🏃‍♂️',
      question: 'Quel sport pratiquez-vous principalement ?',
      description: 'L\'IA créera des programmes spécifiques à votre discipline',
      illustration: '⚽',
      inputType: 'single-select',
      searchable: true,
      customComponent: 'SportSelector',
      
      condition: (data) => data.selectedModules?.includes('sport') || false,
      
      apiEndpoint: '/api/sports',
      cacheKey: 'available_sports',
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre sport principal' }
      ],
      
      nextStep: createConditionalNextStep([
        { condition: (response) => response !== 'other', step: 'sport_position' },
        { condition: () => true, step: 'sport_level' }
      ]),
      
      estimatedTime: 90,
      backable: true,
      
      tips: [
        'Si votre sport n\'apparaît pas, tapez son nom pour le rechercher',
        'Sélectionnez "Autre sport" si vous ne le trouvez pas'
      ],
      
      trackingEvents: ['sport_selected', 'sport_search_used'],
      aiHints: ['analyze_sport_requirements', 'predict_training_needs'],
      
      ariaLabel: 'Sélection du sport principal',
      mobileLayout: 'stack'
    },

    {
      id: 'sport_position',
      type: 'question',
      requiredModules: ['sport'],
      title: 'Votre poste/spécialité 🎯',
      question: "Quel est votre poste ou votre spécialité ?",
      description: 'Pour des programmes encore plus ciblés et efficaces',
      illustration: '🎯',
      inputType: 'single-select',
      customComponent: 'PositionSelector',
      
      condition: (data) => !!(data.selectedModules?.includes('sport') && data.sport !== 'other'),
      dependencies: ['sport_selection'],
      
      options: [], / Rempli dynamiquement selon le sport
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre position' }
      ],
      
      nextStep: 'sport_level',
      estimatedTime: 60,
      backable: true,
      
      trackingEvents: ['sport_position_selected'],
      aiHints: ['refine_sport_specialization'],
      
      ariaLabel: 'Sélection de la position sportive'
    },

    {
      id: 'sport_level',
      type: 'question',
      requiredModules: ['sport'],
      title: 'Votre niveau sportif 📊',
      question: 'Comment décririez-vous votre niveau ?',
      description: 'Soyez honnête, cela détermine l\'intensité de vos programmes',
      illustration: '📈',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('sport') || false,
      
      options: SPORT_LEVELS.map((level): QuestionOption => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
        icon: level.icon,
        metadata: {
          trainingFrequency: level.training_frequency,
          competitionLevel: level.competition_level
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau' }
      ],
      
      nextStep: 'sport_season',
      estimatedTime: 60,
      backable: true,
      
      tips: [
        'Un niveau mal évalué peut conduire à des blessures ou à l\'ennui',
        'Vous pourrez ajuster votre niveau en fonction de vos progrès'
      ],
      
      trackingEvents: ['sport_level_selected'],
      aiHints: ['calibrate_program_intensity', 'assess_injury_risk'],
      
      ariaLabel: 'Sélection du niveau sportif'
    },

    {
      id: 'sport_season',
      type: 'question',
      requiredModules: ['sport'],
      title: 'Période de saison 🗓️',
      question: 'Dans quelle période vous trouvez-vous actuellement ?',
      description: 'L\'IA adaptera l\'intensité et le focus de vos entraînements',
      illustration: '📅',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('sport') && data.sportLevel !== 'recreational',
      
      options: SEASON_PERIODS.map((period): QuestionOption => ({
        id: period.id,
        label: period.name,
        value: period.id,
        description: period.description,
        icon: period.icon,
        metadata: {
          focus: period.focus,
          durationWeeks: period.duration_weeks
        }
      })),
      
      nextStep: 'sport_equipment',
      estimatedTime: 45,
      backable: true,
      skippable: true,
      skipLabel: 'Pas de saison spécifique',
      
      trackingEvents: ['sport_season_selected'],
      aiHints: ['periodize_training_plan'],
      
      ariaLabel: 'Sélection de la période de saison'
    },

    {
      id: 'sport_equipment',
      type: 'question',
      requiredModules: ['sport'],
      title: 'Votre équipement 🏋️‍♂️',
      question: 'À quel équipement avez-vous accès ?',
      description: 'L\'IA adaptera les exercices à votre matériel disponible',
      illustration: '🎪',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('sport') || false,
      
      options: EQUIPMENT_LEVELS.map((level): QuestionOption => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
        icon: level.icon,
        metadata: {
          availableEquipment: level.available_equipment
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau d\\'équipement' }
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'sport'),
      estimatedTime: 60,
      backable: true,
      
      trackingEvents: ['sport_equipment_selected'],
      aiHints: ['filter_exercises_by_equipment', 'suggest_equipment_upgrades'],
      
      ariaLabel: 'Sélection du niveau d\'équipement'
    },

    /* ======================= MODULE: STRENGTH ======================= */
    {
      id: 'strength_setup',
      type: 'question',
      requiredModules: ['strength'],
      title: 'Objectif musculation 💪',
      question: "Quel est votre objectif principal en musculation ?",
      description: 'L\'IA déterminera votre style d\'entraînement optimal',
      illustration: '🏋️‍♀️',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('strength') || false,
      
      options: STRENGTH_OBJECTIVES.map((obj): QuestionOption => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
        icon: obj.icon,
        metadata: {
          focus: obj.focus
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif principal' }
      ],
      
      nextStep: 'strength_experience',
      estimatedTime: 90,
      backable: true,
      
      tips: [
        'Vous pouvez avoir plusieurs objectifs, mais un principal aide l\'IA',
        'Les programmes s\'adaptent selon vos progrès'
      ],
      
      trackingEvents: ['strength_objective_selected'],
      aiHints: ['design_strength_progression', 'calculate_volume_intensity'],
      
      ariaLabel: 'Sélection de l\'objectif de musculation'
    },

    {
      id: 'strength_experience',
      type: 'question',
      requiredModules: ['strength'],
      title: 'Votre expérience 📈',
      question: 'Depuis combien de temps faites-vous de la musculation ?',
      description: 'L\'IA ajustera la complexité des exercices proposés',
      illustration: '🎯',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('strength') || false,
      
      options: FITNESS_EXPERIENCE_LEVELS.map((level): QuestionOption => ({
        id: level.id,
        label: level.name,
        value: level.id,
        description: level.description,
        icon: level.icon,
        metadata: {
          experienceMonths: level.experience_months
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre niveau d\'expérience' }
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'strength'),
      estimatedTime: 60,
      backable: true,
      
      trackingEvents: ['strength_experience_selected'],
      aiHints: ['assess_technical_readiness', 'prevent_overtraining'],
      
      ariaLabel: 'Sélection du niveau d\'expérience en musculation'
    },

    /* ======================= MODULE: NUTRITION ====================== */
    {
      id: 'nutrition_setup',
      type: 'question',  
      requiredModules: ['nutrition'],
      title: 'Vos préférences alimentaires 🥗',
      question: 'Quel type d\'alimentation vous convient ?',
      description: 'L\'IA personnalisera vos plans de repas selon vos goûts et contraintes',
      illustration: '🍽️',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      
      options: DIETARY_PREFERENCES.map((pref): QuestionOption => ({
        id: pref.id,
        label: pref.name,
        value: pref.id,
        description: pref.description,
        icon: pref.icon
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre préférence alimentaire' }
      ],
      
      nextStep: 'nutrition_objective',
      estimatedTime: 90,
      backable: true,
      
      tips: [
        'L\'IA s\'adapte à tous les régimes alimentaires',
        'Vous pourrez affiner vos préférences dans l\'application'
      ],
      
      trackingEvents: ['dietary_preference_selected'],
      aiHints: ['filter_recipes_by_diet', 'calculate_macro_distribution'],
      
      ariaLabel: 'Sélection des préférences alimentaires'
    },

    {
      id: 'nutrition_objective',
      type: 'question',
      requiredModules: ['nutrition'],
      title: 'Objectif nutritionnel 🎯',
      question: 'Que souhaitez-vous atteindre avec la nutrition ?',
      description: 'L\'IA déterminera votre approche calorique et vos macronutriments',
      illustration: '📊',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      
      options: NUTRITION_OBJECTIVES.map((obj): QuestionOption => ({
        id: obj.id,
        label: obj.name,
        value: obj.id,
        description: obj.description,
        icon: obj.icon,
        metadata: {
          calorieTarget: obj.calorie_target
        }
      })),
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner votre objectif nutritionnel' }
      ],
      
      nextStep: 'nutrition_allergies',
      estimatedTime: 60,
      backable: true,
      
      trackingEvents: ['nutrition_objective_selected'],
      aiHints: ['calculate_caloric_needs', 'design_meal_timing'],
      
      ariaLabel: 'Sélection de l\'objectif nutritionnel'
    },

    {
      id: 'nutrition_allergies',
      type: 'question',
      requiredModules: ['nutrition'],
      title: 'Allergies et intolérances ⚠️',
      question: 'Avez-vous des allergies ou intolérances alimentaires ?',
      description: 'L\'IA évitera automatiquement ces aliments dans vos plans',
      illustration: '🚫',
      inputType: 'multi-select',
      
      condition: (data) => data.selectedModules?.includes('nutrition') || false,
      
      options: [
        { id: 'none', label: 'Aucune allergie', value: 'none', icon: '✅' },
        ...(['gluten', 'lactose', 'nuts', 'eggs', 'fish', 'shellfish', 'soy'].map(allergy => ({
          id: allergy,
          label: allergy.charAt(0).toUpperCase() + allergy.slice(1),
          value: allergy,
          icon: '⚠️'
        })))
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'nutrition'),
      estimatedTime: 90,
      backable: true,
      skippable: true,
      skipLabel: 'Aucune allergie',
      
      trackingEvents: ['allergies_selected'],
      aiHints: ['filter_ingredients_by_allergies', 'suggest_alternatives'],
      
      ariaLabel: 'Sélection des allergies et intolérances'
    },

    /* ======================== MODULE: SLEEP ========================= */
    {
      id: 'sleep_setup',
      type: 'question',
      requiredModules: ['sleep'],
      title: 'Vos habitudes de sommeil 😴',
      question: 'Combien d\'heures dormez-vous en moyenne par nuit ?',
      description: 'Le sommeil est crucial pour la récupération et les performances',
      illustration: '🌙',
      inputType: 'slider',
      min: 4,
      max: 12,
      step: 0.5,
      defaultValue: 8,
      unit: 'h',
      
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      
      scaleLabels: {
        4: 'Très peu',
        6: 'Insuffisant',
        8: 'Idéal',
        10: 'Beaucoup',
        12: 'Excessif'
      },
      
      validation: [
        { type: 'required', message: 'Veuillez indiquer votre durée de sommeil' },
        { type: 'range', min: 4, max: 12, message: 'Entre 4 et 12 heures' }
      ],
      
      nextStep: 'sleep_quality',
      estimatedTime: 60,
      backable: true,
      
      tips: [
        'Comptez le temps réellement endormi, pas le temps au lit',
        'L\'IA optimisera vos horaires d\'entraînement selon votre sommeil'
      ],
      
      trackingEvents: ['sleep_duration_selected'],
      aiHints: ['assess_recovery_capacity', 'optimize_training_timing'],
      
      ariaLabel: 'Sélection de la durée de sommeil'
    },

    {
      id: 'sleep_quality',
      type: 'question',
      requiredModules: ['sleep'],
      title: 'Qualité du sommeil 🌟',
      question: 'Comment évaluez-vous la qualité de votre sommeil ?',
      description: 'L\'IA proposera des conseils personnalisés d\'amélioration',
      illustration: '⭐',
      inputType: 'single-select',
      
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      
      options: [
        { id: 'excellent', label: 'Excellent', value: 5, description: 'Je me réveille toujours reposé(e)', icon: '🌟' },
        { id: 'good', label: 'Bon', value: 4, description: 'Généralement satisfaisant', icon: '😊' },
        { id: 'average', label: 'Moyen', value: 3, description: 'Parfois bon, parfois moins', icon: '😐' },
        { id: 'poor', label: 'Mauvais', value: 2, description: 'Souvent fatigué(e) au réveil', icon: '😴' },
        { id: 'very_poor', label: 'Très mauvais', value: 1, description: 'Je ne me sens jamais reposé(e)', icon: '😵' }
      ],
      
      validation: [
        { type: 'required', message: 'Veuillez évaluer votre qualité de sommeil' }
      ],
      
      nextStep: 'sleep_difficulties',
      estimatedTime: 45,
      backable: true,
      
      trackingEvents: ['sleep_quality_assessed'],
      aiHints: ['prioritize_sleep_interventions'],
      
      ariaLabel: 'Évaluation de la qualité du sommeil'
    },

    {
      id: 'sleep_difficulties',
      type: 'question',
      requiredModules: ['sleep'],
      title: 'Difficultés de sommeil 🤔',
      question: 'Rencontrez-vous des difficultés particulières ?',
      description: 'L\'IA personnalisera ses conseils selon vos problèmes spécifiques',
      illustration: '💭',
      inputType: 'multi-select',
      
      condition: (data) => data.selectedModules?.includes('sleep') || false,
      
      options: [
        { id: 'none', label: 'Aucune difficulté particulière', value: 'none', icon: '✅' },
        { id: 'falling_asleep', label: 'Mal à m\\'endormir', value: 'falling_asleep', icon: '😵‍💫' },
        { id: 'staying_asleep', label: 'Réveils nocturnes', value: 'staying_asleep', icon: '🌃' },
        { id: 'early_waking', label: 'Réveil trop tôt', value: 'early_waking', icon: '🌅' },
        { id: 'restless_sleep', label: 'Sommeil agité', value: 'restless_sleep', icon: '🌀' },
        { id: 'snoring', label: 'Ronflements', value: 'snoring', icon: '😴' },
        { id: 'stress', label: 'Stress/anxiété', value: 'stress', icon: '😰' }
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'sleep'),
      estimatedTime: 75,
      backable: true,
      skippable: true,
      skipLabel: 'Aucune difficulté',
      
      trackingEvents: ['sleep_difficulties_selected'],
      aiHints: ['customize_sleep_protocol', 'suggest_sleep_hygiene'],
      
      ariaLabel: 'Sélection des difficultés de sommeil'
    },

    /* ====================== MODULE: HYDRATION ====================== */
    {
      id: 'hydration_setup',
      type: 'question',
      requiredModules: ['hydration'],
      title: 'Votre hydratation 💧',
      question: "Quel est votre objectif d'hydratation quotidien ?",
      description: 'Une bonne hydratation améliore les performances et la récupération',
      illustration: '🚰',
      inputType: 'slider',
      min: 1,
      max: 5,
      step: 0.25,
      defaultValue: 2.5,
      unit: 'L',
      
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      
      scaleLabels: {
        1: 'Minimum',
        2: 'Modéré',
        3: 'Recommandé',
        4: 'Élevé',
        5: 'Maximum'
      },
      
      validation: [
        { type: 'required', message: 'Veuillez définir votre objectif d\'hydratation' },
        { type: 'range', min: 1, max: 5, message: 'Entre 1 et 5 litres par jour' }
      ],
      
      nextStep: 'hydration_reminders',
      estimatedTime: 60,
      backable: true,
      
      tips: [
        'L\'objectif varie selon votre poids, activité et climat',
        'L\'IA ajustera selon vos entraînements'
      ],
      
      trackingEvents: ['hydration_goal_set'],
      aiHints: ['calculate_personalized_hydration', 'factor_exercise_intensity'],
      
      ariaLabel: 'Définition de l\'objectif d\'hydratation'
    },

    {
      id: 'hydration_reminders',
      type: 'question',
      requiredModules: ['hydration'],
      title: 'Rappels intelligents 🔔',
      question: 'Souhaitez-vous des rappels d\'hydratation personnalisés ?',
      description: 'L\'IA enverra des notifications basées sur votre activité et météo',
      illustration: '📱',
      inputType: 'toggle',
      
      condition: (data) => data.selectedModules?.includes('hydration') || false,
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'hydration'),
      estimatedTime: 30,
      backable: true,
      
      tips: [
        'Les rappels s\'adaptent à vos habitudes',
        'Vous pouvez les personnaliser dans l\'application'
      ],
      
      trackingEvents: ['hydration_reminders_configured'],
      aiHints: ['setup_smart_notifications'],
      
      ariaLabel: 'Configuration des rappels d\'hydratation'
    },

    /* ======================= MODULE: WELLNESS ====================== */
    {
      id: 'wellness_assessment',
      type: 'question',
      requiredModules: ['wellness'],
      title: 'Évaluation bien-être 🧘‍♀️',
      question: 'Comment évaluez-vous votre niveau de stress actuel ?',
      description: 'L\'IA adaptera vos programmes selon votre état de bien-être',
      illustration: '🌸',
      inputType: 'slider',
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 3,
      
      condition: (data) => data.selectedModules?.includes('wellness') || false,
      
      scaleLabels: {
        1: 'Très détendu',
        2: 'Plutôt calme',
        3: 'Modéré',
        4: 'Assez stressé',
        5: 'Très stressé'
      },
      
      validation: [
        { type: 'required', message: 'Veuillez évaluer votre niveau de stress' }
      ],
      
      nextStep: 'wellness_goals',
      estimatedTime: 45,
      backable: true,
      
      trackingEvents: ['stress_level_assessed'],
      aiHints: ['personalize_recovery_protocols'],
      
      ariaLabel: 'Évaluation du niveau de stress'
    },

    {
      id: 'wellness_goals',
      type: 'question',
      requiredModules: ['wellness'],
      title: 'Objectifs bien-être 🎯',
      question: 'Sur quels aspects aimeriez-vous vous concentrer ?',
      description: 'L\'IA créera un programme de bien-être personnalisé',
      illustration: '🌈',
      inputType: 'multi-select',
      maxSelections: 3,
      
      condition: (data) => data.selectedModules?.includes('wellness') || false,
      
      options: [
        { id: 'stress_management', label: 'Gestion du stress', value: 'stress_management', icon: '🧘‍♂️' },
        { id: 'energy_boost', label: 'Augmenter l\'énergie', value: 'energy_boost', icon: '⚡' },
        { id: 'mental_clarity', label: 'Clarté mentale', value: 'mental_clarity', icon: '🧠' },
        { id: 'emotional_balance', label: 'Équilibre émotionnel', value: 'emotional_balance', icon: '⚖️' },
        { id: 'mindfulness', label: 'Pleine conscience', value: 'mindfulness', icon: '🌸' },
        { id: 'work_life_balance', label: 'Équilibre vie-travail', value: 'work_life_balance', icon: '🏠' }
      ],
      
      validation: [
        { type: 'required', message: 'Veuillez sélectionner au moins un objectif' }
      ],
      
      nextStep: (_, data) => getNextModuleStep(data.selectedModules || [], 'wellness'),
      estimatedTime: 90,
      backable: true,
      
      trackingEvents: ['wellness_goals_selected'],
      aiHints: ['design_wellness_interventions'],
      
      ariaLabel: 'Sélection des objectifs de bien-être'
    },

    /* ========================= FINAL STEPS ========================= */
    {
      id: 'final_questions',
      type: 'question',
      title: 'Dernières questions ✨',
      question: 'Partagez votre principale motivation',
      description: 'Qu\\'est-ce qui vous motive le plus dans cette démarche ?',
      illustration: '🔥',
      inputType: 'textarea',
      placeholder: 'Décrivez ce qui vous motive...',
      maxLength: 500,
      
      validation: [
        { type: 'required', message: 'Veuillez partager votre motivation' },
        { type: 'minLength', value: 10, message: 'Au moins 10 caractères' }
      ],
      
      nextStep: 'health_conditions',
      estimatedTime: 120,
      backable: true,
      
      tips: [
        'Plus vous êtes spécifique, mieux l\'IA peut vous aider',
        'Cette information aide à personnaliser vos encouragements'
      ],
      
      trackingEvents: ['motivation_shared'],
      aiHints: ['analyze_motivation_type', 'personalize_coaching_style'],
      
      ariaLabel: 'Saisie de la motivation principale',
      sensitive: false
    },

    {
      id: 'health_conditions',
      type: 'question',
      title: 'Conditions de santé 🏥',
      question: 'Avez-vous des conditions médicales particulières ?',
      description: 'L\'IA adaptera les programmes pour votre sécurité',
      illustration: '🩺',
      inputType: 'multi-select',
      
      options: HEALTH_CONDITIONS.map((condition): QuestionOption => ({
        id: condition.id,
        label: condition.name,
        value: condition.id,
        description: condition.description,
        metadata: {
          restrictions: condition.restrictions
        }
      })),
      
      nextStep: 'privacy_consent',
      estimatedTime: 90,
      backable: true,
      skippable: true,
      skipLabel: 'Aucune condition particulière',
      
      warnings: [
        'Consultez toujours un professionnel de santé avant de commencer'
      ],
      
      trackingEvents: ['health_conditions_declared'],
      aiHints: ['apply_safety_restrictions', 'suggest_medical_clearance'],
      
      ariaLabel: 'Déclaration des conditions de santé',
      sensitive: true,
      gdprCategory: 'health_data'
    },

    {
      id: 'privacy_consent',
      type: 'question',
      title: 'Confidentialité & Conditions 🔒',
      question: 'Acceptez-vous nos conditions d\\'utilisation ?',
      description: 'Vos données sont chiffrées, sécurisées et ne sont jamais vendues',
      illustration: '🛡️',
      inputType: 'toggle',
      
      validation: [
        { type: 'required', message: 'Vous devez accepter les conditions pour continuer' },
        { type: 'custom', message: 'L\'acceptation est obligatoire', validator: (value) => value === true }
      ],
      
      nextStep: 'marketing_consent',
      estimatedTime: 60,
      backable: true,
      skippable: false,
      
      tips: [
        'Vos données restent privées et sécurisées',
        'Vous pouvez consulter nos conditions à tout moment'
      ],
      
      trackingEvents: ['privacy_consent_given'],
      
      ariaLabel: 'Acceptation des conditions d\\'utilisation',
      importance: 'critical',
      sensitive: true,
      gdprCategory: 'consent'
    },

    {
      id: 'marketing_consent',
      type: 'question',
      title: 'Communications personnalisées 📧',
      question: 'Souhaitez-vous recevoir nos conseils et nouveautés ?',
      description: 'Conseils personnalisés, nouvelles fonctionnalités et success stories',
      illustration: '✉️',
      inputType: 'toggle',
      
      nextStep: 'summary',
      estimatedTime: 30,
      backable: true,
      skippable: true,
      skipLabel: 'Non merci',
      
      tips: [
        'Contenu entièrement personnalisé selon votre profil',
        'Vous pouvez vous désabonner à tout moment'
      ],
      
      trackingEvents: ['marketing_consent_response'],
      
      ariaLabel: 'Consentement aux communications marketing'
    },

    /* ============================ SUMMARY =========================== */
    {
      id: 'summary',
      type: 'summary',
      title: 'Votre profil est prêt ! 🎉',
      description: "Voici le résumé de votre configuration personnalisée",
      illustration: '✨',
      
      nextStep: 'completion',
      estimatedTime: 120,
      backable: true,
      
      trackingEvents: ['profile_summary_viewed'],
      aiHints: ['generate_final_recommendations', 'prepare_onboarding_completion'],
      
      ariaLabel: 'Résumé du profil utilisateur'
    },

    /* ========================== COMPLETION ========================== */
    {
      id: 'completion',
      type: 'confirmation',
      title: 'Bienvenue dans MyFitHero ! 🚀',
      description: 'Votre voyage personnalisé vous attend. L\'IA a créé vos programmes sur mesure.',
      illustration: '🎊',
      
      estimatedTime: 60,
      backable: false,
      skippable: false,
      
      trackingEvents: ['onboarding_completed', 'user_journey_started'],
      aiHints: ['finalize_user_profile', 'trigger_first_recommendations'],
      
      ariaLabel: 'Confirmation de fin d\\'onboarding'
    },

    /* ======================== ERROR HANDLING ======================= */
    {
      id: 'error_recovery',
      type: 'error',
      title: 'Oups, quelque chose s\'est mal passé 😅',
      description: 'Ne vous inquiétez pas, vos réponses sont sauvegardées',
      illustration: '🔧',
      
      nextStep: 'welcome',
      backable: false,
      skippable: false,
      
      trackingEvents: ['error_recovery_shown'],
      
      ariaLabel: 'Page de récupération d\'erreur'
    },

    {
      id: 'technical_error',
      type: 'error',
      title: 'Erreur technique 🚫',
      description: 'Une erreur technique est survenue. Nos ingénieurs ont été notifiés.',
      illustration: '⚠️',
      
      nextStep: 'welcome',
      backable: false,
      skippable: false,
      
      trackingEvents: ['technical_error_occurred'],
      
      ariaLabel: 'Page d\'erreur technique'
    }
  ]
};

/* ================================================================== */
/*                        FONCTIONS UTILITAIRES                        */
/* ================================================================== */

/**
 * Obtient la couleur associée à un module pour l'interface utilisateur
 */
function getModuleColor(moduleId: string): string {
  const colors: Record<string, string> = {
    sport: '#3B82F6',      // Bleu
    strength: '#EF4444',   // Rouge
    nutrition: '#10B981',  // Vert
    sleep: '#8B5CF6',      // Violet
    hydration: '#06B6D4',  // Cyan
    wellness: '#F59E0B'    // Ambre
  };
  return colors[moduleId] || '#6B7280';
}

/**
 * Obtient le badge de recommandation IA pour un module
 */
function getAIRecommendationBadge(moduleId: string): string | undefined {
  // Logique pour déterminer les badges basés sur l'IA
  const recommendedModules = ['nutrition', 'sleep']; // Exemple statique
  if (recommendedModules.includes(moduleId)) {
    return 'Recommandé IA';
  }
  return undefined;
}

/**
 * Obtient la priorité d'un module pour l'affichage
 */
function getModulePriority(moduleId: string): number {
  const priorities: Record<string, number> = {
    nutrition: 1,
    sleep: 2,
    sport: 3,
    strength: 4,
    hydration: 5,
    wellness: 6
  };
  return priorities[moduleId] || 10;
}

/**
 * Obtient le score IA pour un module
 */
function getAIScore(moduleId: string): number {
  // Simulation de score IA (dans la vraie app, ce serait calculé dynamiquement)
  const scores: Record<string, number> = {
    nutrition: 0.95,
    sleep: 0.92,
    sport: 0.88,
    strength: 0.85,
    hydration: 0.82,
    wellness: 0.78
  };
  return scores[moduleId] || 0.5;
}

/**
 * Obtient l'impact estimé d'un module
 */
function getEstimatedImpact(moduleId: string): string {
  const impacts: Record<string, string> = {
    nutrition: '+67% résultats',
    sleep: '+43% récupération',
    sport: '+85% performance',
    strength: '+52% force',
    hydration: '+28% énergie',
    wellness: '+38% bien-être'
  };
  return impacts[moduleId] || '+25% amélioration';
}

/**
 * Crée une fonction de navigation conditionnelle
 */
function createConditionalNextStep(
  conditions: Array<{
    condition: (response?: any, data?: OnboardingData) => boolean;
    step: string;
    action?: (data: OnboardingData) => OnboardingData;
  }>
): StepNextFunction {
  return (response: any, data: OnboardingData) => {
    for (const { condition, step, action } of conditions) {
      if (condition(response, data)) {
        if (action) {
          Object.assign(data, action(data));
        }
        return step;
      }
    }
    return 'completion'; // Fallback
  };
}

/**
 * Détermine la prochaine étape pour les modules
 */
export function getNextModuleStep(
  selectedModules: ModuleId[],
  currentModule?: string
): string {
  const moduleOrder: ModuleId[] = ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'];
  
  if (!currentModule) {
    // Première étape de module
    for (const moduleId of moduleOrder) {
      if (selectedModules.includes(moduleId)) {
        return `${moduleId}_setup`;
      }
    }
    return 'final_questions';
  }
  
  // Étape suivante après le module actuel
  const currentIndex = moduleOrder.indexOf(currentModule as ModuleId);
  for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
    if (selectedModules.includes(moduleOrder[i])) {
      return `${moduleOrder[i]}_setup`;
    }
  }
  
  return 'final_questions';
}

/**
 * Filtre les étapes selon les modules sélectionnés
 */
export function filterStepsByModules(
  steps: ConversationalStep[], 
  modules: ModuleId[]
): ConversationalStep[] {
  return steps.filter(step => {
    if (!step.requiredModules) return true;
    return step.requiredModules.some(required => modules.includes(required as ModuleId));
  });
}

/**
 * Obtient les étapes conditionnelles pour un flux personnalisé
 */
export function getConditionalSteps(
  data: OnboardingData
): ConversationalStep[] {
  const allSteps = CONVERSATIONAL_ONBOARDING_FLOW.steps;
  
  return allSteps.filter(step => {
    if (step.condition) {
      return step.condition(data);
    }
    return true;
  });
}

/**
 * Calcule le temps estimé restant basé sur les modules
 */
export function calculateEstimatedTime(selectedModules: ModuleId[]): number {
  const baseTime = 8; // Minutes de base
  const moduleTime: Record<string, number> = {
    sport: 4,
    strength: 2,
    nutrition: 3,
    sleep: 2,
    hydration: 1,
    wellness: 2
  };
  
  const totalModuleTime = selectedModules.reduce((total, module) => {
    return total + (moduleTime[module] || 1);
  }, 0);
  
  return Math.max(5, baseTime + totalModuleTime);
}

/**
 * Obtient la navigation conditionnelle pour une étape
 */
export function getConditionalNextStep(
  stepId: string,
  response: any,
  data: OnboardingData
): string | null {
  // Logique de navigation intelligente basée sur l'IA
  const navigationRules: Record<string, (response: any, data: OnboardingData) => string | null> = {
    'main_objective': (response, data) => {
      // L'IA peut décider de passer l'analyse si le profil est simple
      if (response === 'health_wellness' && !data.selectedModules?.length) {
        return 'module_selection';
      }
      return null;
    },
    
    'module_selection': (response, data) => {
      // Navigation intelligente basée sur les modules sélectionnés
      const modules = response as ModuleId[];
      if (modules.length <= 2) {
        return 'personal_info'; // Simplifier pour les profils basiques
      }
      return null;
    }
  };
  
  const rule = navigationRules[stepId];
  return rule ? rule(response, data) : null;
}

/* ================================================================== */
/*                             EXPORT                                  */
/* ================================================================== */

export default CONVERSATIONAL_ONBOARDING_FLOW;

// Exports utilitaires pour l'intégration
export {
  getModuleColor,
  getAIRecommendationBadge,
  getModulePriority,
  getAIScore,
  getEstimatedImpact,
  createConditionalNextStep
};

// Configuration par défaut
export const ONBOARDING_CONFIG = {
  ...DEFAULT_ONBOARDING_CONFIG,
  // Spécifique au flux conversationnel
  aiEnabled: true,
  adaptiveFlow: true,
  smartRecommendations: true,
  autoSave: true,
  autoSaveInterval: 30000, // 30 secondes
  maxRetries: 3,
  timeoutDuration: 300000, // 5 minutes
  
  // Analytics
  trackingEnabled: true,
  debugMode: process.env.NODE_ENV === '
