import React, { Suspense } from 'react';
import { useLocation } from 'wouter';
import { AppRouter } from '@/router/AppRouter';
import { LoadingRoute } from '@/router/components/LoadingRoute';

const App: React.FC = () => {
  const [location] = useLocation();

  console.log('🟢 MyFitHero - Route actuelle:', location);

  return (
    <Suspense fallback={<LoadingRoute />}>
      <AppRouter />
    </Suspense>
  );
};

export default App;
