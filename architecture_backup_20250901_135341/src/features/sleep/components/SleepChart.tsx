import React from 'react';
import { BarChart3, TrendingUp, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SleepStats, SleepDayData } from '../types';
import { formatDuration, getSleepQualityLabel } from '../utils/sleepConfig';

interface SleepChartProps {
  stats: SleepStats;
  className?: string;
}

export const SleepChart: React.FC<SleepChartProps> = ({ stats, className = '' }) => {
  if (!stats || !stats.weeklyData.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Analyse hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Moon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Pas assez de données pour l'analyse</p>
            <p className="text-sm">Enregistrez quelques nuits de sommeil</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxDuration = Math.max(...stats.weeklyData.map(d => d.duration));
  const maxQuality = 10;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Analyse hebdomadaire
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp
              size={16}
              className={
                stats.trend === 'improving'
                  ? 'text-green-500'
                  : stats.trend === 'declining'
                    ? 'text-red-500'
                    : 'text-gray-500'
              }
            />
            <span
              className={
                stats.trend === 'improving'
                  ? 'text-green-600'
                  : stats.trend === 'declining'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }
            >
              {stats.trend === 'improving'
                ? 'En amélioration'
                : stats.trend === 'declining'
                  ? 'En baisse'
                  : 'Stable'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Graphique en barres simple */}
          <div className="space-y-2">
            {stats.weeklyData.map((day, index) => {
              const durationPercent = (day.duration / maxDuration) * 100;
              const qualityPercent = (day.quality / maxQuality) * 100;
              const dayName = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' });
              const qualityInfo = getSleepQualityLabel(day.quality);

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{dayName}</span>
                    <div className="flex items-center space-x-4">
                      <span>{formatDuration(day.duration)}</span>
                      <span className={`${qualityInfo.color} text-xs`}>{day.quality}/10</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {/* Barre durée */}
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${durationPercent}%` }}
                      />
                    </div>

                    {/* Barre qualité */}
                    <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          day.quality >= 7
                            ? 'bg-green-500'
                            : day.quality >= 5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${qualityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-2 bg-blue-500 rounded-full"></div>
                <span>Durée</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-2 bg-green-500 rounded-full"></div>
                <span>Qualité</span>
              </div>
            </div>
            <div className="text-right">
              <div>Moy: {formatDuration(stats.averageDuration)}</div>
              <div>Qualité: {stats.averageQuality.toFixed(1)}/10</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
