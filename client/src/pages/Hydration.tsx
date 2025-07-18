import React, { useState, useMemo, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Target,
  Clock,
  Zap,
  Sun,
  Dumbbell,
  Thermometer,
  Coffee,
  Minus,
  RotateCcw,
  Footprints,
  Shield,
  Trophy,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AIIntelligence from '@/components/AIIntelligence';
import { supabase } from '@/lib/supabase';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { UniformHeader } from '@/components/UniformHeader';

// --- TYPES & INTERFACES DE PERSONNALISATION ---

type SportCategory = 'endurance' | 'contact' | 'court' | 'strength';

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

const Hydration: React.FC = () => {
  // --- DONNÉES RÉELLES DU STORE ---
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  
  // --- LOGIQUE DE PERSONNALISATION DYNAMIQUE ---
  
  // Mapping du sport de l'utilisateur vers une catégorie
  const getSportCategory = (sport: string | null | undefined): SportCategory => {
    const sportMappings: Record<string, SportCategory> = {
      'basketball': 'court',
      'tennis': 'court',
      'volleyball': 'court',
      'american_football': 'contact',
      'rugby': 'contact',
      'hockey': 'contact',
      'football': 'endurance',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'musculation': 'strength',
      'powerlifting': 'strength',
      'crossfit': 'strength',
      'weightlifting': 'strength'
    };
    
    return sportMappings[sport?.toLowerCase() || ''] || 'strength'; // fallback
  };

  const userSportCategory = getSportCategory(appStoreUser?.sport || null);
  const sportConfig = sportsHydrationData[userSportCategory];

  // --- CALCUL OBJECTIF PERSONNALISÉ ---
  
  const personalizedGoalMl = useMemo(() => {
    // Objectif de base (peut venir de ton store ou être calculé)
    const baseGoalMl = 2000; // 2L de base
    
    // Ajustements selon le profil utilisateur
    let adjustments = 0;
    
    // Ajustement sport
    adjustments += sportConfig.goalModifierMl;
    
    // Ajustement selon l'âge
    if (appStoreUser?.age) {
      if (appStoreUser.age > 50) adjustments += 200; // Plus âgé = plus d'hydratation
      if (appStoreUser.age < 25) adjustments += 300; // Plus jeune = plus actif
    }
    
    // Ajustement selon le genre
    if (appStoreUser?.gender === 'male') {
      adjustments += 500; // Hommes ont généralement besoin de plus
    }
    
    // Ajustement selon les objectifs
    if (appStoreUser?.primary_goals?.includes('weight_loss')) {
      adjustments += 500; // Perte de poids = plus d'eau
    }
    
    if (appStoreUser?.primary_goals?.includes('muscle_gain')) {
      adjustments += 300; // Construction musculaire = hydratation importante
    }
    
    return baseGoalMl + adjustments;
  }, [appStoreUser, sportConfig.goalModifierMl]);

  // --- STATES & DONNÉES ---
  const [selectedAmount] = useState(250);
  const [currentMl, setCurrentMl] = useState(0); // Commencer à 0 et charger depuis la base
  const [isLoading, setIsLoading] = useState(true);

  const todayDate = new Date().toISOString().split('T')[0];

  // Fonction pour charger les données d'hydratation
  const loadHydrationData = async () => {
    if (!appStoreUser?.id) return;

    try {
      setIsLoading(true);
      
      // Charger les données du jour
      const { data: dailyStats, error } = await supabase
        .from('daily_stats')
        .select('water_intake_ml')
        .eq('user_id', appStoreUser.id)
        .eq('date', todayDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement:', error);
        return;
      }

      setCurrentMl(dailyStats?.water_intake_ml || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'hydratation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données d'hydratation au démarrage
  useEffect(() => {
    loadHydrationData();
  }, [appStoreUser?.id, todayDate]);

  // Synchronisation temps réel
  const { } = useRealtimeSync({
    pillar: 'hydration',
    onUpdate: (payload) => {
      console.log('🔄 Hydratation mise à jour:', payload);
      // Ne recharger que si c'est une mise à jour externe
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        if (payload.userId !== appStoreUser?.id) {
          loadHydrationData();
        }
      }
    }
  });

  const currentHydrationL = currentMl / 1000;
  const goalHydrationL = personalizedGoalMl / 1000;
  const remaining = personalizedGoalMl - currentMl;
  const percentage = personalizedGoalMl > 0 ? Math.min((currentMl / personalizedGoalMl) * 100, 100) : 0;

  // --- FONCTIONS ---
  const handleAddWater = async (amount: number, type: string = 'water') => {
    try {
      const newTotal = currentMl + amount;
      
      // Mise à jour optimiste du state local
      setCurrentMl(newTotal);
      
      // Sauvegarde dans Supabase
      const { error } = await supabase
        .from('hydration_logs')
        .insert({
          user_id: appStoreUser?.id,
          amount_ml: amount,
          drink_type: type,
          logged_at: new Date().toISOString(),
          date: todayDate
        });

      if (error) throw error;

      // Mise à jour des stats quotidiennes
      const { error: statsError } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser?.id,
          date: todayDate,
          water_intake_ml: newTotal,
          hydration_goal_ml: personalizedGoalMl,
          updated_at: new Date().toISOString()
        });

      if (statsError) throw statsError;
      
      toast({
        title: "Eau ajoutée !",
        description: `+${amount}ml d'hydratation. Continue comme ça ${appStoreUser?.first_name || appStoreUser?.username || 'Champion'} !`,
      });
      
      // Les données sont déjà mises à jour de manière optimiste via setCurrentMl
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setCurrentMl(prev => prev - amount); // Rollback
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder. Réessayez.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveLast = async () => {
    if (currentMl >= 250) {
      const newTotal = currentMl - 250;
      setCurrentMl(newTotal);
      
      // Mise à jour dans la base
      try {
        const { error } = await supabase
          .from('daily_stats')
          .upsert({
            user_id: appStoreUser?.id,
            date: todayDate,
            water_intake_ml: newTotal,
            hydration_goal_ml: personalizedGoalMl,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        toast({
          title: "Dernière entrée annulée",
          description: "-250ml",
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        setCurrentMl(prev => prev + 250); // Rollback
      }
    }
  };

  const handleReset = async () => {
    setCurrentMl(0);
    
    try {
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser?.id,
          date: todayDate,
          water_intake_ml: 0,
          hydration_goal_ml: personalizedGoalMl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Compteur remis à zéro",
        description: "Nouveau départ pour aujourd'hui !",
      });
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      loadHydrationData(); // Recharger les vraies données
    }
  };

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = () => {
    const progressPercentage = (currentMl / personalizedGoalMl) * 100;
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    
    if (progressPercentage >= 100) {
      return `🎉 Excellent ${userName} ! Objectif atteint pour un ${appStoreUser?.sport || 'athlète'} !`;
    } else if (progressPercentage >= 75) {
      return `💪 Bravo ${userName}, tu es sur la bonne voie !`;
    } else if (progressPercentage >= 50) {
      return `⚡ Continue ${userName}, tu y es presque !`;
    } else if (progressPercentage >= 25) {
      return `🚀 Allez ${userName}, accélère ton hydratation !`;
    } else {
      return `💧 ${userName}, il est temps de rattraper ton retard !`;
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600">Chargement de votre hydratation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">

        {/* Header Uniforme */}
        <UniformHeader
          title="Hydratation"
          subtitle={`${sportConfig.emoji} ${getPersonalizedMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Objectif principal avec Données Personnalisées */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 rounded-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Aujourd'hui</h3>
            <Target size={24} />
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-1">{currentHydrationL.toFixed(2).replace(/\.?0+$/, '')}L</div>
            <div className="text-white/80">
              sur {goalHydrationL.toFixed(2).replace(/\.?0+$/, '')}L (Objectif {userSportCategory})
            </div>
            <div className="text-sm text-white/70 mt-1">
              {remaining > 0 ? `${(remaining/1000).toFixed(2).replace(/\.?0+$/, '')}L restants` : 'Objectif atteint ! 🎉'}
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-center text-white/90 text-sm">
            {Math.round(percentage)}% de l'objectif
          </div>
        </div>

        {/* Actions rapides améliorées avec Données Utilisateur */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAddWater(selectedAmount)}
              className="bg-blue-600 text-white p-4 rounded-xl font-medium flex flex-col items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus size={24} className="mb-1" />
              <span className="text-sm">Ajouter {selectedAmount}ml</span>
            </button>
            <button
              onClick={() => handleAddWater(sportConfig.recommendedDrink.amount, sportConfig.recommendedDrink.type)}
              className="bg-white text-gray-800 p-4 rounded-xl font-medium flex flex-col items-center justify-center border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              {React.createElement(sportConfig.recommendedDrink.icon, { size: 24, className: "mb-1 text-blue-600" })}
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

        {/* Conseils d'hydratation Personnalisés selon le Sport */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              Conseils pour {appStoreUser?.sport || 'votre sport'}
            </h2>
          </div>
          <div className="space-y-3">
            {sportConfig.tips.map((tip, index) => {
              const TipIcon = tip.icon;
              return (
                <div key={index} className={`p-4 rounded-xl border-l-4 ${tip.priority === 'high' ? 'border-l-red-500 bg-red-50' : tip.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-blue-500 bg-blue-50'}`}>
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

        {/* Insights Personnalisés */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center space-x-3">
            <Trophy size={20} className="text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">Analyse Personnalisée</h3>
              <p className="text-purple-700 text-sm">
                En tant que {appStoreUser?.gender === 'male' ? 'homme' : 'femme'} de {appStoreUser?.age || '?'} ans pratiquant le {appStoreUser?.sport || 'sport'}, 
                votre objectif de {goalHydrationL.toFixed(1)}L est optimal pour vos {appStoreUser?.primary_goals?.join(', ') || 'objectifs'}.
              </p>
            </div>
          </div>
        </div>
        
        {/* Intelligence AI - Analyse Hydratation */}
        <AIIntelligence
          pillar="hydration"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />
        
        {/* Rappel hydratation Personnalisé */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Votre Rappel {userSportCategory}</h3>
              <p className="text-blue-700 text-sm">{sportConfig.contextualReminder}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hydration;
