/**
 * Tests pour WorkoutPage
 * Tests pour la page de séance d'entraînement
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import {
  render,
  userEvent,
  createMockWorkout,
  createMockExercise,
} from '../../test-utils/test-utils';
import { server } from '../../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import WorkoutPage from '@/features/workout/pages/WorkoutPage';

// Mock du router pour les paramètres d'URL
const mockUseParams = jest.fn();
jest.mock('wouter', () => ({
  useParams: () => mockUseParams(),
  useLocation: () => ['/workout/123', jest.fn()],
}));

describe('WorkoutPage', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: 'workout-123' });
    jest.clearAllMocks();
  });

  describe('Chargement et affichage initial', () => {
    it('affiche les informations de la séance', async () => {
      const mockWorkout = createMockWorkout({
        id: 'workout-123',
        name: 'Upper Body Strength',
        description: 'Complete upper body workout',
        duration: 45,
        difficulty: 'intermediate',
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
        expect(screen.getByText('Complete upper body workout')).toBeInTheDocument();
        expect(screen.getByText(/45.*min/i)).toBeInTheDocument();
        expect(screen.getByText(/intermediate|intermédiaire/i)).toBeInTheDocument();
      });
    });

    it('affiche un état de chargement pendant la récupération', () => {
      render(<WorkoutPage />);

      expect(
        screen.getByTestId('workout-loading') || screen.getByText(/chargement/i)
      ).toBeInTheDocument();
    });

    it("gère l'erreur si la séance n'existe pas", async () => {
      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([], { status: 404 });
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        expect(screen.getByText(/séance non trouvée/i)).toBeInTheDocument();
      });
    });
  });

  describe('Liste des exercices', () => {
    it('affiche tous les exercices de la séance', async () => {
      const mockExercises = [
        createMockExercise({ id: '1', name: 'Push-ups' }),
        createMockExercise({ id: '2', name: 'Pull-ups' }),
        createMockExercise({ id: '3', name: 'Squats' }),
      ];

      const mockWorkout = createMockWorkout({
        exercises: mockExercises,
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
        expect(screen.getByText('Pull-ups')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
      });
    });

    it('permet de marquer un exercice comme terminé', async () => {
      const user = userEvent.setup();
      const mockWorkout = createMockWorkout({
        exercises: [createMockExercise({ name: 'Push-ups' })],
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
      });

      // Cliquer sur la checkbox de completion
      const completionCheckbox = screen.getByRole('checkbox', { name: /marquer comme terminé/i });
      await user.click(completionCheckbox);

      expect(completionCheckbox).toBeChecked();
    });
  });

  describe('Timer de séance', () => {
    it('démarre le timer lors du début de séance', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      const startButton = await screen.findByRole('button', { name: /commencer.*séance/i });
      await user.click(startButton);

      // Vérifier que le timer s'affiche
      expect(screen.getByTestId('workout-timer')).toBeInTheDocument();
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    it('met en pause et reprend le timer', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Démarrer la séance
      const startButton = await screen.findByRole('button', { name: /commencer/i });
      await user.click(startButton);

      // Mettre en pause
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await user.click(pauseButton);

      expect(screen.getByRole('button', { name: /reprendre/i })).toBeInTheDocument();

      // Reprendre
      const resumeButton = screen.getByRole('button', { name: /reprendre/i });
      await user.click(resumeButton);

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('arrête le timer et termine la séance', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Démarrer puis arrêter
      const startButton = await screen.findByRole('button', { name: /commencer/i });
      await user.click(startButton);

      const stopButton = screen.getByRole('button', { name: /terminer.*séance/i });
      await user.click(stopButton);

      // Confirmer dans la modal
      const confirmButton = screen.getByRole('button', { name: /confirmer/i });
      await user.click(confirmButton);

      expect(screen.getByText(/séance terminée/i)).toBeInTheDocument();
    });
  });

  describe('Gestion des repos', () => {
    it('démarre un timer de repos entre les exercices', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Démarrer la séance et terminer un exercice
      await waitFor(() => screen.findByRole('button', { name: /commencer/i }));

      const restButton = screen.getByRole('button', { name: /repos/i });
      await user.click(restButton);

      expect(screen.getByTestId('rest-timer')).toBeInTheDocument();
      expect(screen.getByText(/repos/i)).toBeInTheDocument();
    });

    it('permet de personnaliser la durée de repos', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Ouvrir les paramètres de repos
      const settingsButton = screen.getByRole('button', { name: /paramètres.*repos/i });
      await user.click(settingsButton);

      // Modifier la durée
      const durationInput = screen.getByLabelText(/durée.*repos/i);
      await user.clear(durationInput);
      await user.type(durationInput, '90');

      const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
      await user.click(saveButton);

      // Vérifier que la nouvelle durée est appliquée
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();
    });
  });

  describe('Progression et statistiques', () => {
    it('affiche la progression de la séance', async () => {
      const mockWorkout = createMockWorkout({
        exercises: [
          createMockExercise({ name: 'Exercise 1' }),
          createMockExercise({ name: 'Exercise 2' }),
          createMockExercise({ name: 'Exercise 3' }),
        ],
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        // Vérifier la barre de progression
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByText(/0.*3.*exercices/i)).toBeInTheDocument();
      });
    });

    it('met à jour la progression quand un exercice est terminé', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      await waitFor(() => screen.findByRole('checkbox'));

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Vérifier que la progression s'est mise à jour
      await waitFor(() => {
        expect(screen.getByText(/1.*3.*exercices/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sauvegarde et historique', () => {
    it('sauvegarde automatiquement la progression', async () => {
      const user = userEvent.setup();

      // Mock de l'endpoint de sauvegarde
      const saveMock = jest.fn();
      server.use(
        http.patch('*/rest/v1/workout_sessions*', () => {
          saveMock();
          return HttpResponse.json([]);
        })
      );

      render(<WorkoutPage />);

      // Effectuer une action qui déclenche la sauvegarde
      await waitFor(() => screen.findByRole('checkbox'));
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Vérifier que la sauvegarde a été appelée
      await waitFor(() => {
        expect(saveMock).toHaveBeenCalled();
      });
    });

    it("permet de consulter l'historique des séances", async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      const historyButton = screen.getByRole('button', { name: /historique/i });
      await user.click(historyButton);

      expect(screen.getByText(/séances précédentes/i)).toBeInTheDocument();
    });
  });

  describe('Interface et interactions', () => {
    it("affiche les instructions d'exercice en modal", async () => {
      const user = userEvent.setup();
      const mockWorkout = createMockWorkout({
        exercises: [
          createMockExercise({
            name: 'Push-ups',
            instructions: 'Keep your body straight and lower down slowly',
          }),
        ],
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
      });

      const instructionsButton = screen.getByRole('button', { name: /instructions/i });
      await user.click(instructionsButton);

      expect(screen.getByText(/Keep your body straight/)).toBeInTheDocument();
    });

    it('permet de naviguer entre les exercices', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Boutons de navigation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exercice précédent/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /exercice suivant/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /exercice suivant/i });
      await user.click(nextButton);

      // Vérifier que l'exercice actif a changé
      expect(screen.getByTestId('current-exercise')).toHaveAttribute('data-exercise-index', '1');
    });
  });

  describe('Erreurs et edge cases', () => {
    it('gère les erreurs de connexion pendant la séance', async () => {
      const user = userEvent.setup();

      // Simuler une erreur réseau après le chargement initial
      server.use(
        http.patch('*/rest/v1/workout_sessions*', () => {
          return HttpResponse.json({ error: 'Network Error' }, { status: 500 });
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => screen.findByRole('checkbox'));

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Vérifier qu'un message d'erreur s'affiche
      await waitFor(() => {
        expect(screen.getByText(/erreur.*sauvegarde/i)).toBeInTheDocument();
      });
    });

    it("conserve l'état local même en cas d'erreur de sauvegarde", async () => {
      const user = userEvent.setup();

      // Simuler une erreur de sauvegarde
      server.use(
        http.patch('*/rest/v1/workout_sessions*', () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      render(<WorkoutPage />);

      await waitFor(() => screen.findByRole('checkbox'));

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Vérifier que l'état local est conservé malgré l'erreur
      expect(checkbox).toBeChecked();
    });
  });

  describe('Accessibilité', () => {
    it('supporte la navigation au clavier', async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      // Navigation avec Tab
      await user.tab();
      expect(screen.getByRole('button', { name: /commencer/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /paramètres/i })).toHaveFocus();
    });

    it("annonce les changements d'état au lecteur d'écran", async () => {
      const user = userEvent.setup();

      render(<WorkoutPage />);

      await waitFor(() => screen.findByRole('checkbox'));

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Vérifier la présence d'un live region pour les annonces
      expect(screen.getByRole('status')).toHaveTextContent(/exercice terminé/i);
    });
  });
});
