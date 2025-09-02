// client/src/types/conversationalOnboarding.ts
import React from 'react';
import type { ModuleId } from '../data/packs';

/* ================================================================== */
/*                     INTERFACES PRINCIPALES                          */
/* ================================================================== */

/**
 * Options utilisées dans les questions (boutons de sélection, etc.)
 * Compatible avec les systèmes de design modernes et l'IA
 */
export interface QuestionOption<T = any> {
  id: string;
  label: string;
  value: T;
  description?: string;
  icon?: string; // emoji, lucide-react icon name, ou URL
  color?: string; // hex, rgb, ou classe CSS
  image?: string; // URL d'image optionnelle
  badge?: string; // texte de badge (ex: "Recommandé")
  disabled?: boolean; // option désactivée
  tooltip?: string; // info-bulle
  triggers?: ModuleId[]; // modules déclenchés par cette option
  priority?: number; // ordre d'affichage (1 = le plus important)
  category?: string; // catégorie pour groupement
  metadata?: Record<string, any>; // données supplémentaires pour l'IA
}

/**
 * Alias pour compatibilité avec l'ancien code
 * @deprecated Utiliser QuestionOption à la place
 */
export type StepOption<T = any> = QuestionOption<T>;

/* ================================================================== */
/*                        VALIDATION SYSTÈME                           */
/* ================================================================== */

/**
 * Règles de validation étendues pour tous types de données
 * Intègre la validation côté client et serveur
 */
export type ValidationRule =
  | { type: 'required'; message: string; allowEmpty?: boolean }
  | { type: 'min'; value: number; message: string; inclusive?: boolean }
  | { type: 'max'; value: number; message: string; inclusive?: boolean }
  | { type: 'range'; min: number; max: number; message: string }
  | { type: 'email'; message: string; strict?: boolean }
  | { type: 'phone'; message: string; country?: string }
  | { type: 'url'; message: string; protocols?: string[] }
  | { type: 'pattern'; regex: RegExp; message: string; flags?: string }
  | { type: 'length'; exact: number; message: string }
  | { type: 'minLength'; value: number; message: string }
  | { type: 'maxLength'; value: number; message: string }
  | { type: 'array'; minItems?: number; maxItems?: number; message: string }
  | { type: 'oneOf'; values: unknown[]; message: string }
  | {
      type: 'custom';
      message: string;
      validator: (value: any, data?: OnboardingData) => boolean | Promise<boolean>;
    }
  | {
      type: 'conditional';
      condition: (data: OnboardingData) => boolean;
      rule: ValidationRule;
      message: string;
    }
  | {
      type: 'async';
      message: string;
      validator: (value: any, data?: OnboardingData) => Promise<boolean>;
    };

/* ================================================================== */
/*                         TYPES D'ENTRÉE                              */
/* ================================================================== */

/**
 * Types d'entrée supportés par le système conversationnel
 * Extensible pour nouveaux composants UI
 */
export type StepInputType =
  | 'text' // Input texte simple
  | 'textarea' // Zone de texte multi-ligne
  | 'number' // Input numérique
  | 'email' // Input email avec validation
  | 'phone' // Input téléphone
  | 'password' // Input mot de passe
  | 'slider' // Slider/Range
  | 'toggle' // Switch/Toggle
  | 'checkbox' // Case à cocher unique
  | 'radio' // Boutons radio (alias de single-select)
  | 'single-select' // Sélection unique
  | 'multi-select' // Sélection multiple
  | 'dropdown' // Menu déroulant
  | 'autocomplete' // Champ avec autocomplétion
  | 'date' // Sélecteur de date
  | 'time' // Sélecteur d'heure
  | 'datetime' // Sélecteur date + heure
  | 'file' // Upload de fichier
  | 'image' // Upload d'image
  | 'rating' // Système d'étoiles
  | 'color' // Sélecteur de couleur
  | 'range' // Double slider (min/max)
  | 'tags' // Saisie de tags
  | 'location' // Sélecteur de localisation
  | 'single_choice' // Choix unique (alias de radio)
  | 'multiple_choice' // Choix multiples (alias de multi-select)
  | 'switch' // Switch/Toggle (alias de toggle)
  | 'sport_selector' // Sélecteur de sport personnalisé
  | 'position_selector' // Sélecteur de position personnalisé
  | 'personal_info' // Formulaire d'informations personnelles
  | 'pack_selector' // Sélecteur de pack personnalisé
  | 'custom'; // Composant personnalisé

