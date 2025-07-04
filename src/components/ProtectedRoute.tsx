import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useAppStore } from '@/store/appStore'; // Adapter selon ton store

interface ProtectedRouteProps {
  children: React.ReactElement;
  moduleRequired?: 'sport' | 'nutrition' | 'sleep' | 'hydration'; // Nouveau prop
}

// Page d'activation de module
const ModuleActivationPage = ({ moduleId }: { moduleId: string }) => {
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  const [isActivating, setIsActivating] = React.useState(false);

  const moduleConfig = {
    sport: { title: 'Sport', icon: '🏋️', color: 'red', desc: 'Programmes d\'entraînement personnalisés' },
    nutrition: { title: 'Nutrition', icon: '🍎', color: 'green', desc: 'Plans alimentaires et suivi nutritionnel' },
    sleep: { title: 'Sommeil', icon: '😴', color: 'purple', desc: 'Optimisation de votre récupération' },
    hydration: { title: 'Hydratation', icon: '💧', color: 'blue', desc: 'Suivi et conseils d\'hydratation' }
  }[moduleId as keyof typeof moduleConfig];

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const newActiveModules = [...(appStoreUser.active_modules || []), moduleId];
      
      // Appel API Supabase (adapter selon ton setup)
      const { error } = await supabase
        .from('user_profiles')
        .update({ active_modules: newActiveModules })
        .eq('id', appStoreUser.id);

      if (error) throw error;

      // Mettre à jour le store
      updateAppStoreUserProfile({ active_modules: newActiveModules });
      
      // Recharger la page pour voir le module
      window.location.reload();
    } catch (error) {
      console.error('Erreur activation:', error);
      alert('Erreur lors de l\'activation');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="text-6xl mb-4">{moduleConfig?.icon}</div>
        <h1 className="text-2xl font-bold mb-4">Module {moduleConfig?.title}</h1>
        <p className="text-gray-600 mb-2">{moduleConfig?.desc}</p>
        <p className="text-sm text-gray-500 mb-6">Ce module n'est pas activé dans votre profil actuel.</p>
        
        <button
          onClick={handleActivate}
          disabled={isActivating}
          className={`px-6 py-3 bg-${moduleConfig?.color}-600 text-white rounded-xl font-bold hover:bg-${moduleConfig?.color}-700 disabled:opacity-50 transition-colors`}
        >
          {isActivating ? 'Activation...' : `Activer ${moduleConfig?.title}`}
        </button>
        
        <p className="text-xs text-gray-400 mt-4">Activation gratuite et immédiate</p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, moduleRequired }) => {
  const { session, loading, hasCompletedOnboarding } = useAuthStatus();
  const { appStoreUser } = useAppStore(); // Adapter selon ton store
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Sauvegarde de la route demandée pour redirection après connexion
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // 🚀 NOUVELLE LOGIQUE : Vérification des modules actifs
  if (moduleRequired) {
    const userActiveModules = appStoreUser.active_modules || [];
    const isModuleActive = userActiveModules.includes(moduleRequired);
    
    if (!isModuleActive) {
      return <ModuleActivationPage moduleId={moduleRequired} />;
    }
  }

  return children;
};

export default ProtectedRoute;
