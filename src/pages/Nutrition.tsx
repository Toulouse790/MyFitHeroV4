import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Target, 
  Utensils,
  Coffee,
  Sun,
  Moon as MoonIcon,
  Apple,
  ChevronRight,
  Camera,
  BarChart3,
  Droplets,
  Flame,
  Zap,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Meal, DailyStats, Json } from '@/lib/supabase'; // Importe les types de Supabase, y compris Json
import { User } from '@supabase/supabase-js'; // Importe le type User de Supabase

interface NutritionProps {
  userProfile?: User; // Reçoit le profil utilisateur de App.tsx via PrivateRoute
}

// Interface pour les aliments au sein d'un repas (correspond à la structure JSONB dans Supabase)
// Cette interface est cruciale et DOIT correspondre à la structure de vos objets aliments
interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Repas prédéfinis pour la démo, avec des données calculées ou saisies par l'utilisateur
const demoMealsStructure = {
  breakfast: {
    name: 'Petit-déjeuner',
    icon: Coffee,
    meal_type_db: 'breakfast', // Type à envoyer à la DB
  },
  lunch: {
    name: 'Déjeuner',
    icon: Sun,
    meal_type_db: 'lunch',
  },
  snack: {
    name: 'Collation',
    icon: Apple,
    meal_type_db: 'snack',
  },
  dinner: {
    name: 'Dîner',
    icon: MoonIcon,
    meal_type_db: 'dinner',
  }
};


