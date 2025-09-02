import React from 'react';
import { Redirect } from 'wouter';
import { supabase } from '@/lib/supabase';
import { appStore } from '@/store/appStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  moduleRequired?: 'sport' | 'nutrition' | 'sleep' | 'hydration';
}

// Page d'activation de module
const ModuleActivationPage = ({ moduleId }: { moduleId: string }) => {
  const { appStoreUser, activateModule } = appStore();
  const [isActivating, setIsActivating] = React.useState(false);

  const moduleConfigs = {
    sport: {
      title: 'Sport',
      icon: '🏋️',
      color: 'red',
      desc: "Programmes d'entraînement personnalisés",
      bgGradient: 'from-red-500 to-pink-500',
    },
    nutrition: {
      title: 'Nutrition',
      icon: '🍎',
      color: 'green',
      desc: 'Plans alimentaires et suivi nutritionnel',
      bgGradient: 'from-green-500 to-teal-500',
    },
    sleep: {
      title: 'Sommeil',
      icon: '😴',
      color: 'purple',
      desc: 'Optimisation de votre récupération',
      bgGradient: 'from-purple-500 to-indigo-500',
    },
    hydration: {
      title: 'Hydratation',
      icon: '💧',
      color: 'blue',
      desc: "Suivi et conseils d'hydratation",
      bgGradient: 'from-blue-500 to-cyan-500',
    },
  } as const;

  const moduleConfig = moduleConfigs[moduleId as keyof typeof moduleConfigs];

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const success = await activateModule(moduleId);

      if (success) {
        // Petit délai pour voir l'animation
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert("Erreur lors de l'activation du module");
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur activation:', error);
      alert("Erreur lors de l'activation");
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
        <p className="text-sm text-gray-500 mb-6">
          Ce module n'est pas activé dans votre profil {appStoreUser.profile_type}.
        </p>

        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-2">Votre profil actuel :</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Type : {appStoreUser.profile_type}</p>
            <p>• Modules actifs : {appStoreUser.active_modules?.join(', ') || 'Aucun'}</p>
            <p>• Sport : {appStoreUser.sport || 'Non défini'}</p>
          </div>
        </div>

        <button
          onClick={handleActivate}
          disabled={isActivating}
          className={`w-full px-6 py-3 bg-gradient-to-r ${moduleConfig?.bgGradient} text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all transform hover:scale-105 disabled:scale-100`}
        >
          {isActivating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Activation...</span>
            </div>
          ) : (
            `Activer ${moduleConfig?.title}`
          )}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Activation gratuite et immédiate • Vous pouvez modifier vos modules dans Profil
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, moduleRequired }) => {
  const { appStoreUser } = appStore();
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
      } catch {
      // Erreur silencieuse
        console.error('Erreur vérification auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirection vers la page d'auth avec sauvegarde de la route
    return <Redirect to="/auth" />;
  }

  if (!appStoreUser.id || !appStoreUser.age || !appStoreUser.gender) {
    // Onboarding non terminé
    return <Redirect to="/" />;
  }

  // Vérification des modules actifs
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
