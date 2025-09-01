// components/DashboardRecoveryWidget.tsx
import { useMuscleRecovery } from '@/features/workout/hooks/useMuscleRecovery';

export const DashboardRecoveryWidget = () => {
  const { getRecoveryScore, getNextWorkoutRecommendation } = useMuscleRecovery();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Récupération</h3>
      <div className="text-2xl font-bold text-blue-600 mb-1">{getRecoveryScore()}%</div>
      <p className="text-sm text-gray-600">{getNextWorkoutRecommendation()}</p>
    </div>
  );
};
