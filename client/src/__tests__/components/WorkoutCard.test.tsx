/**
 * Tests pour WorkoutCard
 * Tests du composant de carte d'entraînement
 * @jest-environment jsdom
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { render, userEvent } from '../../test-utils/test-utils';
import { WorkoutCard } from '../../components/WorkoutCard';

// Mock des hooks personnalisés
const mockStartSession = jest.fn();
const mockAddExercise = jest.fn();
const mockGetLastWeight = jest.fn();
const mockToast = jest.fn();

jest.mock('../../hooks/workout/useWorkoutSession', () => ({
  useWorkoutSession: () => ({
    startSession: mockStartSession,
    addExercise: mockAddExercise,
    getLastWeightForExercise: mockGetLastWeight,
    currentSession: null,
    isSessionActive: false,
  }),
}));

jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockWorkout = {
  id: 1,
  title: 'Upper Body Strength',
  duration: 45,
  difficulty: 'intermediate',
  calories: 350,
  category: 'strength',
  tags: ['chest', 'arms'],
  description: 'Complete upper body workout focusing on chest and arms',
  exerciseList: ['Push-ups', 'Pull-ups', 'Dips'],
  rating: 4.5,
  participants: 128,
  emoji: '💪',
};

const mockOnStartWorkout = jest.fn();

describe('WorkoutCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLastWeight.mockReturnValue(0);
  });

  describe('Rendu initial', () => {
    it('affiche les informations de base du workout', () => {
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
      expect(
        screen.getByText('Complete upper body workout focusing on chest and arms')
      ).toBeInTheDocument();
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByText('350 cal')).toBeInTheDocument();
      expect(screen.getByText('128')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('💪')).toBeInTheDocument();
    });

    it('affiche les tags et badges', () => {
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('chest')).toBeInTheDocument();
      expect(screen.getByText('arms')).toBeInTheDocument();
    });

    it('ne montre pas les exercices par défaut', () => {
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();
      expect(screen.queryByText('Pull-ups')).not.toBeInTheDocument();
      expect(screen.queryByText('Dips')).not.toBeInTheDocument();
    });
  });

  describe("Interaction d'expansion", () => {
    it("s'étend quand on clique sur l'en-tête", async () => {
      const user = userEvent.setup();
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      // La liste d'exercices ne devrait pas être visible initialement
      expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();

      // Cliquer sur l'en-tête pour étendre - utiliser un élément plus spécifique
      const cardHeader = screen.getByText('Upper Body Strength');
      await user.click(cardHeader);

      // Vérifier que la liste d'exercices est maintenant visible
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
      expect(screen.getByText('Pull-ups')).toBeInTheDocument();
      expect(screen.getByText('Dips')).toBeInTheDocument();
    });
  });

  describe("Démarrage d'entraînement", () => {
    it("affiche les boutons d'action quand étendu", async () => {
      const user = userEvent.setup();
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      // Étendre la carte
      const cardHeader = screen.getByText('Upper Body Strength');
      await user.click(cardHeader);

      // Vérifier que les boutons sont visibles
      expect(screen.getByRole('button', { name: /démarrer l'entraînement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /aperçu rapide/i })).toBeInTheDocument();
    });

    it('démarre un entraînement personnalisé', async () => {
      const user = userEvent.setup();
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      // Étendre la carte
      const cardHeader = screen.getByText('Upper Body Strength');
      await user.click(cardHeader);

      // Cliquer sur démarrer l'entraînement
      const startButton = screen.getByRole('button', { name: /démarrer l'entraînement/i });
      await user.click(startButton);

      expect(mockStartSession).toHaveBeenCalledWith('Upper Body Strength', 45);
      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe('Gestion des exercices', () => {
    it('affiche les contrôles pour chaque exercice quand étendu', async () => {
      const user = userEvent.setup();
      render(<WorkoutCard workout={mockWorkout} onStartWorkout={mockOnStartWorkout} />);

      // Étendre la carte
      const cardHeader = screen.getByText('Upper Body Strength');
      await user.click(cardHeader);

      // Vérifier que chaque exercice a ses contrôles
      mockWorkout.exerciseList.forEach(exercise => {
        expect(screen.getByText(exercise)).toBeInTheDocument();
      });

      // Vérifier qu'il y a des contrôles pour sets, reps, weight
      expect(screen.getAllByText('Séries')).toHaveLength(3);
      expect(screen.getAllByText('Reps')).toHaveLength(3);
      expect(screen.getAllByText('Poids (kg)')).toHaveLength(3);
    });
  });

  describe('Cas limites', () => {
    it('gère les workouts sans exercices', () => {
      const emptyWorkout = { ...mockWorkout, exerciseList: [] };
      render(<WorkoutCard workout={emptyWorkout} onStartWorkout={mockOnStartWorkout} />);

      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
    });

    it('gère les valeurs numériques manquantes', () => {
      const incompleteWorkout = {
        ...mockWorkout,
        duration: 0,
        calories: 0,
        rating: 0,
        participants: 0,
      };

      render(<WorkoutCard workout={incompleteWorkout} onStartWorkout={mockOnStartWorkout} />);

      expect(screen.getByText('0 min')).toBeInTheDocument();
      expect(screen.getByText('0 cal')).toBeInTheDocument();
    });
  });
});