/* ================================================================== */
/*                          TYPES D'ÉTAPES                             */
/* ================================================================== */

/**
 * Types d'étapes dans le flow conversationnel
 */
export type StepType =
  | 'info' // Page d'information pure
  | 'welcome' // Page d'accueil spéciale
  | 'question' // Question avec input utilisateur
  | 'survey' // Question de type sondage
  | 'form' // Formulaire multi-champs
  | 'choice' // Choix entre plusieurs options
  | 'confirmation' // Confirmation d'action
  | 'summary' // Résumé des réponses
  | 'loading' // Écran de chargement/traitement
  | 'error' // Gestion d'erreur
  | 'completion' // Finalisation du processus
  | 'redirect'; // Redirection vers autre page

/* ================================================================== */
/*                       FONCTIONS DYNAMIQUES                          */
/* ================================================================== */

/**
 * Fonction de navigation dynamique pour nextStep
 * Permet une logique complexe de routage
 */
export type StepNextFunction = (
  response: any,
  data: OnboardingData,
  context?: {
    stepHistory: string[];
    skipCount: number;
    timeSpent: number;
    userAgent?: string;
  }
) => string | Promise<string>;

/**
 * Fonction de condition pour affichage d'étape
 */
export type StepConditionFunction = (
  data: OnboardingData,
  context?: {
    userAgent?: string;
    timestamp: Date;
    previousSteps: string[];
  }
) => boolean | Promise<boolean>;

/* ================================================================== */
/*                         ÉTAPE PRINCIPALE                            */
/* ================================================================== */

/**
 * Définition complète d'une étape du flow conversationnel
 * Compatible avec l'IA et les outils de développement modernes
 */
export interface ConversationalStep {
  // Identification
  id: string;
  type: StepType;
  version?: string; // Versioning pour A/B testing

  // Contenu affiché
  title?: string;
  subtitle?: string;
  question?: string;
  description?: string;
  illustration?: string; // emoji, icon name, ou URL
  placeholder?: string; // placeholder pour inputs
  helpText?: string; // texte d'aide contextuel

  // Configuration UI
  inputType?: StepInputType;
  options?: QuestionOption[];
  defaultValue?: any; // valeur par défaut
  maxLength?: number; // longueur max pour texte
  minLength?: number; // longueur min pour texte
  min?: number; // valeur min pour nombre/slider
  max?: number; // valeur max pour nombre/slider
  step?: number; // pas pour slider/number
  minLabel?: string; // label pour valeur min du slider
  maxLabel?: string; // label pour valeur max du slider
  multiple?: boolean; // sélection multiple autorisée
  searchable?: boolean; // recherche dans les options
  clearable?: boolean; // peut être vidé
  unit?: string; // unité affichée (kg, cm, etc.)
  scaleLabels?: Record<number, string> | { low?: string; high?: string }; // labels pour slider
  maxSelections?: number; // max sélections pour multi-select

  // Propriétés spécifiques aux composants
  switchLabel?: string; // label pour les switch
  switchDescription?: string; // description pour les switch
  icon?: React.ComponentType<any>; // icône du step

  // Logique et validation
  validation?: ValidationRule[];
  condition?: StepConditionFunction;
  requiredModules?: ModuleId[]; // modules requis pour cette étape
  excludedModules?: ModuleId[]; // modules qui excluent cette étape
  dependencies?: string[]; // IDs d'étapes dépendantes

  // Navigation
  nextStep?: string | StepNextFunction;
  previousStep?: string; // étape précédente forcée
  skippable?: boolean; // peut être ignorée
  skipLabel?: string; // texte du bouton "ignorer"
  backable?: boolean; // retour autorisé
  autoAdvance?: boolean; // avance automatiquement
  autoAdvanceDelay?: number; // délai en ms pour auto-advance

