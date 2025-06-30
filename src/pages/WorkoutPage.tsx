import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dumbbell, 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Target, 
  TrendingUp,
  Users,
  User,
  Activity,
  Brain,
  Zap,
  Award,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Search,
  Heart,
  Flame,
  Loader2,
  Star 
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Workout, DailyStats, UserProfile, Exercise, Json, AiRecommendation } from '@/lib/supabase';
import { User as SupabaseUserAuthType } from '@supabase/supabase-js'; 
import { supabase } from '@/lib/supabase';

interface WorkoutPageProps {
  userProfile?: SupabaseUserAuthType; 
}

interface SportProfileData {
  sport: string;
  position?: string;
  level: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional';
  experience_years?: number;
  training_frequency?: number; 
  season_period?: string;
}

type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced' | null;
type WorkoutIntensity = 'low' | 'moderate' | 'high' | 'very_high' | null;

interface AiRecommendationMetadata {
  workout_type?: WorkoutType;
  duration_minutes?: number;
  intensity?: WorkoutIntensity;
  target_muscles?: string[];
  sport_relevance?: number;
  recovery_time_hours?: number;
}

interface DisplayWorkoutRecommendation {
  id: string;
  title: string;
  type: WorkoutType | 'general';
  duration_minutes: number;
  intensity: WorkoutIntensity | 'general';
  target_muscles: string[]; 
  sport_relevance: number; 
  recovery_time_hours: number;
  ai_reasoning: string;
}

interface TrainingLoad {
  current_load: number;
  optimal_range: [number, number];
  fatigue_level: 'low' | 'moderate' | 'high' | 'critical';
  recovery_recommendation: string;
}

