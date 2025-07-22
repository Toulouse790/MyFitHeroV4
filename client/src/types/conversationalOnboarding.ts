// client/src/types/conversationalOnboarding.ts
import type { ModuleId } from '@/data/packs';

/* ------------------------------------------------------------------ */
/*  Options utilisées dans les questions (boutons de sélection, etc.) */
/* ------------------------------------------------------------------ */
export interface StepOption<T = any> {
  id: string;
  label: string;
  value: T;
  description?: string;
  icon?: string;      // emoji ou nom d’icône
  color?: string;     // couleur optionnelle pour l’UI
  triggers?: string[]; // modules recommandés (ex: depuis MAIN_OBJECTIVES)
}

/* --------------------------- Règles de validation ------------------ */
export type ValidationRule =
  | { type: 'required'; message: string }
  | { type: 'min'; value: number; message: string }
  | { type: 'max'; value: number; message: string }
  | { type: 'custom'; message: string; validator: (v: any) => boolean };

/* ------------------------------ Types d'entrée --------------------- */
export type StepInputType =
  | 'text'
  | 'number'
  | 'slider'
  | 'toggle'
  | 'single-select'
  | 'multi-select';

/* --------------------------- Types d’étapes ------------------------ */
export type StepType = 'info' | 'question' | 'summary' | 'confirmation';

/* -------------------- Fonction dynamique de nextStep --------------- */
export type StepNextFn = (response: any, data: OnboardingData) => string;

/* ---------------------------- Étape du flow ------------------------ */
export interface ConversationalStep {
  id: string;
  type: StepType;
  title?: string;
  subtitle?: string;
  question?: string;
  description?: string;
  illustration?: string;      // emoji
  inputType?: StepInputType;  // requis pour type:question
  options?: StepOption[];     // pour single/multi-select
  tips?: string[];
  validation?: ValidationRule[];
  condition?: (data: OnboardingData) => boolean; // permet de masquer/montrer
  requiredModules?: ModuleId[]; // ✅ filtrage par modules (nouveauté)
  estimatedTime?: number;        // conservé mais non affiché si tu veux
  nextStep?: string | StepNextFn;
}

/* ---------------------------- Progression -------------------------- */
export interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  estimatedTimeLeft?: number; // plus affiché dans l’UI, OK de garder
  skipCount: number;
  moduleSpecificSteps: Record<string, string[]>; // optionnel: étapes déjà faites par module
}

/* ----------------------- Données collectées ------------------------ */
export interface OnboardingData {
  // progression technique
  progress: OnboardingProgress;

  // timestamps
  startedAt: Date;
  lastUpdated: Date;

  // base user info
  firstName?: string;
  age?: number;
  gender?: string;
  lifestyle?: string;
  availableTimePerDay?: number;

  // objectif
  mainObjective?: string;

  // modules sélectionnés
  selectedModules?: ModuleId[];

  /* ---- SPORT ---- */
  sport?: string;
  sportPosition?: string;
  sportLevel?: string;
  equipmentLevel?: string;

  /* ---- STRENGTH ---- */
  strengthObjective?: string;
  strengthExperience?: string;

  /* ---- NUTRITION ---- */
  dietaryPreference?: string;
  nutritionObjective?: string;
  foodAllergies?: string[];
  dietaryRestrictions?: string[];

  /* ---- SLEEP ---- */
  averageSleepHours?: number;
  sleepDifficulties?: boolean;

  /* ---- HYDRATION ---- */
  hydrationGoal?: number;       // litres
  hydrationReminders?: boolean;

  /* ---- FINAL ---- */
  motivation?: string;
  privacyConsent?: boolean;
  marketingConsent?: boolean;   // si tu l’utilises dans saveProgress
}

/* --------------------------- Flow complet -------------------------- */
export interface ConversationalFlow {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: number;
  modules: string[]; // liste de tous les modules supportés (id)
  initialStep: string;
  steps: ConversationalStep[];
}
