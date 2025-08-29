import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AvatarUpload from '@/components/AvatarUpload';
import UserProfileTabs from '@/components/UserProfileTabs';
import { toast } from 'react-hot-toast';
import {
  Scale,
  RefreshCw as Sync,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Bluetooth,
  Wifi,
  Calendar,
  Activity,
  Loader2,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  // Store principal
  const {
    appStoreUser,
    connectedScales,
    weightHistory,
    updateUserProfile,
    addConnectedScale,
    addWeightEntry,
  } = useAppStore();

  // États locaux pour les champs modifiables
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [fitnessGoal, setFitnessGoal] = useState('maintain');
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Variables utilisateur pour l'affichage
  const userProfile = appStoreUser;
  const user = appStoreUser;

  // Charger les données au montage du composant
  useEffect(() => {
    // Les données sont déjà chargées via le store global
  }, []);

  // Synchroniser les états locaux avec le profil utilisateur
  useEffect(() => {
    if (appStoreUser) {
      setCurrentWeight((appStoreUser as any).weight_kg?.toString() || '');
      setHeight((appStoreUser as any).height_cm?.toString() || '');
      setAge((appStoreUser as any).age?.toString() || '');
      setGender(appStoreUser.gender || '');
      setActivityLevel(appStoreUser.activity_level || 'moderate');
      setFitnessGoal((appStoreUser as any).fitness_goal || 'maintain');
    }
  }, [appStoreUser]);

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!appStoreUser?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    try {
      await updateUserProfile({
        weight_kg: parseFloat(currentWeight) || undefined,
        height_cm: parseInt(height) || undefined,
        age: parseInt(age) || undefined,
        gender: (gender as 'male' | 'female' | 'other') || undefined,
        activity_level: activityLevel as any,
        fitness_goal: fitnessGoal as any,
      } as any);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error('Profile update error:', error);
    }
  };

  // Synchroniser avec une balance
  const handleSyncScale = async (scaleId: string) => {
    try {
      setIsSyncing(true);
      // Simulation de synchronisation - à remplacer par l'API réelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockWeight = Math.random() * 20 + 60; // Poids simulé entre 60-80kg
      setCurrentWeight(mockWeight.toFixed(1));
      toast.success('Poids synchronisé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
      console.error('Scale sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Scanner pour de nouvelles balances
  const handleScanForScales = async () => {
    try {
      setIsScanning(true);
      // Simulation de scan - à remplacer par l'API réelle
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockDevices = []; // Simulation: aucun appareil trouvé
      if (mockDevices.length === 0) {
        toast.success('Recherche terminée. Aucune nouvelle balance trouvée.');
      } else {
        toast.success(`${mockDevices.length} balance(s) trouvée(s)`);
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche');
      console.error('Scale scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Connecter une nouvelle balance
  const handleConnectScale = async (device: any) => {
    try {
      await addConnectedScale({
        user_id: appStoreUser?.id,
        device_id: device.id,
        brand: device.brand,
        model: device.model,
        is_active: true,
      } as any);
      toast.success(`${device.name} connectée avec succès !`);
    } catch (error) {
      toast.error('Échec de la connexion');
      console.error('Scale connect error:', error);
    }
  };

  // Calculs basés sur les vraies données
  const calculateBMI = () => {
    const weight = parseFloat(currentWeight);
    const heightM = parseInt(height) / 100;
    if (weight && heightM) {
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    const recent = weightHistory.slice(-2);
    const diff = recent[1].weight - recent[0].weight;
    return {
      type: diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable',
      diff: Math.abs(diff),
    };
  };

  const getLatestWeight = () => {
    return weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  };

  const bmi = calculateBMI();
  const weightTrend = getWeightTrend();
  const latestWeight = getLatestWeight();

  // Afficher un loader si les données sont en cours de chargement
  if (isLoading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Header avec avatar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <AvatarUpload />
            <h1 className="text-2xl font-bold mt-4 text-gray-900">
              {(userProfile as any)?.displayName ||
                (user as any)?.email?.split('@')[0] ||
                'Utilisateur'}
            </h1>
            <p className="text-gray-500 mt-1">{(user as any)?.email}</p>

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
                  <div
                    className={`font-semibold flex items-center gap-1 ${
                      weightTrend.type === 'up'
                        ? 'text-red-500'
                        : weightTrend.type === 'down'
                          ? 'text-green-500'
                          : 'text-gray-500'
                    }`}
                  >
                    {weightTrend.type === 'up' && <TrendingUp size={16} />}
                    {weightTrend.type === 'down' && <TrendingDown size={16} />}
                    {weightTrend.type === 'stable' && <Minus size={16} />}
                    {weightTrend.diff > 0 ? `${weightTrend.diff.toFixed(1)}kg` : 'Stable'}
                  </div>
                  <div className="text-gray-500">Tendance</div>
                </div>
              )}
              {latestWeight && (
                <div className="text-center">
                  <div className="font-semibold text-green-600">{latestWeight} kg</div>
                  <div className="text-gray-500">Poids actuel</div>
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
                onChange={e => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 70.5"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 175"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 25"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
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
                onChange={e => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
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
                onChange={e => setFitnessGoal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
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
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
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
              {connectedScales.map(scale => (
                <div key={scale.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          (scale as any).isConnected ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {(scale as any).connectionType === 'bluetooth' && (
                          <Bluetooth
                            size={16}
                            className={
                              (scale as any).isConnected ? 'text-green-600' : 'text-red-600'
                            }
                          />
                        )}
                        {(scale as any).connectionType === 'wifi' && (
                          <Wifi
                            size={16}
                            className={
                              (scale as any).isConnected ? 'text-green-600' : 'text-red-600'
                            }
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{(scale as any).name}</h3>
                        <p className="text-sm text-gray-500">
                          {scale.brand} {scale.model}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(scale as any).batteryLevel && (
                        <div className="text-sm text-gray-500">
                          🔋 {(scale as any).batteryLevel}%
                        </div>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (scale as any).isConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(scale as any).isConnected ? 'Connectée' : 'Déconnectée'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Dernière synchro:{' '}
                      {(scale as any).lastSync
                        ? new Date((scale as any).lastSync).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </div>

                    <button
                      onClick={() => handleSyncScale(scale.id)}
                      disabled={!(scale as any).isConnected || isSyncing}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune balance connectée</h3>
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
              {(showWeightHistory ? weightHistory : weightHistory.slice(0, 3)).map(
                (entry, index) => (
                  <div
                    key={entry.id || index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          entry.source === 'connected_scale'
                            ? 'bg-green-500'
                            : entry.source === 'manual'
                              ? 'bg-blue-500'
                              : 'bg-gray-500'
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium">{entry.weight} kg</div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.recorded_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {entry.source === 'connected_scale'
                        ? 'Balance'
                        : entry.source === 'manual'
                          ? 'Manuel'
                          : 'Import'}
                    </div>
                  </div>
                )
              )}
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
