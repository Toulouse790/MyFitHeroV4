// 📖 GUIDE D'UTILISATION - SERVICE SUPABASE UNIFIÉ
// Exemples concrets de migration et d'utilisation

import React from 'react';
import SupabaseService, { useSupabaseQuery } from '@/services/supabaseService';
import { AppUser } from '@/shared/types/user';

// 🎯 MIGRATION : ANCIEN → NOUVEAU

// ❌ AVANT : Pattern dupliqué 30+ fois (exemple commenté)
/*
const [workouts, setWorkouts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      setWorkouts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchWorkouts();
}, [userId]);
*/

// ✅ APRÈS : Service unifié
export const NouveauPattern = ({ userId }: { userId: string }) => {
  const {
    data: workouts,
    loading,
    error,
  } = useSupabaseQuery(() => SupabaseService.getUserWorkouts(userId), [userId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {workouts?.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
};

// 🎯 EXEMPLES D'UTILISATION

// 1. Récupération simple par ID
export const UserProfileExample = ({ userId }: { userId: string }) => {
  const {
    data: profile,
    loading,
    error,
  } = useSupabaseQuery<AppUser>(() => SupabaseService.getUserProfile(userId), [userId]);

  return (
    <div>
      {loading && <p>Chargement du profil...</p>}
      {error && <p>Erreur: {error}</p>}
      {profile && (
        <div>
          <h3>{profile.full_name}</h3>
          <p>Email: {profile.email}</p>
        </div>
      )}
    </div>
  );
};

// 2. Récupération avec pagination
export const WorkoutListExample = ({ userId }: { userId: string }) => {
  const {
    data: workouts,
    loading,
    error,
    refetch,
  } = useSupabaseQuery(
    () =>
      SupabaseService.getUserWorkouts(userId, {
        limit: 10,
        page: 1,
        orderBy: 'completed_at',
        ascending: false,
      }),
    [userId]
  );

  return (
    <div>
      <button onClick={refetch}>Actualiser</button>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {workouts && (
        <div>
          {workouts.map(workout => (
            <div key={workout.id}>
              <h4>{workout.name}</h4>
              <p>Durée: {workout.duration} min</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Nutrition par date
export const NutritionExample = ({ userId }: { userId: string }) => {
  const today = new Date().toISOString().split('T')[0];

  const {
    data: nutrition,
    loading,
    error,
  } = useSupabaseQuery(
    () => SupabaseService.getUserNutrition(userId, today, { limit: 20 }),
    [userId, today]
  );

  return (
    <div>
      <h3>Nutrition du jour</h3>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {nutrition?.length === 0 && <p>Aucun repas enregistré</p>}
      {nutrition?.map(meal => (
        <div key={meal.id}>
          <h4>{meal.meal_name}</h4>
          <p>Calories: {meal.calories}</p>
        </div>
      ))}
    </div>
  );
};

// 4. Stats quotidiennes
export const DailyStatsExample = ({ userId }: { userId: string }) => {
  const today = new Date().toISOString().split('T')[0];

  const {
    data: stats,
    loading,
    error,
  } = useSupabaseQuery(() => SupabaseService.getDailyStats(userId, today), [userId, today]);

  return (
    <div>
      <h3>Statistiques du jour</h3>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {stats ? (
        <div>
          <p>🔥 Calories brûlées: {stats.calories_burned}</p>
          <p>💧 Hydratation: {stats.water_intake}ml</p>
          <p>💪 Workouts: {stats.workouts_completed}</p>
        </div>
      ) : (
        <p>Aucune statistique pour aujourd&apos;hui</p>
      )}
    </div>
  );
};

// 🎯 UTILISATION AVANCÉE

// 5. Mutation avec gestion d'erreur
export const UpdateProfileExample = ({ userId }: { userId: string }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  const handleUpdateProfile = async (updates: Partial<AppUser>) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const result = await SupabaseService.updateUserProfile(userId, updates);

      if (result.success) {
        console.log('Profil mis à jour:', result.data);
        // Réactualiser les données si nécessaire
      } else {
        setUpdateError(result.error);
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleUpdateProfile({ fitness_level: 'advanced' })}
        disabled={isUpdating}
      >
        {isUpdating ? 'Mise à jour...' : 'Passer en niveau avancé'}
      </button>
      {updateError && <p style={{ color: 'red' }}>Erreur: {updateError}</p>}
    </div>
  );
};

// 6. Pattern de recherche générique
export const GenericSearchExample = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [results, setResults] = React.useState<
    Array<{
      id: string;
      workout_name?: string;
      description?: string;
    }>
  >([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Recherche dans les workouts
      const workoutResults = await SupabaseService.findByUserId(
        'user_workouts',
        'current-user-id',
        {
          limit: 10,
          orderBy: 'created_at',
          ascending: false,
        },
        `*, workout_name, description`
      );

      if (workoutResults.success) {
        const filtered =
          workoutResults.data?.filter((workout: { workout_name?: string }) =>
            workout.workout_name?.toLowerCase().includes(searchTerm.toLowerCase())
          ) || [];
        setResults(filtered);
      }
    } catch (err) {
      console.error('Erreur de recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Rechercher un workout..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Recherche...' : 'Rechercher'}
      </button>

      <div>
        {results.map(result => (
          <div key={result.id}>
            <h4>{result.workout_name}</h4>
            <p>{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎯 PATTERNS DE VALIDATION

// 7. Validation avant opération
export const SafeOperationExample = ({ userId }: { userId: string }) => {
  const handleSafeDelete = async (workoutId: string) => {
    // Validation préalable
    if (!SupabaseService.validateUserId(userId)) {
      console.error('User ID invalide');
      return;
    }

    if (!SupabaseService.validateTableName('user_workouts')) {
      console.error('Nom de table invalide');
      return;
    }

    try {
      const result = await SupabaseService.delete('user_workouts', workoutId, userId);

      if (result.success) {
        console.log('Workout supprimé avec succès');
      } else {
        console.error('Erreur:', result.error);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
    }
  };

  return <button onClick={() => handleSafeDelete('workout-id')}>Supprimer workout</button>;
};

// 🎯 GESTION D'ERREURS CENTRALISÉE

export const ErrorHandlingExample = () => {
  const handleOperationWithErrorHandling = async () => {
    try {
      const result = await SupabaseService.getUserProfile('invalid-user-id');

      if (!result.success) {
        // Utiliser le gestionnaire d'erreur unifié
        const userFriendlyMessage = SupabaseService.handleError(result.error);
        console.log('Message utilisateur:', userFriendlyMessage);

        // Afficher une notification ou toast
        // showErrorToast(userFriendlyMessage);
      }
    } catch (err) {
      const fallbackMessage = SupabaseService.handleError(err);
      console.log('Message de fallback:', fallbackMessage);
    }
  };

  return <button onClick={handleOperationWithErrorHandling}>Test gestion d&apos;erreur</button>;
};

export default {
  NouveauPattern,
  UserProfileExample,
  WorkoutListExample,
  NutritionExample,
  DailyStatsExample,
  UpdateProfileExample,
  GenericSearchExample,
  SafeOperationExample,
  ErrorHandlingExample,
};
