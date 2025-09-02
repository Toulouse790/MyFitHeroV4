import { supabase } from '@/lib/supabase';
import type {
  MuscleRecoveryData,
  UserRecoveryProfile,
  WorkoutImpact,
  RecoveryRecommendation,
  GlobalRecoveryMetrics,
  MuscleGroup,
  RecoveryStatus,
  WorkoutIntensity,
} from '@/features/workout/types/muscleRecovery';
import type {
  UserProfile,
  Workout,
  SleepSession,
  DailyStats,
} from '@/features/workout/types/database';

export class MuscleRecoveryService {
  // === CONSTANTES DE RÉCUPÉRATION ===
  private static readonly BASE_RECOVERY_HOURS: Record<MuscleGroup, number> = {
    chest: 48,
    back: 48,
    shoulders: 36,
    biceps: 36,
    triceps: 36,
    forearms: 24,
    quadriceps: 48,
    hamstrings: 48,
    glutes: 48,
    calves: 24,
    core: 24,
    traps: 36,
    lats: 48,
    delts: 36,
  };

  private static readonly INTENSITY_MULTIPLIERS: Record<WorkoutIntensity, number> = {
    light: 0.7,
    moderate: 1.0,
    high: 1.4,
    extreme: 1.8,
  };

  private static readonly MUSCLE_GROUP_MAPPINGS: Record<string, MuscleGroup[]> = {
    chest: ['chest', 'triceps', 'delts'],
    back: ['back', 'lats', 'biceps', 'traps'],
    shoulders: ['delts', 'traps'],
    arms: ['biceps', 'triceps', 'forearms'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    core: ['core'],
    cardio: [], // pas d'impact musculaire spécifique
    flexibility: [],
  };

  // === PROFIL DE RÉCUPÉRATION UTILISATEUR ===
  static async getUserRecoveryProfile(userId: string): Promise<UserRecoveryProfile | null> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_recovery_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch {
      // Erreur silencieuse
      console.error('Error fetching user recovery profile:', error);
      return null;
    }
  }

