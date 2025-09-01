import React from 'react';
import { MuscleRecoveryDashboard } from '@/features/workout/components/MuscleRecoveryDashboard';

const RecoveryPage: React.FC = () => {
  return (
    <main className="container mx-auto p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <section
        aria-labelledby="muscle-recovery-dashboard-title"
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h1
          id="muscle-recovery-dashboard-title"
          className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
        >
          Tableau de récupération musculaire
        </h1>
        <MuscleRecoveryDashboard />
      </section>
    </main>
  );
};

export default RecoveryPage;
