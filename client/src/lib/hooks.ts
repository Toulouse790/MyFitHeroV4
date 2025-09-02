// ====================================================================
// MyFitHero - Hooks et Store Utilitaires
// ====================================================================

// Re-export des hooks depuis index.tsx pour éviter les warnings Fast Refresh
// Ces exports seront supprimés du fichier index.tsx principal

export {
  useUSLocation,
  useUSUnits,
  useConversationalAI,
  useOfflineSync,
  appStore,
} from '../pages/index';

// Types exportés
export type {
  User,
  FitnessProfile,
  USMainSports,
  FitnessGoal,
  Equipment,
  OnboardingState,
  OnboardingModule,
  ConversationMessage,
  AIRecommendation,
  Workout,
  Exercise,
  ExerciseSet,
  NutritionEntry,
  Meal,
  FoodItem,
  SleepEntry,
  HydrationEntry,
  MentalWellnessEntry,
  SocialProfile,
  Challenge,
  UserAnalytics,
} from '../pages/index';
