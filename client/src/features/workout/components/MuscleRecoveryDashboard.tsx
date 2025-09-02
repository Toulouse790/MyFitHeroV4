import React, { useState } from 'react';
import { useMuscleRecovery } from '@/features/workout/hooks/useMuscleRecovery';
import type { MuscleGroup } from '@/features/workout/types/muscleRecovery';

interface MuscleRecoveryDashboardProps {
  className?: string;
}

export const MuscleRecoveryDashboard: React.FC<MuscleRecoveryDashboardProps> = ({
  className = '',
}) => {
  const {
    muscleRecoveryData,
    recommendations,
    globalMetrics,
    isLoading,
    error,
    lastUpdated,
    refreshRecoveryData,
    formatRecoveryStatus,
    getRecoveryColor,
    getNextWorkoutRecommendation,
  } = useMuscleRecovery();

  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshRecoveryData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const selectedMuscleData = selectedMuscle
    ? muscleRecoveryData.find(data => data.muscle_group === selectedMuscle)
    : null;

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Récupération Musculaire</h2>
            <p className="text-gray-600 mt-1">
              Score global:{' '}
              <span className="font-semibold">{globalMetrics?.overall_recovery_score || 0}%</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showRecommendations ? 'Masquer' : 'Recommandations'}
            </button>
            <button
              onClick={refreshRecoveryData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-2">
            Dernière mise à jour: {new Date(lastUpdated).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      {/* Recommandation principale */}
      <div className="p-6 bg-blue-50 border-b border-gray-200">
        <h3 className="font-semibold text-blue-900 mb-2">Recommandation d&apos;entraînement</h3>
        <p className="text-blue-800">{getNextWorkoutRecommendation()}</p>
      </div>

      {/* Grille des groupes musculaires */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {muscleRecoveryData.map(muscle => (
            <div
              key={muscle.muscle_group}
              onClick={() => setSelectedMuscle(muscle.muscle_group)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${
                  selectedMuscle === muscle.muscle_group
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getRecoveryColor(muscle.recovery_percentage) }}
                >
                  {muscle.recovery_percentage}%
                </div>
                <h4 className="font-medium text-gray-900 capitalize text-sm">
                  {muscle.muscle_group.replace('_', ' ')}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {formatRecoveryStatus(muscle.recovery_status)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Détails du muscle sélectionné */}
        {selectedMuscleData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              Détails - {selectedMuscleData.muscle_group.replace('_', ' ')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">État de récupération</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Récupération:</span>
                    <span className="font-medium">{selectedMuscleData.recovery_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fatigue:</span>
                    <span className="font-medium">{selectedMuscleData.fatigue_level}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Courbatures:</span>
                    <span className="font-medium">{selectedMuscleData.soreness_level}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prêt à l&apos;entraînement:</span>
                    <span className="font-medium">{selectedMuscleData.readiness_score}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Dernier entraînement</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedMuscleData.last_workout_date
                        ? new Date(selectedMuscleData.last_workout_date).toLocaleDateString('fr-FR')
                        : 'Aucun'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Intensité:</span>
                    <span className="font-medium capitalize">
                      {selectedMuscleData.workout_intensity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Volume:</span>
                    <span className="font-medium">{selectedMuscleData.workout_volume} séries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durée:</span>
                    <span className="font-medium">
                      {selectedMuscleData.workout_duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Récupération complète</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Estimée pour:</div>
                  <div className="font-medium">
                    {new Date(selectedMuscleData.estimated_full_recovery).toLocaleString('fr-FR')}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {selectedMuscleData.recovery_percentage >= 100
                      ? 'Récupération terminée ✅'
                      : `${Math.ceil((new Date(selectedMuscleData.estimated_full_recovery).getTime() - Date.now()) / (1000 * 60 * 60))}h restantes`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommandations détaillées */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Recommandations personnalisées ({recommendations.length})
            </h3>

            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {rec.muscle_group.replace('_', ' ')} -{' '}
                        {rec.recommendation_type.replace('_', ' ')}
                      </h4>
                      <span
                        className={`
                        inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                        ${
                          rec.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : rec.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }
                      `}
                      >
                        Priorité {rec.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Bénéfice: {rec.estimated_benefit}%</div>
                  </div>

                  <p className="text-gray-700 mb-3">{rec.message}</p>

                  {rec.specific_actions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Actions recommandées:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.specific_actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm text-gray-600">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.duration_minutes && (
                    <div className="mt-2 text-sm text-gray-500">
                      Durée recommandée: {rec.duration_minutes} minutes
                    </div>
                  )}
                </div>
              ))}
            </div>

            {recommendations.length > 5 && (
              <div className="text-center mt-4">
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Voir toutes les recommandations ({recommendations.length - 5} de plus)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Métriques globales */}
        {globalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Muscles prêts</h4>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {globalMetrics.ready_for_training.length}
              </div>
              <div className="text-sm text-blue-600">
                {globalMetrics.ready_for_training
                  .map(muscle => muscle.replace('_', ' '))
                  .join(', ') || 'Aucun'}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Besoin de repos</h4>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {globalMetrics.needs_rest.length}
              </div>
              <div className="text-sm text-red-600">
                {globalMetrics.needs_rest.map(muscle => muscle.replace('_', ' ')).join(', ') ||
                  'Aucun'}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Entraînement optimal</h4>
              <div className="text-lg font-bold text-green-700 mb-1 capitalize">
                {globalMetrics.optimal_workout_type.replace('_', ' ')}
              </div>
              <div className="text-sm text-green-600">Basé sur votre récupération actuelle</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
