// client/src/types/onboarding.ts
export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  type: 'single_choice' | 'multi_choice' | 'text_input' | 'slider' | 'dropdown';
  required: boolean;
  condition?: (data: OnboardingData) => boolean;
}

export interface OnboardingData {
  // Modules sélectionnés
  selectedModules: string[];
  
  // Objectif principal
  mainObjective: string;
  
  // Informations de base
  firstName: string;
  age: number;
  gender: 'male' | 'female';
  
  // Sport (si module sport activé)
  sport?: string;
  sportPosition?: string;
  sportLevel?: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional';
  seasonPeriod?: 'off_season' | 'pre_season' | 'in_season' | 'recovery';
  trainingFrequency?: number;
  equipmentLevel?: 'no_equipment' | 'minimal_equipment' | 'some_equipment' | 'full_gym';
  
  // Musculation (si activée)
  addStrengthTraining?: boolean;
  strengthObjective?: 'strength' | 'power' | 'hypertrophy' | 'injury_prevention' | 'endurance';
  strengthExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Nutrition (si module nutrition activé)
  dietaryPreference?: string;
  foodAllergies?: string[];
  nutritionObjective?: 'muscle_gain' | 'weight_loss' | 'maintenance' | 'performance';
  dietaryRestrictions?: string[];
  
  // Sommeil (si module sommeil activé)
  averageSleepHours?: number;
  sleepDifficulties?: boolean;
  
  // Hydratation (si module hydratation activé)
  hydrationGoal?: number;
  hydrationReminders?: boolean;
  
  // Général
  motivation?: string;
  availableTimePerDay?: number;
  lifestyle?: 'student' | 'office_worker' | 'physical_job' | 'retired';
}

export interface SportOption {
  id: string;
  name: string;
  emoji: string;
  positions?: string[];
}

export interface OnboardingModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  benefits: string[];
}
