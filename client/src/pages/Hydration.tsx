// client/src/components/Hydration.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  Settings
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AIIntelligence from '@/components/AIIntelligence';
import { supabase } from '@/lib/supabase';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { UniformHeader } from '@/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPES & INTERFACES ---
type SportCategory = 'endurance' | 'contact' | 'court' | 'strength';

interface RecommendedDrink {
  type: string;
  name: string;
  icon: React.ElementType;
  amount: number;
  color: string;
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

interface HydrationLog {
  id: string;
  amount_ml: number;
  drink_type: string;
  logged_at: string;
  hydration_context?: string;
}

interface DailyHydrationStats {
  current_ml: number;
  goal_ml: number;
  logs_count: number;
  last_drink_time?: string;
  achievement_rate: number;
}

// --- CONFIGURATION HYDRATATION PAR SPORT ---
const sportsHydrationData: Record<SportCategory, SportHydrationConfig> = {
  endurance: {
    emoji: '🏃‍♂️',
    goalModifierMl: 1000,
    contextualReminder: "Hydratez-vous toutes les 15-20 minutes pendant l'effort pour maintenir vos performances.",
    recommendedDrink: { 
      type: 'sports_drink', 
      name: "Boisson Sport", 
      icon: Zap, 
      amount: 250,
      color: 'bg-orange-500'
    },
    tips: [
      { 
        icon: Footprints, 
        title: 'Pré-hydratation', 
        description: 'Buvez 500ml 2-3h avant l\'effort et 250ml 15min avant le départ.', 
        priority: 'high' 
      },
      { 
        icon: Clock, 
        title: 'Pendant l\'effort', 
        description: '150-250ml toutes les 15-20min selon l\'intensité et la température.', 
        priority: 'high' 
      },
      { 
        icon: Thermometer, 
        title: 'Post-effort', 
        description: 'Buvez 150% du poids perdu en sueur dans les 6h suivant l\'effort.', 
        priority: 'medium' 
      },
    ]
  },
  contact: {
    emoji: '🏈',
    goalModifierMl: 750,
    contextualReminder: "Compensez les pertes intenses en sels minéraux avec des électrolytes.",
    recommendedDrink: { 
      type: 'electrolytes', 
      name: "Électrolytes", 
      icon: Shield, 
      amount: 500,
      color: 'bg-purple-500'
    },
    tips: [
      { 
        icon: Shield, 
        title: 'Électrolytes cruciaux', 
        description: 'La sueur sous l\'équipement fait perdre beaucoup de sodium. Compensez avec des boissons enrichies.', 
        priority: 'high' 
      },
      { 
        icon: Dumbbell, 
        title: 'Récupération accélérée', 
        description: 'Une hydratation optimale réduit les courbatures et accélère la réparation musculaire.', 
        priority: 'medium' 
      },
      { 
        icon: Thermometer, 
        title: 'Thermorégulation', 
        description: 'L\'équipement limite l\'évacuation de la chaleur. Hydratez-vous plus que d\'habitude.', 
        priority: 'medium' 
      },
    ]
  },
  court: {
    emoji: '🎾',
    goalModifierMl: 500,
    contextualReminder: "Profitez de chaque pause pour boire 150-200ml et maintenir votre niveau.",
    recommendedDrink: { 
      type: 'water', 
      name: "Eau Pure", 
      icon: Droplets, 
      amount: 250,
      color: 'bg-blue-500'
    },
    tips: [
      { 
        icon: Trophy, 
        title: 'Concentration optimale', 
        description: 'Même 2% de déshydratation réduit significativement vos réflexes et votre précision.', 
        priority: 'high' 
      },
      { 
        icon: Zap, 
        title: 'Énergie constante', 
        description: 'Pour les matchs >1h, alternez eau pure et boisson isotonique toutes les 2 pauses.', 
        priority: 'medium' 
      },
      { 
        icon: Clock, 
        title: 'Timing optimal', 
        description: 'Buvez aux changements de côté, pas pendant les points pour éviter l\'inconfort.', 
        priority: 'low' 
      },
    ]
  },
  strength: {
    emoji: '💪',
    goalModifierMl: 250,
    contextualReminder: "Hydratez-vous entre chaque série pour maintenir force et concentration.",
    recommendedDrink: { 
      type: 'water', 
      name: "Eau Fraîche", 
      icon: Droplets, 
      amount: 300,
      color: 'bg-blue-600'
    },
    tips: [
      { 
        icon: Dumbbell, 
        title: 'Performance musculaire', 
        description: '3% de déshydratation = 10-15% de perte de force. Hydratez-vous régulièrement.', 
        priority: 'high' 
      },
      { 
        icon: Coffee, 
        title: 'Pré-workout et caféine', 
        description: 'Si vous prenez des stimulants, augmentez votre apport hydrique de 500ml.', 
        priority: 'medium' 
      },
      { 
        icon: Clock, 
        title: 'Récupération inter-séries', 
        description: 'Quelques gorgées entre les séries optimisent votre récupération.', 
        priority: 'low' 
      },
    ]
  }
};

// --- COMPOSANT PRINCIPAL ---
const Hydration: React.FC = () => {
  // --- HOOKS ET STATE ---
  const navigate = useNavigate();
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  
  const [currentMl, setCurrentMl] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyLogs, setDailyLogs] = useState<HydrationLog[]>([]);
  const [lastDrinkTime, setLastDrinkTime] = useState<Date | null>(null);
  const [showReminders, setShowReminders] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  // --- LOGIQUE DE PERSONNALISATION ---
  const getSportCategory = useCallback((sport: string | null | undefined): SportCategory => {
    const sportMappings: Record<string, SportCategory> = {
      'basketball': 'court',
      'tennis': 'court',
      'volleyball': 'court',
      'badminton': 'court',
      'american_football': 'contact',
      'rugby': 'contact',
      'hockey': 'contact',
      'football': 'endurance',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'triathlon': 'endurance',
      'course à pied': 'endurance',
      'musculation': 'strength',
      'powerlifting': 'strength',
      'crossfit': 'strength',
      'weightlifting': 'strength'
    };
    
    return sportMappings[sport?.toLowerCase() || ''] || 'strength';
  }, []);

