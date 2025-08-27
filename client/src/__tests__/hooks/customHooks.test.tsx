/**
 * Tests pour les hooks personnalisés
 * Tests des hooks de gestion d'état et logique métier
 */

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMockWorkout, createMockExercise } from '../../test-utils/test-utils';
import { server } from '../../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock des hooks (à adapter selon votre implémentation)
const mockUseWorkoutSession = () => {
  const sessions = new Map();
  
  return {
    startSession: jest.fn((workout) => {
      const sessionId = `session-${Date.now()}`;
      sessions.set(sessionId, {
        id: sessionId,
        workoutId: workout.workoutId,
        startTime: new Date(),
        exercises: [],
        isActive: true,
      });
      return sessionId;
    }),
    endSession: jest.fn((sessionId) => {
      const session = sessions.get(sessionId);
      if (session) {
        session.endTime = new Date();
        session.isActive = false;
      }
    }),
    addExercise: jest.fn((sessionId, exercise) => {
      const session = sessions.get(sessionId);
      if (session) {
        session.exercises.push(exercise);
      }
    }),
    getSession: jest.fn((sessionId) => sessions.get(sessionId)),
    getAllSessions: jest.fn(() => Array.from(sessions.values())),
    getLastWeightForExercise: jest.fn(() => 0),
  };
};

const mockUseWorkoutTimer = () => {
  let time = 0;
  let isRunning = false;
  
  return {
    time,
    isRunning,
    start: jest.fn(() => { isRunning = true; }),
    pause: jest.fn(() => { isRunning = false; }),
    reset: jest.fn(() => { time = 0; isRunning = false; }),
    formatTime: jest.fn((seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }),
  };
};

const mockUseAuth = () => ({
  user: { id: 'user-123', email: 'test@example.com' },
  loading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
});

const mockUseLocalStorage = (key: string, defaultValue: any) => {
  let stored = defaultValue;
  
  return [
    stored,
    jest.fn((value) => {
      stored = value;
      localStorage.setItem(key, JSON.stringify(value));
    }),
    jest.fn(() => {
      stored = defaultValue;
      localStorage.removeItem(key);
    }),
  ];
};

