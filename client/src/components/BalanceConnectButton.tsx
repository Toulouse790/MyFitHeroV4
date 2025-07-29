import React, { useState } from 'react';
import { Bluetooth, Wifi, Scale, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BalanceDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  connectionType: 'bluetooth' | 'wifi';
  signalStrength?: number;
  batteryLevel?: number;
}

interface BalanceConnectButtonProps {
  onDeviceConnected: (device: BalanceDevice) => void;
  className?: string;
}

const BalanceConnectButton: React.FC<BalanceConnectButtonProps> = ({ 
  onDeviceConnected, 
  className = '' 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BalanceDevice[]>([]);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);

  // Simuler la recherche de balances
  const handleScanDevices = async () => {
    setIsScanning(true);
    setShowDeviceList(true);
    
    try {
      // Simuler la recherche Bluetooth/WiFi
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simuler des appareils trouvés
      const mockDevices: BalanceDevice[] = [
        {
          id: 'xiaomi-001',
          name: 'Mi Body Composition Scale 2',
          brand: 'Xiaomi',
          model: 'XMTZC05HM',
          connectionType: 'bluetooth',
          signalStrength: 85,
          batteryLevel: 78
        },
        {
          id: 'withings-001',
          name: 'Body+ WiFi Scale',
          brand: 'Withings',
          model: 'WBS05',
          connectionType: 'wifi',
          signalStrength: 92
        },
        {
          id: 'fitbit-001',
          name: 'Aria Air',
          brand: 'Fitbit',
          model: 'FB203BK',
          connectionType: 'bluetooth',
          signalStrength: 67,
          batteryLevel: 45
        }
      ];
      
      setAvailableDevices(mockDevices);
      toast.success(`${mockDevices.length} balance(s) trouvée(s)`);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsScanning(false);
    }
  };

  // Connecter un appareil
  const handleConnectDevice = async (device: BalanceDevice) => {
    setConnectingDevice(device.id);
    
    try {
      // Simuler la connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onDeviceConnected(device);
      setShowDeviceList(false);
      setAvailableDevices([]);
      toast.success(`${device.name} connectée avec succès !`);
    } catch (error) {
      toast.error('Échec de la connexion');
    } finally {
      setConnectingDevice(null);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleScanDevices}
        disabled={isScanning}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Recherche en cours...
          </>
        ) : (
          <>
            <Scale size={20} />
            Rechercher des balances
          </>
        )}
      </button>

      {/* Liste des appareils trouvés */}
      {showDeviceList && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Balances disponibles</h3>
          </div>
          
          {availableDevices.length === 0 && !isScanning ? (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="mx-auto mb-2" size={24} />
              <p>Aucune balance trouvée</p>
              <p className="text-sm">Assurez-vous que votre balance est allumée et en mode appairage</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {availableDevices.map((device) => (
                <div key={device.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {device.connectionType === 'bluetooth' ? (
                          <Bluetooth className="text-blue-600" size={16} />
                        ) : (
                          <Wifi className="text-blue-600" size={16} />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{device.name}</h4>
                        <p className="text-sm text-gray-500">{device.brand} • {device.model}</p>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            📶 {device.signalStrength}%
                          </div>
                          {device.batteryLevel && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              🔋 {device.batteryLevel}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnectDevice(device)}
                      disabled={connectingDevice === device.id}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                    >
                      {connectingDevice === device.id ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          Connecter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceConnectButton;
