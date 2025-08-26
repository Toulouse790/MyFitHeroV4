// client/src/pages/Nutrition.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Coffee,
  Sun,
  Moon as MoonIcon,
  Apple,
  Zap,
  Info,
  Dumbbell,
  Footprints,
  Trophy,
  AlertTriangle,
  Plus,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Brain,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AIIntelligence from '@/components/AIIntelligence';
import { UniformHeader } from '@/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

// --- TYPES & INTERFACES ---
type Sport = 'strength' | 'basketball' | 'american_football' | 'tennis' | 'endurance' | 'football';

interface MealSuggestion {
  name: string;
  icon: React.ElementType;
  meal_type_db: string;
  calories?: number;
  description?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SportNutritionConfig {
  emoji: string;
  calorieModifier: number;
  proteinMultiplier: number;
  carbMultiplier: number;
  dailyTip: string;
  hydrationTip: string;
  mealSuggestions: { [key: string]: MealSuggestion };
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface DailyNutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  lastUpdated: Date;
}

// --- CONFIGURATION NUTRITIONNELLE PAR SPORT ---
const sportsNutritionData: Record<Sport, SportNutritionConfig> = {
  strength: {
    emoji: '💪',
    calorieModifier: 300,
    proteinMultiplier: 1.5,
    carbMultiplier: 1.0,
    dailyTip: "Priorisez les protéines dans les 90 minutes après l'entraînement pour maximiser la réparation et la croissance musculaire.",
    hydrationTip: "Une bonne hydratation est cruciale pour la force. Visez au moins 2.5L par jour.",
    mealSuggestions: {
      breakfast: { 
        name: 'Petit-déjeuner Protéiné', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 450,
        description: 'Œufs, avoine, fruits',
        priority: 'high'
      },
      post_workout: { 
        name: 'Post-Entraînement', 
        icon: Dumbbell, 
        meal_type_db: 'snack',
        calories: 250,
        description: 'Protéine + glucides rapides',
        priority: 'high'
      },
      lunch: { 
        name: 'Déjeuner Force', 
        icon: Sun, 
        meal_type_db: 'lunch',
        calories: 650,
        description: 'Viande maigre, riz, légumes',
        priority: 'medium'
      },
      dinner: { 
        name: 'Dîner Récupération', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 600,
        description: 'Poisson, quinoa, légumes verts',
        priority: 'medium'
      },
    }
  },
  basketball: {
    emoji: '🏀',
    calorieModifier: 250,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.3,
    dailyTip: "Les glucides à action rapide 1-2h avant un match peuvent vous donner l'énergie explosive nécessaire.",
    hydrationTip: "L'hydratation est la clé de l'endurance. Buvez régulièrement tout au long de la journée.",
    mealSuggestions: {
      pre_game: { 
        name: 'Repas pré-match', 
        icon: Zap, 
        meal_type_db: 'lunch',
        calories: 550,
        description: 'Pâtes, sauce tomate, blanc de poulet',
        priority: 'high'
      },
      snack: { 
        name: 'Collation énergétique', 
        icon: Apple, 
        meal_type_db: 'snack',
        calories: 200,
        description: 'Fruits secs, eau de coco',
        priority: 'high'
      },
      breakfast: { 
        name: 'Petit-déjeuner Énergie', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 400,
        description: 'Banane, flocons d\'avoine, miel',
        priority: 'medium'
      },
      dinner: { 
        name: 'Dîner de récupération', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 650,
        description: 'Saumon, patate douce, brocolis',
        priority: 'medium'
      },
    }
  },
  american_football: {
    emoji: '🏈',
    calorieModifier: 500,
    proteinMultiplier: 1.6,
    carbMultiplier: 1.1,
    dailyTip: "Un apport calorique élevé et riche en protéines est essentiel pour construire et maintenir la masse musculaire.",
    hydrationTip: "Ne sous-estimez pas les pertes d'eau sous l'équipement. Buvez plus que votre soif.",
    mealSuggestions: {
      breakfast: { 
        name: 'Petit-déjeuner de Masse', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 600,
        description: 'Œufs brouillés, bacon, pain complet',
        priority: 'high'
      },
      snack: { 
        name: 'Collation Masse', 
        icon: Apple, 
        meal_type_db: 'snack',
        calories: 350,
        description: 'Shake protéiné, noix',
        priority: 'high'
      },
      lunch: { 
        name: 'Déjeuner Riche', 
        icon: Sun, 
        meal_type_db: 'lunch',
        calories: 800,
        description: 'Bœuf, riz, avocat',
        priority: 'medium'
      },
      dinner: { 
        name: 'Dîner Puissance', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 750,
        description: 'Steak, pommes de terre, épinards',
        priority: 'medium'
      },
    }
  },
  tennis: {
    emoji: '🎾',
    calorieModifier: 150,
    proteinMultiplier: 1.1,
    carbMultiplier: 1.2,
    dailyTip: "Pendant un long match, des collations faciles à digérer comme une banane peuvent maintenir votre énergie.",
    hydrationTip: "Pensez aux électrolytes ! Ajoutez une pincée de sel et un peu de jus de citron à votre eau.",
    mealSuggestions: {
      on_court_snack: { 
        name: 'Collation Court', 
        icon: Apple, 
        meal_type_db: 'snack',
        calories: 150,
        description: 'Banane, gel énergétique',
        priority: 'high'
      },
      breakfast: { 
        name: 'Petit-déjeuner Léger', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 350,
        description: 'Yaourt grec, fruits, granola',
        priority: 'high'
      },
      lunch: { 
        name: 'Déjeuner Équilibré', 
        icon: Sun, 
        meal_type_db: 'lunch',
        calories: 500,
        description: 'Salade de quinoa, légumes',
        priority: 'medium'
      },
      dinner: { 
        name: 'Dîner Récupération', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 550,
        description: 'Poisson blanc, légumes vapeur',
        priority: 'medium'
      },
    }
  },
  endurance: {
    emoji: '🏃‍♂️',
    calorieModifier: 400,
    proteinMultiplier: 1.2,
    carbMultiplier: 1.5,
    dailyTip: "Les glucides complexes (avoine, riz complet, patates douces) sont votre meilleur carburant.",
    hydrationTip: "Commencez à vous hydrater bien avant une longue sortie. L'hydratation de la veille est importante.",
    mealSuggestions: {
      breakfast: { 
        name: 'Petit-déjeuner Énergie', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 500,
        description: 'Porridge, banane, miel',
        priority: 'high'
      },
      snack: { 
        name: 'Collation Endurance', 
        icon: Apple, 
        meal_type_db: 'snack',
        calories: 250,
        description: 'Dattes, amandes',
        priority: 'high'
      },
      lunch: { 
        name: 'Repas Glucides Complexes', 
        icon: Footprints, 
        meal_type_db: 'lunch',
        calories: 650,
        description: 'Pâtes complètes, légumes',
        priority: 'medium'
      },
      dinner: { 
        name: 'Dîner de Récupération', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 600,
        description: 'Saumon, patate douce',
        priority: 'medium'
      },
    }
  },
  football: {
    emoji: '⚽',
    calorieModifier: 200,
    proteinMultiplier: 1.1,
    carbMultiplier: 1.4,
    dailyTip: "L'endurance nécessite des réserves de glycogène pleines. Mangez des glucides complexes 3-4h avant les matchs.",
    hydrationTip: "Pendant les 90 minutes de jeu, votre corps perd beaucoup d'eau. Hydratez-vous avant, pendant et après.",
    mealSuggestions: {
      pre_match: { 
        name: 'Repas pré-match', 
        icon: Zap, 
        meal_type_db: 'lunch',
        calories: 600,
        description: 'Riz, poulet, légumes',
        priority: 'high'
      },
      half_time: { 
        name: 'Mi-temps', 
        icon: Apple, 
        meal_type_db: 'snack',
        calories: 100,
        description: 'Orange, eau',
        priority: 'high'
      },
      breakfast: { 
        name: 'Petit-déjeuner Foot', 
        icon: Coffee, 
        meal_type_db: 'breakfast',
        calories: 400,
        description: 'Céréales, lait, fruits',
        priority: 'medium'
      },
      dinner: { 
        name: 'Récupération', 
        icon: MoonIcon, 
        meal_type_db: 'dinner',
        calories: 650,
        description: 'Poisson, quinoa, légumes',
        priority: 'medium'
      },
    }
  }
};

const Nutrition: React.FC = () => {
  // --- HOOKS ET STATE ---
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appStoreUser } = useAppStore();
  
