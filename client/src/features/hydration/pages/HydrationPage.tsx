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
  Settings,
  ChevronRight,
  Brain,
  Info,
} from 'lucide-react';
import { appStore } from '@/store/appStore';
import { useToast } from '@/shared/hooks/use-toast';
import AIIntelligence from '@/features/ai-coach/components/AIIntelligence';
import { supabase } from '@/lib/supabase';
import { useRealtimeSync } from '@/features/workout/hooks/useRealtimeSync';
import UniformHeader from '@/features/profile/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Database } from '@/features/workout/types/database';

// --- TYPES & INTERFACES ---
type DrinkType = Database['public']['Tables']['hydration_logs']['Row']['drink_type'];
type HydrationContext = Database['public']['Tables']['hydration_logs']['Row']['hydration_context'];
type SportCategory = 'endurance' | 'contact' | 'court' | 'strength';

interface RecommendedDrink {
  type: DrinkType;
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

type HydrationLog = Database['public']['Tables']['hydration_logs']['Row'];
type DailyStats = Database['public']['Tables']['daily_stats']['Row'];

// --- CONFIGURATION HYDRATATION PAR SPORT ---
const sportsHydrationData: Record<SportCategory, SportHydrationConfig> = {
  endurance: {
    emoji: '🏃‍♂️',
    goalModifierMl: 1000,
    contextualReminder:
      "Hydratez-vous toutes les 15-20 minutes pendant l'effort pour maintenir vos performances.",
    recommendedDrink: {
      type: 'sports_drink',
      name: 'Boisson Sport',
      icon: Zap,
      amount: 250,
      color: 'bg-orange-500',
    },
    tips: [
      {
        icon: Footprints,
        title: 'Pré-hydratation',
        // Utilisation de guillemets doubles pour encapsuler l'apostrophe dans "l'effort"
        description: "Buvez 500ml 2-3h avant l'effort et 250ml 15min avant le départ.",
        priority: 'high',
      },
      {
        icon: Clock,
        // Utilisation de guillemets doubles pour encapsuler l'apostrophe
        title: "Pendant l'effort",
        description: "150-250ml toutes les 15-20min selon l'intensité et la température.",
        priority: 'high',
      },
      {
        icon: Thermometer,
        title: 'Post-effort',
        // Utilisation de guillemets doubles pour encapsuler l'apostrophe
        description: "Buvez 150% du poids perdu en sueur dans les 6h suivant l'effort.",
        priority: 'medium',
      },
    ],
  },
  contact: {
    emoji: '🏈',
    goalModifierMl: 750,
    contextualReminder: 'Compensez les pertes intenses en sels minéraux avec des électrolytes.',
    recommendedDrink: {
      type: 'electrolytes',
      name: 'Électrolytes',
      icon: Shield,
      amount: 500,
      color: 'bg-purple-500',
    },
    tips: [
      {
        icon: Shield,
        // Utilisation de guillemets doubles pour encapsuler l'apostrophe dans "l'équipement"
        title: 'Électrolytes cruciaux',
        description:
          "La sueur sous l'équipement fait perdre beaucoup de sodium. Compensez avec des boissons enrichies.",
        priority: 'high',
      },
      {
        icon: Dumbbell,
        title: 'Récupération accélérée',
        description:
          'Une hydratation optimale réduit les courbatures et accélère la réparation musculaire.',
        priority: 'medium',
      },
    ],
  },
  court: {
    emoji: '🎾',
    goalModifierMl: 500,
    contextualReminder: 'Profitez de chaque pause pour boire 150-200ml et maintenir votre niveau.',
    recommendedDrink: {
      type: 'water',
      name: 'Eau Pure',
      icon: Droplets,
      amount: 250,
      color: 'bg-blue-500',
    },
    tips: [
      {
        icon: Trophy,
        title: 'Concentration optimale',
        description:
          'Même 2% de déshydratation réduit significativement vos réflexes et votre précision.',
        priority: 'high',
      },
      {
        icon: Zap,
        title: 'Énergie constante',
        description:
          'Pour les matchs >1h, alternez eau pure et boisson isotonique toutes les 2 pauses.',
        priority: 'medium',
      },
    ],
  },
  strength: {
    emoji: '💪',
    goalModifierMl: 250,
    contextualReminder: 'Hydratez-vous entre chaque série pour maintenir force et concentration.',
    recommendedDrink: {
      type: 'water',
      name: 'Eau Fraîche',
      icon: Droplets,
      amount: 300,
      color: 'bg-blue-600',
    },
    tips: [
      {
        icon: Dumbbell,
        title: 'Performance musculaire',
        description:
          '3% de déshydratation = 10-15% de perte de force. Hydratez-vous régulièrement.',
        priority: 'high',
      },
      {
        icon: Coffee,
        title: 'Pré-workout et caféine',
        description: 'Si vous prenez des stimulants, augmentez votre apport hydrique de 500ml.',
        priority: 'medium',
      },
    ],
  },
};

// --- COMPOSANT PRINCIPAL ---
const Hydration: React.FC = () => {
  // --- HOOKS ET STATE ---
  const navigate = useNavigate();
  const { appStoreUser } = appStore();
  const { toast } = useToast();

  const [currentMl, setCurrentMl] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyLogs, setDailyLogs] = useState<HydrationLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [lastDrinkTime, setLastDrinkTime] = useState<Date | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  // --- LOGIQUE DE PERSONNALISATION ---
  const getSportCategory = useCallback((sport: string | null | undefined): SportCategory => {
    const sportMappings: Record<string, SportCategory> = {
      basketball: 'court',
      tennis: 'court',
      volleyball: 'court',
      badminton: 'court',
      american_football: 'contact',
      rugby: 'contact',
      hockey: 'contact',
      football: 'endurance',
      running: 'endurance',
      cycling: 'endurance',
      swimming: 'endurance',
      triathlon: 'endurance',
      'course à pied': 'endurance',
      musculation: 'strength',
      powerlifting: 'strength',
      crossfit: 'strength',
      weightlifting: 'strength',
    };

    return sportMappings[sport?.toLowerCase() || ''] || 'strength';
  }, []);

  const userSportCategory = getSportCategory(appStoreUser?.sport);
  const sportConfig = sportsHydrationData[userSportCategory];

  // --- CALCUL OBJECTIF PERSONNALISÉ ---
  const personalizedGoalMl = useMemo(() => {
    const weight = appStoreUser?.weight ?? 70;
    const baseGoalMl = weight * 35;

    let adjustments = 0;
    adjustments += sportConfig.goalModifierMl;

    if (appStoreUser?.age) {
      if (appStoreUser.age > 50) adjustments += 200;
      if (appStoreUser.age < 25) adjustments += 300;
    }

    if (appStoreUser?.gender === 'male') {
      adjustments += 300;
    }

    if (appStoreUser?.primary_goals?.includes('weight_loss')) {
      adjustments += 500;
    }

    if (appStoreUser?.primary_goals?.includes('muscle_gain')) {
      adjustments += 300;
    }

    const activityLevel = appStoreUser?.activity_level;
    if (activityLevel === 'extra_active') adjustments += 500;
    else if (activityLevel === 'moderately_active') adjustments += 300;

    return Math.round(baseGoalMl + adjustments);
  }, [appStoreUser, sportConfig.goalModifierMl]);

  // --- FONCTIONS DE DONNÉES ---
  const loadHydrationData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      setIsLoading(true);

      const today = new Date().toISOString().split('T')[0];

      const { data: statsData, error: statsError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('stat_date', today)
        .single();

      const { data: logsData, error: logsError } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('log_date', today)
        .order('logged_at', { ascending: false });

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching daily stats:', statsError);
        toast({ title: 'Erreur de chargement des stats', variant: 'destructive' });
      }

      if (logsError) {
        console.error('Error fetching hydration logs:', logsError);
        toast({ title: 'Erreur de chargement des logs', variant: 'destructive' });
      }

      const currentStats = statsData as DailyStats | null;
      const currentLogs = logsData as HydrationLog[] | null;

      setDailyStats(currentStats);
      setDailyLogs(currentLogs || []);

      if (currentStats) {
        setCurrentMl(currentStats.water_intake_ml ?? 0);
      } else {
        setCurrentMl(0);
      }