  static async createOrUpdateRecoveryProfile(
    userId: string,
    userProfile: UserProfile,
    sleepData?: SleepSession[],
    nutritionData?: DailyStats[]
  ): Promise<UserRecoveryProfile | null> {
    try {
      const profile = await this.calculateRecoveryProfile(
        userId,
        userProfile,
        sleepData,
        nutritionData
      );

      const { data: _data, error: _error } = await supabase
        .from('user_recovery_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch {
      // Erreur silencieuse
      console.error('Error creating/updating recovery profile:', error);
      return null;
    }
  }

  private static async calculateRecoveryProfile(
    userId: string,
    userProfile: UserProfile,
    sleepData?: SleepSession[],
    nutritionData?: DailyStats[]
  ): Promise<UserRecoveryProfile> {
    // Facteur d'âge (récupération ralentit avec l'âge)
    const age = userProfile.age || 25;
    const ageFactor = Math.max(0.6, 1.2 - (age - 20) * 0.01);

    // Facteur de niveau de fitness
    const fitnessLevelFactors = {
      beginner: 0.8,
      intermediate: 1.0,
      advanced: 1.2,
      expert: 1.3,
    };
    const fitnessLevelFactor =
      fitnessLevelFactors[userProfile.fitness_experience || 'intermediate'];

    // Facteur de récupération de base (génétique + lifestyle)
    let baseRecoveryRate = 1.0;
    if (userProfile.lifestyle === 'physical_job') baseRecoveryRate *= 0.9;
    if (userProfile.lifestyle === 'office_worker') baseRecoveryRate *= 0.95;
    if (userProfile.lifestyle === 'student') baseRecoveryRate *= 1.05;

    // Impact du sommeil (moyenne des 7 derniers jours)
    let sleepQualityImpact = 1.0;
    if (sleepData && sleepData.length > 0) {
      const avgSleepQuality =
        sleepData.reduce((sum, session) => sum + (session.quality_rating || 7), 0) /
        sleepData.length;
      const avgSleepDuration =
        sleepData.reduce((sum, session) => sum + (session.duration_minutes || 480), 0) /
        sleepData.length /
        60;

      sleepQualityImpact = Math.max(
        0.7,
        Math.min(1.3, (avgSleepQuality / 10) * Math.min(avgSleepDuration / 8, 1.2))
      );
    }

    // Impact de la nutrition (moyenne des 7 derniers jours)
    let nutritionQualityImpact = 1.0;
    if (nutritionData && nutritionData.length > 0) {
      const avgProtein =
        nutritionData.reduce((sum, day) => sum + (day.total_protein || 0), 0) /
        nutritionData.length;
      const targetProtein = (userProfile.weight_kg || 70) * 1.6; // 1.6g/kg pour récupération

      nutritionQualityImpact = Math.max(0.8, Math.min(1.2, avgProtein / targetProtein));
    }

    // Historique des blessures
    const injuryHistory: MuscleGroup[] = [];
    if (userProfile.injuries && userProfile.injuries.length > 0) {
      userProfile.injuries.forEach(injury => {
        const injuryLower = injury.toLowerCase();
        if (injuryLower.includes('shoulder')) injuryHistory.push('shoulders');
        if (injuryLower.includes('back')) injuryHistory.push('back');
        if (injuryLower.includes('knee')) injuryHistory.push('quadriceps', 'hamstrings');
        if (injuryLower.includes('ankle')) injuryHistory.push('calves');
        // Ajouter d'autres mappings selon les besoins
      });
    }

    return {
      user_id: userId,
      recovery_rate_multiplier: baseRecoveryRate,
      sleep_quality_impact: sleepQualityImpact,
      nutrition_quality_impact: nutritionQualityImpact,
      stress_level_impact: 1.0, // À calculer avec des données de stress
      hydration_impact: 1.0, // À calculer avec les données d'hydratation
      age_factor: ageFactor,
      fitness_level_factor: fitnessLevelFactor,
      injury_history: injuryHistory,
      supplements: [], // À remplir selon les préférences utilisateur
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // === CALCUL DE LA RÉCUPÉRATION MUSCULAIRE ===
  static async calculateMuscleRecovery(
    userId: string,
    workouts: Workout[],
    recoveryProfile?: UserRecoveryProfile
  ): Promise<MuscleRecoveryData[]> {
    try {
      if (!recoveryProfile) {
        recoveryProfile = await this.getUserRecoveryProfile(userId);
        if (!recoveryProfile) {
          throw new Error('Recovery profile not found');
        }
      }

      const muscleRecoveryMap = new Map<MuscleGroup, MuscleRecoveryData>();
      const now = new Date();

      // Initialiser tous les groupes musculaires
      Object.keys(this.BASE_RECOVERY_HOURS).forEach(muscle => {
        const muscleGroup = muscle as MuscleGroup;
        muscleRecoveryMap.set(muscleGroup, {
          muscle_group: muscleGroup,
          last_workout_date: '',
          workout_intensity: 'light',
          workout_volume: 0,
          workout_duration_minutes: 0,
          recovery_status: 'fully_recovered',
          recovery_percentage: 100,
          estimated_full_recovery: now.toISOString(),
          fatigue_level: 1,
          soreness_level: 1,
          readiness_score: 100,
          last_updated: now.toISOString(),
        });
      });

      // Analyser les workouts récents (7 derniers jours)
      const recentWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.completed_at || workout.created_at || '');
        const daysDiff = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });

      // Calculer l'impact de chaque workout
      for (const workout of recentWorkouts) {
        const workoutImpacts = this.analyzeWorkoutImpact(workout);

        for (const impact of workoutImpacts) {
          const currentData = muscleRecoveryMap.get(impact.muscle_group);
          if (!currentData) continue;

          const workoutDate = new Date(workout.completed_at || workout.created_at || '');
          const hoursElapsed = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);

          // Calculer le temps de récupération nécessaire
          const baseRecoveryHours = this.BASE_RECOVERY_HOURS[impact.muscle_group];
          const intensityMultiplier = this.INTENSITY_MULTIPLIERS[impact.intensity];
          const volumeMultiplier = Math.max(0.8, Math.min(1.5, impact.volume / 12)); // 12 séries = référence

          const totalRecoveryHours =
            baseRecoveryHours *
            intensityMultiplier *
            volumeMultiplier *
            (1 / recoveryProfile.recovery_rate_multiplier) *
            (1 / recoveryProfile.sleep_quality_impact) *
            (1 / recoveryProfile.nutrition_quality_impact) *
            (1 / recoveryProfile.age_factor) *
            (1 / recoveryProfile.fitness_level_factor);

          // Calculer le pourcentage de récupération
          const recoveryPercentage = Math.min(100, (hoursElapsed / totalRecoveryHours) * 100);

          // Mettre à jour si ce workout est plus récent ou plus impactant
          if (workoutDate.getTime() > new Date(currentData.last_workout_date || 0).getTime()) {
            const estimatedFullRecovery = new Date(
              workoutDate.getTime() + totalRecoveryHours * 60 * 60 * 1000
            );

            muscleRecoveryMap.set(impact.muscle_group, {
              ...currentData,
              last_workout_date: workoutDate.toISOString(),
              workout_intensity: impact.intensity,
              workout_volume: impact.volume,
              workout_duration_minutes: impact.duration_minutes,
              recovery_percentage: Math.max(0, recoveryPercentage),
              estimated_full_recovery: estimatedFullRecovery.toISOString(),
              recovery_status: this.calculateRecoveryStatus(recoveryPercentage),
              fatigue_level: this.calculateFatigueLevel(recoveryPercentage, impact.intensity),
              soreness_level: this.calculateSorenessLevel(
                hoursElapsed,
                totalRecoveryHours,
                impact.intensity
              ),
              readiness_score: this.calculateReadinessScore(
                recoveryPercentage,
                impact.muscle_group,
                recoveryProfile
              ),
              last_updated: now.toISOString(),
            });
          }
        }
      }

      return Array.from(muscleRecoveryMap.values());
    } catch {
      // Erreur silencieuse
      console.error('Error calculating muscle recovery:', error);
      return [];
    }
  }

  private static analyzeWorkoutImpact(workout: Workout): WorkoutImpact[] {
    const impacts: WorkoutImpact[] = [];

    // Analyser les exercices du workout
    const exercises = (workout.exercises as any[]) || [];
    const workoutType = workout.workout_type || 'strength';
    const duration = workout.duration_minutes || 60;

    // Mapper le type de workout aux groupes musculaires
    const affectedMuscles = this.MUSCLE_GROUP_MAPPINGS[workoutType] || [];

    if (affectedMuscles.length === 0) {
      // Si pas de mapping spécifique, analyser les exercices individuellement
      exercises.forEach(exercise => {
        const muscleGroups = this.getMuscleGroupsFromExercise(exercise);
        muscleGroups.forEach(muscle => {
          impacts.push({
            muscle_group: muscle,
            intensity: this.determineIntensity(workout, exercise),
            volume: exercise.sets || 3,
            duration_minutes: duration / exercises.length,
            exercise_types: [exercise.name || 'unknown'],
            compound_movements: this.isCompoundMovement(exercise.name || ''),
            eccentric_focus: this.hasEccentricFocus(exercise.name || ''),
          });
        });
      });
    } else {
      // Utiliser le mapping du type de workout
      affectedMuscles.forEach(muscle => {
        impacts.push({
          muscle_group: muscle,
          intensity: this.determineWorkoutIntensity(workout),
          volume: this.estimateVolumeFromWorkout(workout),
          duration_minutes: duration / affectedMuscles.length,
          exercise_types: exercises.map(ex => ex.name || 'unknown'),
          compound_movements: true, // Assumé pour les workouts typés
          eccentric_focus: false,
        });
      });
    }

    return impacts;
  }

  private static getMuscleGroupsFromExercise(exercise: any): MuscleGroup[] {
    const exerciseName = (exercise.name || '').toLowerCase();
    const muscles: MuscleGroup[] = [];

    // Mapping des exercices aux groupes musculaires
    if (exerciseName.includes('bench') || exerciseName.includes('push')) {
      muscles.push('chest', 'triceps', 'delts');
    }
    if (exerciseName.includes('pull') || exerciseName.includes('row')) {
      muscles.push('back', 'lats', 'biceps');
    }
    if (exerciseName.includes('squat') || exerciseName.includes('leg press')) {
      muscles.push('quadriceps', 'glutes');
    }
    if (exerciseName.includes('deadlift')) {
      muscles.push('hamstrings', 'glutes', 'back', 'traps');
    }
    if (exerciseName.includes('shoulder') || exerciseName.includes('press')) {
      muscles.push('delts', 'triceps');
    }
    if (exerciseName.includes('curl')) {
      muscles.push('biceps');
    }
    if (exerciseName.includes('tricep') || exerciseName.includes('dip')) {
      muscles.push('triceps');
    }
    if (exerciseName.includes('calf')) {
      muscles.push('calves');
    }
    if (exerciseName.includes('core') || exerciseName.includes('ab')) {
      muscles.push('core');
    }

    return muscles.length > 0 ? muscles : ['core']; // Fallback
  }

  private static determineIntensity(workout: Workout, exercise: any): WorkoutIntensity {
    const difficulty = workout.difficulty || 'moderate';
    const rpe = exercise.rpe || 7; // Rate of Perceived Exertion

    if (rpe >= 9 || difficulty === 'advanced') return 'extreme';
    if (rpe >= 7 || difficulty === 'intermediate') return 'high';
    if (rpe >= 5) return 'moderate';
    return 'light';
  }

  private static determineWorkoutIntensity(workout: Workout): WorkoutIntensity {
    const difficulty = workout.difficulty || 'moderate';
    const duration = workout.duration_minutes || 60;

    if (difficulty === 'advanced' || duration > 90) return 'extreme';
    if (difficulty === 'intermediate' || duration > 60) return 'high';
    if (duration > 30) return 'moderate';
    return 'light';
  }

  private static estimateVolumeFromWorkout(workout: Workout): number {
    const exercises = (workout.exercises as any[]) || [];
    return exercises.reduce((total, ex) => total + (ex.sets || 3), 0);
  }

  private static isCompoundMovement(exerciseName: string): boolean {
    const compoundKeywords = [
      'squat',
      'deadlift',
      'bench',
      'press',
      'pull',
      'row',
      'clean',
      'snatch',
    ];
    return compoundKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
  }

  private static hasEccentricFocus(exerciseName: string): boolean {
    const eccentricKeywords = ['negative', 'eccentric', 'slow', 'tempo'];
    return eccentricKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
  }

  private static calculateRecoveryStatus(recoveryPercentage: number): RecoveryStatus {
    if (recoveryPercentage >= 95) return 'fully_recovered';
    if (recoveryPercentage >= 80) return 'mostly_recovered';
    if (recoveryPercentage >= 60) return 'partially_recovered';
    if (recoveryPercentage >= 30) return 'needs_recovery';
    return 'overworked';
  }

  private static calculateFatigueLevel(
    recoveryPercentage: number,
    intensity: WorkoutIntensity
  ): number {
    const baseIntensityFatigue = {
      light: 2,
      moderate: 4,
      high: 6,
      extreme: 8,
    };

    const baseFatigue = baseIntensityFatigue[intensity];
    const recoveryFactor = (100 - recoveryPercentage) / 100;

    return Math.max(1, Math.min(10, Math.round(baseFatigue * recoveryFactor)));
  }

  private static calculateSorenessLevel(
    hoursElapsed: number,
    totalRecoveryHours: number,
    intensity: WorkoutIntensity
  ): number {
    const peakSorenessHours = {
      light: 12,
      moderate: 24,
      high: 36,
      extreme: 48,
    };

    const peakHours = peakSorenessHours[intensity];
    const maxSoreness = {
      light: 3,
      moderate: 5,
      high: 7,
      extreme: 9,
    };

    if (hoursElapsed <= peakHours) {
      // Montée vers le pic
      return Math.round((hoursElapsed / peakHours) * maxSoreness[intensity]);
    } else {
      // Descente après le pic
      const remainingHours = totalRecoveryHours - peakHours;
      const hoursAfterPeak = hoursElapsed - peakHours;
      const sorenessReduction = (hoursAfterPeak / remainingHours) * maxSoreness[intensity];
      return Math.max(1, Math.round(maxSoreness[intensity] - sorenessReduction));
    }
  }

  private static calculateReadinessScore(
    recoveryPercentage: number,
    muscleGroup: MuscleGroup,
    profile: UserRecoveryProfile
  ): number {
    let baseScore = recoveryPercentage;

    // Pénalité pour les muscles avec historique de blessure
    if (profile.injury_history.includes(muscleGroup)) {
      baseScore *= 0.9;
    }

    // Bonus pour les petits groupes musculaires (récupèrent plus vite)
    const smallMuscles: MuscleGroup[] = ['biceps', 'triceps', 'forearms', 'calves', 'core'];
    if (smallMuscles.includes(muscleGroup)) {
      baseScore *= 1.1;
    }

    // Impact des facteurs globaux
    baseScore *= profile.sleep_quality_impact;
    baseScore *= profile.nutrition_quality_impact;
    baseScore *= profile.age_factor;

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  // === RECOMMANDATIONS ===
  static async generateRecoveryRecommendations(
    muscleRecoveryData: MuscleRecoveryData[],
    userProfile: UserProfile
  ): Promise<RecoveryRecommendation[]> {
    const recommendations: RecoveryRecommendation[] = [];

    for (const muscle of muscleRecoveryData) {
      if (muscle.recovery_percentage < 70) {
        // Muscle a besoin de récupération
        if (muscle.recovery_percentage < 30) {
          recommendations.push({
            muscle_group: muscle.muscle_group,
            recommendation_type: 'rest',
            priority: 'critical',
            message: `${muscle.muscle_group} est en surmenage. Repos complet recommandé.`,
            estimated_benefit: 90,
            specific_actions: [
              'Éviter tout exercice sollicitant ce groupe musculaire',
              'Appliquer de la glace si inflammation',
              'Massage léger ou auto-massage',
              'Étirements très doux uniquement',
            ],
          });
        } else if (muscle.recovery_percentage < 50) {
          recommendations.push({
            muscle_group: muscle.muscle_group,
            recommendation_type: 'light_activity',
            priority: 'high',
            message: `${muscle.muscle_group} a besoin de récupération active.`,
            estimated_benefit: 70,
            duration_minutes: 15,
            specific_actions: [
              'Exercices de mobilité douce',
              'Marche légère',
              'Étirements dynamiques légers',
              'Échauffement prolongé avant exercice',
            ],
          });
        } else {
          recommendations.push({
            muscle_group: muscle.muscle_group,
            recommendation_type: 'stretching',
            priority: 'medium',
            message: `${muscle.muscle_group} bénéficierait d'étirements et de mobilité.`,
            estimated_benefit: 50,
            duration_minutes: 10,
            specific_actions: [
              'Étirements statiques 30 secondes',
              'Rouleau de massage (foam rolling)',
              'Exercices de mobilité articulaire',
            ],
          });
        }
      }

      // Recommandations nutritionnelles pour la récupération
      if (muscle.soreness_level > 6) {
        recommendations.push({
          muscle_group: muscle.muscle_group,
          recommendation_type: 'nutrition',
          priority: 'medium',
          message: "Optimiser la nutrition pour réduire l'inflammation.",
          estimated_benefit: 60,
          specific_actions: [
            'Consommer des protéines dans les 2h post-entraînement',
            'Aliments anti-inflammatoires (curcuma, gingembre)',
            'Hydratation accrue',
            'Oméga-3 (poisson, noix)',
          ],
        });
      }

      // Recommandations de sommeil
      if (muscle.recovery_percentage < 60 && muscle.fatigue_level > 6) {
        recommendations.push({
          muscle_group: muscle.muscle_group,
          recommendation_type: 'sleep',
          priority: 'high',
          message: 'Le sommeil est crucial pour la récupération musculaire.',
          estimated_benefit: 80,
          duration_minutes: 480, // 8 heures
          specific_actions: [
            'Viser 8-9h de sommeil de qualité',
            'Éviter les écrans 1h avant le coucher',
            'Température fraîche dans la chambre',
            'Routine de relaxation avant le coucher',
          ],
        });
      }
    }

    // Trier par priorité et bénéfice estimé
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimated_benefit - a.estimated_benefit;
    });
  }

  // === MÉTRIQUES GLOBALES ===
  static calculateGlobalRecoveryMetrics(
    muscleRecoveryData: MuscleRecoveryData[]
  ): GlobalRecoveryMetrics {
    if (muscleRecoveryData.length === 0) {
      return {
        overall_recovery_score: 100,
        most_recovered_muscle: 'core',
        least_recovered_muscle: 'core',
        ready_for_training: [],
        needs_rest: [],
        optimal_workout_type: 'light_cardio',
        recovery_trend: 'stable',
        last_calculated: new Date().toISOString(),
      };
    }

    // Score global de récupération (moyenne pondérée)
    const totalScore = muscleRecoveryData.reduce(
      (sum, muscle) => sum + muscle.recovery_percentage,
      0
    );
    const overallScore = Math.round(totalScore / muscleRecoveryData.length);

    // Muscle le plus et le moins récupéré
    const sortedByRecovery = [...muscleRecoveryData].sort(
      (a, b) => b.recovery_percentage - a.recovery_percentage
    );
    const mostRecovered = sortedByRecovery[0].muscle_group;
    const leastRecovered = sortedByRecovery[sortedByRecovery.length - 1].muscle_group;

    // Muscles prêts pour l'entraînement (>80% récupération)
    const readyForTraining = muscleRecoveryData
      .filter(muscle => muscle.recovery_percentage > 80)
      .map(muscle => muscle.muscle_group);

    // Muscles ayant besoin de repos (<60% récupération)
    const needsRest = muscleRecoveryData
      .filter(muscle => muscle.recovery_percentage < 60)
      .map(muscle => muscle.muscle_group);

    // Type d'entraînement optimal
    let optimalWorkoutType = 'rest';
    if (readyForTraining.length >= 6) {
      optimalWorkoutType = 'full_body';
    } else if (readyForTraining.length >= 4) {
      optimalWorkoutType = 'upper_lower_split';
    } else if (readyForTraining.length >= 2) {
      optimalWorkoutType = 'targeted_training';
    } else if (overallScore > 70) {
      optimalWorkoutType = 'light_cardio';
    }

    return {
      overall_recovery_score: overallScore,
      most_recovered_muscle: mostRecovered,
      least_recovered_muscle: leastRecovered,
      ready_for_training: readyForTraining,
      needs_rest: needsRest,
      optimal_workout_type: optimalWorkoutType,
      recovery_trend: 'stable', // À calculer avec l'historique
      last_calculated: new Date().toISOString(),
    };
  }

  // === SAUVEGARDE EN BASE ===
  static async saveMuscleRecoveryData(
    userId: string,
    recoveryData: MuscleRecoveryData[]
  ): Promise<boolean> {
    try {
      // Supprimer les anciennes données
      await supabase.from('muscle_recovery_data').delete().eq('user_id', userId);

      // Insérer les nouvelles données
      const dataToInsert = recoveryData.map(data => ({
        user_id: userId,
        ...data,
      }));

      const { error } = await supabase.from('muscle_recovery_data').insert(dataToInsert);

      if (error) throw error;
      return true;
    } catch {
      // Erreur silencieuse
      console.error('Error saving muscle recovery data:', error);
      return false;
    }
  }

  static async getMuscleRecoveryData(userId: string): Promise<MuscleRecoveryData[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('muscle_recovery_data')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Error fetching muscle recovery data:', error);
      return [];
    }
  }
}
