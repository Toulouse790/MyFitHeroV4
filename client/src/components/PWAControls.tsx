import React from 'react';
import { Download, Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAControls: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    checkForUpdates,
    enableNotifications
  } = usePWA();

  return (
    <div className="space-y-3">
      {/* Statut de connexion */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <div className="flex items-center text-green-600">
            <Wifi size={16} className="mr-1" />
            <span className="text-sm">En ligne</span>
          </div>
        ) : (
          <div className="flex items-center text-orange-600">
            <WifiOff size={16} className="mr-1" />
            <span className="text-sm">Hors ligne</span>
          </div>
        )}
      </div>

      {/* Bouton d'installation PWA */}
      {isInstallable && !isInstalled && (
        <button
          onClick={installApp}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
        >
          <Download size={16} />
          <span>Installer l'app</span>
        </button>
      )}

      {/* Indicateur d'installation */}
      {isInstalled && (
        <div className="text-green-600 text-sm flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          App installée
        </div>
      )}

      {/* Bouton de mise à jour */}
      {updateAvailable && (
        <button
          onClick={checkForUpdates}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
        >
          <RefreshCw size={16} />
          <span>Mettre à jour</span>
        </button>
      )}

      {/* Bouton notifications */}
      <button
        onClick={enableNotifications}
        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
      >
        <Bell size={16} />
        <span>Activer notifications</span>
      </button>
    </div>
  );
};

export default PWAControls;
