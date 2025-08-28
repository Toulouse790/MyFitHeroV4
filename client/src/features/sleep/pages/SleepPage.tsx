import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, TrendingUp, Settings, Moon, Eye, EyeOff, 
  Sparkles, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { UniformHeader } from '@/components/UniformHeader';
import AIIntelligence from '@/components/AIIntelligence';
import { useSleepStore } from '../hooks/useSleepStore';
import { 
  SleepChart, 
  SleepQualityForm, 
  SleepGoals, 
  SleepAnalytics 
} from '../components';
import { 
  sportSleepConfigs, 
  formatDuration, 
  getSleepQualityLabel,
  getPersonalizedSleepMessage,
  getSleepDeficit
} from '../utils/sleepConfig';

const SleepPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const appStoreUser = useAppStore((state) => state.appStoreUser);
  
  const {
    entries,
    currentEntry,
    currentGoal,
    stats,
    isLoading,
    error,
    loadEntries,
    loadGoals,
    loadStats,
    clearError
  } = useSleepStore();

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Configuration sport
  const userSportCategory = appStoreUser?.sport || 'endurance';
  const sportConfig = sportSleepConfigs[userSportCategory] || sportSleepConfigs.endurance;

  // Calculs dérivés
  const sleepDeficit = useMemo(() => {
    if (!stats || !currentGoal) return 0;
    return getSleepDeficit(currentGoal, stats.averageDuration);
  }, [stats, currentGoal]);

  const personalizedMessage = useMemo(() => {
    return getPersonalizedSleepMessage(appStoreUser?.sport || undefined, sleepDeficit);
  }, [appStoreUser?.sport, sleepDeficit]);

  const priorityBenefits = useMemo(() => {
    if (!sportConfig) return [];
    return sportConfig.benefits.filter(benefit => benefit.priority === 'high').slice(0, 2);
  }, [sportConfig]);

  const priorityTips = useMemo(() => {
    if (!sportConfig) return [];
    return sportConfig.tips.filter(tip => tip.priority === 'high').slice(0, 2);
  }, [sportConfig]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadEntries(),
          loadGoals(),
          loadStats()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données sommeil:', error);
      }
    };

    loadData();
  }, [loadEntries, loadGoals, loadStats]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Loading state
  if (isLoading && entries.length === 0) {
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

  const TipCard = ({ tip }: { tip: any }) => {
    const TipIcon = tip.icon;
    return (
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Header Uniforme */}
        <UniformHeader
          title="Sommeil"
          subtitle={`${sportConfig?.emoji || '😴'} ${personalizedMessage}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Status actuel */}
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
                  {userSportCategory} {sportConfig?.emoji || '😴'}
                </Badge>
              </div>
            </div>
            
            {currentEntry ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatDuration(currentEntry.duration)}
                    </div>
                    <div className="text-white/80 text-sm">
                      {currentEntry.bedtime} → {currentEntry.wakeTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {currentEntry.quality}/10
                    </div>
                    <div className="text-white/80 text-sm">
                      {getSleepQualityLabel(currentEntry.quality).label}
                    </div>
                  </div>
                </div>

                {showDetailedView && currentEntry.factors.length > 0 && (
                  <div className="pt-3 border-t border-white/20">
                    <div className="text-sm text-white/90 mb-2">Facteurs influents:</div>
                    <div className="flex flex-wrap gap-1">
                      {currentEntry.factors.slice(0, 3).map((factor, idx) => (
                        <Badge 
                          key={idx}
                          variant="secondary"
                          className={`text-xs ${
                            factor.type === 'positive' 
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {factor.type === 'positive' ? '+' : '-'} {factor.name}
                        </Badge>
                      ))}
                      {currentEntry.factors.length > 3 && (
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                          +{currentEntry.factors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-white/80 mb-2">Aucune nuit enregistrée</div>
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab('add')}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  <Plus size={16} className="mr-1" />
                  Première nuit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <Button 
                onClick={() => setActiveTab('add')}
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

        {/* Analyse du profil sportif */}
        <Card className="bg-gradient-to-r from-gray-50 to-purple-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Analyse pour {userSportCategory} {sportConfig?.emoji || '😴'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {sportConfig?.motivationalMessage || 'Votre sommeil est important pour vos performances'}
                </p>

                <Tabs defaultValue="benefits" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="benefits" className="text-xs">Bénéfices</TabsTrigger>
                    <TabsTrigger value="tips" className="text-xs">Conseils</TabsTrigger>
                  </TabsList>

                  <TabsContent value="benefits" className="mt-0">
                    {showDetailedView ? (
                      <div className="grid grid-cols-1 gap-3">
                        {(sportConfig?.benefits || []).map((benefit, index) => {
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
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {priorityBenefits.map((benefit, index) => {
                            const BenefitIcon = benefit.icon;
                            return (
                              <Card key={index} className="bg-white/50">
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
                        {(sportConfig?.benefits?.length || 0) > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetailedView(true)}
                            className="w-full text-xs text-purple-600 hover:text-purple-700"
                          >
                            Voir tous les bénéfices ({sportConfig?.benefits?.length || 0})
                            <ChevronRight size={12} className="ml-1" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tips" className="mt-0">
                    <div className="space-y-3">
                      {(showDetailedView ? (sportConfig?.tips || []) : priorityTips).map((tip, index) => (
                        <TipCard key={index} tip={tip} />
                      ))}
                      {!showDetailedView && (sportConfig?.tips?.length || 0) > priorityTips.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetailedView(true)}
                          className="w-full text-xs text-purple-600 hover:text-purple-700"
                        >
                          Voir tous les conseils ({sportConfig?.tips?.length || 0})
                          <ChevronRight size={12} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal avec onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="add">Ajouter</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && <SleepChart stats={stats} />}
            {entries.length > 0 && <SleepAnalytics />}
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <SleepQualityForm onComplete={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <SleepGoals />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SleepAnalytics />
            {stats && <SleepChart stats={stats} />}
          </TabsContent>
        </Tabs>

        {/* IA Intelligence */}
        <AIIntelligence 
          pillar="sleep"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />
      </div>
    </div>
  );
};

export default SleepPage;
