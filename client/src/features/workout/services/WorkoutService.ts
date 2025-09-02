import type {
  Workout,
  WorkoutSession,
  
  CreateWorkoutData,
  UpdateWorkoutData,
  WorkoutStats,
  WorkoutTemplate,
  
  WorkoutProgress,
  WorkoutFilters,
  WorkoutSearchQuery,
} from '../types/WorkoutTypes';

export class WorkoutService {
  private static readonly BASE_URL = '/api/workouts';

  // === GESTION DES WORKOUTS ===

  // Récupération des workouts d'un utilisateur
  static async getWorkouts(userId: string, filters?: WorkoutFilters): Promise<Workout[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.BASE_URL}/user/${userId}?${params}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des workouts');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.getWorkouts:', error);
      return this.getMockWorkouts();
    }
  }

  // Création d'un nouveau workout
  static async createWorkout(userId: string, data: CreateWorkoutData): Promise<Workout> {
    try {
      const response = await fetch(`${this.BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!response.ok) throw new Error('Erreur lors de la création du workout');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.createWorkout:', error);
      throw error;
    }
  }

  // Mise à jour d'un workout
  static async updateWorkout(workoutId: string, data: UpdateWorkoutData): Promise<Workout> {
    try {
      const response = await fetch(`${this.BASE_URL}/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du workout');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.updateWorkout:', error);
      throw error;
    }
  }

  // Suppression d'un workout
  static async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${workoutId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression du workout');
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.deleteWorkout:', error);
      throw error;
    }
  }

  // === GESTION DES SESSIONS ===

  // Démarrage d'une session de workout
  static async startWorkoutSession(userId: string, workoutId: string): Promise<WorkoutSession> {
    try {
      const response = await fetch(`${this.BASE_URL}/${workoutId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Erreur lors du démarrage de la session');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.startWorkoutSession:', error);
      return this.getMockWorkoutSession(workoutId, userId);
    }
  }

  // Pause d'une session
  static async pauseWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    try {
      const response = await fetch(`${this.BASE_URL}/sessions/${sessionId}/pause`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erreur lors de la pause de la session');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.pauseWorkoutSession:', error);
      throw error;
    }
  }

  // Reprise d'une session
  static async resumeWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    try {
      const response = await fetch(`${this.BASE_URL}/sessions/${sessionId}/resume`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erreur lors de la reprise de la session');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.resumeWorkoutSession:', error);
      throw error;
    }
  }

  // Finalisation d'une session
  static async completeWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    try {
      const response = await fetch(`${this.BASE_URL}/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erreur lors de la finalisation de la session');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.completeWorkoutSession:', error);
      throw error;
    }
  }

  // Annulation d'une session
  static async cancelWorkoutSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/sessions/${sessionId}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Erreur lors de l'annulation de la session");
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.cancelWorkoutSession:', error);
      throw error;
    }
  }

  // Enregistrement d'un exercice
  static async logExercise(
    sessionId: string,
    exerciseId: string,
    data: { sets: number; reps: number; weight?: number; duration?: number }
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/sessions/${sessionId}/exercises/${exerciseId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement de l'exercice");
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.logExercise:', error);
      throw error;
    }
  }

  // === STATISTIQUES ===

  // Récupération des statistiques
  static async getWorkoutStats(userId: string): Promise<WorkoutStats> {
    try {
      const response = await fetch(`${this.BASE_URL}/stats/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.getWorkoutStats:', error);
      return this.getMockWorkoutStats();
    }
  }

  // Progression d'un exercice
  static async getExerciseProgress(userId: string, exerciseId: string): Promise<WorkoutProgress> {
    try {
      const response = await fetch(`${this.BASE_URL}/progress/${userId}/exercise/${exerciseId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération de la progression');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.getExerciseProgress:', error);
      return this.getMockExerciseProgress();
    }
  }

  // === RECHERCHE ET TEMPLATES ===

  // Recherche de workouts
  static async searchWorkouts(query: WorkoutSearchQuery): Promise<Workout[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (!response.ok) throw new Error('Erreur lors de la recherche');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.searchWorkouts:', error);
      return this.getMockWorkouts();
    }
  }

  // Templates populaires
  static async getPopularTemplates(): Promise<WorkoutTemplate[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/templates/popular`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des templates');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur WorkoutService.getPopularTemplates:', error);
      return this.getMockWorkoutTemplates();
    }
  }

  // === DONNÉES DE MOCK ===

  private static getMockWorkouts(): Workout[] {
    return [
      {
        id: '1',
        name: 'Push Day - Poitrine & Triceps',
        description: 'Workout focalisé sur le haut du corps',
        duration: 60,
        difficulty: 'intermediate',
        category: 'strength',
        exercises: [
          {
            id: 'ex1',
            name: 'Développé couché',
            description: 'Exercice de base pour la poitrine',
            sets: 4,
            reps: 8,
            weight: 80,
            restTime: 120,
            instructions: ['Allongez-vous sur le banc', 'Descendez la barre lentement'],
            muscleGroups: ['chest', 'triceps'],
          },
          {
            id: 'ex2',
            name: 'Dips',
            description: 'Exercice au poids du corps',
            sets: 3,
            reps: 12,
            restTime: 90,
            instructions: ['Descendez lentement', 'Remontez en contractant'],
            muscleGroups: ['chest', 'triceps'],
          },
        ],
        tags: ['force', 'haut du corps'],
        equipment: [],
        caloriesBurned: 350,
        isPublic: true,
        createdBy: 'coach1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  }

  private static getMockWorkoutSession(workoutId: string, userId: string): WorkoutSession {
    return {
      id: 'session-' + Date.now(),
      workoutId,
      userId,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      exercises: [],
    };
  }

  private static getMockWorkoutStats(): WorkoutStats {
    return {
      totalWorkouts: 45,
      totalDuration: 2700, // 45 heures
      totalCaloriesBurned: 15750,
      averageWorkoutDuration: 60,
      currentStreak: 12,
      longestStreak: 28,
      favoriteExercises: [],
      weeklyStats: [],
      monthlyStats: [],
      muscleGroupDistribution: {
        chest: 15,
        back: 12,
        shoulders: 10,
        biceps: 8,
        triceps: 8,
        forearms: 3,
        abs: 6,
        obliques: 4,
        lower_back: 5,
        quadriceps: 12,
        hamstrings: 8,
        glutes: 10,
        calves: 6,
        full_body: 3,
        core: 8,
      },
    };
  }

  private static getMockExerciseProgress(): WorkoutProgress {
    return {
      exerciseId: 'ex1',
      historicalData: [
        {
          date: '2024-01-01',
          sets: 4,
          reps: 8,
          weight: 75,
          volume: 2400,
        },
        {
          date: '2024-01-03',
          sets: 4,
          reps: 8,
          weight: 80,
          volume: 2560,
        },
      ],
      personalBest: {
        maxWeight: 85,
        maxReps: 10,
        maxVolume: 2720,
        achievedAt: '2024-01-05T00:00:00Z',
      },
      trend: 'improving',
    };
  }

  private static getMockWorkoutTemplates(): WorkoutTemplate[] {
    return [
      {
        id: 'template1',
        name: 'Débutant Full Body',
        description: 'Workout complet pour débutants',
        exercises: [],
        difficulty: 'beginner',
        estimatedDuration: 45,
        targetMuscleGroups: ['full_body'],
        equipment: [],
        isPublic: true,
        rating: 4.5,
        usageCount: 1250,
      },
    ];
  }
}
