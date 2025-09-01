import { useState, useEffect, useCallback } from 'react';
import { NutritionService } from '../services/nutrition.service';
import type {
  NutritionData,
  Meal,
  FoodItem,
  NutritionGoals,
  NutritionAnalysis,
  Recipe,
  MealPlan,
  NutritionTrend,
  CreateMealDTO,
  UpdateNutritionGoalsDTO,
  FoodSearchQuery,
  NutritionInsight,
} from '../types/index';

type NutritionMealInput = {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  foods: Omit<FoodItem, 'id'>[];
};

export interface UseNutritionReturn {
  // État
  nutritionData: NutritionData | null;
  meals: Meal[];
  goals: NutritionGoals | null;
  analysis: NutritionAnalysis | null;
  recipes: Recipe[];
  mealPlans: MealPlan[];
  trends: NutritionTrend | null;
  insights: NutritionInsight[];
  searchResults: FoodItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addMeal: (meal: NutritionMealInput) => Promise<void>;
  updateMeal: (id: string, meal: Partial<NutritionMealInput>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  updateGoals: (goals: UpdateNutritionGoalsDTO) => Promise<void>;
  searchFoods: (query: FoodSearchQuery) => Promise<void>;
  loadRecipes: (filters?: { tags?: string[]; difficulty?: string }) => Promise<void>;
  loadMealPlans: () => Promise<void>;
  loadTrends: (period: 'week' | 'month' | 'quarter') => Promise<void>;
  refreshData: () => Promise<void>;

  // Calculateurs
  calculateDailyScore: () => number;
  calculateCalorieBalance: () => number;
  getMacroBalance: () => { proteins: number; carbohydrates: number; fats: number };
  getHydrationStatus: () => number;
}

export function useNutrition(userId?: string): UseNutritionReturn {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [trends, setTrends] = useState<NutritionTrend | null>(null);
  const [insights, setInsights] = useState<NutritionInsight[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';
  const today = new Date().toISOString().split('T')[0] || '';

  // Chargement des données initiales
  const loadNutritionData = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await NutritionService.getNutritionData(currentUserId, today);
      setNutritionData(data);
      setMeals(data.meals);
      setGoals(data.dailyGoals);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des données nutritionnelles';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, today]);

  // Chargement de l'analyse
  const loadAnalysis = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const endDate = today;
      const startDate =
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
      const analysisData = await NutritionService.getNutritionAnalysis(
        currentUserId,
        startDate,
        endDate
      );
      setAnalysis(analysisData);
    } catch (err) {
      console.error("Erreur lors du chargement de l'analyse:", err);
    }
  }, [currentUserId, today]);

  // Chargement des insights
  const loadInsights = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const insightsData = await NutritionService.getNutritionInsights(currentUserId);
      setInsights(insightsData);
    } catch (err) {
      console.error('Erreur lors du chargement des insights:', err);
    }
  }, [currentUserId]);

  // Ajout d'un repas
  const addMeal = useCallback(
    async (meal: NutritionMealInput) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const mealData: CreateMealDTO = {
          type: meal.type,
          name: meal.name,
          foods: meal.foods,
        };

        await NutritionService.addMeal(currentUserId, mealData);
        await loadNutritionData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout du repas";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, loadNutritionData]
  );

  // Mise à jour d'un repas
  const updateMeal = useCallback(
    async (id: string, meal: Partial<NutritionMealInput>) => {
      setIsLoading(true);
      setError(null);

      try {
        await NutritionService.updateMeal(id, meal);
        await loadNutritionData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour du repas';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadNutritionData]
  );

  // Suppression d'un repas
  const deleteMeal = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const success = await NutritionService.deleteMeal(id);
        if (success) {
          await loadNutritionData();
        } else {
          setError('Erreur lors de la suppression du repas');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors de la suppression du repas';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadNutritionData]
  );

  // Mise à jour des objectifs
  const updateGoals = useCallback(
    async (newGoals: UpdateNutritionGoalsDTO) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const updatedGoals = await NutritionService.updateNutritionGoals(currentUserId, newGoals);
        setGoals(updatedGoals);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour des objectifs';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Recherche d'aliments
  const searchFoods = useCallback(async (query: FoodSearchQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await NutritionService.searchFoods(query);
      setSearchResults(results);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la recherche d'aliments";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement des recettes
  const loadRecipes = useCallback(
    async (filters?: { tags?: string[]; difficulty?: string }) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const recipesData = await NutritionService.getRecipes(currentUserId, filters);
        setRecipes(recipesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors du chargement des recettes';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Chargement des plans de repas
  const loadMealPlans = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const plansData = await NutritionService.getMealPlans(currentUserId);
      setMealPlans(plansData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du chargement des plans de repas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Chargement des tendances
  const loadTrends = useCallback(
    async (period: 'week' | 'month' | 'quarter') => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const trendsData = await NutritionService.getNutritionTrends(currentUserId, period);
        setTrends(trendsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors du chargement des tendances';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Rafraîchissement des données
  const refreshData = useCallback(async () => {
    await Promise.all([loadNutritionData(), loadAnalysis(), loadInsights()]);
  }, [loadNutritionData, loadAnalysis, loadInsights]);

  // Calculateurs
  const calculateDailyScore = useCallback((): number => {
    if (!nutritionData) return 0;
    return NutritionService.calculateNutritionScore(nutritionData);
  }, [nutritionData]);

  const calculateCalorieBalance = useCallback((): number => {
    if (!nutritionData) return 0;
    return nutritionData.totalCalories - nutritionData.dailyGoals.dailyCalories;
  }, [nutritionData]);

  const getMacroBalance = useCallback((): {
    proteins: number;
    carbohydrates: number;
    fats: number;
  } => {
    if (!nutritionData) return { proteins: 0, carbohydrates: 0, fats: 0 };

    const { totalMacros, dailyGoals } = nutritionData;
    return {
      proteins: Math.round((totalMacros.proteins / dailyGoals.macroTargets.proteins) * 100),
      carbohydrates: Math.round(
        (totalMacros.carbohydrates / dailyGoals.macroTargets.carbohydrates) * 100
      ),
      fats: Math.round((totalMacros.fats / dailyGoals.macroTargets.fats) * 100),
    };
  }, [nutritionData]);

  const getHydrationStatus = useCallback((): number => {
    if (!nutritionData) return 0;
    return Math.round((nutritionData.waterIntake / nutritionData.dailyGoals.waterGoal) * 100);
  }, [nutritionData]);

  // Chargement initial
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // État
    nutritionData,
    meals,
    goals,
    analysis,
    recipes,
    mealPlans,
    trends,
    insights,
    searchResults,
    isLoading,
    error,

    // Actions
    addMeal,
    updateMeal,
    deleteMeal,
    updateGoals,
    searchFoods,
    loadRecipes,
    loadMealPlans,
    loadTrends,
    refreshData,

    // Calculateurs
    calculateDailyScore,
    calculateCalorieBalance,
    getMacroBalance,
    getHydrationStatus,
  };
}
