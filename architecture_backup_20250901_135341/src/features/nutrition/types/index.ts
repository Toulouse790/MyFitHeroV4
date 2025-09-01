// Types pour le module de nutrition

export interface NutritionData {
  id?: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalMacros: Macronutrients;
  waterIntake: number; // ml
  dailyGoals: NutritionGoals;
}

export interface Meal {
  id?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  timestamp: string;
  foods: FoodItem[];
  totalCalories: number;
  macros: Macronutrients;
}

export interface FoodItem {
  id?: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: 'g' | 'ml' | 'piece' | 'cup' | 'tbsp' | 'tsp';
  calories: number;
  macros: Macronutrients;
  micronutrients?: Micronutrients;
  barcode?: string;
}

export interface Macronutrients {
  proteins: number; // g
  carbohydrates: number; // g
  fats: number; // g
  fiber?: number; // g
}

export interface Micronutrients {
  vitamins: {
    vitaminA?: number; // mcg
    vitaminC?: number; // mg
    vitaminD?: number; // mcg
    vitaminE?: number; // mg
    vitaminK?: number; // mcg
    thiamine?: number; // mg
    riboflavin?: number; // mg
    niacin?: number; // mg
    vitaminB6?: number; // mg
    folate?: number; // mcg
    vitaminB12?: number; // mcg
  };
  minerals: {
    calcium?: number; // mg
    iron?: number; // mg
    magnesium?: number; // mg
    phosphorus?: number; // mg
    potassium?: number; // mg
    sodium?: number; // mg
    zinc?: number; // mg
  };
}

export interface NutritionGoals {
  dailyCalories: number;
  macroTargets: Macronutrients;
  waterGoal: number; // ml
  customGoals?: {
    name: string;
    target: number;
    unit: string;
    achieved: number;
  }[];
}

export interface NutritionAnalysis {
  date: string;
  calorieBalance: number; // surplus/deficit
  macroBalance: {
    proteins: number; // % of target
    carbohydrates: number; // % of target
    fats: number; // % of target
  };
  hydrationStatus: number; // % of goal
  nutritionScore: number; // 0-100
  recommendations: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  nutritionPerServing: {
    calories: number;
    macros: Macronutrients;
  };
  images?: string[];
  createdBy: string;
  isPublic: boolean;
}

export interface RecipeIngredient {
  foodItem: FoodItem;
  quantity: number;
  unit: string;
  optional?: boolean;
  substitutes?: FoodItem[];
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  targetCalories: number;
  targetMacros: Macronutrients;
  meals: {
    day: number;
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snacks?: Recipe[];
  }[];
  createdBy: string;
  isPublic: boolean;
}

export interface NutritionTrend {
  period: 'week' | 'month' | 'quarter';
  averageCalories: number;
  averageMacros: Macronutrients;
  averageHydration: number;
  consistency: number; // 0-100
  improvements: string[];
  concerns: string[];
}

// DTOs pour les API
export interface CreateMealDTO {
  type: Meal['type'];
  name: string;
  foods: Omit<FoodItem, 'id'>[];
}

export interface UpdateNutritionGoalsDTO {
  dailyCalories?: number;
  macroTargets?: Partial<Macronutrients>;
  waterGoal?: number;
}

export interface FoodSearchQuery {
  query: string;
  filters?: {
    brand?: string;
    category?: string;
    minCalories?: number;
    maxCalories?: number;
  };
  limit?: number;
}

export interface NutritionInsight {
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  actionRequired?: boolean;
  priority: 'low' | 'medium' | 'high';
}
