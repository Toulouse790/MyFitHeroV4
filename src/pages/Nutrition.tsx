import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Loader2,
  Info,
  Dumbbell,
  Footprints
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Meal, DailyStats, Json } from '@/lib/supabase';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// --- TYPES & INTERFACES DE PERSONNALISATION ---

type Sport = 'strength' | 'basketball' | 'american_football' | 'tennis' | 'endurance';

interface User {
  name: string;
  sport: Sport;
}

interface MealSuggestion {
  name: string;
  icon: React.ElementType;
  meal_type_db: string;
}

interface SportNutritionConfig {
  emoji: string;
  calorieModifier: number; // Ajout/soustraction aux objectifs de base
  proteinMultiplier: number; // Multiplicateur pour les protéines
  carbMultiplier: number; // Multiplicateur pour les glucides
  dailyTip: string;
  hydrationTip: string;
  mealSuggestions: { [key: string]: MealSuggestion };
}

// --- CONFIGURATION NUTRITIONNELLE PAR SPORT ---

const sportsNutritionData: Record<Sport, SportNutritionConfig> = {
  strength: {
    emoji: '💪',
    calorieModifier: 300,
    proteinMultiplier: 1.5,
    carbMultiplier: 1.0,
    dailyTip: "Priorisez les protéines dans les 90 minutes après l'entraînement pour maximiser la réparation et la croissance musculaire. La créatine peut également être un supplément efficace.",
    hydrationTip: "Une bonne hydratation est cruciale pour la force. Visez au moins 2.5L par jour.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner Protéiné', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner', icon: Sun, meal_type_db: 'lunch' },
      post_workout: { name: 'Post-Entraînement', icon: Dumbbell, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  basketball: {
    emoji: '🏀',
    calorieModifier: 250,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.3,
    dailyTip: "Les glucides à action rapide 1-2h avant un match ou un entraînement intense peuvent vous donner l'énergie explosive nécessaire sur le terrain.",
    hydrationTip: "L'hydratation est la clé de l'endurance. Buvez régulièrement tout au long de la journée, pas seulement pendant l'effort.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner', icon: Coffee, meal_type_db: 'breakfast' },
      pre_game: { name: 'Repas pré-match', icon: Zap, meal_type_db: 'lunch' },
      snack: { name: 'Collation énergétique', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner de récupération', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  american_football: {
    emoji: '🏈',
    calorieModifier: 500,
    proteinMultiplier: 1.6,
    carbMultiplier: 1.1,
    dailyTip: "Un apport calorique élevé et riche en protéines est essentiel pour construire et maintenir la masse musculaire nécessaire à l'impact.",
    hydrationTip: "Ne sous-estimez pas les pertes d'eau sous l'équipement. Buvez plus que votre soif.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner de Masse', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner Riche', icon: Sun, meal_type_db: 'lunch' },
      snack: { name: 'Collation', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  tennis: {
    emoji: '🎾',
    calorieModifier: 150,
    proteinMultiplier: 1.1,
    carbMultiplier: 1.2,
    dailyTip: "Pendant un long match, des collations faciles à digérer comme une banane ou un gel énergétique peuvent maintenir votre niveau d'énergie.",
    hydrationTip: "Pensez aux électrolytes ! Ajoutez une pincée de sel et un peu de jus de citron à votre eau pour compenser les pertes dues à la transpiration.",
    mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Déjeuner Léger', icon: Sun, meal_type_db: 'lunch' },
      on_court_snack: { name: 'Collation (Court)', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  },
  endurance: {
    emoji: '🏃‍♂️',
    calorieModifier: 400,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.5,
    dailyTip: "Les glucides complexes (avoine, riz complet, patates douces) sont votre meilleur carburant. Consommez-les régulièrement pour maintenir vos réserves d'énergie.",
    hydrationTip: "Commencez à vous hydrater bien avant une longue sortie. L'hydratation de la veille est tout aussi importante.",
     mealSuggestions: {
      breakfast: { name: 'Petit-déjeuner Énergie', icon: Coffee, meal_type_db: 'breakfast' },
      lunch: { name: 'Repas Glucides Complexes', icon: Footprints, meal_type_db: 'lunch' },
      snack: { name: 'Collation', icon: Apple, meal_type_db: 'snack' },
      dinner: { name: 'Dîner de Récupération', icon: MoonIcon, meal_type_db: 'dinner' },
    }
  }
};


const Nutrition: React.FC<NutritionProps> = ({ userProfile }) => {
  // --- SIMULATION UTILISATEUR & CONFIG ---
  const currentUser: User = {
    name: 'Alex',
    sport: 'strength' // Changez ici pour tester: 'basketball', 'tennis', 'endurance', 'american_football'
  };
  
  const sportConfig = sportsNutritionData[currentUser.sport];

  // --- STATE MANAGEMENT ---
  const [selectedMealType, setSelectedMealType] = useState<string>(Object.keys(sportConfig.mealSuggestions)[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState<number>(0);
  // ... autres états pour les champs de formulaire ...
  const [newFoodProtein, setNewFoodProtein] = useState<number>(0);
  const [newFoodCarbs, setNewFoodCarbs] = useState<number>(0);
  const [newFoodFat, setNewFoodFat] = useState<number>(0);

  const { toast } = useToast();

  const {
    dailyGoals: baseDailyGoals, // On renomme les objectifs de base
    addMeal,
    fetchMeals,
    fetchDailyStats,
  } = useAppStore();

  // --- LOGIQUE DE PERSONNALISATION ---

  // Calcul des objectifs personnalisés avec useMemo pour la performance
  const personalizedGoals = useMemo(() => {
    return {
      calories: baseDailyGoals.calories + sportConfig.calorieModifier,
      protein: Math.round(baseDailyGoals.protein * sportConfig.proteinMultiplier),
      carbs: Math.round(baseDailyGoals.carbs * sportConfig.carbMultiplier),
      water: baseDailyGoals.water // L'objectif d'eau reste de base, mais le conseil change
    };
  }, [baseDailyGoals, sportConfig]);
  
  const today = new Date().toISOString().split('T')[0];

  const currentCalories = dailyStats?.total_calories || 0;
  const goalCalories = personalizedGoals.calories;
  const remainingCalories = goalCalories - currentCalories;
  const caloriesPercentage = goalCalories > 0 ? Math.min((currentCalories / goalCalories) * 100, 100) : 0;

  const currentProtein = dailyStats?.total_protein || 0;
  const goalProtein = personalizedGoals.protein;
  const proteinPercentage = goalProtein > 0 ? Math.min((currentProtein / goalProtein) * 100, 100) : 0;
  
  // ... calculs similaires pour les autres macros
  const currentCarbs = dailyStats?.total_carbs || 0;
  const goalCarbs = personalizedGoals.carbs;
  const carbsPercentage = goalCarbs > 0 ? Math.min((currentCarbs / goalCarbs) * 100, 100) : 0;

  const currentFat = dailyStats?.total_fat || 0;
  const goalFat = baseDailyGoals.fat; // Lipides non modifiés dans cet exemple
  const fatPercentage = goalFat > 0 ? Math.min((currentFat / goalFat) * 100, 100) : 0;


  // --- DATA FETCHING & ACTIONS (inchangées, mais importantes pour le contexte) ---
  const loadNutritionData = useCallback(async () => {
    // ... (code de chargement des données existant)
  }, [userProfile?.id, today, fetchMeals, fetchDailyStats]);

  useEffect(() => {
    // loadNutritionData(); // Décommenter dans un projet réel
    setLoadingData(false); // Pour la démo, on arrête le chargement immédiatement
  }, [loadNutritionData]);

  const handleAddFoodToMeal = async () => {
    // ... (code d'ajout d'aliment existant)
  };
  
  // --- SOUS-COMPOSANTS (avec adaptations mineures) ---

  const MacroCard = ({ title, current, goal, unit, color, percentage, tip }: { title: string; current: number; goal: number; unit: string; color: string; percentage: number, tip?: string }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          <span className="text-xs font-medium" style={{color: color.replace('bg-', 'text-')}}>{Math.round(percentage)}%</span>
        </div>
        <div className="flex items-baseline space-x-1 mb-2">
          <span className="text-lg font-bold text-gray-800">{Math.round(current)}</span>
          <span className="text-sm text-gray-500">/ {goal} {unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${color} rounded-full h-2 transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      {tip && (
        <div className="flex items-start mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{tip}</span>
        </div>
      )}
    </div>
  );

  const MealCard = ({ mealTypeKey, isSelected, onClick }: { mealTypeKey: string; isSelected: boolean; onClick: (key: string) => void }) => {
    const mealDef = sportConfig.mealSuggestions[mealTypeKey];
    if (!mealDef) return null;

    const MealIcon = mealDef.icon;
    const actualMeal = meals.find(m => m.meal_type === mealDef.meal_type_db);
    const totalCals = actualMeal?.total_calories || 0;
    
    // ... (logique d'affichage de MealCard existante) ...
  };
  
  // ...

  // --- RENDER DU COMPOSANT PRINCIPAL ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header Personnalisé */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 text-3xl">{sportConfig.emoji}</span>
              Nutrition
            </h1>
            <p className="text-gray-600">Suivi adapté pour {currentUser.sport.replace('_', ' ')}</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Calories avec Objectif Personnalisé */}
        <div className="bg-gradient-growth p-5 rounded-xl text-white">
          {/* ... (logique de chargement existante) ... */}
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Calories aujourd'hui</h3>
              <Target size={24} />
            </div>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-1">{currentCalories}</div>
              <div className="text-white/80">sur {goalCalories} kcal (Objectif {currentUser.sport})</div>
              {/* ... */}
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-2">
              <div className="bg-white rounded-full h-3" style={{ width: `${caloriesPercentage}%` }} />
            </div>
          </>
        </div>

        {/* ... (Actions rapides inchangées) ... */}

        {/* Macronutriments Personnalisés */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Vos Macros Personnalisées</h2>
          <div className="grid grid-cols-2 gap-3">
            <MacroCard title="Protéines" current={currentProtein} goal={goalProtein} unit="g" color="bg-red-500" percentage={proteinPercentage} />
            <MacroCard title="Glucides" current={currentCarbs} goal={goalCarbs} unit="g" color="bg-blue-500" percentage={carbsPercentage} />
            <MacroCard title="Lipides" current={currentFat} goal={goalFat} unit="g" color="bg-yellow-500" percentage={fatPercentage} />
            <MacroCard 
              title="Hydratation" 
              current={dailyStats?.water_intake_ml ? (dailyStats.water_intake_ml / 1000) : 0}
              goal={personalizedGoals.water}
              unit="L"
              color="bg-cyan-500"
              percentage={dailyStats?.water_intake_ml ? Math.round((dailyStats.water_intake_ml / (personalizedGoals.water * 1000)) * 100) : 0}
              tip={sportConfig.hydrationTip}
            />
          </div>
        </div>

        {/* Repas du jour avec Suggestions Personnalisées */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Repas du jour</h2>
          <div className="space-y-3">
            {Object.keys(sportConfig.mealSuggestions).map((mealTypeKey) => (
              // Le composant MealCard utiliserait maintenant sportConfig.mealSuggestions pour s'afficher
              // Pour la démo, on affiche juste le nom :
               <button key={mealTypeKey} className="w-full text-left p-4 rounded-xl border bg-white flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    {React.createElement(sportConfig.mealSuggestions[mealTypeKey].icon, { size: 20 })}
                  </div>
                  <h3 className="font-semibold text-gray-800">{sportConfig.mealSuggestions[mealTypeKey].name}</h3>
               </button>
            ))}
          </div>
        </div>

        {/* Conseil du jour Personnalisé */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Conseil du jour pour {currentUser.sport.replace('_', ' ')}</h3>
              <p className="text-blue-700 text-sm">{sportConfig.dailyTip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