  const userSportCategory = getSportCategory(appStoreUser?.sport);
  const sportConfig = sportsHydrationData[userSportCategory];

  // --- CALCUL OBJECTIF PERSONNALISÉ ---
  const personalizedGoalMl = useMemo(() => {
    const weight = appStoreUser?.weight_kg ?? 70;
    const baseGoalMl = weight * 35; // 35ml par kg de poids corporel
    
    let adjustments = 0;
    
    // Ajustement sport
    adjustments += sportConfig.goalModifierMl;
    
    // Ajustement selon l'âge
    if (appStoreUser?.age) {
      if (appStoreUser.age > 50) adjustments += 200;
      if (appStoreUser.age < 25) adjustments += 300;
    }
    
    // Ajustement selon le genre
    if (appStoreUser?.gender === 'male') {
      adjustments += 300;
    }
    
    // Ajustement selon les objectifs
    if (appStoreUser?.primary_goals?.includes('weight_loss')) {
      adjustments += 500;
    }
    
    if (appStoreUser?.primary_goals?.includes('muscle_gain')) {
      adjustments += 300;
    }
    
    // Ajustement selon l'activité
    const activityLevel = appStoreUser?.activity_level;
    if (activityLevel === 'very_active') adjustments += 500;
    else if (activityLevel === 'active') adjustments += 300;
    
    return Math.round(baseGoalMl + adjustments);
  }, [appStoreUser, sportConfig.goalModifierMl]);

  // --- FONCTIONS DE DONNÉES ---
  const loadHydrationData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      setIsLoading(true);
      
      // Charger les stats du jour
      const { data: dailyStats, error: statsError } = await supabase
        .from('daily_stats')
        .select('water_intake_ml')
        .eq('user_id', appStoreUser.id)
        .eq('stat_date', todayDate)
        .single();

      // Charger les logs détaillés
      const { data: logs, error: logsError } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('log_date', todayDate)
        .order('logged_at', { ascending: false });

