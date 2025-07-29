import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import AvatarUpload from '@/components/AvatarUpload';
import UserProfileTabs from '@/components/UserProfileTabs';
import { toast } from 'react-hot-toast';
import { 
  Scale, 
  Sync, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Bluetooth,
  Wifi,
  Settings,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface WeightEntry {
  date: string;
  weight: number;
  source: 'manual' | 'scale' | 'import';
}

interface ScaleDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  batteryLevel?: number;
  isConnected: boolean;
  lastSync?: string;
  connectionType: 'bluetooth' | 'wifi' | 'api';
}

const ProfilePage = () => {
  const { user, userProfile, updateUserProfile } = useAppStore();
  
  // États locaux
  const [currentWeight, setCurrentWeight] = useState(userProfile?.weight_kg?.toString() || '');
  const [height, setHeight] = useState(userProfile?.height_cm?.toString() || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [activityLevel, setActivityLevel] = useState(userProfile?.activity_level || 'moderate');
  const [fitnessGoal, setFitnessGoal] = useState(userProfile?.fitness_goal || 'maintain');
  
  // États pour la balance connectée
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedScales, setConnectedScales] = useState<ScaleDevice[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [showWeightHistory, setShowWeightHistory] = useState(false);

  // Simuler des données d'historique (à remplacer par tes vraies données)
  useEffect(() => {
    const mockHistory: WeightEntry[] = [
      { date: '2024-01-15', weight: 75.2, source: 'scale' },
      { date: '2024-01-10', weight: 75.8, source: 'manual' },
      { date: '2024-01-05', weight: 76.1, source: 'scale' },
      { date: '2024-01-01', weight: 76.5, source: 'manual' },
    ];
    setWeightHistory(mockHistory);

    // Simuler une balance connectée
    const mockScale: ScaleDevice = {
      id: 'scale-001',
      name: 'Balance Xiaomi',
      brand: 'Xiaomi',
      model: 'Mi Body Composition Scale 2',
      batteryLevel: 85,
      isConnected: true,
      lastSync: '2024-01-15T08:30:00Z',
      connectionType: 'bluetooth'
    };
    setConnectedScales([mockScale]);
  }, []);

  // Calculer l'IMC
  const calculateBMI = () => {
    const weightNum = parseFloat(currentWeight);
    const heightNum = parseFloat(height);
    if (weightNum && heightNum) {
      const heightInMeters = heightNum / 100;
      return (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  // Calculer la tendance du poids
  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    const diff = latest - previous;
    
    if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 };
    return { 
      type: diff > 0 ? 'up' : 'down', 
      diff: Math.abs(diff) 
    };
  };

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        weight_kg: parseFloat(currentWeight) || undefined,
        height_cm: parseInt(height) || undefined,
        age: parseInt(age) || undefined,
        gender: gender || undefined,
        activity_level: activityLevel,
        fitness_goal: fitnessGoal,
        updated_at: new Date().toISOString()
      });
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error('Profile update error:', error);
    }
  };

  // Synchroniser avec la balance
  const handleSyncScale = async (scaleId: string) => {
    setIsSyncing(true);
    try {
      // Simuler la synchronisation (remplace par ton API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une nouvelle mesure
      const newWeight = 74.8 + (Math.random() - 0.5) * 2;
      const newEntry: WeightEntry = {
        date: new Date().toISOString(),
        weight: parseFloat(newWeight.toFixed(1)),
        source: 'scale'
      };
      
      setWeightHistory(prev => [newEntry, ...prev]);
      setCurrentWeight(newWeight.toFixed(1));
      
      // Mettre à jour la dernière synchronisation
      setConnectedScales(prev => prev.map(scale => 
        scale.id === scaleId 
          ? { ...scale, lastSync: new Date().toISOString() }
          : scale
      ));
      
      toast.success('Poids synchronisé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  // Scanner pour de nouvelles balances
  const handleScanForScales = async () => {
    setIsScanning(true);
    try {
      // Simuler la recherche (remplace par ton API Bluetooth/WiFi)
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Recherche terminée. Aucune nouvelle balance trouvée.');
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsScanning(false);
    }
  };

  const bmi = calculateBMI();
  const weightTrend = getWeightTrend();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Header avec avatar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <AvatarUpload />
            <h1 className="text-2xl font-bold mt-4 text-gray-900">
              {userProfile?.display_name || user?.email?.split('@')[0] || 'Utilisateur'}
            </h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
            
            {/* Statistiques rapides */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              {bmi && (
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{bmi}</div>
                  <div className="text-gray-500">IMC</div>
                </div>
              )}
              {weightTrend && (
                <div className="text-center">
                  <div className={`font-semibold flex items-center gap-1 ${
                    weightTrend.type === 'up' ? 'text-red-500' : 
                    weightTrend.type === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {weightTrend.type === 'up' && <TrendingUp size={16} />}
                    {weightTrend.type === 'down' && <TrendingDown size={16} />}
                    {weightTrend.type === 'stable' && <Minus size={16} />}
                    {weightTrend.diff > 0 ? `${weightTrend.diff.toFixed(1)}kg` : 'Stable'}
                  </div>
                  <div className="text-gray-500">Tendance</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Données physiques */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            Données physiques
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids actuel (kg)
              </label>
              <input
                type="number"
                min="20"
                max="300"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 70.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 175"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 25"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexe
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'activité
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sedentary">Sédentaire</option>
                <option value="light">Légèrement actif</option>
                <option value="moderate">Modérément actif</option>
                <option value="active">Très actif</option>
                <option value="extra_active">Extrêmement actif</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif principal
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lose_weight">Perdre du poids</option>
                <option value="maintain">Maintenir le poids</option>
                <option value="gain_weight">Prendre du poids</option>
                <option value="build_muscle">Prendre du muscle</option>
                <option value="improve_fitness">Améliorer la condition physique</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleSaveProfile}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Enregistrer les modifications
          </button>
        </div>

        {/* Balance connectée */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="text-green-500" size={20} />
            Balance connectée
          </h2>
          
          {connectedScales.length > 0 ? (
            <div className="space-y-4">
              {connectedScales.map((scale) => (
                <div key={scale.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        scale.isConnected ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {scale.connectionType === 'bluetooth' && <Bluetooth size={16} className={
                          scale.isConnected ? 'text-green-600' : 'text-red-600'
                        } />}
                        {scale.connectionType === 'wifi' && <Wifi size={16} className={
                          scale.isConnected ? 'text-green-600' : 'text-red-600'
                        } />}
                      </div>
                      <div>
                        <h3 className="font-medium">{scale.name}</h3>
                        <p className="text-sm text-gray-500">{scale.brand} {scale.model}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {scale.batteryLevel && (
                        <div className="text-sm text-gray-500">
                          🔋 {scale.batteryLevel}%
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scale.isConnected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scale.isConnected ? 'Connectée' : 'Déconnectée'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Dernière synchro: {scale.lastSync 
                        ? new Date(scale.lastSync).toLocaleString('fr-FR')
                        : 'Jamais'
                      }
                    </div>
                    
                    <button
                      onClick={() => handleSyncScale(scale.id)}
                      disabled={!scale.isConnected || isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                    >
                      <Sync className={isSyncing ? 'animate-spin' : ''} size={16} />
                      {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune balance connectée
              </h3>
              <p className="text-gray-500 mb-4">
                Connectez votre balance pour synchroniser automatiquement votre poids
              </p>
            </div>
          )}
          
          <button
            onClick={handleScanForScales}
            disabled={isScanning}
            className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isScanning ? (
              <span className="flex items-center justify-center gap-2">
                <Sync className="animate-spin" size={16} />
                Recherche en cours...
              </span>
            ) : (
              '+ Ajouter une balance'
            )}
          </button>
        </div>

        {/* Historique du poids */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="text-purple-500" size={20} />
              Historique du poids
            </h2>
            <button
              onClick={() => setShowWeightHistory(!showWeightHistory)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showWeightHistory ? 'Masquer' : 'Voir tout'}
            </button>
          </div>
          
          {weightHistory.length > 0 ? (
            <div className="space-y-3">
              {(showWeightHistory ? weightHistory : weightHistory.slice(0, 3)).map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      entry.source === 'scale' ? 'bg-green-500' : 
                      entry.source === 'manual' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{entry.weight} kg</div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {entry.source === 'scale' ? 'Balance' : 
                     entry.source === 'manual' ? 'Manuel' : 'Import'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="mx-auto mb-2" size={32} />
              <p>Aucun historique de poids disponible</p>
            </div>
          )}
        </div>

        {/* Onglets du profil */}
        <UserProfileTabs />
      </div>
    </div>
  );
};

export default ProfilePage;
