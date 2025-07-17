import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useWearableSync } from '@/hooks/useWearableSync';
import { WearableAnalyzer } from '@/lib/wearableUtils';
import { useToast } from '@/hooks/use-toast';

const SmartHealthDashboard: React.FC = () => {
  const { getCachedData, syncAll, isLoading } = useWearableSync();
  const { toast } = useToast();
  const [fitnessScore, setFitnessScore] = useState(0);
  const [healthTrend, setHealthTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [insights, setInsights] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateDashboard();
  }, []);

  const updateDashboard = () => {
    const data = getCachedData();
    if (data) {
      const score = WearableAnalyzer.calculateFitnessScore(data);
      const trend = WearableAnalyzer.getHealthTrend(data);
      const healthInsights = WearableAnalyzer.generateHealthInsights(data);
      
      setFitnessScore(score);
      setHealthTrend(trend);
      setInsights(healthInsights);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncAll();
      updateDashboard();
      toast({
        title: "Données synchronisées",
        description: "Vos données wearables ont été mises à jour",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendIcon = () => {
    switch (healthTrend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'down':
        return <TrendingDown className="text-red-500" size={20} />;
      default:
        return <Minus className="text-gray-500" size={20} />;
    }
  };

  const getTrendColor = () => {
    switch (healthTrend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      default:
        return <Target className="text-blue-500" size={16} />;
    }
  };

  const data = getCachedData();
  const metrics = data ? WearableAnalyzer.calculateHealthMetrics(data) : null;

  return (
    <div className="space-y-6">
      {/* En-tête avec score global */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              Tableau de bord intelligent
            </CardTitle>
            <Button
              onClick={handleRefresh}
              disabled={isLoading || refreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score de forme */}
            <div className={`text-center p-6 rounded-lg ${getScoreBackground(fitnessScore)}`}>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(fitnessScore)}`}>
                {fitnessScore}
              </div>
              <div className="text-sm text-gray-600 mb-3">Score de forme</div>
              <Progress value={fitnessScore} className="h-2" />
              <div className="flex items-center justify-center mt-2">
                {getTrendIcon()}
                <span className={`ml-1 text-sm ${getTrendColor()}`}>
                  {healthTrend === 'up' ? 'En progression' : 
                   healthTrend === 'down' ? 'En baisse' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pas quotidiens</span>
                <div className="flex items-center">
                  <span className="font-medium">{metrics?.steps.toLocaleString() || 0}</span>
                  <div className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Calories brûlées</span>
                <div className="flex items-center">
                  <span className="font-medium">{metrics?.calories || 0}</span>
                  <div className="ml-2 w-2 h-2 bg-orange-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FC moyenne</span>
                <div className="flex items-center">
                  <span className="font-medium">{Math.round(metrics?.heartRateAvg || 0)} BPM</span>
                  <div className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sommeil</span>
                <div className="flex items-center">
                  <span className="font-medium">
                    {metrics ? WearableAnalyzer.formatDuration(metrics.sleepDuration) : '0h 0min'}
                  </span>
                  <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Objectifs de la journée */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Objectifs du jour</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pas</span>
                    <span>{Math.round(((metrics?.steps || 0) / 10000) * 100)}%</span>
                  </div>
                  <Progress value={Math.min(((metrics?.steps || 0) / 10000) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calories</span>
                    <span>{Math.round(((metrics?.calories || 0) / 400) * 100)}%</span>
                  </div>
                  <Progress value={Math.min(((metrics?.calories || 0) / 400) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Activité</span>
                    <span>{Math.round(((metrics?.activeMinutes || 0) / 30) * 100)}%</span>
                  </div>
                  <Progress value={Math.min(((metrics?.activeMinutes || 0) / 30) * 100, 100)} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights personnalisés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2" size={20} />
            Insights personnalisés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto mb-2" size={48} />
              <p>Synchronisez vos données pour voir les insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 4).map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-sm text-blue-600 mt-2">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                  {insight.score && (
                    <Badge variant="outline" className="text-xs">
                      {insight.score}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2" size={20} />
            Résumé de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">6/7</div>
              <div className="text-sm text-gray-600">Jours actifs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Objectifs atteints</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">+12%</div>
              <div className="text-sm text-gray-600">Amélioration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartHealthDashboard;
