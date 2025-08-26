import React, { Suspense } from 'react';
import { useLocation } from 'wouter';
import { AppRouter } from '@/routes/AppRouter';
import { AppLoadingSpinner } from '@/components/AppLoadingSpinner';

const App: React.FC = () => {
  const [location] = useLocation();
  
  console.log("🟢 MyFitHero V4 - Route actuelle:", location);
  
  return (
    <Suspense fallback={<AppLoadingSpinner />}>
      <AppRouter currentPath={location} />
    </Suspense>
  );
};
export default App;
