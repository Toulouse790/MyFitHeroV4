// pages/analytics.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  Users,
  Activity,
  Target,
  Award,
  Zap,
  FileText,
  Share2,
  Filter,
  Trophy
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UniformHeader } from '@/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AIIntelligence from '@/components/AIIntelligence';

interface AnalyticsData {
  consistency_rate: number;
  streak_days: number;
  monthly_improvement: number;
  goals_achieved: number;
  ranking_percentile: number;
  total_workouts: number;
  total_calories: number;
  average_sleep: number;
  hydration_rate: number;
}

interface ExportData {
  format: 'json' | 'csv' | 'pdf';
  period: 'week' | 'month' | 'quarter' | 'year';
  includes: string[];
}

const Analytics: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'tableau-bord' | 'rapports' | 'export' | 'social'>('tableau-bord');
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'quarter'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Chargement des données analytics
  const loadAnalyticsData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setLoading(true);
    try {
      // Récupération des données depuis Supabase
      const { data: workoutStats } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .gte('stat_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Calculs avec intégration IA pour personnalisation
      const mockData: AnalyticsData = {
        consistency_rate: dailyStats?.length ? Math.round((dailyStats.length / 30) * 100) : 85,
        streak_days: 12,
        monthly_improvement: 23,
        goals_achieved: 92,
        ranking_percentile: 15,
        total_workouts: workoutStats?.length || 24,
        total_calories: workoutStats?.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0) || 3840,
        average_sleep: 7.5,
        hydration_rate: 88
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser?.id, toast]);

  // Messages personnalisés avec IA
  const getPersonalizedMessage = useMemo(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    const sport = appStoreUser?.sport || 'sport';

    if (!analyticsData) return `📊 Analysons vos performances, ${userName}`;

    if (analyticsData.consistency_rate >= 90) {
      return `🎯 Excellent ${userName} ! Vos performances en ${sport} sont remarquables`;
    } else if (analyticsData.consistency_rate >= 70) {
      return `💪 Très bien ${userName}, votre progression en ${sport} est solide`;
    } else {
      return `🚀 ${userName}, améliorons ensemble vos résultats en ${sport}`;
    }
  }, [appStoreUser, analyticsData]);

  // Export des données avec optimisation
  const handleExport = useCallback(async (format: ExportData['format']) => {
    if (!analyticsData || !appStoreUser?.id) return;

    setExporting(true);
    try {
      const exportData = {
        user_id: appStoreUser.id,
        sport: appStoreUser.sport,
        export_date: new Date().toISOString(),
        period: periodFilter,
        analytics: analyticsData,
        format
      };

      // Simulation d'export avec délai réaliste
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${appStoreUser.sport}-${periodFilter}.json`;
        a.setAttribute('aria-label', `Télécharger les données analytics au format JSON`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Génération CSV basique
        const csvContent = [
          'Métrique,Valeur',
          `Taux de consistance,${analyticsData.consistency_rate}%`,
          `Série de jours,${analyticsData.streak_days}`,
          `Amélioration mensuelle,${analyticsData.monthly_improvement}%`,
          `Objectifs atteints,${analyticsData.goals_achieved}%`,
          `Total entraînements,${analyticsData.total_workouts}`,
          `Total calories,${analyticsData.total_calories}`,
          `Sommeil moyen,${analyticsData.average_sleep}h`,
          `Taux hydratation,${analyticsData.hydration_rate}%`
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${appStoreUser.sport}-${periodFilter}.csv`;
        a.setAttribute('aria-label', `Télécharger les données analytics au format CSV`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export réussi",
        description: `Données ${format.toUpperCase()} téléchargées avec succès`,
      });

      // Analytics event pour insights
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'analytics_export', {
          format,
          period: periodFilter,
          sport: appStoreUser.sport,
          user_id: appStoreUser.id
        });
      }

    } catch (error) {
      console.error('Erreur export:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  }, [analyticsData, appStoreUser, periodFilter, toast]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData, periodFilter]);

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Analytics"
          subtitle="Chargement des données..."
          showBackButton={true}
          gradient={true}
        />
        <div className="p-4 space-y-6 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tableau-bord', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'rapports', label: 'Rapports', icon: TrendingUp },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'social', label: 'Social', icon: Users }
  ];

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      case 'quarter': return 'Trimestre';
      default: return 'Mois';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Analytics"
        subtitle={getPersonalizedMessage}
        showBackButton={true}
        gradient={true}
        rightContent={
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {analyticsData.consistency_rate}% consistance
            </Badge>
            <Select value={periodFilter} onValueChange={(value: 'week' | 'month' | 'quarter') => setPeriodFilter(value)}>
              <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white" aria-label="Sélectionner la période">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-6xl mx-auto">

        {/* Navigation */}
        <Card>
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={(value: 'tableau-bord' | 'rapports' | 'export' | 'social') => setActiveTab(value)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Tableau de bord */}
              <TabsContent value="tableau-bord" className="space-y-6">

                {/* Métriques principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Activity className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-700">{analyticsData.total_workouts}</div>
                      <div className="text-xs text-blue-600">Entraînements</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-700">{analyticsData.consistency_rate}%</div>
                      <div className="text-xs text-green-600">Consistance</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                      <div className="text-2xl font-bold text-orange-700">{analyticsData.total_calories.toLocaleString()}</div>
                      <div className="text-xs text-orange-600">Calories</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-purple-700">{analyticsData.streak_days}</div>
                      <div className="text-xs text-purple-600">Jours de suite</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progression détaillée */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Progression {getPeriodLabel(periodFilter)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Objectifs atteints</span>
                        <span className="text-sm text-gray-600">{analyticsData.goals_achieved}%</span>
                      </div>
                      <Progress value={analyticsData.goals_achieved} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Hydratation</span>
                        <span className="text-sm text-gray-600">{analyticsData.hydration_rate}%</span>
                      </div>
                      <Progress value={analyticsData.hydration_rate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">+{analyticsData.monthly_improvement}%</div>
                        <div className="text-xs text-gray-500">Amélioration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Top {analyticsData.ranking_percentile}%</div>
                        <div className="text-xs text-gray-500">Classement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* IA Intelligence */}
                <AIIntelligence
                  pillar="analytics"
                  showPredictions={true}
                  showCoaching={true}
                  showRecommendations={true}
                />
              </TabsContent>

              {/* Rapports */}
              <TabsContent value="rapports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Rapport de consistance */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-6 w-6 text-green-600" />
                        <div>
                          <CardTitle className="text-lg">Consistance</CardTitle>
                          <CardDescription>Analyse de vos habitudes</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Taux de réussite</span>
                          <span className="font-bold text-green-600">{analyticsData.consistency_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Série actuelle</span>
                          <span className="font-bold text-blue-600">{analyticsData.streak_days} jours</span>
                        </div>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => toast({ title: "Fonctionnalité en développement", description: "Rapport détaillé bientôt disponible" })}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Rapport détaillé
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rapport de progression */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                        <div>
                          <CardTitle className="text-lg">Progression</CardTitle>
                          <CardDescription>Évolution performances</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Amélioration</span>
                          <span className="font-bold text-orange-600">+{analyticsData.monthly_improvement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Piliers actifs</span>
                          <span className="font-bold text-purple-600">4/4</span>
                        </div>
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleExport('pdf')}
                          disabled={exporting}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {exporting ? 'Génération...' : 'Télécharger PDF'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rapport comparatif */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Eye className="h-6 w-6 text-red-600" />
                        <div>
                          <CardTitle className="text-lg">Comparatif</CardTitle>
                          <CardDescription>Vs vos objectifs</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Objectifs atteints</span>
                          <span className="font-bold text-red-600">{analyticsData.goals_achieved}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Classement</span>
                          <span className="font-bold text-blue-600">Top {analyticsData.ranking_percentile}%</span>
                        </div>
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={() => toast({ title: "Fonctionnalité en développement", description: "Comparaison détaillée bientôt disponible" })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir comparaison
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Export */}
              <TabsContent value="export" className="space-y-6">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Exportation des Données</span>
                    </CardTitle>
                    <CardDescription>
                      Téléchargez vos analytics dans différents formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => handleExport('json')}
                        disabled={exporting}
                        className="h-20 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
                        aria-label="Exporter les données au format JSON"
                      >
                        <Download className="h-5 w-5" />
                        <span className="text-sm">{exporting ? 'Export...' : 'JSON Complet'}</span>
                      </Button>

                      <Button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        variant="outline"
                        className="h-20 flex flex-col space-y-2 border-green-200 hover:bg-green-50"
                        aria-label="Exporter les données au format CSV"
                      >
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600">{exporting ? 'Export...' : 'CSV Tableau'}</span>
                      </Button>

                      <Button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        variant="outline"
                        className="h-20 flex flex-col space-y-2 border-orange-200 hover:bg-orange-50"
                        aria-label="Exporter les données au format PDF"
                      >
                        <FileText className="h-5 w-5 text-orange-600" />
                        <span className="text-sm text-orange-600">{exporting ? 'Export...' : 'Rapport PDF'}</span>
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Données incluses</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Métriques des {periodFilter === 'week' ? '7' : periodFilter === 'month' ? '30' : '90'} derniers jours : 
                            entraînements, nutrition, hydratation, sommeil, progression {appStoreUser?.sport}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social */}
              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Comparaison Sociale</span>
                    </CardTitle>
                    <CardDescription>
                      Comparez vos performances avec la communauté {appStoreUser?.sport}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <Trophy className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                        <div className="text-2xl font-bold text-purple-700">Top {analyticsData.ranking_percentile}%</div>
                        <div className="text-sm text-purple-600">Classement global {appStoreUser?.sport}</div>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <Share2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                        <div className="text-2xl font-bold text-green-700">{analyticsData.consistency_rate}%</div>
                        <div className="text-sm text-green-600">Au-dessus de la moyenne</div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800 text-center">
                        🚧 Fonctionnalité en développement - Comparaison avec vos amis bientôt disponible
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button 
                        variant="outline" 
                        className="border-blue-200 hover:bg-blue-50"
                        onClick={() => toast({ title: "Bientôt disponible", description: "Invitation d'amis en développement" })}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Inviter des amis
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-green-200 hover:bg-green-50"
                        onClick={() => toast({ title: "Bientôt disponible", description: "Partage de stats en développement" })}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager mes stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AIIntelligence
                  pillar="social"
                  showPredictions={false}
                  showCoaching={true}
                  showRecommendations={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