  // Expérience utilisateur
  tips?: string[]; // conseils contextuels
  warnings?: string[]; // avertissements
  examples?: string[]; // exemples de réponses
  estimatedTime?: number; // temps estimé en secondes
  difficulty?: 'easy' | 'medium' | 'hard'; // difficulté perçue
  importance?: 'low' | 'medium' | 'high' | 'critical'; // importance

  // Intégration IA et analytics
  aiHints?: string[]; // indices pour l'IA
  trackingEvents?: string[]; // événements à tracker
  metadata?: Record<string, any>; // métadonnées personnalisées

  // Configuration avancée
  customComponent?: string; // nom du composant React personnalisé
  customProps?: Record<string, any>; // props pour composant personnalisé
  apiEndpoint?: string; // endpoint pour données dynamiques
  cacheKey?: string; // clé de cache pour optimisation

  // Accessibilité
  ariaLabel?: string; // label aria
  ariaDescription?: string; // description aria
  tabIndex?: number; // ordre de tabulation

  // Responsive design
  mobileLayout?: 'stack' | 'grid' | 'carousel'; // layout mobile
  desktopLayout?: 'grid' | 'list' | 'cards'; // layout desktop

  // Sécurité et confidentialité
  sensitive?: boolean; // données sensibles
  encrypted?: boolean; // chiffrement requis
  gdprCategory?: string; // catégorie RGPD
}

/* ================================================================== */
/*                           PROGRESSION                                */
/* ================================================================== */

/**
 * Suivi détaillé de la progression utilisateur
 * Intègre analytics et personnalisation IA
 */
export interface OnboardingProgress {
  // État actuel
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  totalSteps: number;

  // Temps et performance
  estimatedTimeLeft?: number; // temps restant estimé (minutes)
  timeSpent: number; // temps déjà passé (secondes)
  startedAt: Date;
  lastActivity: Date;
  averageTimePerStep: number;

  // Statistiques utilisateur
  skipCount: number;
  backCount: number; // nombre de retours en arrière
  errorCount: number; // nombre d'erreurs de validation
  helpViewCount: number; // nombre de consultations d'aide

  // Progression par module
  moduleSpecificSteps: Record<
    ModuleId,
    {
      steps: string[];
      completed: string[];
      skipped: string[];
      timeSpent: number;
    }
  >;

  // Personnalisation IA
  userPreferences: {
    preferredInputTypes: StepInputType[];
    skipsTendency: number; // tendance à ignorer (0-1)
    detailLevel: 'minimal' | 'standard' | 'detailed';
    pace: 'slow' | 'normal' | 'fast';
  };

  // Contexte technique
  deviceInfo?: {
    userAgent: string;
    screenSize: { width: number; height: number };
    touchDevice: boolean;
    language: string;
    timezone: string;
  };

  // Qualité des données
  completionQuality: number; // score de qualité (0-100)
  validationScore: number; // score de validation (0-100)
  consistencyScore: number; // cohérence des réponses (0-100)
}

/* ================================================================== */
/*                        DONNÉES COLLECTÉES                           */
/* ================================================================== */

/**
 * Structure complète des données collectées pendant l'onboarding
 * Optimisée pour Supabase et compatible IA
 */
export interface OnboardingData {
  // Métadonnées techniques
  id?: string; // ID unique
  version: string; // version du flow
  progress: OnboardingProgress;

  // Timestamps
  startedAt: Date;
  lastUpdated: Date;
  completedAt?: Date;

  // Informations personnelles de base
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg

