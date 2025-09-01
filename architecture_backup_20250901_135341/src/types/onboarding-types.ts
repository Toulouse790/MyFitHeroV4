// client/src/types/onboarding-types.ts

import { AVAILABLE_MODULES, MAIN_OBJECTIVES, AVAILABLE_SPORTS } from '@/data/onboardingData';

// Type dynamique pour les IDs de module
// Il extrait les 'id' de chaque objet dans AVAILABLE_MODULES
export type ModuleId = (typeof AVAILABLE_MODULES)[number]['id'];

// Type dynamique pour les IDs d'objectif principal
export type ObjectiveId = (typeof MAIN_OBJECTIVES)[number]['id'];

// Type dynamique pour les IDs de sport
export type SportId = (typeof AVAILABLE_SPORTS)[number]['id'];

// Interfaces pour les structures de données
export interface OnboardingModule {
  id: ModuleId;
  name: string;
  icon: string;
  description: string;
  benefits: string[];
}

export interface MainObjective {
  id: ObjectiveId;
  name: string;
  description: string;
  icon: string;
  modules: ModuleId[];
  priority: number;
}

export interface SportOption {
  id: SportId;
  name: string;
  emoji: string;
  category: string;
  positions: string[];
}

export interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StrengthObjective {
  id: string;
  name: string;
  description: string;
  icon: string;
  focus: string;
}

export interface NutritionObjective {
  id: string;
  name: string;
  description: string;
  icon: string;
  calorie_target: string;
}

export interface LifestyleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  characteristics: string[];
}

export interface EquipmentLevel {
  id: string;
  name: string;
  description: string;
  icon: string;
  available_equipment: string[];
}

export interface SportLevel {
  id: string;
  name: string;
  description: string;
  icon: string;
  training_frequency: string;
  competition_level: string;
}

export interface FitnessExperienceLevel {
  id: string;
  name: string;
  description: string;
  icon: string;
  experience_months: number;
}

// Type pour le contexte de l'onboarding
export interface OnboardingContext {
  mainObjective?: ObjectiveId;
  selectedModules: ModuleId[];
  [key: string]: any; // Pour les autres données collectées
}