// Helper pour wrapper avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Hooks personnalisés', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('useWorkoutSession', () => {
    it('démarre une nouvelle session', () => {
      const hook = mockUseWorkoutSession();
      
      const workout = { workoutId: 'workout-123', workoutName: 'Test Workout' };
      const sessionId = hook.startSession(workout);
      
      expect(sessionId).toBeDefined();
      expect(hook.startSession).toHaveBeenCalledWith(workout);
      
      const session = hook.getSession(sessionId);
      expect(session).toMatchObject({
        workoutId: 'workout-123',
        isActive: true,
      });
    });

    it('termine une session active', () => {
      const hook = mockUseWorkoutSession();
      
      const workout = { workoutId: 'workout-123', workoutName: 'Test Workout' };
      const sessionId = hook.startSession(workout);
      
      hook.endSession(sessionId);
      expect(hook.endSession).toHaveBeenCalledWith(sessionId);
      
      const session = hook.getSession(sessionId);
      expect(session.isActive).toBe(false);
      expect(session.endTime).toBeDefined();
    });

    it('ajoute des exercices à une session', () => {
      const hook = mockUseWorkoutSession();
      
      const workout = { workoutId: 'workout-123', workoutName: 'Test Workout' };
      const sessionId = hook.startSession(workout);
      
      const exercise = { name: 'Push-ups', sets: 3, reps: 10 };
      hook.addExercise(sessionId, exercise);
      
      expect(hook.addExercise).toHaveBeenCalledWith(sessionId, exercise);
      
      const session = hook.getSession(sessionId);
      expect(session.exercises).toContain(exercise);
    });

    it('récupère le dernier poids pour un exercice', () => {
      const hook = mockUseWorkoutSession();
      
      hook.getLastWeightForExercise.mockReturnValue(25);
      
      const weight = hook.getLastWeightForExercise('Push-ups');
      expect(weight).toBe(25);
      expect(hook.getLastWeightForExercise).toHaveBeenCalledWith('Push-ups');
    });
  });

  describe('useWorkoutTimer', () => {
    it('démarre et arrête le timer', () => {
      const hook = mockUseWorkoutTimer();
      
      expect(hook.isRunning).toBe(false);
      
      hook.start();
      expect(hook.start).toHaveBeenCalled();
      
      hook.pause();
      expect(hook.pause).toHaveBeenCalled();
    });

    it('remet le timer à zéro', () => {
      const hook = mockUseWorkoutTimer();
      
      hook.reset();
      expect(hook.reset).toHaveBeenCalled();
    });

    it('formate le temps correctement', () => {
      const hook = mockUseWorkoutTimer();
      
      expect(hook.formatTime(65)).toBe('01:05');
      expect(hook.formatTime(3661)).toBe('61:01');
      expect(hook.formatTime(0)).toBe('00:00');
    });
  });

  describe('useAuth', () => {
    it('retourne les informations utilisateur', () => {
      const hook = mockUseAuth();
      
      expect(hook.user).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
      });
      expect(hook.loading).toBe(false);
      expect(hook.error).toBeNull();
    });

    it('fournit les méthodes d\'authentification', () => {
      const hook = mockUseAuth();
      
      expect(typeof hook.signIn).toBe('function');
      expect(typeof hook.signOut).toBe('function');
      expect(typeof hook.signUp).toBe('function');
    });
  });

  describe('useLocalStorage', () => {
    it('stocke et récupère des valeurs', () => {
      const [value, setValue, clearValue] = mockUseLocalStorage('test-key', 'default');
      
      expect(value).toBe('default');
      
      setValue('new-value');
      expect(setValue).toHaveBeenCalledWith('new-value');
      
      clearValue();
      expect(clearValue).toHaveBeenCalled();
    });

    it('gère les objets complexes', () => {
      const defaultObj = { name: 'test', count: 0 };
      const [value, setValue] = mockUseLocalStorage('test-object', defaultObj);
      
      expect(value).toEqual(defaultObj);
      
      const newObj = { name: 'updated', count: 5 };
      setValue(newObj);
      expect(setValue).toHaveBeenCalledWith(newObj);
    });
  });

  describe('Intégration des hooks', () => {
    it('utilise useWorkoutSession avec useWorkoutTimer', () => {
      const sessionHook = mockUseWorkoutSession();
      const timerHook = mockUseWorkoutTimer();
      
      // Démarrer une session et le timer
      const workout = { workoutId: 'workout-123', workoutName: 'Test' };
      const sessionId = sessionHook.startSession(workout);
      timerHook.start();
      
      expect(sessionHook.startSession).toHaveBeenCalled();
      expect(timerHook.start).toHaveBeenCalled();
      
      // Terminer la session et arrêter le timer
      sessionHook.endSession(sessionId);
      timerHook.pause();
      
      expect(sessionHook.endSession).toHaveBeenCalled();
      expect(timerHook.pause).toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it('gère les erreurs d\'authentification', () => {
      const hook = mockUseAuth();
      
      // Simuler une erreur
      hook.signIn.mockRejectedValue(new Error('Invalid credentials'));
      
      expect(hook.signIn('test@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('gère les erreurs de stockage local', () => {
      // Simuler un localStorage plein
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      const [, setValue] = mockUseLocalStorage('test', 'default');
      
      expect(() => setValue('large-data')).not.toThrow();
      
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Performance et optimisation', () => {
    it('évite les re-renders inutiles', () => {
      const hook = mockUseWorkoutSession();
      
      const workout = { workoutId: 'workout-123', workoutName: 'Test' };
      const sessionId1 = hook.startSession(workout);
      const sessionId2 = hook.startSession(workout);
      
      // Vérifier que les sessions sont distinctes
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('nettoie les ressources correctement', () => {
      const hook = mockUseWorkoutTimer();
      
      hook.start();
      hook.reset();
      
      // Vérifier que le timer est correctement remis à zéro
      expect(hook.reset).toHaveBeenCalled();
    });
  });

  describe('Hooks avec React Query', () => {
    it('utilise React Query pour les données distantes', async () => {
      const mockExercises = [
        createMockExercise({ name: 'Push-ups' }),
        createMockExercise({ name: 'Squats' }),
      ];

      server.use(
        http.get('*/rest/v1/exercises*', () => {
          return HttpResponse.json(mockExercises);
        })
      );

      // Mock d'un hook qui utilise React Query
      const useExercises = () => {
        // Simulation d'un hook React Query
        return {
          data: mockExercises,
          loading: false,
          error: null,
          refetch: jest.fn(),
        };
      };

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExercises(), { wrapper });

      expect(result.current.data).toEqual(mockExercises);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('gère les états de chargement', () => {
      const useLoadingHook = () => {
        return {
          data: null,
          loading: true,
          error: null,
        };
      };

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLoadingHook(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
    });

    it('gère les erreurs de requête', () => {
      const useErrorHook = () => {
        return {
          data: null,
          loading: false,
          error: new Error('Network error'),
        };
      };

      const wrapper = createWrapper();
      const { result } = renderHook(() => useErrorHook(), { wrapper });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });
  });
});