  // Style de vie et disponibilité
  lifestyle?:
    | 'student'
    | 'office_worker'
    | 'physical_job'
    | 'parent'
    | 'retired'
    | 'athlete'
    | 'other';
  availableTimePerDay?: number; // minutes
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  workoutDays?: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];

  // Objectifs principaux
  mainObjective?:
    | 'performance'
    | 'health_wellness'
    | 'body_composition'
    | 'energy_sleep'
    | 'strength_building'
    | 'endurance_cardio'
    | 'recovery_focus'
    | 'weight_management'
    | 'muscle_gain'
    | 'weight_loss'
    | 'holistic';
  fitnessGoals?: string[]; // objectifs secondaires
  timeline?: 'short' | 'medium' | 'long'; // 3 mois, 6 mois, 1 an+

  // Pack et modules sélectionnés
  selectedPack?: string; // ID du pack sélectionné
  selectedModules?: ModuleId[];
  modulePreferences?: Record<
    ModuleId,
    {
      priority: number; // 1-5
      customization: Record<string, any>;
    }
  >;

  /* ===== MODULE SPORT ===== */
  sport?: string;
  sportCategory?:
    | 'individual'
    | 'team'
    | 'combat'
    | 'endurance'
    | 'strength'
    | 'flexibility'
    | 'mixed';
  sportPosition?: string;
  sportLevel?:
    | 'recreational'
    | 'amateur_competitive'
    | 'club_competitive'
    | 'semi_professional'
    | 'professional';
  seasonPeriod?:
    | 'off_season'
    | 'pre_season'
    | 'early_season'
    | 'in_season'
    | 'championship'
    | 'recovery';
  trainingFrequency?: string;
  competitionLevel?: 'none' | 'local' | 'regional' | 'national' | 'international';
  injuries?: {
    type: string;
    bodyPart: string;
    severity: 'minor' | 'moderate' | 'major';
    date: Date;
    recovered: boolean;
  }[];

  /* ===== MODULE STRENGTH ===== */
  strengthObjective?:
    | 'strength'
    | 'power'
    | 'hypertrophy'
    | 'injury_prevention'
    | 'endurance'
    | 'functional';
  strengthExperience?: 'complete_beginner' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  equipmentLevel?:
    | 'no_equipment'
    | 'minimal_equipment'
    | 'home_gym_basic'
    | 'home_gym_complete'
    | 'commercial_gym';
  equipmentAccess?: string[]; // liste équipements disponibles
  preferredExercises?: string[];
  avoidedExercises?: string[];
  maxSessionDuration?: number; // minutes

  /* ===== MODULE NUTRITION ===== */
  dietaryPreference?:
    | 'omnivore'
    | 'vegetarian'
    | 'vegan'
    | 'pescatarian'
    | 'flexitarian'
    | 'keto'
    | 'paleo'
    | 'mediterranean'
    | 'intermittent_fasting';
  nutritionObjective?:
    | 'muscle_gain'
    | 'weight_loss'
    | 'maintenance'
    | 'performance'
    | 'recomposition';
  foodAllergies?: string[];
  foodIntolerances?: string[];
  dietaryRestrictions?: string[];
  culturalDietaryNeeds?: string[];
  cookingSkill?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mealPrepTime?: number; // minutes par jour
  budget?: 'low' | 'medium' | 'high' | 'unlimited';
  supplementsUsed?: string[];
  mealsPerDay?: number;
  snackPreferences?: string[];

  /* ===== MODULE SLEEP ===== */
  averageSleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // 1=très mauvais, 5=excellent
  bedtime?: string; // format HH:MM
  wakeupTime?: string; // format HH:MM
  sleepDifficulties?: (
    | 'falling_asleep'
    | 'staying_asleep'
    | 'early_waking'
    | 'restless_sleep'
    | 'snoring'
    | 'nightmares'
  )[];
  sleepEnvironment?: {
    darkness: 1 | 2 | 3 | 4 | 5;
    noise: 1 | 2 | 3 | 4 | 5;
    temperature: 1 | 2 | 3 | 4 | 5;
    comfort: 1 | 2 | 3 | 4 | 5;
  };
  caffeineIntake?: number; // mg par jour
  screenTimeBeforeBed?: number; // minutes
  relaxationTechniques?: string[];

  /* ===== MODULE HYDRATION ===== */
  hydrationGoal?: number; // litres par jour
  currentHydrationLevel?: number; // litres actuelles
  hydrationReminders?: boolean;
  reminderFrequency?: number; // minutes entre rappels
  beveragePreferences?: string[];
  caffeineLimit?: number; // mg par jour
  alcoholConsumption?: 'none' | 'occasional' | 'moderate' | 'regular';
  sweatRate?: 'low' | 'moderate' | 'high'; // transpiration pendant effort
  climate?: 'cold' | 'temperate' | 'hot' | 'humid';

  /* ===== MODULE WELLNESS ===== */
  stressLevel?: 1 | 2 | 3 | 4 | 5; // 1=très faible, 5=très élevé
  stressManagement?: string[]; // techniques utilisées
  mentalHealthGoals?: string[];
  mindfulnessPractice?: boolean;
  meditationExperience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  socialSupport?: 1 | 2 | 3 | 4 | 5; // niveau de soutien social
  workLifeBalance?: 1 | 2 | 3 | 4 | 5; // équilibre vie pro/perso
  hobbies?: string[];
  motivationSources?: string[];

  /* ===== SANTÉ ET CONDITIONS MÉDICALES ===== */
  healthConditions?: (
    | 'none'
    | 'joint_issues'
    | 'back_problems'
    | 'cardiovascular'
    | 'diabetes'
    | 'hypertension'
    | 'asthma'
    | 'arthritis'
    | 'other'
  )[];
  medications?: {
    name: string;
    dosage?: string;
    frequency: string;
    affects_exercise?: boolean;
  }[];
  medicalClearance?: boolean; // autorisation médicale
  pregnancyStatus?: 'not_applicable' | 'trying' | 'pregnant' | 'postpartum';
  menstrualCycle?: boolean; // suivi du cycle pour femmes

  /* ===== PRÉFÉRENCES ET PERSONNALISATION ===== */
  communicationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  language?: string; // code ISO
  timezone?: string; // timezone IANA
  units?: 'metric' | 'imperial'; // système d'unités
  theme?: 'light' | 'dark' | 'auto'; // thème interface

  /* ===== MOTIVATION ET ENGAGEMENT ===== */
  motivation?: string; // description libre
  previousAttempts?: number; // tentatives passées
  biggestChallenge?: string;
  successFactors?: string[]; // facteurs de réussite passés
  accountabilityPreference?: 'self' | 'coach' | 'community' | 'family' | 'none';
  rewardSystem?: boolean; // système de récompenses

  /* ===== CONSENTEMENTS ET LÉGAL ===== */
  privacyConsent?: boolean; // RGPD
  marketingConsent?: boolean; // marketing
  dataSharing?: {
    analytics: boolean;
    research: boolean;
    partnerships: boolean;
  };
  termsAccepted?: boolean;
  minorConsent?: boolean; // si mineur

  /* ===== MÉTADONNÉES TECHNIQUES ===== */
  source?: string; // source d'acquisition
  referrer?: string; // référent
  utmParameters?: Record<string, string>;
  experimentGroup?: string; // groupe A/B test
  customFields?: Record<string, any>; // champs personnalisés

  /* ===== SCORES CALCULÉS (IA) ===== */
  riskScore?: number; // score de risque (0-100)
  motivationScore?: number; // score de motivation (0-100)
  complexityScore?: number; // complexité du profil (0-100)
  readinessScore?: number; // prêt à commencer (0-100)

  /* ===== INTÉGRATIONS EXTERNES ===== */
  connectedApps?: {
    name: string;
    type: 'fitness' | 'nutrition' | 'sleep' | 'health' | 'social';
    connected: boolean;
    lastSync?: Date;
    permissions: string[];
  }[];
  wearableDevices?: string[]; // appareils connectés

  /* ===== VALIDATION ET QUALITÉ ===== */
  validationStatus?: 'pending' | 'validated' | 'flagged' | 'rejected';
  qualityScore?: number; // qualité des données (0-100)
  completenessScore?: number; // complétude (0-100)
  lastValidated?: Date;

  /* ===== SUIVI POST-ONBOARDING ===== */
  onboardingRating?: 1 | 2 | 3 | 4 | 5; // satisfaction onboarding
  onboardingFeedback?: string;
  timeToFirstAction?: number; // secondes
  conversionStatus?: 'completed' | 'abandoned' | 'converted' | 'churned';
}

