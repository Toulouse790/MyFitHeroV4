import { api } from '@/services/api.service';
import type { Workout, WorkoutSession, CreateWorkoutDTO, UpdateWorkoutDTO } from '../types';

export class WorkoutService {
  /**
   * Récupère les workouts d'un utilisateur
   */
  static async getWorkouts(userId: string): Promise<Workout[]> {
    const response = await api.get(`/workouts?userId=${userId}`);
    return response.data;
  }

  /**
   * Récupère un workout par son ID
   */
  static async getWorkoutById(id: string): Promise<Workout> {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  }

  /**
   * Crée un nouveau workout
   */
  static async createWorkout(data: CreateWorkoutDTO): Promise<Workout> {
    const response = await api.post('/workouts', data);
    return response.data;
  }

  /**
   * Met à jour un workout existant
   */
  static async updateWorkout(id: string, data: UpdateWorkoutDTO): Promise<Workout> {
    const response = await api.put(`/workouts/${id}`, data);
    return response.data;
  }

  /**
   * Supprime un workout
   */
  static async deleteWorkout(id: string): Promise<void> {
    await api.delete(`/workouts/${id}`);
  }

  /**
   * Démarre une session d'entraînement
   */
  static async startSession(workoutId: string): Promise<WorkoutSession> {
    const response = await api.post(`/workouts/${workoutId}/sessions`, {
      startTime: new Date().toISOString(),
    });
    return response.data;
  }

  /**
   * Termine une session d'entraînement
   */
  static async completeSession(sessionId: string, summary: any): Promise<WorkoutSession> {
    const response = await api.put(`/workout-sessions/${sessionId}`, {
      endTime: new Date().toISOString(),
      summary,
      status: 'completed',
    });
    return response.data;
  }

  /**
   * Récupère l'historique des sessions
   */
  static async getSessionHistory(userId: string, limit = 10): Promise<WorkoutSession[]> {
    const response = await api.get(`/workout-sessions?userId=${userId}&limit=${limit}`);
    return response.data;
  }

  /**
   * Récupère les workouts recommandés
   */
  static async getRecommendedWorkouts(userId: string): Promise<Workout[]> {
    const response = await api.get(`/workouts/recommended?userId=${userId}`);
    return response.data;
  }
}