const WorkoutPage: React.FC<WorkoutPageProps> = ({ userProfile }) => {
  const [loadingData, setLoadingData] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  const [activeWorkoutSession, setActiveWorkoutSession] = useState<Workout | null>(null); 
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0); 

  const [userSportProfile, setUserSportProfile] = useState<SportProfileData>({ 
    sport: '',
    level: 'recreational',
    position: '',
    experience_years: 0,
    training_frequency: 0,
    season_period: '',
  });

  const [workoutsHistory, setWorkoutsHistory] = useState<Workout[]>([]); 
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null); 
  const [exercisesLibrary, setExercisesLibrary] = useState<Exercise[]>([]); 
  const [aiRecommendations, setAiRecommendations] = useState<DisplayWorkoutRecommendation[]>([]); 

  const {
    user: initialUserProfileFromStore, 
    addWorkoutSession,
    updateWorkoutSession,
    fetchWorkoutSessions,
    fetchDailyStats,
    fetchExercisesLibrary,
    fetchAiRecommendations, 
    updateProfile: updateUserProfileStore 
  } = useAppStore();

  const sportsDataOptions = { 
    'rugby': {
      positions: ['Pilier', 'Talonneur', 'Deuxième ligne', 'Troisième ligne', 'Mêlée', 'Ouverture', 'Centre', 'Ailier', 'Arrière'],
    },
    'football': {
      positions: ['Gardien', 'Défenseur central', 'Latéral', 'Milieu défensif', 'Milieu offensif', 'Ailier', 'Attaquant'],
    },
    'basketball': {
      positions: ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'],
    },
    'tennis': {
      positions: ['Simple', 'Double'],
    },
    'natation': {
      positions: ['Nage libre', 'Brasse', 'Dos crawlé', 'Papillon', 'Quatre nages'],
    },
    'musculation': {
      positions: ['Général', 'Powerlifting', 'Bodybuilding', 'CrossFit'],
    }
  };

  const trainingLoad: TrainingLoad = { 
    current_load: dailyStats?.total_workout_minutes ? (dailyStats.total_workout_minutes / (dailyStats.hydration_goal_ml || 2000)) * 100 : 75, 
    optimal_range: [65, 85],
    fatigue_level: 'moderate', 
    recovery_recommendation: 'Séance de récupération active recommandée demain' 
  };

  const loadWorkoutData = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoadingData(true);
    setErrorFetching(null);
    try {
      const { data: fetchedUserProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userProfile.id)
        .single();
      
      if (profileError) throw profileError;

      if (fetchedUserProfile) {
        setUserSportProfile({
          sport: fetchedUserProfile.sport || '',
          position: fetchedUserProfile.sport_position || '',
          level: (fetchedUserProfile.sport_level as SportProfileData['level']) || 'recreational',
          experience_years: fetchedUserProfile.fitness_experience === 'beginner' ? 0 : 
                            fetchedUserProfile.fitness_experience === 'intermediate' ? 1 : 
                            fetchedUserProfile.fitness_experience === 'advanced' ? 3 : 5, 
          training_frequency: fetchedUserProfile.training_frequency || 0,
          season_period: fetchedUserProfile.season_period || '',
        });
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fetchedWorkouts = await fetchWorkoutSessions(userProfile.id, thirtyDaysAgo.toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
      setWorkoutsHistory(fetchedWorkouts);

      const todayDate = new Date().toISOString().split('T')[0];
      const fetchedDailyStats = await fetchDailyStats(userProfile.id, todayDate);
      setDailyStats(fetchedDailyStats);

      const fetchedExercises = await fetchExercisesLibrary(); 
      setExercisesLibrary(fetchedExercises);

      const fetchedAiRecommendations = await fetchAiRecommendations(userProfile.id, 'workout', 5);
      const displayRecos: DisplayWorkoutRecommendation[] = fetchedAiRecommendations.map(rec => {
        const metadata = rec.metadata as unknown as AiRecommendationMetadata; 

        return {
          id: rec.id,
          title: rec.recommendation.split('\n')[0] || 'Recommandation IA', 
          type: (metadata.workout_type || 'general') as WorkoutType | 'general',
          duration_minutes: metadata.duration_minutes || 30,
          intensity: (metadata.intensity || 'moderate') as WorkoutIntensity | 'general',
          target_muscles: metadata.target_muscles || [],
          sport_relevance: metadata.sport_relevance || 70,
          recovery_time_hours: metadata.recovery_time_hours || 24,
          ai_reasoning: rec.recommendation 
        };
      });
      setAiRecommendations(displayRecos);


    } catch (err: unknown) {
      setErrorFetching('Erreur lors du chargement des données: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Failed to load workout data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [userProfile?.id, fetchWorkoutSessions, fetchDailyStats, fetchExercisesLibrary, fetchAiRecommendations]);

  useEffect(() => {
    loadWorkoutData();
  }, [loadWorkoutData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && activeWorkoutSession) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, activeWorkoutSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = async (workoutRecommendation: DisplayWorkoutRecommendation) => { 
    if (!userProfile?.id) {
      alert('Utilisateur non connecté.');
      return;
    }
    setLoadingData(true);
    const newWorkout: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
      name: workoutRecommendation.title,
      description: workoutRecommendation.ai_reasoning,
      workout_type: workoutRecommendation.type === 'general' ? 'other' : workoutRecommendation.type,
      duration_minutes: workoutRecommendation.duration_minutes,
      difficulty: workoutRecommendation.intensity === 'general' ? 'beginner' : workoutRecommendation.intensity,
      exercises: workoutRecommendation.target_muscles as Json, 
      started_at: new Date().toISOString(),
      completed_at: null,
      calories_burned: 0, 
      notes: null,
    };

    const result = await addWorkoutSession(userProfile.id, newWorkout);
    if (result) {
      setActiveWorkoutSession(result);
      setIsWorkoutActive(true);
      setWorkoutTimer(0);
      alert(`Entraînement "${result.name}" démarré !`);
      await loadWorkoutData(); 
    } else {
      alert('Échec du démarrage de l\'entraînement.');
    }
    setLoadingData(false);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(prev => !prev);
  };

  const stopWorkout = async () => {
    if (!activeWorkoutSession || !userProfile?.id) return;

    setLoadingData(true);
    const completedWorkout: Partial<Workout> = {
      completed_at: new Date().toISOString(),
      duration_minutes: workoutTimer ? Math.round(workoutTimer / 60) : 0, 
      calories_burned: calculateCaloriesBurned(workoutTimer, activeWorkoutSession.difficulty || 'beginner'), 
    };

    const result = await updateWorkoutSession(activeWorkoutSession.id, completedWorkout);
    if (result) {
      alert(`Entraînement "${result.name}" terminé et enregistré !`);
      setActiveWorkoutSession(null);
      setIsWorkoutActive(false);
      setWorkoutTimer(0);
      await loadWorkoutData(); 
    } else {
      alert('Échec de l\'enregistrement de l\'entraînement terminé.');
    }
    setLoadingData(false);
  };

  const calculateCaloriesBurned = (durationSeconds: number, difficulty: string | null): number => { 
    const baseCaloriesPerMinute = 5; 
    let difficultyMultiplier = 1;
    if (difficulty === 'intermediate' || difficulty === 'moderate') difficultyMultiplier = 1.2;
    if (difficulty === 'advanced' || difficulty === 'high' || difficulty === 'very_high') difficultyMultiplier = 1.5; 
    return Math.round((durationSeconds / 60) * baseCaloriesPerMinute * difficultyMultiplier);
  };

  const getDifficultyColor = (difficulty: string | null) => { 
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      case 'low': return 'text-green-600 bg-green-100'; 
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'very_high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const WorkoutCard = ({ workout }: { workout: DisplayWorkoutRecommendation }) => ( 
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl">💪</div> 
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{workout.sport_relevance}%</span> 
            <span className="text-xs text-gray-500">(AI Relev.)</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-1">{workout.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{workout.ai_reasoning}</p> 
        
        <div className="flex flex-wrap gap-1 mb-3">
          {workout.target_muscles.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {workout.target_muscles.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{workout.target_muscles.length - 2}
            </span>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <Clock size={16} className="text-gray-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.duration_minutes}min</span>
          </div>
          <div className="text-center">
            <Flame size={16} className="text-orange-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">~{calculateCaloriesBurned(workout.duration_minutes * 60, workout.intensity)} kcal</span>
          </div>
          <div className="text-center">
            <Target size={16} className="text-blue-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.target_muscles.length} zones</span>
          </div>
          <div className="text-center">
            <Users size={16} className="text-green-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">AI</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.intensity)}`}>
            {workout.intensity.replace('_', ' ')}
          </span>
          <button 
            onClick={() => startWorkout(workout)}
            disabled={!!activeWorkoutSession || loadingData}
            className="bg-fitness-energy text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center hover:bg-fitness-energy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={14} className="mr-1" />
            Commencer
          </button>
        </div>
      </div>
    </div>
  );


  const handleProfileUpdate = async () => {
    if (!userProfile?.id) return;
    setLoadingData(true);
    const updates: Partial<UserProfile> = {
      sport: userSportProfile.sport || null,
      sport_position: userSportProfile.position || null,
      sport_level: userSportProfile.level || null,
      training_frequency: userSportProfile.training_frequency || null,
      season_period: userSportProfile.season_period || null,
      fitness_experience: userSportProfile.level === 'recreational' ? 'beginner' : 
                          userSportProfile.level === 'amateur_competitive' ? 'intermediate' : 
                          userSportProfile.level === 'semi_professional' ? 'advanced' : 'expert',
    };

    const { data: resultData, error: updateError } = await supabase.from('user_profiles').update(updates).eq('id', userProfile.id).select().single();
    if (updateError) {
        alert('Échec de la mise à jour du profil: ' + updateError.message);
        console.error('Error updating user profile:', updateError);
    } else if (resultData) {
        updateUserProfileStore(updates);
        alert('Profil sportif mis à jour !');
    } else {
        alert('Échec inattendu de la mise à jour du profil.');
    }
    setLoadingData(false);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Dumbbell className="mr-3 text-blue-600" size={28} />
                Espace Sport & Entraînement
              </h1>
              <p className="text-gray-600 mt-1">IA multi-sports adaptée à votre profil</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Activity className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Charge d'entraînement</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          trainingLoad.fatigue_level === 'low' ? 'bg-green-500' :
                          trainingLoad.fatigue_level === 'moderate' ? 'bg-yellow-500' :
                          trainingLoad.fatigue_level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${trainingLoad.current_load}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{trainingLoad.current_load}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loadingData && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Chargement des données sportives...</p>
          </div>
        )}
        {errorFetching && (
          <div className="text-center py-8 text-red-500">
            <Zap className="mx-auto mb-4" size={32} />
            <p>{errorFetching}</p>
          </div>
        )}

        {!loadingData && !errorFetching && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Target className="mr-2 text-blue-600" size={20} />
                  Profil Sportif
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sport principal</label>
                    <select 
                      value={userSportProfile.sport}
                      onChange={(e) => setUserSportProfile(prev => ({ ...prev, sport: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un sport</option>
                      {Object.keys(sportsDataOptions).map(sport => (
                        <option key={sport} value={sport}>
                          {sport.charAt(0).toUpperCase() + sport.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {userSportProfile.sport && sportsDataOptions[userSportProfile.sport as keyof typeof sportsDataOptions] && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Spécialité</label>
                      <select 
                        value={userSportProfile.position}
                        onChange={(e) => setUserSportProfile(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner un poste</option>
                        {sportsDataOptions[userSportProfile.sport as keyof typeof sportsDataOptions].positions.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                    <select 
                      value={userSportProfile.level}
                      onChange={(e) => setUserSportProfile(prev => ({ ...prev, level: e.target.value as SportProfileData['level'] }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="recreational">Loisir</option>
                      <option value="amateur_competitive">Amateur compétitif</option>
                      <option value="semi_professional">Semi-professionnel</option>
                      <option value="professional">Professionnel</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleProfileUpdate}
                  disabled={loadingData}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loadingData ? <Loader2 className="animate-spin mr-2" size={18} /> : <Brain className="mr-2" size={18} />}
                  Mettre à jour l'IA
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Timer className="mr-2 text-green-600" size={20} />
                  Séance en cours
                </h3>

                {activeWorkoutSession ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{activeWorkoutSession.name}</h4>
                      <p className="text-sm text-gray-600">{activeWorkoutSession.description}</p>
                    </div>

                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {formatTime(workoutTimer)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Durée prévue: {activeWorkoutSession.duration_minutes || '--'}min
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={pauseWorkout}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                          isWorkoutActive 
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isWorkoutActive ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button
                        onClick={stopWorkout}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                      >
                        <Square size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Activity size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Aucune séance en cours</p>
                    <p className="text-sm">Sélectionnez une recommandation ci-dessous</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="mr-2 text-purple-600" size={20} />
                  Cette semaine
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Séances</span>
                    <span className="font-semibold text-gray-800">{dailyStats?.workouts_completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Temps total</span>
                    <span className="font-semibold text-gray-800">{dailyStats?.total_workout_minutes ? (dailyStats.total_workout_minutes / 60).toFixed(1) + 'h' : '--'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-semibold text-gray-800">{dailyStats?.calories_burned || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Récupération</span>
                    <span className="font-semibold text-green-600">
                      {trainingLoad.fatigue_level === 'low' && 'Optimale'}
                      {trainingLoad.fatigue_level === 'moderate' && 'Modérée'}
                      {trainingLoad.fatigue_level === 'high' && 'Élevée'}
                      {trainingLoad.fatigue_level === 'critical' && 'Critique'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Brain className="mr-3 text-purple-600" size={24} />
                    Recommandations IA Personnalisées
                  </h2>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                      <Filter size={16} />
                      <span>Filtrer</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Plus size={16} />
                      <span>Nouvelle séance</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {aiRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {aiRecommendations.map((recommendation) => (
                      <WorkoutCard key={recommendation.id} workout={recommendation} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune recommandation IA pour le sport pour le moment.</p>
                    <p className="text-sm">Interagissez avec l'IA via le tableau de bord pour en générer !</p>
                  </div>
                )}
              </div>
            </div>

            {trainingLoad.fatigue_level === 'high' && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="text-orange-600" size={20} />
                  <div>
                    <h4 className="font-semibold text-orange-800">Attention à la récupération</h4>
                    <p className="text-sm text-orange-700">{trainingLoad.recovery_recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutPage;