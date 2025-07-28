# Créer le code React optimisé pour la page Sleep
sleep_code = '''// client/src/components/Sleep.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Clock, 
  Bed,
  Phone,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Shield,
  Zap,
  Trophy,
  Users,
  Eye,
  Plus,
  TrendingUp,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  TimerIcon,
  Bell,
  ChevronDown,
  ChevronUp,
  EyeOff,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AIIntelligence from '@/components/AIIntelligence';
import { UniformHeader } from '@/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

// --- TYPES ---
type SportCategory = 'contact' | 'endurance' | 'precision' | 'team';

interface SportSleepConfig {
  emoji: string;
  sleepGoalHours: number;
  motivationalMessage: string;
  benefits: {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
    priority: 'high' | 'medium';
  }[];
  tips: {
    icon: React.ElementType;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface SleepSession {
  id: string;
  user_id: string;
  sleep_date: string;
  bedtime?: string;
  wake_time?: string;
  duration_minutes?: number;
  quality_rating?: number;
  mood_rating?: number;
  energy_level?: number;
  notes?: string;
  factors?: Record<string, any>;
  hrv_ms?: number;
  resting_hr?: number;
  sleep_efficiency?: number;
}

interface SleepGoals {
  target_hours: number;
  target_bedtime: string;
  target_wake_time: string;
  consistency_score: number;
}

// --- CONFIGURATION DU SOMMEIL PAR SPORT ---
const sportsSleepData: Record<SportCategory, SportSleepConfig> = {
  contact: {
    emoji: '🛡️',
    sleepGoalHours: 9,
    motivationalMessage: 'Optimisez votre récupération physique pour l\'impact.',
    benefits: [
      { icon: Shield, title: 'Récup. Musculaire', value: 'Maximale', color: 'text-green-500', priority: 'high' },
      { icon: Heart, title: 'Réduction Inflam.', value: 'Élevée', color: 'text-red-500', priority: 'high' },
      { icon: Brain, title: 'Prise de décision', value: '+15%', color: 'text-purple-500', priority: 'medium' },
      { icon: Zap, title: 'Puissance', value: '+10%', color: 'text-yellow-500', priority: 'medium' }
    ],
    tips: [
      { icon: Bed, title: 'Priorité à la durée', description: 'Visez 9h+ pour permettre à votre corps de réparer les micro-déchirures musculaires.', priority: 'high' },
      { icon: Moon, title: 'Routine de décompression', description: 'Après un entraînement intense, une routine calme aide à baisser le rythme cardiaque.', priority: 'medium' },
      { icon: Phone, title: 'Zéro distraction', description: 'Le sommeil est votre meilleur atout de récupération. Protégez-le des interruptions.', priority: 'high' },
    ]
  },
  endurance: {
    emoji: '🏃‍♀️',
    sleepGoalHours: 8.5,
    motivationalMessage: 'Améliorez la qualité de votre sommeil pour une meilleure endurance.',
    benefits: [
      { icon: Heart, title: 'Santé Cardiaque', value: 'Optimale', color: 'text-red-500', priority: 'high' },
      { icon: Zap, title: 'Stockage Glycogène', value: 'Amélioré', color: 'text-yellow-500', priority: 'high' },
      { icon: Brain, title: 'Endurance Mentale', value: '+20%', color: 'text-purple-500', priority: 'medium' },
      { icon: Shield, title: 'Système Immunitaire', value: 'Renforcé', color: 'text-green-500', priority: 'medium' }
    ],
    tips: [
      { icon: Clock, title: 'Consistance des horaires', description: 'Se coucher et se lever à la même heure stabilise votre rythme circadien.', priority: 'high' },
      { icon: Sun, title: 'Exposition à la lumière', description: 'La lumière du jour le matin aide à réguler votre horloge interne.', priority: 'medium' },
      { icon: Bed, title: 'Qualité > Quantité', description: 'Un sommeil profond et ininterrompu est plus réparateur.', priority: 'high' },
    ]
  },
  precision: {
    emoji: '🎯',
    sleepGoalHours: 8,
    motivationalMessage: 'Aiguisez votre concentration avec un repos mental parfait.',
    benefits: [
      { icon: Brain, title: 'Clarté Mentale', value: 'Maximale', color: 'text-purple-500', priority: 'high' },
      { icon: Eye, title: 'Coordination Œil-main', value: '+18%', color: 'text-blue-500', priority: 'high' },
      { icon: Zap, title: 'Temps de réaction', value: 'Amélioré', color: 'text-yellow-500', priority: 'medium' },
      { icon: Shield, title: 'Gestion du Stress', value: 'Optimale', color: 'text-green-500', priority: 'medium' }
    ],
    tips: [
      { icon: Brain, title: 'Calme mental pré-sommeil', description: 'Pratiquez la méditation ou la respiration profonde pour calmer votre esprit.', priority: 'high' },
      { icon: Phone, title: 'Déconnexion digitale', description: 'Évitez les écrans et informations stressantes avant le coucher.', priority: 'high' },
      { icon: Trophy, title: 'Visualisation pré-compétition', description: 'Utilisez les dernières minutes pour visualiser le succès.', priority: 'medium' },
    ]
  },
  team: {
    emoji: '🤝',
    sleepGoalHours: 8,
    motivationalMessage: 'Synchronisez votre repos pour une performance d\'équipe au top.',
    benefits: [
      { icon: Users, title: 'Cohésion d\'équipe', value: 'Améliorée', color: 'text-blue-500', priority: 'high' },
      { icon: Zap, title: 'Niveau d\'énergie', value: 'Stable', color: 'text-yellow-500', priority: 'high' },
      { icon: Brain, title: 'Tactique & Stratégie', value: 'Mémoire +', color: 'text-purple-500', priority: 'medium' },
      { icon: Heart, title: 'Endurance de match', value: '+10%', color: 'text-red-500', priority: 'medium' },
    ],
    tips: [
      { icon: Calendar, title: 'Routine de veille de match', description: 'Adoptez une routine fixe la veille des matchs pour réduire l\'anxiété.', priority: 'high' },
      { icon: Clock, title: 'Consistance du groupe', description: 'Des horaires réguliers aident à maintenir un niveau d\'énergie homogène.', priority: 'medium' },
      { icon: Sun, title: 'Réveil sans stress', description: 'Évitez la touche "snooze" pour démarrer avec plus d\'énergie.', priority: 'low' },
    ]
  }
};

const Sleep: React.FC = () => {
  // --- HOOKS ET STATE ---
  const navigate = useNavigate();
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  
  const [currentSleep, setCurrentSleep] = useState<SleepSession | null>(null);
  const [sleepGoals, setSleepGoals] = useState<SleepGoals>({
    target_hours: 8,
    target_bedtime: '23:00',
    target_wake_time: '07:00',
    consistency_score: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<SleepSession[]>([]);
  const [sleepTimer, setSleepTimer] = useState<{ active: boolean; startTime?: Date }>({ active: false });
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showAllTips, setShowAllTips] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  // --- MAPPING SPORT VERS CATÉGORIE ---
  const getSportCategory = useCallback((sport: string): SportCategory => {
    const mappings: Record<string, SportCategory> = {
      'american_football': 'contact',
      'rugby': 'contact', 
      'hockey': 'contact',
      'boxing': 'contact',
      'mma': 'contact',
      'basketball': 'team',
      'football': 'team',
      'volleyball': 'team',
      'handball': 'team',
      'tennis': 'precision',
      'golf': 'precision',
      'snooker': 'precision',
      'archery': 'precision',
      'esports': 'precision',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'triathlon': 'endurance',
      'course à pied': 'endurance'
    };
    return mappings[sport?.toLowerCase()] || 'team';
  }, []);

  const userSportCategory = getSportCategory(appStoreUser?.sport || 'none');
  const sportConfig = sportsSleepData[userSportCategory];

  // --- CALCUL OBJECTIF PERSONNALISÉ ---
  const personalizedSleepGoal = useMemo(() => {
    let goalHours = sportConfig.sleepGoalHours;
    
    // Ajustements selon l'âge
    if (appStoreUser?.age) {
      if (appStoreUser.age < 25) goalHours += 0.5;
      if (appStoreUser.age > 45) goalHours += 0.5;
    }
    
    // Ajustements selon les objectifs
    if (appStoreUser?.primary_goals?.includes('muscle_gain')) goalHours += 0.5;
    if (appStoreUser?.primary_goals?.includes('performance')) goalHours += 0.5;
    
    // Ajustement selon la fréquence d'entraînement
    if (appStoreUser?.training_frequency && appStoreUser.training_frequency > 5) {
      goalHours += 0.5;
    }
    
    return Math.min(goalHours, 10);
  }, [appStoreUser, sportConfig.sleepGoalHours]);

  // --- CHARGEMENT DES DONNÉES ---
  const loadSleepData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      setIsLoading(true);
      
      // Charger la session de sommeil d'hier soir/cette nuit
      const { data: sleepSession, error: sessionError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('sleep_date', todayDate)
        .single();

      // Charger les données de la semaine
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const { data: weekData, error: weekError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .gte('sleep_date', weekStart.toISOString().split('T')[0])
        .order('sleep_date', { ascending: false });

      if (!sessionError && sleepSession) {
        setCurrentSleep(sleepSession);
      } else if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Erreur session:', sessionError);
      }

      if (!weekError && weekData) {
        setWeeklyData(weekData);
        
        // Calculer le score de consistance
        if (weekData.length > 0) {
          const avgBedtime = weekData
            .filter(s => s.bedtime)
            .reduce((acc, s) => {
              const time = new Date(`2000-01-01T${s.bedtime}`).getTime();
              return acc + time;
            }, 0) / weekData.filter(s => s.bedtime).length;

          const avgWakeTime = weekData
            .filter(s => s.wake_time)
            .reduce((acc, s) => {
              const time = new Date(`2000-01-01T${s.wake_time}`).getTime();
              return acc + time;
            }, 0) / weekData.filter(s => s.wake_time).length;

          if (avgBedtime && avgWakeTime) {
            setSleepGoals(prev => ({
              ...prev,
              target_bedtime: new Date(avgBedtime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              target_wake_time: new Date(avgWakeTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              consistency_score: Math.round(Math.random() * 30 + 70) // Simulation de score
            }));
          }
        }
      }

    } catch (error) {
      console.error('Erreur chargement sommeil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, todayDate]);

  // --- HANDLERS ---
  const handleStartSleepTimer = useCallback(() => {
    setSleepTimer({ active: true, startTime: new Date() });
    toast({
      title: "Timer de sommeil démarré",
      description: "Bonne nuit ! 🌙",
    });
  }, [toast]);

  const handleStopSleepTimer = useCallback(async () => {
    if (!sleepTimer.startTime || !appStoreUser?.id) return;

    const now = new Date();
    const durationMs = now.getTime() - sleepTimer.startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    try {
      const { error } = await supabase
        .from('sleep_sessions')
        .insert({
          user_id: appStoreUser.id,
          sleep_date: todayDate,
          bedtime: sleepTimer.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          wake_time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration_minutes: durationMinutes,
          created_at: now.toISOString()
        });

      if (error) throw error;

      setSleepTimer({ active: false });
      await loadSleepData();

      toast({
        title: "Session de sommeil enregistrée",
        description: `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60}min de sommeil`,
      });

    } catch (error) {
      console.error('Erreur sauvegarde sommeil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la session",
        variant: "destructive"
      });
    }
  }, [sleepTimer, appStoreUser?.id, todayDate, loadSleepData, toast]);

  // --- CALCULS ---
  const currentSleepHours = currentSleep?.duration_minutes ? currentSleep.duration_minutes / 60 : 0;
  const sleepPercentage = (currentSleepHours / personalizedSleepGoal) * 100;
  const sleepDeficit = Math.max(0, personalizedSleepGoal - currentSleepHours);
  const weeklyAverage = weeklyData.length > 0 
    ? weeklyData.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / weeklyData.length / 60
    : 0;

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = useCallback(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    const progress = (currentSleepHours / personalizedSleepGoal) * 100;
    
    if (progress >= 95) {
      return `😴 Parfait ${userName} ! Sommeil optimal pour ${appStoreUser?.sport}`;
    } else if (progress >= 80) {
      return `💤 Très bien ${userName}, ta récupération est sur la bonne voie !`;
    } else if (progress >= 60) {
      return `⏰ ${userName}, quelques heures de plus t'aideraient pour ${appStoreUser?.sport}`;
    } else {
      return `🚨 ${userName}, ton corps a besoin de plus de récupération !`;
    }
  }, [currentSleepHours, personalizedSleepGoal, appStoreUser]);

  const getPersonalizedRecommendation = useCallback(() => {
    const deficit = Math.round(sleepDeficit * 60);
    if (deficit > 0) {
      return `Pour optimiser vos performances en ${appStoreUser?.sport}, couchez-vous ${deficit} minutes plus tôt.`;
    }
    return `Votre sommeil est parfaitement adapté à vos besoins en ${appStoreUser?.sport} !`;
  }, [sleepDeficit, appStoreUser?.sport]);

  // --- COMPOSANTS ---
  const TipCard = ({ tip }: { tip: any }) => {
    const TipIcon = tip.icon;
    const priorityColors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-blue-500 bg-blue-50'
    };
    
    return (
      <Card className={`border-l-4 ${priorityColors[tip.priority]}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <TipIcon size={20} className="text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Bénéfices prioritaires
  const getPriorityBenefits = useCallback(() => {
    return sportConfig.benefits.filter(benefit => benefit.priority === 'high').slice(0, 2);
  }, [sportConfig.benefits]);

  // Conseils prioritaires
  const getPriorityTips = useCallback(() => {
    return sportConfig.tips.filter(tip => tip.priority === 'high').slice(0, 2);
  }, [sportConfig.tips]);

  // --- EFFECTS ---
  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  const priorityBenefits = getPriorityBenefits();
  const priorityTips = getPriorityTips();

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
          title="Sommeil"
          subtitle={`${sportConfig.emoji} ${getPersonalizedMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Timer de sommeil */}
        {sleepTimer.active && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-purple-800">Timer en cours</h3>
                    <p className="text-sm text-purple-600">
                      Démarré à {sleepTimer.startTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Button onClick={handleStopSleepTimer} className="bg-purple-600 hover:bg-purple-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Réveil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résumé de la nuit - FOCUS */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Dernière Nuit</span>
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  className="text-white hover:bg-white/20"
                >
                  {showDetailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {userSportCategory} {sportConfig.emoji}
                </Badge>
              </div>
            </div>
            
            {currentSleep ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{currentSleepHours.toFixed(1)}h</div>
                  <div className="text-white/80 text-sm">
                    sur {personalizedSleepGoal}h ({userSportCategory})
                  </div>
                  <div className="text-white/70 text-xs mt-1">
                    {sleepDeficit > 0 
                      ? `${Math.round(sleepDeficit * 60)} min de déficit`
                      : 'Objectif atteint ! 🎉'
                    }
                  </div>
                </div>
                
                {showDetailedView && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{currentSleep.quality_rating || '--'}/5</div>
                      <div className="text-white/80 text-xs">Qualité</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{Math.round(sleepPercentage)}%</div>
                      <div className="text-white/80 text-xs">Objectif</div>
                    </div>
                  </div>
                )}
                
                <div className="text-center text-sm text-white/80">
                  Couché: {currentSleep.bedtime || '--'} • Levé: {currentSleep.wake_time || '--'}
                </div>
                
                <Progress value={Math.min(sleepPercentage, 100)} className="h-3 bg-white/20" />
                
                {!sleepTimer.active && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleStartSleepTimer}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <TimerIcon className="h-4 w-4 mr-2" />
                      Nouveau timer
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/80 mb-4">Aucune donnée de sommeil aujourd'hui</p>
                {!sleepTimer.active && (
                  <Button 
                    onClick={handleStartSleepTimer}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer le timer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommandation personnalisée */}
        {sleepDeficit > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Recommandation personnalisée</h3>
                  <p className="text-amber-700 text-sm">{getPersonalizedRecommendation()}</p>
                  <div className="mt-2 p-2 bg-amber-100 rounded-md">
                    <p className="text-xs text-amber-800">
                      <strong>Déficit:</strong> -{Math.round(sleepDeficit * 60)} minutes pour un sommeil optimal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques - MODE COMPACT/DÉTAILLÉ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Vos Stats</h2>
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
                onClick={() => navigate('/sleep/history')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </div>
          </div>

          {showDetailedView ? (
            // Vue détaillée avec tabs
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Cette semaine</TabsTrigger>
                <TabsTrigger value="benefits">Bénéfices</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly">
                {weeklyData.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{weeklyAverage.toFixed(1)}h</div>
                          <div className="text-xs text-gray-500">Moyenne</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{sleepGoals.consistency_score}%</div>
                          <div className="text-xs text-gray-500">Consistance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {Math.round((weeklyAverage / personalizedSleepGoal) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">Objectif</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <Badge variant="outline" className="text-xs">
                          {weeklyData.length} nuits enregistrées
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="benefits">
                <div className="grid grid-cols-1 gap-3">
                  {sportConfig.benefits.map((benefit, index) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <BenefitIcon size={18} className={benefit.color} />
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{benefit.title}</div>
                              <div className={`text-xs font-bold ${benefit.color}`}>{benefit.value}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // Vue compacte - Top 2 bénéfices + stats essentielles
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {priorityBenefits.map((benefit, index) => {
                  const BenefitIcon = benefit.icon;
                  return (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <BenefitIcon size={16} className={benefit.color} />
                          <div>
                            <div className="font-medium text-gray-800 text-xs">{benefit.title}</div>
                            <div className={`text-xs font-bold ${benefit.color}`}>{benefit.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {weeklyData.length > 0 && (
                <Card className="bg-white">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-800">Cette semaine</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">{weeklyAverage.toFixed(1)}h</div>
                        <div className="text-xs text-gray-500">moyenne</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Actions rapides - COMPACTES */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-4 gap-2">
              {!sleepTimer.active && (
                <Button 
                  onClick={handleStartSleepTimer}
                  className="bg-purple-600 hover:bg-purple-700 h-12 flex flex-col space-y-1 text-xs"
                >
                  <TimerIcon size={16} />
                  <span>Timer</span>
                </Button>
              )}
              <Button 
                onClick={() => navigate('/sleep/log')}
                variant="outline"
                className="h-12 flex flex-col space-y-1 text-xs"
              >
                <Plus size={16} />
                <span>Ajouter</span>
              </Button>
              <Button 
                onClick={() => navigate('/sleep/history')}
                variant="outline"
                className="h-12 flex flex-col space-y-1 text-xs"
              >
                <TrendingUp size={16} />
                <span>Historique</span>
              </Button>
              <Button 
                onClick={() => navigate('/sleep/settings')}
                variant="outline"
                className="h-12 flex flex-col space-y-1 text-xs"
              >
                <Settings size={16} />
                <span>Réglages</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analyse du profil - COMPACTE */}
        <Card className="bg-gradient-to-r from-gray-50 to-purple-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Brain size={20} className="text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800 mb-1">Analyse de votre profil</h3>
                <p className="text-purple-700 text-sm mb-2">
                  En tant que {appStoreUser?.gender === 'male' ? 'pratiquant' : 'pratiquante'} de {appStoreUser?.sport} 
                  de {appStoreUser?.age || '?'} ans, votre objectif de sommeil est ajusté à {personalizedSleepGoal}h.
                </p>
                <Collapsible open={showDetailedView} onOpenChange={setShowDetailedView}>
                  <CollapsibleContent className="text-xs text-purple-600 space-y-1 mt-2">
                    <p>• Sport {userSportCategory}: {sportConfig.sleepGoalHours}h de base</p>
                    {appStoreUser?.training_frequency && appStoreUser.training_frequency > 5 && (
                      <p>• Entraînement intensif ({appStoreUser.training_frequency}x/sem): +0.5h</p>
                    )}
                    {appStoreUser?.primary_goals?.includes('muscle_gain') && (
                      <p>• Objectif prise de masse: +0.5h récupération</p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conseils personnalisés - ACCORDION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb size={20} className="text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Conseils pour {userSportCategory}
              </h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {sportConfig.tips.length} conseils
            </Badge>
          </div>
          
          {/* Top 2 conseils prioritaires */}
          <div className="space-y-3">
            {priorityTips.map((tip, index) => (
              <TipCard key={index} tip={tip} />
            ))}
          </div>
          
          {/* Voir tous les conseils */}
          <Collapsible open={showAllTips} onOpenChange={setShowAllTips}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full text-sm">
                {showAllTips ? "Voir moins" : `Voir tous les conseils (${sportConfig.tips.length - 2} autres)`}
                {showAllTips ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {sportConfig.tips
                .filter(tip => tip.priority !== 'high')
                .map((tip, index) => (
                  <TipCard key={index} tip={tip} />
                ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Intelligence IA - MODAL */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Analyse IA Sommeil</h3>
                  <p className="text-xs text-gray-600">Coaching personnalisé et prédictions</p>
                </div>
              </div>
              <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ouvrir <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Analyse IA Sommeil</DialogTitle>
                  </DialogHeader>
                  <AIIntelligence
                    pillar="sleep"
                    showPredictions={true}
                    showCoaching={true}
                    showRecommendations={true}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Message de motivation */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-4 text-center">
            <h3 className="font-bold mb-2">{sportConfig.motivationalMessage}</h3>
            <p className="text-purple-100 text-sm">
              Le sommeil n'est pas du temps perdu, c'est votre arme secrète pour exceller en {appStoreUser?.sport} !
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sleep;'''

# Sauvegarder le code dans un fichier
with open('Sleep_Optimized.tsx', 'w', encoding='utf-8') as f:
    f.write(sleep_code)

print("Code React optimisé généré avec succès !")
print("\nPrincipales améliorations :")
print("✅ Mode Vue Simple vs Vue Détaillée (toggle)")
print("✅ Actions rapides compactes (4 colonnes)")
print("✅ Bénéfices prioritaires (top 2 en mode simple)")
print("✅ Conseils en accordion (prioritaires d'abord)")
print("✅ Tabs pour organiser stats/bénéfices")
print("✅ Analyse IA dans une modal")
print("✅ Interface plus claire et moins chargée")
print("✅ Analyse du profil collapsible")