  const [dailyData, setDailyData] = useState<DailyNutritionData>({
    calories: 850,
    protein: 45,
    carbs: 120,
    fat: 25,
    water: 1200,
    lastUpdated: new Date()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);

  // --- MAPPING SPORT UTILISATEUR ---
  const getSportCategory = useCallback((sport: string): Sport => {
    const mappings: Record<string, Sport> = {
      'basketball': 'basketball',
      'tennis': 'tennis', 
      'american_football': 'american_football',
      'football': 'football',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'course à pied': 'endurance',
      'musculation': 'strength',
      'powerlifting': 'strength',
      'crossfit': 'strength',
      'weightlifting': 'strength'
    };
    return mappings[sport?.toLowerCase()] || 'strength';
  }, []);

  const userSport = getSportCategory(appStoreUser.sport || 'none');
  const sportConfig = sportsNutritionData[userSport];

  // --- CALCULS PERSONNALISÉS SÉCURISÉS ---
  const personalizedGoals = useMemo((): NutritionGoals => {
    const weight = appStoreUser?.weight_kg ?? 70;
    const height = appStoreUser?.height_cm ?? 170;
    const age = appStoreUser?.age ?? 30;
    const gender = appStoreUser?.gender ?? 'male';
    
    // Vérifier si le profil est complet
    const isIncomplete = !appStoreUser?.weight_kg || !appStoreUser?.height_cm || !appStoreUser?.age;
    setProfileIncomplete(isIncomplete);
    
    let baseCalories = appStoreUser?.daily_calories || 0;
    
    // Calcul BMR avec formule Harris-Benedict
    if (!baseCalories && weight && height && age) {
      const bmr = gender === 'male'
        ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      
      const activityFactor = {
        'student': 1.4,
        'office_worker': 1.3, 
        'physical_job': 1.6,
        'retired': 1.2
      }[appStoreUser?.lifestyle as string] ?? 1.4;
      
      baseCalories = Math.round(bmr * activityFactor);
    }
    
    // Valeur de sécurité si calcul impossible
    if (!baseCalories) {
      baseCalories = gender === 'male' ? 2200 : 1800;
    }

    // Ajustements selon objectifs
    let calorieAdjustment = 0;
    if (appStoreUser?.primary_goals?.includes('weight_loss')) calorieAdjustment -= 300;
    if (appStoreUser?.primary_goals?.includes('muscle_gain')) calorieAdjustment += 400;
    
    const finalCalories = baseCalories + sportConfig.calorieModifier + calorieAdjustment;
    
    return {
      calories: finalCalories,
      protein: Math.round((finalCalories * 0.15 / 4) * sportConfig.proteinMultiplier),
      carbs: Math.round((finalCalories * 0.50 / 4) * sportConfig.carbMultiplier),
      fat: Math.round((finalCalories * 0.30 / 9)),
      water: Math.round(weight * 35) // 35ml par kg de poids
    };
  }, [appStoreUser, sportConfig]);

  // --- CHARGEMENT DES DONNÉES NUTRITIONNELLES ---
  const loadNutritionData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_stats')
        .select('total_calories, total_protein, total_carbs, total_fat, water_intake_ml')
        .eq('user_id', appStoreUser.id)
        .eq('stat_date', today)
        .single();

      if (!error && data) {
        setDailyData({
          calories: data.total_calories || 0,
          protein: data.total_protein || 0,
          carbs: data.total_carbs || 0,
          fat: data.total_fat || 0,
          water: data.water_intake_ml || 0,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur chargement nutrition:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id]);

  // --- HANDLERS ---
  const handleOpenMeal = useCallback((mealTypeDb: string, mealName: string) => {
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'meal_suggestion_clicked', {
        meal_type: mealTypeDb,
        meal_name: mealName,
        sport: userSport,
        user_id: appStoreUser?.id
      });
    }

    // Navigation vers la page de détail du repas
    navigate(`/meals/${mealTypeDb}`, { 
      state: { 
        suggestionName: mealName,
        sportOptimized: true,
        userSport
      }
    });
  }, [navigate, userSport, appStoreUser?.id]);