const Nutrition: React.FC<NutritionProps> = ({ userProfile }) => {
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast'); // Change à 'mealType' pour la sélection
  const [meals, setMeals] = useState<Meal[]>([]); // Données réelles des repas
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  // Pour le formulaire d'ajout rapide (peut être étendu)
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState<number>(0);
  const [newFoodProtein, setNewFoodProtein] = useState<number>(0);
  const [newFoodCarbs, setNewFoodCarbs] = useState<number>(0);
  const [newFoodFat, setNewFoodFat] = useState<number>(0);


  // === CONNEXION AU STORE ZUSTAND ===
  const {
    dailyGoals, // Objectifs définis localement dans le store
    addMeal,
    fetchMeals,
    fetchDailyStats,
  } = useAppStore();

  // === CALCULS BASÉS SUR LES DONNÉES RÉELLES ===
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

  const currentCalories = dailyStats?.total_calories || 0;
  const goalCalories = dailyGoals.calories;
  const remainingCalories = goalCalories - currentCalories;
  const caloriesPercentage = Math.min((currentCalories / goalCalories) * 100, 100);

  const currentProtein = dailyStats?.total_protein || 0;
  const goalProtein = dailyGoals.protein;
  const proteinPercentage = Math.min((currentProtein / goalProtein) * 100, 100);

  const currentCarbs = dailyStats?.total_carbs || 0;
  const goalCarbs = dailyGoals.carbs;
  const carbsPercentage = Math.min((currentCarbs / goalCarbs) * 100, 100);

  const currentFat = dailyStats?.total_fat || 0;
  const goalFat = dailyGoals.fat;
  const fatPercentage = Math.min((currentFat / goalFat) * 100, 100);

  // === FONCTIONS DE RÉCUPÉRATION DES DONNÉES ===
  const loadNutritionData = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoadingData(true);
    setErrorFetching(null);
    try {
      const fetchedMeals = await fetchMeals(userProfile.id, today);
      setMeals(fetchedMeals);

      const fetchedDailyStats = await fetchDailyStats(userProfile.id, today);
      setDailyStats(fetchedDailyStats);

    } catch (err: unknown) {
      setErrorFetching('Erreur lors du chargement des données: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Failed to load nutrition data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [userProfile?.id, today, fetchMeals, fetchDailyStats]);

  useEffect(() => {
    loadNutritionData();
  }, [loadNutritionData]);


  // === ACTIONS D'AJOUT DE REPAS ===
  const handleAddFoodToMeal = async () => {
    if (!userProfile?.id || !newFoodName || !selectedMealType) {
      alert('Veuillez remplir le nom de l\'aliment et sélectionner un type de repas.');
      return;
    }

    setLoadingData(true);

    // CRÉATION D'UNE NOUVELLE COPIE DU TABLEAU foodsInMeal pour éviter l'avertissement ESLint et garantir l'immutabilité
    const currentMealData = meals.find(m => m.meal_type === selectedMealType);
    // Assertion de type pour la lecture (Json vers FoodItem[])
    const existingFoods: FoodItem[] = (currentMealData?.foods as unknown as FoodItem[] || []);
    
    // Crée un nouveau tableau avec l'ancien + le nouvel aliment
    const updatedFoodsInMeal: FoodItem[] = [...existingFoods, {
      name: newFoodName,
      calories: newFoodCalories,
      protein: newFoodProtein,
      carbs: newFoodCarbs,
      fat: newFoodFat
    }];

    // Recalculer les totaux pour ce repas (pour la nouvelle entrée)
    const totalCals = updatedFoodsInMeal.reduce((sum, food) => sum + food.calories, 0);
    const totalProt = updatedFoodsInMeal.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = updatedFoodsInMeal.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = updatedFoodsInMeal.reduce((sum, food) => sum + food.fat, 0);

    // Appel à addMeal pour enregistrer le nouveau repas/aliment
    // CORRECTION ICI: Double assertion de type pour l'envoi (FoodItem[] vers Json)
    const result = await addMeal(userProfile.id, selectedMealType, updatedFoodsInMeal as unknown as Json, totalCals, totalProt, totalCarbs, totalFat);

    if (result) {
      alert('Aliment ajouté avec succès !');
      setNewFoodName('');
      setNewFoodCalories(0);
      setNewFoodProtein(0);
      setNewFoodCarbs(0);
      setNewFoodFat(0);
      await loadNutritionData(); // Recharger toutes les données après l'ajout
    } else {
      alert('Échec de l\'ajout de l\'aliment.');
    }
  };

  // === COMPOSANTS DE PRÉSENTATION ===
  const MacroCard = ({ title, current, goal, unit, color, percentage }: { title: string; current: number; goal: number; unit: string; color: string; percentage: number }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-lg font-bold text-gray-800">{current}</span>
        <span className="text-sm text-gray-500">/ {goal} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );

  const MealCard = ({ mealTypeKey, isSelected, onClick }: { mealTypeKey: string; isSelected: boolean; onClick: (key: string) => void }) => {
    const mealDef = demoMealsStructure[mealTypeKey as keyof typeof demoMealsStructure];
    if (!mealDef) return null;

    const MealIcon = mealDef.icon;
    const actualMeal = meals.find(m => m.meal_type === mealDef.meal_type_db);
    const totalCals = actualMeal?.total_calories || 0;
    const mealTime = actualMeal?.created_at ? new Date(actualMeal.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return (
      <button
        onClick={() => onClick(mealTypeKey)}
        className={`w-full p-4 rounded-xl border transition-all duration-200 ${
          isSelected 
            ? 'border-fitness-growth bg-fitness-growth/5' 
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-fitness-growth text-white' : 'bg-gray-100 text-gray-600'}`}>
              <MealIcon size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">{mealDef.name}</h3>
              <p className="text-sm text-gray-500">{mealTime} • {totalCals} kcal</p>
            </div>
          </div>
          <ChevronRight size={20} className={isSelected ? 'text-fitness-growth' : 'text-gray-400'} />
        </div>
        
        {isSelected && actualMeal && (
          <div className="mt-4 space-y-2 animate-slide-up">
            {/* CORRECTION ICI: Assurer le typage correct des éléments 'foods' lors de l'affichage */}
            {(actualMeal.foods as unknown as FoodItem[] || []).map((food: FoodItem, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-t border-gray-100 first:border-t-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{food.name}</p>
                  <p className="text-xs text-gray-500">
                    P: {food.protein}g • G: {food.carbs}g • L: {food.fat}g
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-600">{food.calories} kcal</span>
              </div>
            ))}
            {/* Formulaire d'ajout rapide d'aliment */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-800 text-sm">Ajouter un aliment à ce repas</h4>
              <input
                type="text"
                placeholder="Nom de l'aliment"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Calories (kcal)"
                value={newFoodCalories || ''}
                onChange={(e) => setNewFoodCalories(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Protéines (g)"
                value={newFoodProtein || ''}
                onChange={(e) => setNewFoodProtein(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Glucides (g)"
                value={newFoodCarbs || ''}
                onChange={(e) => setNewFoodCarbs(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Lipides (g)"
                value={newFoodFat || ''}
                onChange={(e) => setNewFoodFat(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <button 
                onClick={handleAddFoodToMeal}
                className="w-full bg-fitness-growth text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center disabled:opacity-50"
                disabled={loadingData || !newFoodName}
              >
                {loadingData ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-1" />}
                Ajouter l'aliment
              </button>
            </div>
          </div>
        )}
      </button>
    );
  };

  const quickActions = [
    { name: 'Scanner', icon: Camera, color: 'bg-blue-500' },
    { name: 'Eau', icon: Droplets, color: 'bg-cyan-500' },
    { name: 'Recettes', icon: Utensils, color: 'bg-green-500' },
    { name: 'Stats', icon: BarChart3, color: 'bg-purple-500' }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nutrition</h1>
            <p className="text-gray-600">Suivez votre alimentation quotidienne</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Calories principales */}
        <div className="bg-gradient-growth p-5 rounded-xl text-white">
          {loadingData ? (
            <div className="text-center py-8">Chargement des données...</div>
          ) : errorFetching ? (
            <div className="text-center py-8 text-red-100">{errorFetching}</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Calories aujourd'hui</h3>
                <Target size={24} />
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">{currentCalories}</div>
                <div className="text-white/80">sur {goalCalories} kcal</div>
                <div className="text-sm text-white/70 mt-1">
                  {remainingCalories > 0 ? `${remainingCalories} kcal restantes` : `${Math.abs(remainingCalories)} kcal dépassées`}
                </div>
              </div>

              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-white/80">
                {caloriesPercentage}% de l'objectif atteint
              </div>
            </>
          )}
        </div>

        {/* Actions rapides */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <button 
                  key={index}
                  className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <div className={`p-3 rounded-full ${action.color} mb-2`}>
                    <ActionIcon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Macronutriments */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Macronutriments</h2>
          <div className="grid grid-cols-2 gap-3">
            <MacroCard
              title="Protéines"
              current={currentProtein}
              goal={goalProtein}
              unit="g"
              color="bg-red-500"
              percentage={proteinPercentage}
            />
            <MacroCard
              title="Glucides"
              current={currentCarbs}
              goal={goalCarbs}
              unit="g"
              color="bg-blue-500"
              percentage={carbsPercentage}
            />
            <MacroCard
              title="Lipides"
              current={currentFat}
              goal={goalFat}
              unit="g"
              color="bg-yellow-500"
              percentage={fatPercentage}
            />
            {/* La MacroCard Hydratation n'a pas de propriété 'title' dans l'appel d'origine, ajoutons-la */}
            <MacroCard
              title="Hydratation"
              current={dailyStats?.water_intake_ml ? (dailyStats.water_intake_ml / 1000) : 0}
              goal={dailyGoals.water}
              unit="L"
              color="bg-cyan-500"
              percentage={dailyStats?.water_intake_ml ? Math.round((dailyStats.water_intake_ml / (dailyGoals.water * 1000)) * 100) : 0} 
            />
          </div>
        </div>

        {/* Repas du jour */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Repas du jour</h2>
            <button className="text-fitness-growth text-sm font-medium flex items-center">
              Planning <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {loadingData ? (
                <div className="text-center py-8">Chargement des repas...</div>
            ) : errorFetching ? (
                <div className="text-center py-8 text-red-500">{errorFetching}</div>
            ) : meals.length > 0 ? (
                // Affiche les MealCards pour chaque type de repas défini
                Object.keys(demoMealsStructure).map((mealTypeKey) => (
                    <MealCard
                        key={mealTypeKey}
                        mealTypeKey={mealTypeKey}
                        isSelected={selectedMealType === mealTypeKey}
                        onClick={setSelectedMealType}
                    />
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <Apple size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Aucun repas enregistré aujourd'hui.</p>
                    <p className="text-sm">Ajoutez votre premier repas !</p>
                </div>
            )}
          </div>
        </div>

        {/* Conseils du jour */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Conseil du jour</h3>
              <p className="text-blue-700 text-sm">
                Pensez à boire un verre d'eau avant chaque repas pour améliorer votre digestion et votre sensation de satiété.
              </p>
            </div>
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Nutrition;