/* ================================================================== */
/*                           FLOW PRINCIPAL                            */
/* ================================================================== */

/**
 * Configuration complète du flow conversationnel
 * Support multi-tenant et personnalisation IA
 */
export interface ConversationalFlow {
  // Identification
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;

  // Configuration
  estimatedDuration?: number; // minutes
  modules: ModuleId[]; // modules supportés
  languages: string[]; // langues supportées

  // Navigation
  initialStep: string;
  steps: ConversationalStep[];
  fallbackStep?: string; // étape de fallback
  errorStep?: string; // étape d'erreur

  // Personnalisation
  theme?: string; // thème UI
  branding?: {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };

  // Intégration IA
  aiConfig?: {
    enabled: boolean;
    model?: string;
    prompts?: Record<string, string>;
    confidenceThreshold?: number;
  };

  // Analytics et tracking
  analytics?: {
    enabled: boolean;
    events: string[];
    customDimensions?: Record<string, string>;
  };

  // Conditions et règles
  conditions?: {
    userSegments?: string[]; // segments utilisateur
    featureFlags?: string[]; // feature flags
    experiments?: string[]; // expérimentations A/B
  };

  // Métadonnées
  tags?: string[]; // tags pour organisation
  category?: string; // catégorie
  priority?: number; // priorité (1-10)
  status?: 'draft' | 'testing' | 'active' | 'archived';

  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
}