      if (!statsError && dailyStats) {
        setCurrentMl(dailyStats.water_intake_ml || 0);
      } else if (statsError && statsError.code !== 'PGRST116') {
        console.error('Erreur stats:', statsError);
      }

      if (!logsError && logs) {
        setDailyLogs(logs);
        if (logs.length > 0) {
          setLastDrinkTime(new Date(logs[0].logged_at));
        }
      }

    } catch (error) {
      console.error('Erreur chargement hydratation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, todayDate]);

  // --- HANDLERS ---
  const handleAddWater = useCallback(async (amount: number, type: string = 'water', context: string = 'normal') => {
    if (!appStoreUser?.id) return;

    try {
      const newTotal = currentMl + amount;
      const now = new Date();
      
      // Mise à jour optimiste
      setCurrentMl(newTotal);
      setLastDrinkTime(now);
      
      // Sauvegarde en base
      const { error: logError } = await supabase
        .from('hydration_logs')
        .insert({
          user_id: appStoreUser.id,
          amount_ml: amount,
          drink_type: type,
          logged_at: now.toISOString(),
          log_date: todayDate,
          hydration_context: context
        });

      if (logError) throw logError;

      // Mise à jour stats quotidiennes
      const { error: statsError } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser.id,
          stat_date: todayDate,
          water_intake_ml: newTotal,
          hydration_goal_ml: personalizedGoalMl,
          updated_at: now.toISOString()
        }, {
          onConflict: 'user_id,stat_date',
          ignoreDuplicates: false
        });

      if (statsError) throw statsError;

      // Feedback utilisateur personnalisé
      const userName = appStoreUser.first_name || appStoreUser.username || 'Champion';
      const progress = (newTotal / personalizedGoalMl) * 100;
      
      let message = `+${amount}ml ajoutés ! `;
      if (progress >= 100) {
        message += `🎉 Objectif atteint ${userName} !`;
      } else if (progress >= 75) {
        message += `💪 Excellent ${userName}, presque fini !`;
      } else {
        message += `Continue ${userName} !`;
      }
      
      toast({
        title: "Hydratation ajoutée",
        description: message,
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'hydration_added', {
          amount_ml: amount,
          drink_type: type,
          total_ml: newTotal,
          goal_progress: Math.round(progress),
          user_id: appStoreUser.id
        });
      }

      // Recharger les logs
      await loadHydrationData();

    } catch (error) {
      console.error('Erreur ajout hydratation:', error);
      setCurrentMl(prev => prev - amount); // Rollback
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder. Réessayez.",
        variant: "destructive"
      });
    }
  }, [appStoreUser?.id, currentMl, personalizedGoalMl, todayDate, loadHydrationData, toast]);

  const handleRemoveLast = useCallback(async () => {
    if (dailyLogs.length === 0) return;

    const lastLog = dailyLogs[0];
    const newTotal = currentMl - lastLog.amount_ml;

    try {
      setCurrentMl(newTotal);

      // Supprimer le dernier log
      const { error: deleteError } = await supabase
        .from('hydration_logs')
        .delete()
        .eq('id', lastLog.id);

      if (deleteError) throw deleteError;

      // Mettre à jour les stats
      const { error: statsError } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser?.id,
          stat_date: todayDate,
          water_intake_ml: newTotal,
          hydration_goal_ml: personalizedGoalMl,
          updated_at: new Date().toISOString()
        });

      if (statsError) throw statsError;

      toast({
        title: "Dernière entrée supprimée",
        description: `-${lastLog.amount_ml}ml`,
      });

      await loadHydrationData();

    } catch (error) {
      console.error('Erreur suppression:', error);
      setCurrentMl(prev => prev + lastLog.amount_ml); // Rollback
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrée",
        variant: "destructive"
      });
    }
  }, [dailyLogs, currentMl, appStoreUser?.id, personalizedGoalMl, todayDate, loadHydrationData, toast]);

  const handleReset = useCallback(async () => {
    try {
      setCurrentMl(0);

      // Supprimer tous les logs du jour
      const { error: deleteError } = await supabase
        .from('hydration_logs')
        .delete()
        .eq('user_id', appStoreUser?.id)
        .eq('log_date', todayDate);

      if (deleteError) throw deleteError;

      // Reset des stats
      const { error: statsError } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser?.id,
          stat_date: todayDate,
          water_intake_ml: 0,
          hydration_goal_ml: personalizedGoalMl,
          updated_at: new Date().toISOString()
        });

      if (statsError) throw statsError;

      toast({
        title: "Compteur remis à zéro",
        description: "Nouveau départ pour aujourd'hui !",
      });

      await loadHydrationData();

    } catch (error) {
      console.error('Erreur reset:', error);
      toast({
        title: "Erreur",
        description: "Impossible de remettre à zéro",
        variant: "destructive"
      });
      loadHydrationData(); // Recharger les vraies données
    }
  }, [appStoreUser?.id, personalizedGoalMl, todayDate, loadHydrationData, toast]);

  // --- SYNCHRONISATION TEMPS RÉEL ---
  const { } = useRealtimeSync({
    pillar: 'hydration',
    onUpdate: (payload) => {
      if (payload.userId !== appStoreUser?.id && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
        loadHydrationData();
      }
    }
  });

  // --- CALCULS ---
  const currentHydrationL = currentMl / 1000;
  const goalHydrationL = personalizedGoalMl / 1000;
  const remaining = Math.max(0, personalizedGoalMl - currentMl);
  const percentage = personalizedGoalMl > 0 ? Math.min((currentMl / personalizedGoalMl) * 100, 100) : 0;
  const isGoalReached = percentage >= 100;

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = useCallback(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    
    if (isGoalReached) {
      return `🎉 Excellent ${userName} ! Objectif atteint pour un ${appStoreUser?.sport || 'athlète'} !`;
    } else if (percentage >= 75) {
      return `💪 Bravo ${userName}, tu es sur la bonne voie !`;
    } else if (percentage >= 50) {
      return `⚡ Continue ${userName}, tu y es presque !`;
    } else if (percentage >= 25) {
      return `🚀 Allez ${userName}, accélère ton hydratation !`;
    } else {
      return `💧 ${userName}, il est temps de rattraper ton retard !`;
    }
  }, [percentage, isGoalReached, appStoreUser]);

  // --- EFFECTS ---
  useEffect(() => {
    loadHydrationData();
  }, [loadHydrationData]);

  // Rappels automatiques
  useEffect(() => {
    if (!showReminders || !lastDrinkTime) return;

    const now = new Date();
    const timeSinceLastDrink = now.getTime() - lastDrinkTime.getTime();
    const oneHour = 60 * 60 * 1000;

    if (timeSinceLastDrink > oneHour && currentMl < personalizedGoalMl * 0.8) {
      toast({
        title: "Rappel d'hydratation 💧",
        description: `Il y a ${Math.floor(timeSinceLastDrink / oneHour)}h que vous n'avez pas bu !`,
        action: (
          <Button size="sm" onClick={() => handleAddWater(250)}>
            Boire maintenant
          </Button>
        )
      });
    }
  }, [lastDrinkTime, currentMl, personalizedGoalMl, showReminders, handleAddWater, toast]);

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">

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

        {/* Objectif principal */}
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Aujourd'hui</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReminders(!showReminders)}
                  className="text-white hover:bg-white/20"
                >
                  <Bell className={`h-4 w-4 ${showReminders ? 'fill-current' : ''}`} />
                </Button>
                <Target size={24} />
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-1">
                {currentHydrationL.toFixed(2).replace(/\.?0+$/, '')}L
              </div>
              <div className="text-white/80">
                sur {goalHydrationL.toFixed(2).replace(/\.?0+$/, '')}L
              </div>
              <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
                Objectif {userSportCategory} {sportConfig.emoji}
              </Badge>
              <div className="text-sm text-white/70 mt-2">
                {remaining > 0 
                  ? `${(remaining/1000).toFixed(2).replace(/\.?0+$/, '')}L restants` 
                  : 'Objectif atteint ! 🎉'
                }
              </div>
            </div>
            
            <Progress value={percentage} className="h-3 mb-4 bg-white/20" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/90">{Math.round(percentage)}% complété</span>
              {lastDrinkTime && (
                <span className="text-white/70">
                  Dernier: {lastDrinkTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sélecteur de quantité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quantité rapide</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex space-x-2">
              {[150, 250, 350, 500].map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAmount(amount)}
                  className="flex-1"
                >
                  {amount}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Actions rapides</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleAddWater(selectedAmount, 'water', 'normal')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 h-20 flex flex-col space-y-1"
            >
              <Plus size={24} />
              <span className="text-sm">Eau {selectedAmount}ml</span>
            </Button>
            
            <Button
              onClick={() => handleAddWater(
                sportConfig.recommendedDrink.amount, 
                sportConfig.recommendedDrink.type, 
                'workout'
              )}
              size="lg"
              variant="outline"
              className={`h-20 flex flex-col space-y-1 border-2 ${sportConfig.recommendedDrink.color.replace('bg-', 'border-')} hover:${sportConfig.recommendedDrink.color.replace('bg-', 'bg-')}/10`}
            >
              {React.createElement(sportConfig.recommendedDrink.icon, { size: 24 })}
              <span className="text-sm">{sportConfig.recommendedDrink.name}</span>
            </Button>
            
            <Button
              onClick={handleRemoveLast}
              variant="outline"
              size="lg"
              className="h-20 flex flex-col space-y-1"
              disabled={dailyLogs.length === 0}
            >
              <Minus size={24} />
              <span className="text-sm">Annuler dernier</span>
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="h-20 flex flex-col space-y-1 text-red-600 hover:bg-red-50"
            >
              <RotateCcw size={24} />
              <span className="text-sm">Reset jour</span>
            </Button>
          </div>
        </div>

        {/* Historique du jour */}
        {dailyLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Historique aujourd'hui</span>
                <Badge variant="outline">{dailyLogs.length} entrées</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {dailyLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span>{log.amount_ml}ml</span>
                      <Badge variant="outline" className="text-xs">
                        {log.drink_type}
                      </Badge>
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.logged_at).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
              {dailyLogs.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/hydration/history')}
                >
                  Voir tout l'historique
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conseils personnalisés */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Conseils pour {appStoreUser?.sport || 'votre sport'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {sportConfig.tips.map((tip, index) => {
                const TipIcon = tip.icon;
                const priorityColors = {
                  high: 'border-l-red-500 bg-red-50',
                  medium: 'border-l-yellow-500 bg-yellow-50',
                  low: 'border-l-blue-500 bg-blue-50'
                };
                
                return (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${priorityColors[tip.priority]}`}>
                    <div className="flex items-start space-x-3">
                      <TipIcon size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Analyse personnalisée */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Trophy size={20} className="text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">Analyse Personnalisée</h3>
                <p className="text-purple-700 text-sm mb-2">
                  En tant que {appStoreUser?.gender === 'male' ? 'homme' : 'femme'} de {appStoreUser?.age || '?'} ans 
                  ({appStoreUser?.weight_kg || '?'}kg) pratiquant le {appStoreUser?.sport || 'sport'}, 
                  votre objectif de {goalHydrationL.toFixed(1)}L est adapté à vos besoins.
                </p>
                <div className="text-xs text-purple-600 space-y-1">
                  <p>• Base: {Math.round((appStoreUser?.weight_kg || 70) * 35)}ml (35ml/kg)</p>
                  <p>• Bonus sport {userSportCategory}: +{sportConfig.goalModifierMl}ml</p>
                  <p>• Ajustements profil: +{personalizedGoalMl - Math.round((appStoreUser?.weight_kg || 70) * 35) - sportConfig.goalModifierMl}ml</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rappel contextuel */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Clock size={20} className="text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  Rappel {userSportCategory} {sportConfig.emoji}
                </h3>
                <p className="text-blue-700 text-sm">{sportConfig.contextualReminder}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence IA */}
        <AIIntelligence
          pillar="hydration"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />

        {/* Actions rapides bottom */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Actions rapides</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/hydration/history')}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/hydration/settings')}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Hydration;
