import React, { useState, useEffect, useCallback } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp,
  Bed,
  Coffee,
  Phone,
  Volume2,
  Eye,
  BarChart3,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SleepSession, DailyStats, Json } from '@/lib/supabase'; // Importe les types de Supabase
import { User } from '@supabase/supabase-js'; // Importe le type User de Supabase
import { supabase } from '@/lib/supabase'; // CORRIGÉ: Import de Supabase

interface SleepProps {
  userProfile?: User; // Reçoit le profil utilisateur de App.tsx
}

const Sleep: React.FC<SleepProps> = ({ userProfile }) => {
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  // Pour l'enregistrement rapide d'une session
  const [currentBedtimeInput, setCurrentBedtimeInput] = useState<string>(''); // Renommé pour éviter le conflit
  const [currentWakeTimeInput, setCurrentWakeTimeInput] = useState<string>(''); // Renommé
  const [currentDurationInput, setCurrentDurationInput] = useState<number>(0); // Renommé
  const [currentQualityInput, setCurrentQualityInput] = useState<number | undefined>(undefined); // Renommé pour éviter conflit avec le "currentQuality" du calcul

  // === CONNEXION AU STORE ZUSTAND ===
  const {
    dailyGoals,
    user, // Pour le level/points du store
    addSleepSession,
    fetchSleepSessions,
    fetchDailyStats,
  } = useAppStore();

  // === CALCULS BASÉS SUR LES DONNÉES RÉELLES ===
  const today = new Date().toISOString().split('T')[0]; // Format dès le début pour la date
  const lastNightSession = sleepSessions[0]; // Supposons la dernière session est celle d'hier soir/cette nuit

  const currentDurationHours = lastNightSession?.duration_minutes ? (lastNightSession.duration_minutes / 60) : 0;
  const displayedQuality = lastNightSession?.quality_rating || 0; 
  
  const weeklyStats = {
    avgDuration: dailyStats?.sleep_duration_minutes ? (dailyStats.sleep_duration_minutes / 60) : 0, 
    avgQuality: dailyStats?.sleep_quality || 0,
    goalDuration: dailyGoals.sleep,
    streak: 0 // La série doit être calculée depuis l'historique des dailyStats
  };

  // === FONCTIONS DE RÉCUPÉRATION DES DONNÉES ===
  const loadSleepData = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoadingData(true);
    setErrorFetching(null);
    try {
      const fetchedSessions = await fetchSleepSessions(userProfile.id, today); // Récupère les sessions du jour
      fetchedSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSleepSessions(fetchedSessions);

      const fetchedDailyStats = await fetchDailyStats(userProfile.id, today);
      setDailyStats(fetchedDailyStats);

      // Met à jour les valeurs des inputs si une session pour aujourd'hui existe
      if (fetchedSessions.length > 0) {
        const latest = fetchedSessions[0];
        setCurrentBedtimeInput(latest.bedtime ? new Date(latest.bedtime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
        setCurrentWakeTimeInput(latest.wake_time ? new Date(latest.wake_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
        setCurrentDurationInput(latest.duration_minutes || 0);
        setCurrentQualityInput(latest.quality_rating || undefined);
      } else {
        // Réinitialise les inputs si pas de session pour le jour
        setCurrentBedtimeInput('');
        setCurrentWakeTimeInput('');
        setCurrentDurationInput(0);
        setCurrentQualityInput(undefined);
      }

    } catch (err: unknown) {
      setErrorFetching('Erreur lors du chargement des données: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Failed to load sleep data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [userProfile?.id, today, fetchSleepSessions, fetchDailyStats]);

  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  // === ACTIONS D'ENREGISTREMENT DU SOMMEIL ===
  const handleLogSleep = async (action: 'bedtime' | 'wake_time' | 'full_session') => {
    if (!userProfile?.id) {
      alert('Utilisateur non connecté.');
      return;
    }
    setLoadingData(true);
    setErrorFetching(null);

    const sleepDate = today;
    // CORRIGÉ: utilisation de const car non réassignée, et typage plus précis
    const sleepSessionToInsert: Partial<SleepSession> = { user_id: userProfile.id, sleep_date: sleepDate };

    try {
      // Trouver la session existante du jour s'il y en a une pour la mettre à jour
      const existingSessionForToday = sleepSessions.find(s => s.sleep_date === sleepDate);
      
      // CORRIGÉ: utilisation de const car non réassignée, et initialisation complète
      const finalSleepData = { 
        sleep_date: sleepDate,
        bedtime: existingSessionForToday?.bedtime || null,
        wake_time: existingSessionForToday?.wake_time || null,
        duration_minutes: existingSessionForToday?.duration_minutes || null,
        quality_rating: existingSessionForToday?.quality_rating || null,
        mood_rating: existingSessionForToday?.mood_rating || null,
        energy_level: existingSessionForToday?.energy_level || null,
        factors: existingSessionForToday?.factors || {} as Json,
        notes: existingSessionForToday?.notes || null
      };

      if (action === 'bedtime') {
        finalSleepData.bedtime = new Date().toISOString();
        alert('Heure de coucher enregistrée !');
      } else if (action === 'wake_time') {
        finalSleepData.wake_time = new Date().toISOString();
        if (finalSleepData.bedtime) {
          const bedTimeDate = new Date(finalSleepData.bedtime);
          const wakeTimeDate = new Date();
          const duration = Math.round((wakeTimeDate.getTime() - bedTimeDate.getTime()) / (1000 * 60));
          finalSleepData.duration_minutes = duration;
        }
        finalSleepData.quality_rating = currentQualityInput || 3; 
        alert('Heure de réveil enregistrée !');
      } else if (action === 'full_session') {
        if (currentBedtimeInput && currentWakeTimeInput) {
          finalSleepData.bedtime = new Date(`${sleepDate}T${currentBedtimeInput}:00`).toISOString();
          finalSleepData.wake_time = new Date(`${sleepDate}T${currentWakeTimeInput}:00`).toISOString();
          if (finalSleepData.bedtime && finalSleepData.wake_time) {
            const bedTimeDate = new Date(finalSleepData.bedtime);
            const wakeTimeDate = new Date(finalSleepData.wake_time);
            finalSleepData.duration_minutes = Math.round((wakeTimeDate.getTime() - bedTimeDate.getTime()) / (1000 * 60));
          }
        }
        finalSleepData.quality_rating = currentQualityInput || 3;
        finalSleepData.mood_rating = 3; 
        finalSleepData.energy_level = 3; 
        finalSleepData.factors = {} as Json; 
        finalSleepData.notes = '';
        alert('Session de sommeil complète enregistrée !');
      }

      let result = null;
      if (existingSessionForToday) {
        // Mise à jour de la session existante
        const { data, error } = await supabase
          .from('sleep_sessions')
          .update(finalSleepData) // Utilise finalSleepData ici
          .eq('id', existingSessionForToday.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Insertion d'une nouvelle session
        const { data, error } = await supabase
          .from('sleep_sessions')
          .insert(finalSleepData as SleepSession) // Cast pour s'assurer que le type est correct pour l'insertion
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      
      if (result) {
        await loadSleepData(); // Recharge toutes les données après l'enregistrement
      } else {
        alert('Échec de l\'enregistrement de la session de sommeil.');
      }
    } catch (err: unknown) {
      setErrorFetching('Erreur lors de l\'enregistrement: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Failed to log sleep:', err);
    } finally {
      setLoadingData(false);
    }
  };


  // Données de présentation (mockées pour l'instant)
  const sleepTips = [
    {
      icon: Phone,
      title: 'Pas d\'écran 1h avant',
      description: 'Évitez les écrans bleus avant le coucher',
      status: 'done'
    },
    {
      icon: Coffee,
      title: 'Pas de caféine après 16h',
      description: 'La caféine peut perturber votre sommeil',
      status: 'warning'
    },
    {
      icon: Volume2,
      title: 'Environnement silencieux',
      description: 'Réduisez les bruits parasites',
      status: 'done'
    },
    {
      icon: Eye,
      title: 'Chambre sombre',
      description: 'Utilisez des rideaux occultants',
      status: 'todo'
    }
  ];

  const benefits = [
    { icon: Brain, title: 'Mémoire', value: '+15%', color: 'text-purple-500' },
    { icon: Heart, title: 'Cardio', value: '+12%', color: 'text-red-500' },
    { icon: Shield, title: 'Immunité', value: '+20%', color: 'text-green-500' },
    { icon: Zap, title: 'Énergie', value: '+18%', color: 'text-yellow-500' }
  ];
  
  // Utilise la qualité affichée pour la couleur
  const qualityColorClass = displayedQuality >= 4 ? 'text-green-500' : 
                       displayedQuality >= 3 ? 'text-yellow-500' : 'text-red-500';
  
  const qualityBgColorClass = displayedQuality >= 4 ? 'bg-green-500' : 
                         displayedQuality >= 3 ? 'bg-yellow-500' : 'bg-red-500';

  const SleepPhaseCard = ({ title, duration, color, percentage }: { title: string; duration: number; color: string; percentage: number }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-lg font-bold text-gray-800">{duration.toFixed(1)}h</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  const TipCard = ({ tip }: { tip: { icon: React.ElementType; title: string; description: string; status: string; } }) => {
    const TipIcon = tip.icon;
    const getStatusColor = () => {
      switch (tip.status) {
        case 'done': return 'text-green-500 bg-green-100';
        case 'warning': return 'text-yellow-500 bg-yellow-100';
        case 'todo': return 'text-gray-500 bg-gray-100';
        default: return 'text-gray-500 bg-gray-100';
      }
    };

    const getStatusIcon = () => {
      switch (tip.status) {
        case 'done': return '✅';
        case 'warning': return '⚠️';
        case 'todo': return '⭕';
        default: return '⭕';
      }
    };

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            <TipIcon size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-gray-800">{tip.title}</h3>
              <span className="text-lg">{getStatusIcon()}</span>
            </div>
            <p className="text-sm text-gray-600">{tip.description}</p>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sommeil</h1>
            <p className="text-gray-600">Analysez et améliorez votre repos</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Résumé de la nuit */}
        <div className="bg-gradient-hydration p-5 rounded-xl text-white">
          {loadingData ? (
            <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" size={24} /> Chargement des données...</div>
          ) : errorFetching ? (
            <div className="text-center py-8 text-red-100">{errorFetching}</div>
          ) : lastNightSession ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Dernière nuit ({new Date(lastNightSession.sleep_date).toLocaleDateString('fr-FR')})</h3>
                <Moon size={24} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{currentDurationHours.toFixed(1)}h</div>
                  <div className="text-white/80 text-sm">Durée totale</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{displayedQuality}/5</div> {/* Affiche 5 car la qualité est sur 5 */}
                  <div className="text-white/80 text-sm">Qualité</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <Bed size={16} />
                  <span>Couché: {lastNightSession.bedtime ? new Date(lastNightSession.bedtime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Sun size={16} />
                  <span>Levé: {lastNightSession.wake_time ? new Date(lastNightSession.wake_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/80">
                <Moon size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune session de sommeil enregistrée pour le moment.</p>
                <p className="text-sm">Enregistrez votre première nuit !</p>
            </div>
          )}
        </div>

        {/* Statistiques hebdomadaires (basé sur dailyStats pour la démo) */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            <BarChart3 size={20} className="text-gray-500" />
          </div>
          
          {loadingData ? (
            <div className="text-center text-gray-500"><Loader2 className="animate-spin mx-auto" size={20} /> Chargement...</div>
          ) : dailyStats ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{weeklyStats.avgDuration.toFixed(1)}h</div>
                <div className="text-gray-600 text-sm">Moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{weeklyStats.avgQuality}/5</div>
                <div className="text-gray-600 text-sm">Qualité moy.</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Pas de données.</div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-fitness-recovery" />
              <span className="text-sm text-gray-600">Objectif: {weeklyStats.goalDuration}h</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Série: {weeklyStats.streak} jours</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'enregistrement de sommeil complet ou actions rapides */}
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Enregistrer votre sommeil</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de coucher</label>
                    <input type="time" value={currentBedtimeInput} onChange={(e) => setCurrentBedtimeInput(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de réveil</label>
                    <input type="time" value={currentWakeTimeInput} onChange={(e) => setCurrentWakeTimeInput(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualité du sommeil (1-5)</label>
                    <input type="number" min="1" max="5" value={currentQualityInput || ''} onChange={(e) => setCurrentQualityInput(parseInt(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <button 
                    onClick={() => handleLogSleep('full_session')}
                    disabled={loadingData || !currentBedtimeInput || !currentWakeTimeInput || currentQualityInput === undefined}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                    {loadingData ? <Loader2 className="animate-spin mr-2" size={16} /> : <Bed size={18} className="mr-2" />}
                    Enregistrer la session
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleLogSleep('bedtime')}
                    disabled={loadingData}
                    className="bg-white text-gray-600 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="text-center">
                        <Moon size={20} className="text-fitness-recovery mx-auto mb-1" />
                        <span className="text-sm font-medium text-gray-700">Je vais me coucher</span>
                    </div>
                </button>
                <button 
                    onClick={() => handleLogSleep('wake_time')}
                    disabled={loadingData}
                    className="bg-white text-gray-600 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="text-center">
                        <Sun size={20} className="text-yellow-500 mx-auto mb-1" />
                        <span className="text-sm font-medium text-gray-700">Je me réveille</span>
                    </div>
                </button>
            </div>
        </div>


        {/* Bénéfices du bon sommeil */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Bénéfices d'un bon sommeil</h2>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <BenefitIcon size={20} className={benefit.color} />
                    <div>
                      <div className="font-medium text-gray-800">{benefit.title}</div>
                      <div className={`text-sm font-bold ${benefit.color}`}>{benefit.value}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conseils pour mieux dormir */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Conseils pour mieux dormir</h2>
          </div>
          <div className="space-y-3">
            {sleepTips.map((tip, index) => (
              <TipCard key={index} tip={tip} />
            ))}
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Sleep;