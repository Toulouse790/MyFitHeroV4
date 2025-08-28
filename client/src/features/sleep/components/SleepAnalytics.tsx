import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSleepStore } from '../hooks/useSleepStore';
import { formatDuration, getSleepQualityLabel } from '../utils/sleepConfig';

interface SleepAnalyticsProps {
  className?: string;
}

export const SleepAnalytics: React.FC<SleepAnalyticsProps> = ({ className = '' }) => {
  const { stats, currentGoal, entries } = useSleepStore();

  if (!stats || entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Analyse détaillée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Pas assez de données</p>
            <p className="text-sm">Enregistrez au moins 3 nuits pour voir les analyses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualityInfo = getSleepQualityLabel(stats.averageQuality);
  const goalProgress = currentGoal 
    ? (stats.averageDuration / currentGoal.targetDuration) * 100 
    : 0;

  // Calcul des métriques avancées
  const recentEntries = entries.slice(0, 7);
  const weeklyImprovement = recentEntries.length > 3 
    ? ((recentEntries.slice(0, 3).reduce((sum, e) => sum + e.quality, 0) / 3) - 
       (recentEntries.slice(-3).reduce((sum, e) => sum + e.quality, 0) / 3))
    : 0;

  const consistencyScore = Math.round(stats.bedtimeConsistency);
  const sleepEfficiency = Math.min(100, Math.round((stats.averageDuration / (currentGoal?.targetDuration || 480)) * 100));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Analyse détaillée
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Durée moyenne */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock size={24} className="mx-auto mb-2 text-blue-600" />
            <div className="font-bold text-lg text-blue-800">
              {formatDuration(stats.averageDuration)}
            </div>
            <div className="text-xs text-blue-600">Durée moyenne</div>
          </div>

          {/* Qualité moyenne */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Heart size={24} className="mx-auto mb-2 text-green-600" />
            <div className={`font-bold text-lg ${qualityInfo.color}`}>
              {stats.averageQuality.toFixed(1)}/10
            </div>
            <div className="text-xs text-green-600">Qualité moyenne</div>
          </div>

          {/* Consistance */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Target size={24} className="mx-auto mb-2 text-purple-600" />
            <div className="font-bold text-lg text-purple-800">
              {consistencyScore}%
            </div>
            <div className="text-xs text-purple-600">Régularité</div>
          </div>

          {/* Efficacité */}
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <TrendingUp size={24} className="mx-auto mb-2 text-yellow-600" />
            <div className="font-bold text-lg text-yellow-800">
              {sleepEfficiency}%
            </div>
            <div className="text-xs text-yellow-600">Efficacité</div>
          </div>
        </div>

        {/* Progression vers l'objectif */}
        {currentGoal && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Progression vers l'objectif</span>
              <span className="text-sm text-gray-600">
                {formatDuration(stats.averageDuration)} / {formatDuration(currentGoal.targetDuration)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  goalProgress >= 100 ? 'bg-green-500' :
                  goalProgress >= 80 ? 'bg-blue-500' :
                  goalProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, goalProgress)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{Math.round(goalProgress)}%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Dette de sommeil */}
        {stats.sleepDebt > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-red-800">Dette de sommeil</span>
              <Badge variant="destructive">
                {formatDuration(stats.sleepDebt)}
              </Badge>
            </div>
            <p className="text-sm text-red-700">
              Vous avez accumulé {formatDuration(stats.sleepDebt)} de dette de sommeil cette semaine.
              Essayez de vous coucher plus tôt ou de faire une sieste.
            </p>
          </div>
        )}

        {/* Tendance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tendance récente</span>
            <div className="flex items-center space-x-2">
              {stats.trend === 'improving' ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : stats.trend === 'declining' ? (
                <TrendingDown size={16} className="text-red-500" />
              ) : (
                <div className="w-4 h-0.5 bg-gray-400"></div>
              )}
              <span className={`text-sm ${
                stats.trend === 'improving' ? 'text-green-600' :
                stats.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'improving' ? 'En amélioration' :
                 stats.trend === 'declining' ? 'En baisse' : 'Stable'}
              </span>
            </div>
          </div>
          
          {weeklyImprovement !== 0 && (
            <div className={`text-sm p-3 rounded-lg ${
              weeklyImprovement > 0 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {weeklyImprovement > 0 ? '📈' : '📉'} Votre qualité de sommeil a 
              {weeklyImprovement > 0 ? ' progressé' : ' diminué'} de{' '}
              <strong>{Math.abs(weeklyImprovement).toFixed(1)} points</strong> cette semaine.
            </div>
          )}
        </div>

        {/* Recommandations basées sur les données */}
        <div className="space-y-3">
          <span className="font-medium">Recommandations personnalisées</span>
          <div className="space-y-2">
            {/* Recommandation durée */}
            {goalProgress < 90 && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">
                  Ajoutez {formatDuration(Math.max(0, (currentGoal?.targetDuration || 480) - stats.averageDuration))} 
                  à votre sommeil pour atteindre votre objectif
                </span>
              </div>
            )}

            {/* Recommandation régularité */}
            {consistencyScore < 70 && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">
                  Essayez de vous coucher et lever à heures fixes pour améliorer la régularité
                </span>
              </div>
            )}

            {/* Recommandation qualité */}
            {stats.averageQuality < 6 && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">
                  Analysez les facteurs qui impactent négativement votre sommeil
                </span>
              </div>
            )}

            {/* Message de félicitations */}
            {goalProgress >= 95 && stats.averageQuality >= 7 && consistencyScore >= 80 && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-green-700 font-medium">
                  🎉 Excellent ! Votre sommeil est optimal pour vos performances
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
