import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';

const Nutrition = () => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  // Données mockées
  const dailyGoals = {
    calories: { current: 1650, goal: 2200, unit: 'kcal' },
    protein: { current: 85, goal: 120, unit: 'g' },
    carbs: { current: 180, goal: 250, unit: 'g' },
    fat: { current: 45, goal: 70, unit: 'g' },
    water: { current: 1.8, goal: 2.5, unit: 'L' }
  };

  const meals = {
    breakfast: {
      name: 'Petit-déjeuner',
      icon: Coffee,
      time: '08:30',
      calories: 420,
      foods: [
        { name: 'Avoine avec banane', calories: 280, protein: 8, carbs: 45, fat: 6 },
        { name: 'Café au lait', calories: 80, protein: 4, carbs: 8, fat: 3 },
        { name: 'Amandes (20g)', calories: 60, protein: 2, carbs: 2, fat: 5 }
      ]
    },
    lunch: {
      name: 'Déjeuner',
      icon: Sun,
      time: '12:45',
      calories: 680,
      foods: [
        { name: 'Salade de quinoa', calories: 350, protein: 15, carbs: 45, fat: 12 },
        { name: 'Poulet grillé 150g', calories: 250, protein: 35, carbs: 0, fat: 8 },
        { name: 'Avocat 1/2', calories: 80, protein: 1, carbs: 4, fat: 7 }
      ]
    },
    snack: {
      name: 'Collation',
      icon: Apple,
      time: '16:00',
      calories: 180,
      foods: [
        { name: 'Yaourt grec', calories: 120, protein: 15, carbs: 8, fat: 5 },
        { name: 'Myrtilles 50g', calories: 30, protein: 0, carbs: 7, fat: 0 },
        { name: 'Noix 15g', calories: 30, protein: 1, carbs: 1, fat: 3 }
      ]
    },
    dinner: {
      name: 'Dîner',
      icon: MoonIcon,
      time: '19:30',
      calories: 370,
      foods: [
        { name: 'Saumon grillé 120g', calories: 220, protein: 25, carbs: 0, fat: 12 },
        { name: 'Légumes vapeur', calories: 80, protein: 3, carbs: 15, fat: 1 },
        { name: 'Riz complet 60g', calories: 70, protein: 2, carbs: 14, fat: 1 }
      ]
    }
  };

  const quickActions = [
    { name: 'Scanner', icon: Camera, color: 'bg-blue-500' },
    { name: 'Eau', icon: Droplets, color: 'bg-cyan-500' },
    { name: 'Recettes', icon: Utensils, color: 'bg-green-500' },
    { name: 'Stats', icon: BarChart3, color: 'bg-purple-500' }
  ];

  const MacroCard = ({ title, current, goal, unit, color, percentage }) => (
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
        ></div>
      </div>
    </div>
  );

  const MealCard = ({ mealKey, meal, isSelected, onClick }) => {
    const MealIcon = meal.icon;
    return (
      <button
        onClick={() => onClick(mealKey)}
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
              <h3 className="font-semibold text-gray-800">{meal.name}</h3>
              <p className="text-sm text-gray-500">{meal.time} • {meal.calories} kcal</p>
            </div>
          </div>
          <ChevronRight size={20} className={isSelected ? 'text-fitness-growth' : 'text-gray-400'} />
        </div>
        
        {isSelected && (
          <div className="mt-4 space-y-2 animate-slide-up">
            {meal.foods.map((food, index) => (
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
            <button className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-fitness-growth hover:text-fitness-growth transition-colors">
              + Ajouter un aliment
            </button>
          </div>
        )}
      </button>
    );
  };

  const currentCalories = dailyGoals.calories.current;
  const goalCalories = dailyGoals.calories.goal;
  const remainingCalories = goalCalories - currentCalories;
  const caloriesPercentage = Math.round((currentCalories / goalCalories) * 100);

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
            ></div>
          </div>
          
          <div className="text-center text-sm text-white/80">
            {caloriesPercentage}% de l'objectif atteint
          </div>
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
              current={dailyGoals.protein.current}
              goal={dailyGoals.protein.goal}
              unit={dailyGoals.protein.unit}
              color="bg-red-500"
              percentage={Math.round((dailyGoals.protein.current / dailyGoals.protein.goal) * 100)}
            />
            <MacroCard
              title="Glucides"
              current={dailyGoals.carbs.current}
              goal={dailyGoals.carbs.goal}
              unit={dailyGoals.carbs.unit}
              color="bg-blue-500"
              percentage={Math.round((dailyGoals.carbs.current / dailyGoals.carbs.goal) * 100)}
            />
            <MacroCard
              title="Lipides"
              current={dailyGoals.fat.current}
              goal={dailyGoals.fat.goal}
              unit={dailyGoals.fat.unit}
              color="bg-yellow-500"
              percentage={Math.round((dailyGoals.fat.current / dailyGoals.fat.goal) * 100)}
            />
            <MacroCard
              title="Hydratation"
              current={dailyGoals.water.current}
              goal={dailyGoals.water.goal}
              unit={dailyGoals.water.unit}
              color="bg-cyan-500"
              percentage={Math.round((dailyGoals.water.current / dailyGoals.water.goal) * 100)}
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
            {Object.entries(meals).map(([key, meal]) => (
              <MealCard
                key={key}
                mealKey={key}
                meal={meal}
                isSelected={selectedMeal === key}
                onClick={setSelectedMeal}
              />
            ))}
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