  const handleCompleteProfile = useCallback(() => {
    navigate('/profile/complete');
  }, [navigate]);

  const handleAddFood = useCallback(() => {
    navigate('/meals/add');
  }, [navigate]);

  // --- CALCULS POURCENTAGES ---
  const caloriesPercentage = Math.min((dailyData.calories / personalizedGoals.calories) * 100, 100);
  const proteinPercentage = Math.min((dailyData.protein / personalizedGoals.protein) * 100, 100);
  const carbsPercentage = Math.min((dailyData.carbs / personalizedGoals.carbs) * 100, 100);
  const fatPercentage = Math.min((dailyData.fat / personalizedGoals.fat) * 100, 100);
  const waterPercentage = Math.min((dailyData.water / personalizedGoals.water) * 100, 100);

  // --- COMPOSANTS ---
  const MacroCard = ({ title, current, goal, unit, color, percentage, tip, compact = false }: {
    title: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
    percentage: number;
    tip?: string;
    compact?: boolean;
  }) => (
    <Card className="bg-white border-gray-100">
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-medium text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h4>
          <Badge variant="outline" className="text-xs">
            {Math.round(percentage)}%
          </Badge>
        </div>
        <div className="flex items-baseline space-x-1 mb-2">
          <span className={`font-bold text-gray-800 ${compact ? 'text-base' : 'text-lg'}`}>
            {Math.round(current)}
          </span>
          <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            / {goal} {unit}
          </span>
        </div>
        <Progress value={percentage} className={`mb-2 ${compact ? 'h-1' : 'h-2'}`} />
        {tip && !compact && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
            <Info size={12} className="inline mr-1" />
            {tip}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = useCallback(() => {
    const progress = (dailyData.calories / personalizedGoals.calories) * 100;
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    
    if (progress >= 90) {
      return `🎯 Parfait ${userName} ! Objectif nutritionnel atteint`;
    } else if (progress >= 70) {
      return `💪 Excellent ${userName}, tu nourris bien ton corps !`;
    } else if (progress >= 50) {
      return `⚡ Bien joué ${userName}, continue !`;
    } else {
      return `🍎 ${userName}, ton corps a besoin de plus de carburant !`;
    }
  }, [dailyData.calories, personalizedGoals.calories, appStoreUser]);

  // Repas prioritaires
  const getPriorityMeals = useCallback(() => {
    const meals = Object.entries(sportConfig.mealSuggestions);
    const highPriority = meals.filter(([_, meal]) => meal.priority === 'high');
    return highPriority.slice(0, 2); // Top 2 repas prioritaires
  }, [sportConfig.mealSuggestions]);

  // --- EFFECTS ---
  useEffect(() => {
    loadNutritionData();
  }, [loadNutritionData]);

  useEffect(() => {
    if (profileIncomplete) {
      toast({
        title: "Profil incomplet",
        description: "Complétez votre profil pour des recommandations nutritionnelles précises",
        variant: "default",
        action: (
          <Button size="sm" onClick={handleCompleteProfile}>
            Compléter
          </Button>
        )
      });
    }
  }, [profileIncomplete, toast, handleCompleteProfile]);

  const priorityMeals = getPriorityMeals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Header Uniforme */}
        <UniformHeader
          title="Nutrition"
          subtitle={`${sportConfig.emoji} ${getPersonalizedMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Alerte Profil Incomplet */}
        {profileIncomplete && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Profil incomplet
                  </h3>
                  <p className="text-amber-700 text-sm mb-3">
                    Renseignez votre poids, taille et âge pour des calculs nutritionnels précis.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleCompleteProfile}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Compléter mon profil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calories avec Objectif Personnalisé - FOCUS */}
        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Calories aujourd'hui</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  className="text-white hover:bg-white/20"
                >
                  {showDetailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Target size={24} />
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-1">{dailyData.calories}</div>
              <div className="text-white/80">
                sur {personalizedGoals.calories} kcal ({appStoreUser?.sport || 'sport'})
              </div>
              <div className="text-sm text-white/70 mt-1">
                {personalizedGoals.calories - dailyData.calories > 0 
                  ? `${personalizedGoals.calories - dailyData.calories} kcal restantes`
                  : 'Objectif atteint ! 🎉'
                }
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500" 
                style={{ width: `${caloriesPercentage}%` }} 
              />
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={handleAddFood}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un aliment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Macronutriments - MODE COMPACT/DÉTAILLÉ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Vos Macros</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={showDetailedView ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="text-xs"
              >
                {showDetailedView ? "Vue Simple" : "Vue Détaillée"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/nutrition/details')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </div>
          </div>
          
          {showDetailedView ? (
            // Vue détaillée avec tabs
            <Tabs defaultValue="macros" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="macros">Macronutriments</TabsTrigger>
                <TabsTrigger value="hydration">Hydratation</TabsTrigger>
              </TabsList>
              <TabsContent value="macros" className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <MacroCard 
                    title="Protéines" 
                    current={dailyData.protein} 
                    goal={personalizedGoals.protein} 
                    unit="g" 
                    color="bg-red-500" 
                    percentage={proteinPercentage}
                    tip={userSport === 'strength' ? 'Crucial pour la masse musculaire' : 'Important pour la récupération'}
                  />
                  <MacroCard 
                    title="Glucides" 
                    current={dailyData.carbs} 
                    goal={personalizedGoals.carbs} 
                    unit="g" 
                    color="bg-blue-500" 
                    percentage={carbsPercentage}
                    tip={userSport === 'endurance' ? 'Votre carburant principal' : 'Énergie pour l\'entraînement'}
                  />
                  <MacroCard 
                    title="Lipides" 
                    current={dailyData.fat} 
                    goal={personalizedGoals.fat} 
                    unit="g" 
                    color="bg-yellow-500" 
                    percentage={fatPercentage}
                    tip="Essentiels pour les hormones et l'absorption des vitamines"
                  />
                </div>
              </TabsContent>
              <TabsContent value="hydration">
                <MacroCard 
                  title="Hydratation" 
                  current={dailyData.water / 1000} 
                  goal={personalizedGoals.water / 1000} 
                  unit="L" 
                  color="bg-blue-500" 
                  percentage={waterPercentage}
                  tip={sportConfig.hydrationTip}
                />
              </TabsContent>
            </Tabs>
          ) : (
            // Vue compacte
            <div className="grid grid-cols-2 gap-3">
              <MacroCard 
                title="Protéines" 
                current={dailyData.protein} 
                goal={personalizedGoals.protein} 
                unit="g" 
                color="bg-red-500" 
                percentage={proteinPercentage}
                compact={true}
              />
              <MacroCard 
                title="Glucides" 
                current={dailyData.carbs} 
                goal={personalizedGoals.carbs} 
                unit="g" 
                color="bg-blue-500" 
                percentage={carbsPercentage}
                compact={true}
              />
              <MacroCard 
                title="Lipides" 
                current={dailyData.fat} 
                goal={personalizedGoals.fat} 
                unit="g" 
                color="bg-yellow-500" 
                percentage={fatPercentage}
                compact={true}
              />
              <Card className="bg-white border-gray-100">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy size={14} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">Hydratation</span>
                  </div>
                  <div className="flex items-baseline space-x-1 mb-2">
                    <span className="text-base font-bold text-gray-800">
                      {Math.round(dailyData.water / 1000 * 10) / 10}L
                    </span>
                    <span className="text-xs text-gray-500">
                      / {Math.round(personalizedGoals.water / 1000 * 10) / 10}L
                    </span>
                  </div>
                  <Progress value={waterPercentage} className="h-1" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Repas Recommandés - PRIORITAIRES UNIQUEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Repas Recommandés</h2>
            <Badge variant="outline" className="text-xs">
              Optimisé {sportConfig.emoji}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {priorityMeals.map(([key, meal]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button 
                    onClick={() => handleOpenMeal(meal.meal_type_db, meal.name)}
                    className="w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors rounded-lg"
                    aria-label={`Voir le détail du ${meal.name}`}
                  >
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      {React.createElement(meal.icon, { size: 20 })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                      <p className="text-sm text-gray-500">{meal.description}</p>
                      {meal.calories && (
                        <p className="text-xs text-gray-400 mt-1">
                          ~{meal.calories} kcal
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Priorité
                      </Badge>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
            
            {/* Voir tous les repas */}
            <Collapsible open={showAllMeals} onOpenChange={setShowAllMeals}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full text-sm">
                  {showAllMeals ? "Voir moins" : `Voir tous les repas (${Object.keys(sportConfig.mealSuggestions).length - 2} autres)`}
                  {showAllMeals ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {Object.entries(sportConfig.mealSuggestions)
                  .filter(([_, meal]) => meal.priority !== 'high')
                  .map(([key, meal]) => (
                    <Card key={key} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <button 
                          onClick={() => handleOpenMeal(meal.meal_type_db, meal.name)}
                          className="w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors rounded-lg"
                        >
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                            {React.createElement(meal.icon, { size: 20 })}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                            <p className="text-sm text-gray-500">{meal.description}</p>
                            {meal.calories && (
                              <p className="text-xs text-gray-400 mt-1">
                                ~{meal.calories} kcal
                              </p>
                            )}
                          </div>
                          <span className="text-gray-400">→</span>
                        </button>
                      </CardContent>
                    </Card>
                  ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Conseil du jour Personnalisé */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  Conseil pour {appStoreUser?.sport?.replace('_', ' ') || 'votre sport'}
                </h3>
                <p className="text-blue-700 text-sm">{sportConfig.dailyTip}</p>
                <div className="mt-2 p-2 bg-blue-100 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>Hydratation:</strong> {sportConfig.hydrationTip}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyse Personnalisée - MODAL */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Analyse Nutritionnelle</h3>
                  <p className="text-xs text-gray-600">IA personnalisée et conseils</p>
                </div>
              </div>
              <Dialog open={showCoachingModal} onOpenChange={setShowCoachingModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ouvrir <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Analyse Nutritionnelle IA</DialogTitle>
                  </DialogHeader>
                  <AIIntelligence
                    pillar="nutrition"
                    showPredictions={true}
                    showCoaching={true}
                    showRecommendations={true}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/meals/history')}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/nutrition/goals')}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Objectifs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Nutrition;
