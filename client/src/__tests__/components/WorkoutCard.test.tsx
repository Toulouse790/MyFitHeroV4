/**
 * Tests pour WorkoutCard
 * Tests du composant de carte d'entraînement
 */

import React from 'react';
import { screen, within } from '@testing-library/react';
import { render, userEvent, createMockWorkout } from '../../test-utils/test-utils';
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

  describe('Affichage des informations', () => {
    it('affiche toutes les informations de base du workout', () => {
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
      expect(screen.getByText('💪')).toBeInTheDocument();
      expect(screen.getByText(/45.*min/i)).toBeInTheDocument();
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText(/350.*cal/i)).toBeInTheDocument();
      expect(screen.getByText('strength')).toBeInTheDocument();
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
      expect(screen.getByText(/128.*participants/i)).toBeInTheDocument();
    });

    it('affiche les tags du workout', () => {
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      expect(screen.getByText('chest')).toBeInTheDocument();
      expect(screen.getByText('arms')).toBeInTheDocument();
    });

    it('affiche la description du workout', () => {
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      expect(screen.getByText('Complete upper body workout focusing on chest and arms')).toBeInTheDocument();
    });
  });

  describe('Interaction d\'expansion', () => {
    it('s\'étend pour montrer plus de détails', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // La liste d'exercices ne devrait pas être visible initialement
      expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();

      // Cliquer pour étendre
      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      // Vérifier que la liste d'exercices est maintenant visible
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
      expect(screen.getByText('Pull-ups')).toBeInTheDocument();
      expect(screen.getByText('Dips')).toBeInTheDocument();
    });

    it('se contracte pour cacher les détails', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Étendre d'abord
      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      expect(screen.getByText('Push-ups')).toBeInTheDocument();

      // Puis contracter
      const collapseButton = screen.getByRole('button', { name: /voir moins|collapse/i });
      await user.click(collapseButton);

      expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();
    });
  });

  describe('Démarrage d\'entraînement', () => {
    it('appelle onStartWorkout quand le bouton start est cliqué', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const startButton = screen.getByRole('button', { name: /commencer.*entraînement|start.*workout/i });
      await user.click(startButton);

      expect(mockOnStartWorkout).toHaveBeenCalledWith(mockWorkout);
    });

    it('démarre une session via le hook', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const startButton = screen.getByRole('button', { name: /commencer.*entraînement|start.*workout/i });
      await user.click(startButton);

      expect(mockStartSession).toHaveBeenCalledWith(
        expect.objectContaining({
          workoutId: mockWorkout.id,
          workoutName: mockWorkout.title,
        })
      );
    });
  });

  describe('Gestion des exercices', () => {
    it('affiche les contrôles pour chaque exercice quand étendu', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Étendre la carte
      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      // Vérifier les contrôles pour chaque exercice
      mockWorkout.exerciseList.forEach(exercise => {
        expect(screen.getByText(exercise)).toBeInTheDocument();
        
        // Chercher les contrôles dans le conteneur de cet exercice
        const exerciseContainer = screen.getByText(exercise).closest('[data-testid=\"exercise-item\"]');
        if (exerciseContainer) {
          expect(within(exerciseContainer).getByLabelText(/séries|sets/i)).toBeInTheDocument();
          expect(within(exerciseContainer).getByLabelText(/répétitions|reps/i)).toBeInTheDocument();
          expect(within(exerciseContainer).getByLabelText(/poids|weight/i)).toBeInTheDocument();
        }
      });
    });

    it('permet de modifier les séries et répétitions', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Étendre et modifier les valeurs
      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      const setsInput = screen.getAllByLabelText(/séries|sets/i)[0];
      const repsInput = screen.getAllByLabelText(/répétitions|reps/i)[0];

      await user.clear(setsInput);
      await user.type(setsInput, '4');

      await user.clear(repsInput);
      await user.type(repsInput, '12');

      expect(setsInput).toHaveValue(4);
      expect(repsInput).toHaveValue(12);
    });

    it('utilise le dernier poids pour chaque exercice', async () => {
      const user = userEvent.setup();
      
      mockGetLastWeight.mockImplementation((exerciseName) => {
        return exerciseName === 'Push-ups' ? 20 : 0;
      });

      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      // Vérifier que le bon poids est récupéré pour Push-ups
      expect(mockGetLastWeight).toHaveBeenCalledWith('Push-ups');
      
      const weightInputs = screen.getAllByLabelText(/poids|weight/i);
      expect(weightInputs[0]).toHaveValue(20); // Push-ups
    });
  });

  describe('États et feedback', () => {
    it('affiche un feedback visuel lors du survol', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const card = screen.getByTestId('workout-card');
      
      await user.hover(card);
      
      // Vérifier que des classes de hover sont appliquées
      expect(card).toHaveClass(/hover:/);
    });

    it('affiche un toast lors de l\'ajout d\'exercice', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Étendre et ajouter un exercice
      const expandButton = screen.getByRole('button', { name: /voir plus|expand/i });
      await user.click(expandButton);

      const addButton = screen.getAllByRole('button', { name: /ajouter|add/i })[0];
      await user.click(addButton);

      expect(mockAddExercise).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/ajouté|added/i),
        })
      );
    });
  });

  describe('Accessibilité', () => {
    it('a une structure accessible', () => {
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Vérifier la présence d'un article/region
      expect(screen.getByRole('article') || screen.getByRole('region')).toBeInTheDocument();
      
      // Vérifier les boutons accessibles
      expect(screen.getByRole('button', { name: /commencer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /voir plus/i })).toBeInTheDocument();
    });

    it('supporte la navigation au clavier', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      // Navigation avec Tab
      await user.tab();
      expect(screen.getByRole('button', { name: /commencer/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /voir plus/i })).toHaveFocus();

      // Activer avec Enter
      await user.keyboard('{Enter}');
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
    });

    it('annonce les changements d\'état', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCard 
          workout={mockWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const expandButton = screen.getByRole('button', { name: /voir plus/i });
      
      // Vérifier l'attribut aria-expanded
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Cas limites', () => {
    it('gère un workout sans exercices', () => {
      const emptyWorkout = {
        ...mockWorkout,
        exerciseList: [],
      };

      render(
        <WorkoutCard 
          workout={emptyWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      expect(screen.getByText(emptyWorkout.title)).toBeInTheDocument();
      // Ne devrait pas planter même sans exercices
    });

    it('gère un workout avec des valeurs manquantes', () => {
      const incompleteWorkout = {
        ...mockWorkout,
        rating: undefined,
        participants: undefined,
        tags: [],
      };

      render(
        <WorkoutCard 
          workout={incompleteWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      expect(screen.getByText(incompleteWorkout.title)).toBeInTheDocument();
      // Devrait gérer gracieusement les valeurs manquantes
    });

    it('gère les noms d\'exercices très longs', async () => {
      const user = userEvent.setup();
      
      const longExerciseWorkout = {
        ...mockWorkout,
        exerciseList: ['Supercalifragilisticexpialidocious Extreme Ultra Maximum Power Exercise'],
      };

      render(
        <WorkoutCard 
          workout={longExerciseWorkout} 
          onStartWorkout={mockOnStartWorkout} 
        />
      );

      const expandButton = screen.getByRole('button', { name: /voir plus/i });
      await user.click(expandButton);

      // Vérifier que le nom long est tronqué ou géré correctement
      expect(screen.getByText(/Supercalifragilisticexpialidocious/)).toBeInTheDocument();
    });
  });
});
