import React from 'react';
import { useLocation } from 'wouter';

const WorkoutDetailPage = () => {
  const [location] = useLocation();
  const workoutId = location.split('/').pop();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Détails de l'entraînement</h1>
      <p>ID de l'entraînement: {workoutId}</p>
      <p>Page en développement</p>
    </div>
  );
};

export default WorkoutDetailPage;
