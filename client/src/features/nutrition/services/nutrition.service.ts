import {
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

export class NutritionService {
  private static readonly BASE_URL = '/api/nutrition';

  // Récupération des données nutritionnelles
  static async getNutritionData(userId: string, date: string): Promise<NutritionData> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/daily/${date}`);
      if (!response.ok)
        throw new Error('Erreur lors de la récupération des données nutritionnelles');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API nutrition:', error);
      // Données de mock en cas d'erreur
      return this.getMockNutritionData(userId, date);
    }
  }

  /**
   * Récupère la nutrition quotidienne d'un utilisateur
   */
  static async getDailyNutrition(userId: string, date: string): Promise<NutritionData | null> {
    return this.getNutritionData(userId, date);
  }

  // Ajout d'un repas
  static async addMeal(userId: string, mealData: CreateMealDTO): Promise<Meal> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });
      if (!response.ok) throw new Error("Erreur lors de l'ajout du repas");
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur ajout repas:', error);
      throw error;
    }
  }

  /**
   * Enregistre un repas
   */
  static async logMeal(data: CreateMealDTO): Promise<Meal | null> {
    try {
      // Simulation d'un userId - en réalité, il viendrait du contexte d'auth
      const userId = 'current-user';
      return await this.addMeal(userId, data);
    } catch {
      // Erreur silencieuse
      console.error("Erreur lors de l'enregistrement du repas:", error);
      return null;
    }
  }

  /**
   * Met à jour un repas
   */
  static async updateMeal(id: string, data: Partial<CreateMealDTO>): Promise<Meal | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du repas');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour repas:', error);
      return null;
    }
  }

  /**
   * Supprime un repas
   */
  static async deleteMeal(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/meals/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      // Erreur silencieuse
      console.error('Erreur suppression repas:', error);
      return false;
    }
  }

  /**
   * Calcule les macros d'une liste de repas
   */
  static async calculateMacros(meals: Meal[]): Promise<{
    calories: number;
    macros: { proteins: number; carbohydrates: number; fats: number };
  } | null> {
    try {
      const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
      const totalMacros = meals.reduce(
        (acc, meal) => ({
          proteins: acc.proteins + meal.macros.proteins,
          carbohydrates: acc.carbohydrates + meal.macros.carbohydrates,
          fats: acc.fats + meal.macros.fats,
        }),
        { proteins: 0, carbohydrates: 0, fats: 0 }
      );

      return {
        calories: totalCalories,
        macros: totalMacros,
      };
    } catch {
      // Erreur silencieuse
      console.error('Erreur calcul macros:', error);
      return null;
    }
  }

  /**
   * Récupère les recommandations nutritionnelles
   */
  static async getRecommendations(profile: {
    age: number;
    weight: number;
    height: number;
    activityLevel: string;
    goal: string;
  }): Promise<NutritionGoals | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error('Erreur lors du calcul des recommandations');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur recommandations:', error);
      // Calcul basique en cas d'erreur
      return this.calculateBasicRecommendations(profile);
    }
  }

  // Recherche d'aliments
  static async searchFoods(query: FoodSearchQuery): Promise<FoodItem[]> {
    try {
      const params = new URLSearchParams({
        q: query.query,
        limit: (query.limit || 20).toString(),
      });

      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, value.toString());
        });
      }

      const response = await fetch(`${this.BASE_URL}/foods/search?${params}`);
      if (!response.ok) throw new Error("Erreur lors de la recherche d'aliments");
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur recherche aliments:', error);
      return this.getMockFoodSearchResults(query.query);
    }
  }

  // Mise à jour des objectifs nutritionnels
  static async updateNutritionGoals(
    userId: string,
    goals: UpdateNutritionGoalsDTO
  ): Promise<NutritionGoals> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goals),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour des objectifs');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour objectifs:', error);
      throw error;
    }
  }

  // Analyse nutritionnelle
  static async getNutritionAnalysis(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<NutritionAnalysis> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${userId}/analysis?start=${startDate}&end=${endDate}`
      );
      if (!response.ok) throw new Error("Erreur lors de l'analyse nutritionnelle");
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur analyse nutritionnelle:', error);
      return this.getMockNutritionAnalysis();
    }
  }

  // Récupération des recettes
  static async getRecipes(
    _userId: string,
    filters?: { tags?: string[]; difficulty?: string }
  ): Promise<Recipe[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);

      const response = await fetch(`${this.BASE_URL}/recipes?${params}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des recettes');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur récupération recettes:', error);
      return this.getMockRecipes();
    }
  }

  // Plan de repas
  static async getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/meal-plans`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des plans de repas');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur plans de repas:', error);
      return this.getMockMealPlans();
    }
  }

  // Tendances nutritionnelles
  static async getNutritionTrends(
    userId: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<NutritionTrend> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/trends/${period}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des tendances');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur tendances nutritionnelles:', error);
      return this.getMockNutritionTrends(period);
    }
  }

  // Insights nutritionnels
  static async getNutritionInsights(userId: string): Promise<NutritionInsight[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}/insights`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des insights');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur insights nutritionnels:', error);
      return this.getMockNutritionInsights();
    }
  }

  // Calcul du score nutritionnel
  static calculateNutritionScore(data: NutritionData): number {
    const { totalCalories, totalMacros, dailyGoals, waterIntake } = data;

    // Score des calories (30%)
    const calorieRatio = Math.min(totalCalories / dailyGoals.dailyCalories, 1.2);
    const calorieScore = calorieRatio <= 1.1 ? 100 : Math.max(0, 100 - (calorieRatio - 1.1) * 500);

    // Score des macros (40%)
    const proteinRatio = totalMacros.proteins / dailyGoals.macroTargets.proteins;
    const carbRatio = totalMacros.carbohydrates / dailyGoals.macroTargets.carbohydrates;
    const fatRatio = totalMacros.fats / dailyGoals.macroTargets.fats;

    const macroScore =
      (Math.min(proteinRatio, 1.2) * 0.4 +
        Math.min(carbRatio, 1.2) * 0.3 +
        Math.min(fatRatio, 1.2) * 0.3) *
      100;

    // Score d'hydratation (30%)
    const hydrationScore = Math.min(waterIntake / dailyGoals.waterGoal, 1) * 100;

    return Math.round(calorieScore * 0.3 + macroScore * 0.4 + hydrationScore * 0.3);
  }

  // Calcul de recommandations basiques
  private static calculateBasicRecommendations(profile: {
    age: number;
    weight: number;
    height: number;
    activityLevel: string;
    goal: string;
  }): NutritionGoals {
    // Calcul BMR (Basal Metabolic Rate) - formule de Mifflin-St Jeor
    const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5; // Pour les hommes

    // Facteur d'activité
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const activityFactor = activityFactors[profile.activityLevel] || 1.2;
    let dailyCalories = bmr * activityFactor;

    // Ajustement selon l'objectif
    if (profile.goal === 'weight_loss') {
      dailyCalories -= 500; // Déficit de 500 calories
    } else if (profile.goal === 'weight_gain') {
      dailyCalories += 500; // Surplus de 500 calories
    }

    // Calcul des macros (30% protéines, 40% glucides, 30% lipides)
    const proteins = (dailyCalories * 0.3) / 4; // 4 cal/g
    const carbohydrates = (dailyCalories * 0.4) / 4; // 4 cal/g
    const fats = (dailyCalories * 0.3) / 9; // 9 cal/g

    return {
      dailyCalories: Math.round(dailyCalories),
      macroTargets: {
        proteins: Math.round(proteins),
        carbohydrates: Math.round(carbohydrates),
        fats: Math.round(fats),
      },
      waterGoal: profile.weight * 35, // 35ml par kg de poids
    };
  }

  // === DONNÉES DE MOCK ===
  private static getMockNutritionData(userId: string, date: string): NutritionData {
    return {
      userId,
      date,
      meals: [
        {
          type: 'breakfast',
          name: 'Petit-déjeuner équilibré',
          timestamp: `${date}T08:00:00Z`,
          foods: [
            {
              name: "Flocons d'avoine",
              quantity: 50,
              unit: 'g',
              calories: 185,
              macros: { proteins: 6.5, carbohydrates: 33, fats: 3.5 },
            },
            {
              name: 'Banane',
              quantity: 120,
              unit: 'g',
              calories: 108,
              macros: { proteins: 1.3, carbohydrates: 27, fats: 0.4 },
            },
          ],
          totalCalories: 293,
          macros: { proteins: 7.8, carbohydrates: 60, fats: 3.9 },
        },
      ],
      totalCalories: 1847,
      totalMacros: { proteins: 95, carbohydrates: 220, fats: 65 },
      waterIntake: 1800,
      dailyGoals: {
        dailyCalories: 2000,
        macroTargets: { proteins: 100, carbohydrates: 250, fats: 70 },
        waterGoal: 2500,
      },
    };
  }

  private static getMockFoodSearchResults(query: string): FoodItem[] {
    const foods = [
      {
        name: 'Pomme Golden',
        brand: 'Bio',
        quantity: 100,
        unit: 'g' as const,
        calories: 52,
        macros: { proteins: 0.3, carbohydrates: 14, fats: 0.2 },
      },
      {
        name: 'Blanc de poulet',
        quantity: 100,
        unit: 'g' as const,
        calories: 165,
        macros: { proteins: 31, carbohydrates: 0, fats: 3.6 },
      },
      {
        name: 'Riz basmati',
        quantity: 100,
        unit: 'g' as const,
        calories: 356,
        macros: { proteins: 8.9, carbohydrates: 78, fats: 0.9 },
      },
    ];

    return foods.filter(food => food.name.toLowerCase().includes(query.toLowerCase()));
  }

  private static getMockNutritionAnalysis(): NutritionAnalysis {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today || '',
      calorieBalance: -153,
      macroBalance: {
        proteins: 95,
        carbohydrates: 88,
        fats: 93,
      },
      hydrationStatus: 72,
      nutritionScore: 78,
      recommendations: [
        "Augmentez votre consommation d'eau",
        'Ajoutez plus de légumes verts à vos repas',
        'Pensez à inclure des collations riches en protéines',
      ],
    };
  }

  private static getMockRecipes(): Recipe[] {
    return [
      {
        id: '1',
        name: 'Salade de quinoa aux légumes',
        description: 'Une salade nutritive et colorée',
        ingredients: [],
        instructions: ['Cuire le quinoa', 'Couper les légumes', 'Mélanger avec la vinaigrette'],
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        difficulty: 'easy',
        tags: ['healthy', 'vegetarian', 'lunch'],
        nutritionPerServing: {
          calories: 285,
          macros: { proteins: 12, carbohydrates: 45, fats: 8 },
        },
        createdBy: 'nutritionist',
        isPublic: true,
      },
    ];
  }

  private static getMockMealPlans(): MealPlan[] {
    return [
      {
        id: '1',
        name: 'Plan de perte de poids - 7 jours',
        description: 'Un plan équilibré pour une perte de poids saine',
        duration: 7,
        targetCalories: 1800,
        targetMacros: { proteins: 120, carbohydrates: 180, fats: 60 },
        meals: [],
        createdBy: 'nutritionist',
        isPublic: true,
      },
    ];
  }

  private static getMockNutritionTrends(period: 'week' | 'month' | 'quarter'): NutritionTrend {
    return {
      period,
      averageCalories: 1925,
      averageMacros: { proteins: 98, carbohydrates: 235, fats: 68 },
      averageHydration: 2100,
      consistency: 82,
      improvements: ['Meilleure hydratation', 'Apport en protéines plus régulier'],
      concerns: ['Consommation de sucres ajoutés élevée'],
    };
  }

  private static getMockNutritionInsights(): NutritionInsight[] {
    return [
      {
        type: 'achievement',
        title: 'Objectif protéines atteint !',
        description: 'Vous avez atteint votre objectif de protéines 5 jours consécutifs',
        data: { streak: 5, target: 100 },
        actionRequired: false,
        priority: 'low',
      },
      {
        type: 'warning',
        title: 'Hydratation insuffisante',
        description: "Votre consommation d'eau est en dessous de l'objectif depuis 3 jours",
        data: { currentIntake: 1800, target: 2500, deficit: 700 },
        actionRequired: true,
        priority: 'medium',
      },
    ];
  }
}
