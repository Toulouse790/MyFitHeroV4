/**
 * Configuration MSW (Mock Service Worker) pour les tests
 * Handlers pour toutes les API Supabase mockées
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { 
  createMockUser, 
  createMockWorkout, 
  createMockExercise, 
  createMockChallenge 
} from '../test-utils';

// Base URL pour l'API Supabase (à adapter selon votre config)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

// Handlers pour les endpoints d'authentification
const authHandlers = [
  // Sign in
  http.post(`${SUPABASE_URL}/auth/v1/token`, ({ request }) => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: createMockUser(),
    });
  }),

  // Sign up
  http.post(`${SUPABASE_URL}/auth/v1/signup`, ({ request }) => {
    return HttpResponse.json({
      user: createMockUser(),
      session: {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
      },
    });
  }),

  // Get user
  http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(createMockUser());
  }),

  // Sign out
  http.post(`${SUPABASE_URL}/auth/v1/logout`, ({ request }) => {
    return HttpResponse.json({}, { status: 204 });
  }),
];

// Handlers pour les workouts
const workoutHandlers = [
  // Get workouts
  http.get(`${SUPABASE_URL}/rest/v1/workouts`, ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get('select');
    
    const mockWorkouts = [
      createMockWorkout({ id: '1', name: 'Upper Body Strength' }),
      createMockWorkout({ id: '2', name: 'Lower Body Power' }),
      createMockWorkout({ id: '3', name: 'Full Body HIIT' }),
    ];

    return HttpResponse.json(mockWorkouts);
  }),

  // Get single workout
  http.get(`${SUPABASE_URL}/rest/v1/workouts`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      return HttpResponse.json([createMockWorkout({ id })]);
    }
    
    return HttpResponse.json([]);
  }),

  // Create workout
  http.post(`${SUPABASE_URL}/rest/v1/workouts`, async ({ request }) => {
    const body = await request.json();
    const newWorkout = createMockWorkout({ 
      id: 'new-workout-id',
      ...body 
    });
    return HttpResponse.json([newWorkout], { status: 201 });
  }),

  // Update workout
  http.patch(`${SUPABASE_URL}/rest/v1/workouts`, async ({ request }) => {
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const updatedWorkout = createMockWorkout({ 
      id,
      ...body 
    });
    return HttpResponse.json([updatedWorkout]);
  }),

  // Delete workout
  http.delete(`${SUPABASE_URL}/rest/v1/workouts`, ({ request }) => {
    return HttpResponse.json({}, { status: 204 });
  }),
];

// Handlers pour les exercises
const exerciseHandlers = [
  // Get exercises
  http.get(`${SUPABASE_URL}/rest/v1/exercises`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('name');
    const muscleGroup = url.searchParams.get('muscle_groups');
    
    let mockExercises = [
      createMockExercise({ 
        id: '1', 
        name: 'Push-ups', 
        muscle_groups: ['chest', 'triceps'] 
      }),
      createMockExercise({ 
        id: '2', 
        name: 'Squats', 
        muscle_groups: ['quadriceps', 'glutes'] 
      }),
      createMockExercise({ 
        id: '3', 
        name: 'Pull-ups', 
        muscle_groups: ['back', 'biceps'] 
      }),
    ];

    // Filtrage par recherche
    if (search) {
      mockExercises = mockExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrage par groupe musculaire
    if (muscleGroup) {
      mockExercises = mockExercises.filter(exercise =>
        exercise.muscle_groups.includes(muscleGroup)
      );
    }

    return HttpResponse.json(mockExercises);
  }),

  // Get single exercise
  http.get(`${SUPABASE_URL}/rest/v1/exercises`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      return HttpResponse.json([createMockExercise({ id })]);
    }
    
    return HttpResponse.json([]);
  }),
];

// Handlers pour les challenges
const challengeHandlers = [
  // Get challenges
  http.get(`${SUPABASE_URL}/rest/v1/challenges`, ({ request }) => {
    const mockChallenges = [
      createMockChallenge({ 
        id: '1', 
        title: '30-Day Push-up Challenge',
        category: 'strength' 
      }),
      createMockChallenge({ 
        id: '2', 
        title: 'Marathon Training',
        category: 'cardio' 
      }),
      createMockChallenge({ 
        id: '3', 
        title: 'Flexibility Focus',
        category: 'flexibility' 
      }),
    ];

    return HttpResponse.json(mockChallenges);
  }),

  // Join challenge
  http.post(`${SUPABASE_URL}/rest/v1/user_challenges`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json([{
      id: 'new-user-challenge',
      user_id: body.user_id,
      challenge_id: body.challenge_id,
      joined_at: new Date().toISOString(),
      completed: false,
      progress: 0,
    }], { status: 201 });
  }),
];

// Handlers pour les données utilisateur
const userDataHandlers = [
  // Get user profile
  http.get(`${SUPABASE_URL}/rest/v1/user_profiles`, ({ request }) => {
    return HttpResponse.json([{
      id: 'profile-123',
      user_id: 'user-123',
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: '1990-01-01',
      height: 175,
      weight: 70,
      fitness_level: 'intermediate',
      goals: ['weight_loss', 'muscle_gain'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }]);
  }),

  // Update user profile
  http.patch(`${SUPABASE_URL}/rest/v1/user_profiles`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json([{
      id: 'profile-123',
      user_id: 'user-123',
      ...body,
      updated_at: new Date().toISOString(),
    }]);
  }),
];

// Handlers pour simuler les erreurs
const errorHandlers = [
  // Erreur réseau générique
  http.get(`${SUPABASE_URL}/rest/v1/error`, ({ request }) => {
    return HttpResponse.json(
      { error: 'Internal Server Error', message: 'Something went wrong' },
      { status: 500 }
    );
  }),

  // Erreur d'authentification
  http.get(`${SUPABASE_URL}/rest/v1/auth-error`, ({ request }) => {
    return HttpResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }),

  // Erreur de validation
  http.post(`${SUPABASE_URL}/rest/v1/validation-error`, ({ request }) => {
    return HttpResponse.json(
      { 
        error: 'Validation Error', 
        message: 'Invalid input data',
        details: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' },
        ]
      },
      { status: 400 }
    );
  }),
];

// Combinaison de tous les handlers
export const handlers = [
  ...authHandlers,
  ...workoutHandlers,
  ...exerciseHandlers,
  ...challengeHandlers,
  ...userDataHandlers,
  ...errorHandlers,
];

// Configuration du serveur MSW
export const server = setupServer(...handlers);