      if (currentLogs && currentLogs.length > 0) {
        setLastDrinkTime(new Date(currentLogs[0].logged_at));
      }
    } catch {
      console.error('Erreur chargement hydratation:', error);
      toast({
        title: 'Erreur inattendue',
        description: "Impossible de charger les données d'hydratation.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, toast]);

  // --- HANDLERS ---
  const handleAddWater = useCallback(
    async (amount: number, type: DrinkType = 'water', context: HydrationContext = 'normal') => {
      if (!appStoreUser?.id) return;

      try {
        const newTotal = currentMl + amount;
        const now = new Date();

        setCurrentMl(newTotal);
        setLastDrinkTime(now);

        const { error: logError } = await (supabase as any).from('hydration_logs').insert({
          user_id: appStoreUser.id,
          amount_ml: amount,
          drink_type: type,
          logged_at: now.toISOString(),
          log_date: todayDate,
          hydration_context: context,
        });

        if (logError) throw logError;

        const { error: statsError } = await (supabase as any).from('daily_stats').upsert(
          {
            user_id: appStoreUser.id,
            stat_date: todayDate,
            water_intake_ml: newTotal,
            hydration_goal_ml: personalizedGoalMl,
            updated_at: now.toISOString(),
          },
          {
            onConflict: 'user_id,stat_date',
          }
        );

        if (statsError) throw statsError;

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
          title: 'Hydratation ajoutée',
          description: message,
        });

        await loadHydrationData();
      } catch {
        console.error('Erreur ajout hydratation:', error);
        setCurrentMl(prev => prev - amount);
        toast({
          title: 'Erreur',
          description: 'Impossible de sauvegarder. Réessayez.',
          variant: 'destructive',
        });
      }
    },
    [appStoreUser?.id, currentMl, personalizedGoalMl, todayDate, loadHydrationData, toast]
  );

  const handleRemoveLast = useCallback(async () => {
    if (dailyLogs.length === 0) return;

    const lastLog = dailyLogs[0];
    const newTotal = currentMl - lastLog.amount_ml;

    try {
      setCurrentMl(newTotal);

      const { error: deleteError } = await supabase
        .from('hydration_logs')
        .delete()
        .eq('id', lastLog.id);

      if (deleteError) throw deleteError;

      const { error: statsError } = await (supabase as any).from('daily_stats').upsert({
        user_id: appStoreUser?.id!,
        stat_date: todayDate,
        water_intake_ml: newTotal,
        hydration_goal_ml: personalizedGoalMl,
        updated_at: new Date().toISOString(),
      });

      if (statsError) throw statsError;

      toast({
        title: 'Dernière entrée supprimée',
        description: `-${lastLog.amount_ml}ml`,
      });

      await loadHydrationData();
    } catch {
      console.error('Erreur suppression:', error);
      setCurrentMl(prev => prev + lastLog.amount_ml);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'entrée",
        variant: 'destructive',
      });
    }
  }, [
    dailyLogs,
    currentMl,
    appStoreUser?.id,
    personalizedGoalMl,
    todayDate,
    loadHydrationData,
    toast,
  ]);

  // --- SYNCHRONISATION TEMPS RÉEL ---
  const {} = useRealtimeSync({
    pillar: 'hydration',
    onUpdate: payload => {
      if (
        payload.userId !== appStoreUser?.id &&
        (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')
      ) {
        loadHydrationData();
      }
    },
  });

  // --- CALCULS ---
  const currentHydrationL = currentMl / 1000;
  const goalHydrationL = personalizedGoalMl / 1000;
  const remaining = Math.max(0, personalizedGoalMl - currentMl);
  const percentage =
    personalizedGoalMl > 0 ? Math.min((currentMl / personalizedGoalMl) * 100, 100) : 0;
  const isGoalReached = percentage >= 100;

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = useCallback(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';

    if (isGoalReached) {
      return `🎉 Excellent ${userName} ! Objectif atteint !`;
    } else if (percentage >= 75) {
      return `💪 Bravo ${userName}, tu y es presque !`;
    } else if (percentage >= 50) {
      return `⚡ Continue ${userName} !`;
    } else {
      return `💧 ${userName}, hydrate-toi !`;
    }
  }, [percentage, isGoalReached, appStoreUser]);

  // Conseil prioritaire du jour
  const getTodayTip = useCallback(() => {
    const highPriorityTips = sportConfig.tips.filter(tip => tip.priority === 'high');
    return highPriorityTips[0] || sportConfig.tips[0];
  }, [sportConfig.tips]);

  // Afficher le rappel contextuel seulement si pertinent
  const shouldShowContextualReminder = useCallback(() => {
    return (
      percentage < 80 &&
      (!lastDrinkTime || new Date().getTime() - lastDrinkTime.getTime() > 2 * 60 * 60 * 1000)
    );
  }, [percentage, lastDrinkTime]);

  // --- EFFECTS ---
  useEffect(() => {
    loadHydrationData();
  }, [loadHydrationData]);

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
        </div>
      </div>
    );
  }

  const todayTip = getTodayTip();

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

        {/* Objectif principal - FOCUS */}
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
                <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Détails de votre objectif</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                      <p>
                        En tant que {appStoreUser?.gender === 'male' ? 'homme' : 'femme'} de{' '}
                        {appStoreUser?.age || '?'} ans ({appStoreUser?.weight || '?'}kg) pratiquant
                        le {appStoreUser?.sport || 'sport'}, votre objectif de{' '}
                        {goalHydrationL.toFixed(1)}L est adapté à vos besoins.
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>• Base: {Math.round((appStoreUser?.weight || 70) * 35)}ml (35ml/kg)</p>
                        <p>
                          • Bonus sport {userSportCategory}: +{sportConfig.goalModifierMl}ml
                        </p>
                        <p>
                          • Ajustements profil: +
                          {personalizedGoalMl -
                            Math.round((appStoreUser?.weight || 70) * 35) -
                            sportConfig.goalModifierMl}
                          ml
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  ? `${(remaining / 1000).toFixed(2).replace(/\.?0+$/, '')}L restants`
                  : 'Objectif atteint ! 🎉'}
              </div>
            </div>

            <Progress value={percentage} className="h-3 mb-4 bg-white/20" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/90">{Math.round(percentage)}% complété</span>
              {lastDrinkTime && (
                <span className="text-white/70">
                  Dernier:{' '}
                  {lastDrinkTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions principales - FOCUS */}
        <div className="space-y-4">
          {/* Sélecteur de quantité */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-2 mb-4">
                {[150, 250, 350, 500].map(amount => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAmount(amount)}
                    className="flex-1"
                  >
                    {amount}ml
                  </Button>
                ))}
              </div>

              {/* Actions principales */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAddWater(selectedAmount, 'water', 'normal')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 h-16 flex flex-col space-y-1"
                >
                  <Plus size={20} />
                  <span className="text-sm">Eau {selectedAmount}ml</span>
                </Button>

                <Button
                  onClick={() =>
                    handleAddWater(
                      sportConfig.recommendedDrink.amount,
                      sportConfig.recommendedDrink.type,
                      'workout'
                    )
                  }
                  size="lg"
                  variant="outline"
                  className={`h-16 flex flex-col space-y-1 border-2 ${sportConfig.recommendedDrink.color.replace('bg-', 'border-')} hover:${sportConfig.recommendedDrink.color.replace('bg-', 'bg-')}/10`}
                >
                  {React.createElement(sportConfig.recommendedDrink.icon, { size: 20 })}
                  <span className="text-sm">{sportConfig.recommendedDrink.name}</span>
                </Button>
              </div>

              {/* Actions secondaires */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Button
                  onClick={handleRemoveLast}
                  variant="outline"
                  size="sm"
                  disabled={dailyLogs.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Minus size={16} />
                  <span>Annuler</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/hydration/history')}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp size={16} />
                  <span>Historique</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique du jour - COMPACT */}
        {dailyLogs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Aujourd'hui</span>
                <Badge variant="outline">{dailyLogs.length} entrées</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {dailyLogs.slice(0, 3).map(log => (
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
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
              {dailyLogs.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => navigate('/hydration/history')}
                >
                  Voir les {dailyLogs.length - 3} autres entrées
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conseil du jour - PRIORITAIRE UNIQUEMENT */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {React.createElement(todayTip.icon, {
                size: 20,
                className: 'text-blue-600 mt-0.5 flex-shrink-0',
              })}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{todayTip.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{todayTip.description}</p>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                      Voir tous les conseils <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {sportConfig.tips.slice(1).map((tip, index) => {
                      const TipIcon = tip.icon;
                      return (
                        <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <TipIcon size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-gray-800 text-xs mb-1">
                                {tip.title}
                              </h4>
                              <p className="text-xs text-gray-600">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rappel contextuel - CONDITIONNEL */}
        {shouldShowContextualReminder() && (
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 text-sm mb-1">
                    Rappel {userSportCategory} {sportConfig.emoji}
                  </h3>
                  <p className="text-blue-700 text-xs">{sportConfig.contextualReminder}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coaching IA - MODAL */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Coaching IA</h3>
                  <p className="text-xs text-gray-600">Analyse personnalisée et conseils</p>
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
                    <DialogTitle>Coaching IA - Hydratation</DialogTitle>
                  </DialogHeader>
                  <AIIntelligence
                    pillar="hydration"
                    showPredictions={true}
                    showCoaching={true}
                    showRecommendations={true}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Hydration;