/* ================================================================== */
/*                          UTILITAIRES                                */
/* ================================================================== */

/**
 * Contexte d'exécution pour fonctions dynamiques
 */
export interface ExecutionContext {
  userId?: string;
  sessionId: string;
  flowId: string;
  stepHistory: string[];
  timeSpent: number;
  skipCount: number;
  errorCount: number;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  abTestGroups?: Record<string, string>;
  featureFlags?: Record<string, boolean>;
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Configuration d'export des données
 */
export interface ExportConfig {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeMetadata: boolean;
  includeSensitive: boolean;
  anonymize: boolean;
  compression?: 'none' | 'gzip' | 'zip';
  encryption?: {
    enabled: boolean;
    algorithm: string;
    keyId: string;
  };
}

/* ================================================================== */
/*                           TYPES HELPERS                             */
/* ================================================================== */

/**
 * Extracteur de type pour les réponses d'étapes
 */
export type StepResponse<T extends ConversationalStep> = T['inputType'] extends 'multi-select'
  ? T['options'] extends QuestionOption[]
    ? T['options'][number]['value'][]
    : unknown[]
  : T['inputType'] extends 'single-select'
    ? T['options'] extends QuestionOption[]
      ? T['options'][number]['value']
      : any
    : T['inputType'] extends 'number' | 'slider' | 'rating'
      ? number
      : T['inputType'] extends 'toggle' | 'checkbox'
        ? boolean
        : T['inputType'] extends 'date'
          ? Date
          : string;

/**
 * Type pour les handlers d'événements
 */
export type EventHandler<T = any> = (event: T, context: ExecutionContext) => void | Promise<void>;

/**
 * Configuration des hooks du cycle de vie
 */
export interface LifecycleHooks {
  onStepEnter?: EventHandler<{ stepId: string; data: OnboardingData }>;
  onStepExit?: EventHandler<{ stepId: string; response: any; data: OnboardingData }>;
  onStepSkip?: EventHandler<{ stepId: string; reason: string; data: OnboardingData }>;
  onStepError?: EventHandler<{ stepId: string; error: Error; data: OnboardingData }>;
  onFlowStart?: EventHandler<{ flowId: string }>;
  onFlowComplete?: EventHandler<{ flowId: string; data: OnboardingData }>;
  onFlowAbandon?: EventHandler<{ flowId: string; lastStep: string; data: Partial<OnboardingData> }>;
}

export default ConversationalStep;
