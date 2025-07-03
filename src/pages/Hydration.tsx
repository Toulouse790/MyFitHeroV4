import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Droplets,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Sun,
  Dumbbell,
  Thermometer,
  Award,
  Coffee,
  Minus,
  RotateCcw,
  Bell,
  Footprints, // Icône pour l'endurance
  Shield,     // Icône pour les sports de contact
  Trophy,     // Icône pour les sports de court
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { HydrationEntry, DailyStats } from '@/lib/supabase';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';

// --- TYPES & INTERFACES DE PERSONNALISATION ---

type SportCategory = 'endurance' | 'contact' | 'court' | 'strength';

interface User {
  name: string;
  sportCategory: SportCategory;
  level: number;
  totalPoints: number;
}

interface RecommendedDrink {
  type: string;
  name: string;
  icon: React.ElementType;
  amount: number;
}

interface SportHydrationConfig {
  emoji: string;
  goalModifierMl: number;
  contextualReminder: string;
  recommendedDrink: RecommendedDrink;
  tips: {
    icon: React.ElementType;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// --- CONFIGURATION D'HYDRATATION PAR SPORT ---

const sportsHydrationData: Record<SportCategory, SportHydrationConfig> = {
  endurance: {
    emoji: '🏃‍♂️',
    goalModifierMl: 1000,
    contextualReminder: "Rappel fréquent : Buvez 150-200ml toutes les 20 minutes pour maintenir la performance.",
    recommendedDrink: { type: 'water', name: "Ajouter Eau", icon: Plus, amount: 250 },
    tips: [
      { icon: Footprints, title: 'Avant la course', description: 'Hyper-hydratez-vous la veille et buvez 500ml 2h avant le départ.', priority: 'high' },
      { icon: Clock, title: 'Régularité', description: 'Ne pas attendre d\'avoir soif est la règle d\'or. Buvez de petites quantités très souvent.', priority: 'high' },
      { icon: Thermometer, title: 'Adaptez à la chaleur', description: 'Par temps chaud, vos besoins peuvent doubler. Pensez aux pastilles d\'électrolytes.', priority: 'medium' },
    ]
  },
  contact: {
    emoji: '🏈',
    goalModifierMl: 750,
    contextualReminder: "Après l'effort, compensez les pertes en sels minéraux avec une boisson de récupération.",
    recommendedDrink: { type: 'electrolytes', name: "Électrolytes", icon: Shield, amount: 500 },
    tips: [
      { icon: Shield, title: 'Focus Électrolytes', description: 'La transpiration intense sous l\'équipement entraîne une grande perte de sodium et potassium. Compensez !', priority: 'high' },
      { icon: Dumbbell, title: 'Hydratation & Récupération', description: 'Une bonne hydratation accélère la récupération musculaire et réduit les risques de crampes.', priority: 'medium' },
      { icon: Sun, title: 'Avant et Après', description: 'Assurez-vous d\'être bien hydraté avant chaque entraînement et match, et continuez après.', priority: 'low' },
    ]
  },
  court: {
    emoji: '🎾',
    goalModifierMl: 500,
    contextualReminder: "Pendant les pauses et changements de côté, buvez systématiquement 150-200ml.",
    recommendedDrink: { type: 'water', name: "Ajouter Eau", icon: Plus, amount: 250 },
    tips: [
      { icon: Trophy, title: 'Pendant l\'effort intense', description: 'Les efforts explosifs et répétés demandent une hydratation constante. Profitez de chaque pause.', priority: 'high' },
      { icon: Zap, title: 'Boissons isotoniques', description: 'Pour les matchs de plus d\'une heure, une boisson isotonique peut aider à maintenir l\'énergie et les électrolytes.', priority: 'medium' },
      { icon: Sun, title: 'Hydratation préventive', description: 'Commencez à boire bien avant le match pour ne pas commencer avec un déficit.', priority: 'low' },
    ]
  },
  strength: {
    emoji: '💪',
    goalModifierMl: 250,
    contextualReminder: "Buvez régulièrement entre vos séries pour maintenir vos performances et votre concentration.",
    recommendedDrink: { type: 'water', name: "Ajouter Eau", icon: Plus, amount: 250 },
    tips: [
      { icon: Dumbbell, title: 'Hydratation et Force', description: 'Même une légère déshydratation (1-2%) peut réduire significativement votre force et votre endurance musculaire.', priority: 'high' },
      { icon: Droplets, title: 'Régularité > Quantité', description: 'L\'important est de boire régulièrement tout au long de la journée, pas seulement autour de la séance.', priority: 'medium' },
      { icon: Coffee, title: 'Attention aux stimulants', description: 'Si vous prenez des pré-workouts à base de caféine, augmentez votre apport en eau.', priority: 'low' },
    ]
  }
};


const Hydration: React.FC<HydrationProps> = ({ userProfile }) => {
  // --- SIMULATION UTILISATEUR & CONFIG ---
  const currentUser: User = {
    name: 'Alex',
    sportCategory: 'court', // Changez ici: 'endurance', 'contact', 'strength'
    level: 12,
    totalPoints: 1450
  };
  
  const sportConfig = sportsHydrationData[currentUser.sportCategory];

  // --- STATES & STORE ---
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [hydrationEntries, setHydrationEntries] = useState<HydrationEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);
  
  // ... autres hooks ...
  const { toast } = useToast();
  const { dailyGoals, storeAddHydration, /* ... autres fonctions du store ... */ } = useAppStore();
  
  // --- LOGIQUE DE PERSONNALISATION ---

  const personalizedGoalMl = useMemo(() => {
    const baseGoalMl = dailyStats?.hydration_goal_ml || (dailyGoals.water * 1000);
    return baseGoalMl + sportConfig.goalModifierMl;
  }, [dailyStats, dailyGoals.water, sportConfig.goalModifierMl]);

  const today = new Date().toISOString().split('T')[0];
  const currentMl = dailyStats?.water_intake_ml || 0;
  const currentHydrationL = currentMl / 1000;
  const goalHydrationL = personalizedGoalMl / 1000;
  const remaining = personalizedGoalMl - currentMl;
  const percentage = personalizedGoalMl > 0 ? Math.min((currentMl / personalizedGoalMl) * 100, 100) : 0;
  
  // ... (fonctions de chargement et d'ajout de données existantes) ...
  const handleAddWater = async (amount: number, type: string = 'water') => { /* ... */ };
  const handleRemoveLast = async () => { /* ... */ };
  const handleReset = async () => { /* ... */ };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">

        {/* Header Personnalisé */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 text-3xl">{sportConfig.emoji}</span>
              Hydratation
            </h1>
            <p className="text-gray-600">Niveau {currentUser.level} • {currentUser.totalPoints} XP</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Objectif principal avec Données Personnalisées */}
        <div className="bg-gradient-hydration p-5 rounded-xl text-white relative overflow-hidden">
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Aujourd'hui</h3>
                <Target size={24} />
              </div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">{currentHydrationL.toFixed(2).replace(/\.?0+$/, '')}L</div>
                <div className="text-white/80">sur {goalHydrationL.toFixed(2).replace(/\.?0+$/, '')}L (Objectif {currentUser.sportCategory})</div>
                <div className="text-sm text-white/70 mt-1">
                  {remaining > 0 ? `${(remaining/1000).toFixed(2).replace(/\.?0+$/, '')}L restants` : 'Objectif atteint ! 🎉'}
                </div>
              </div>
              {/* ... (barre de progression) ... */}
            </>
        </div>

        {/* Actions rapides améliorées */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAddWater(selectedAmount)}
              className="bg-fitness-hydration text-white p-4 rounded-xl font-medium flex flex-col items-center justify-center hover:bg-fitness-hydration/90 transition-colors"
            >
              <Plus size={24} className="mb-1" />
              <span className="text-sm">Ajouter {selectedAmount}ml</span>
            </button>
            <button
              onClick={() => handleAddWater(sportConfig.recommendedDrink.amount, sportConfig.recommendedDrink.type)}
              className="bg-white text-gray-800 p-4 rounded-xl font-medium flex flex-col items-center justify-center border-2 border-fitness-hydration hover:bg-blue-50 transition-colors"
            >
              {React.createElement(sportConfig.recommendedDrink.icon, { size: 24, className: "mb-1 text-fitness-hydration" })}
              <span className="text-sm">{sportConfig.recommendedDrink.name}</span>
            </button>
            <button
              onClick={handleRemoveLast}
              className="bg-white text-gray-600 p-4 rounded-xl font-medium flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Minus size={24} className="mb-1" />
              <span className="text-sm">Annuler</span>
            </button>
            <button
              onClick={handleReset}
              className="bg-white text-gray-600 p-4 rounded-xl font-medium flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={24} className="mb-1" />
              <span className="text-sm">Reset</span>
            </button>
          </div>
        </div>
        
        {/* ... (sections statistiques et historique) ... */}

        {/* Conseils d'hydratation Personnalisés */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Conseils pour {currentUser.sportCategory}</h2>
          </div>
          <div className="space-y-3">
            {sportConfig.tips.map((tip, index) => {
              const TipIcon = tip.icon;
              return (
                <div key={index} className={`p-4 rounded-xl border-l-4 ${tip.priority === 'high' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
                  <div className="flex items-start space-x-3">
                    <TipIcon size={20} className="text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* ... (section achievements) ... */}

        {/* Rappel hydratation Personnalisé */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Votre Rappel Contextuel</h3>
              <p className="text-blue-700 text-sm">{sportConfig.contextualReminder}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hydration;
