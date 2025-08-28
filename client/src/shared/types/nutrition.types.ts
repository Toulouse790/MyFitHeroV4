/**
 * Types pour les fonctionnalités de nutrition
 */

// Types de base pour les aliments
export interface Food {
  id: string;
  name: string;
  brand?: string;
  category: FoodCategory;
  nutritionPer100g: NutritionFacts;
  barcode?: string;
  imageUrl?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum FoodCategory {
  FRUITS = 'fruits',
  VEGETABLES = 'vegetables',
  GRAINS = 'grains',
  PROTEINS = 'proteins',
  DAIRY = 'dairy',
  FATS = 'fats',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  SUPPLEMENTS = 'supplements',
  CONDIMENTS = 'condiments',
  PREPARED_FOODS = 'prepared_foods'
}

export interface NutritionFacts {
  calories: number;
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // g
  transFat?: number; // g
  monounsaturatedFat?: number; // g
  polyunsaturatedFat?: number; // g
  potassium?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  vitaminA?: number; // IU
  vitaminC?: number; // mg
  vitaminD?: number; // IU
}

// Types pour les repas
export interface Meal {
  id: string;
  name: string;
  type: MealType;
  foods: MealFood[];
  totalNutrition: NutritionFacts;
  userId: string;
  date: Date;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout'
}

export interface MealFood {
  foodId: string;
  food: Food;
  quantity: number; // en grammes
  nutrition: NutritionFacts;
}

// Types pour la planification des repas
export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  dailyMeals: DailyMealPlan[];
  nutritionGoals: NutritionGoals;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyMealPlan {
  date: Date;
  meals: Meal[];
  totalNutrition: NutritionFacts;
  waterIntake?: number; // en ml
  notes?: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  fiber?: number; // g
  water?: number; // ml
}

// Types pour le suivi nutritionnel
export interface NutritionEntry {
  id: string;
  userId: string;
  date: Date;
  meals: Meal[];
  totalNutrition: NutritionFacts;
  waterIntake: number; // en ml
  weight?: number; // en kg
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les recettes
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: RecipeCategory;
  servings: number;
  prepTime: number; // en minutes
  cookTime: number; // en minutes
  difficulty: RecipeDifficulty;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionPerServing: NutritionFacts;
  tags: string[];
  imageUrl?: string;
  rating?: number;
  reviews?: RecipeReview[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RecipeCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  SMOOTHIE = 'smoothie'
}

export enum RecipeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface RecipeIngredient {
  foodId: string;
  food: Food;
  quantity: number; // en grammes
  unit?: string;
  preparation?: string; // ex: "chopped", "diced"
}

export interface RecipeReview {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// Types pour les statistiques nutritionnelles
export interface NutritionStats {
  averageDailyCalories: number;
  averageDailyNutrition: NutritionFacts;
  weeklyProgress: WeeklyNutritionProgress[];
  goalAchievement: NutritionGoalAchievement;
  topFoods: FoodConsumption[];
  hydrationStats: HydrationStats;
}

export interface WeeklyNutritionProgress {
  week: string;
  year: number;
  averageCalories: number;
  averageNutrition: NutritionFacts;
  goalAchievement: number; // pourcentage
}

export interface NutritionGoalAchievement {
  calories: number; // pourcentage
  protein: number; // pourcentage
  carbohydrates: number; // pourcentage
  fat: number; // pourcentage
  fiber: number; // pourcentage
  water: number; // pourcentage
}

export interface FoodConsumption {
  food: Food;
  frequency: number; // nombre de fois consommé
  totalQuantity: number; // en grammes
  percentage: number; // pourcentage du total
}

export interface HydrationStats {
  averageDailyIntake: number; // ml
  goalAchievement: number; // pourcentage
  streak: number; // jours consécutifs d'objectif atteint
}
