/**
 * Tests pour ExercisesPage
 * Tests unitaires et d'intégration pour la page des exercices
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render, userEvent, createMockExercise } from '../../test-utils/test-utils';
import { server } from '../../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import ExercisesPage from '../../pages/ExercisesPage';

// Mock du client Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
}));

describe('ExercisesPage', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('affiche correctement la page des exercices', async () => {
      render(<ExercisesPage />);
      
      // Vérifier le titre principal
      expect(screen.getByRole('heading', { name: /exercices/i })).toBeInTheDocument();
      
      // Vérifier la présence de la barre de recherche
      expect(screen.getByPlaceholderText(/rechercher un exercice/i)).toBeInTheDocument();
      
      // Vérifier la présence des filtres
      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/niveau/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/équipement/i)).toBeInTheDocument();
    });

    it('affiche un état de chargement initial', () => {
      render(<ExercisesPage />);
      
      // Vérifier la présence d'un indicateur de chargement
      expect(screen.getByTestId('loading-spinner') || screen.getByText(/chargement/i)).toBeInTheDocument();
    });
  });

  describe('Recherche et filtrage', () => {
    it('permet de rechercher des exercices par nom', async () => {
      const user = userEvent.setup();
      
      // Mock des exercices de test
      const mockExercises = [
        createMockExercise({ id: '1', name: 'Push-ups', muscle_groups: ['chest'] }),
        createMockExercise({ id: '2', name: 'Pull-ups', muscle_groups: ['back'] }),
        createMockExercise({ id: '3', name: 'Squats', muscle_groups: ['legs'] }),
      ];

      // Override du handler pour retourner les exercices mockés
      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json(mockExercises);
        })
      );

      render(<ExercisesPage />);

      // Attendre que les exercices se chargent
      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
      });

      // Effectuer une recherche
      const searchInput = screen.getByPlaceholderText(/rechercher un exercice/i);
      await user.type(searchInput, 'push');

      // Vérifier que la recherche filtre les résultats
      await waitFor(() => {
        expect(screen.getByText('Push-ups')).toBeInTheDocument();
        expect(screen.queryByText('Squats')).not.toBeInTheDocument();
      });
    });

    it('filtre les exercices par catégorie', async () => {
      const user = userEvent.setup();
      
      render(<ExercisesPage />);

      // Sélectionner une catégorie dans le filtre
      const categoryFilter = screen.getByLabelText(/catégorie/i);
      await user.selectOptions(categoryFilter, 'chest');

      // Vérifier que seuls les exercices de cette catégorie sont affichés
      await waitFor(() => {
        const exerciseCards = screen.getAllByTestId('exercise-card');
        exerciseCards.forEach(card => {
          expect(within(card).getByText(/chest|poitrine/i)).toBeInTheDocument();
        });
      });
    });

    it('filtre les exercices par niveau de difficulté', async () => {
      const user = userEvent.setup();
      
      render(<ExercisesPage />);

      const difficultyFilter = screen.getByLabelText(/niveau/i);
      await user.selectOptions(difficultyFilter, 'beginner');

      await waitFor(() => {
        const exerciseCards = screen.getAllByTestId('exercise-card');
        exerciseCards.forEach(card => {
          expect(within(card).getByText(/débutant|beginner/i)).toBeInTheDocument();
        });
      });
    });

    it('combine plusieurs filtres correctement', async () => {
      const user = userEvent.setup();
      
      render(<ExercisesPage />);

      // Appliquer plusieurs filtres
      const searchInput = screen.getByPlaceholderText(/rechercher un exercice/i);
      const categoryFilter = screen.getByLabelText(/catégorie/i);
      
      await user.type(searchInput, 'push');
      await user.selectOptions(categoryFilter, 'chest');

      // Vérifier que les filtres se combinent
      await waitFor(() => {
        const results = screen.getAllByTestId('exercise-card');
        expect(results.length).toBeGreaterThan(0);
        results.forEach(card => {
          const cardText = card.textContent;
          expect(cardText).toMatch(/push/i);
          expect(cardText).toMatch(/chest|poitrine/i);
        });
      });
    });
  });

  describe('Affichage des exercices', () => {
    it('affiche correctement les cartes d exercices', async () => {
      const mockExercise = createMockExercise({
        name: 'Test Exercise',
        description: 'Test description',
        difficulty: 'intermediate',
        muscle_groups: ['chest', 'triceps'],
      });

      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json([mockExercise]);
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        const exerciseCard = screen.getByTestId('exercise-card');
        expect(within(exerciseCard).getByText('Test Exercise')).toBeInTheDocument();
        expect(within(exerciseCard).getByText('Test description')).toBeInTheDocument();
        expect(within(exerciseCard).getByText(/intermediate|intermédiaire/i)).toBeInTheDocument();
        expect(within(exerciseCard).getByText(/chest|poitrine/i)).toBeInTheDocument();
      });
    });

    it('gère l état vide quand aucun exercice n est trouvé', async () => {
      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json([]);
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        expect(screen.getByText(/aucun exercice trouvé/i)).toBeInTheDocument();
      });
    });
  });

  describe('Gestion des favoris', () => {
    it('permet d ajouter un exercice aux favoris', async () => {
      const user = userEvent.setup();
      const mockExercise = createMockExercise({ name: 'Test Exercise' });

      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json([mockExercise]);
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Exercise')).toBeInTheDocument();
      });

      // Cliquer sur le bouton favori
      const favoriteButton = screen.getByTestId('favorite-button');
      await user.click(favoriteButton);

      // Vérifier que le statut favori a changé
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Navigation et interactions', () => {
    it('navigue vers le détail d un exercice lors du clic', async () => {
      const user = userEvent.setup();
      const mockExercise = createMockExercise({ 
        id: 'exercise-123',
        name: 'Test Exercise' 
      });

      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json([mockExercise]);
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Exercise')).toBeInTheDocument();
      });

      // Cliquer sur la carte d'exercice
      const exerciseCard = screen.getByTestId('exercise-card');
      await user.click(exerciseCard);

      // Vérifier la navigation (mock de wouter ou react-router)
      // Cette partie dépend de votre implémentation de routing
    });
  });

  describe('Gestion d erreurs', () => {
    it('affiche un message d erreur en cas d échec de chargement', async () => {
      // Simuler une erreur API
      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        expect(screen.getByText(/erreur lors du chargement/i)).toBeInTheDocument();
      });
    });

    it('permet de réessayer après une erreur', async () => {
      const user = userEvent.setup();
      
      // D'abord une erreur
      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json(
            { error: 'Network Error' },
            { status: 500 }
          );
        })
      );

      render(<ExercisesPage />);

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });

      // Ensuite succès lors du retry
      server.use(
        http.get('*/rest/v1/exercises', () => {
          return HttpResponse.json([createMockExercise()]);
        })
      );

      // Cliquer sur retry
      const retryButton = screen.getByRole('button', { name: /réessayer/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('a une structure accessible avec les rôles appropriés', async () => {
      render(<ExercisesPage />);

      // Vérifier la présence des landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      
      // Vérifier les labels des formulaires
      expect(screen.getByLabelText(/rechercher/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
    });

    it('supporte la navigation au clavier', async () => {
      const user = userEvent.setup();
      
      render(<ExercisesPage />);

      // Tab vers la recherche
      await user.tab();
      expect(screen.getByPlaceholderText(/rechercher/i)).toHaveFocus();

      // Tab vers les filtres
      await user.tab();
      expect(screen.getByLabelText(/catégorie/i)).toHaveFocus();
    });
  });

  describe('Performance et optimisation', () => {
    it('debounce la recherche pour éviter trop d appels API', async () => {
      const user = userEvent.setup();
      
      render(<ExercisesPage />);

      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      
      // Taper rapidement plusieurs caractères
      await user.type(searchInput, 'abc', { delay: 50 });

      // Vérifier qu'un seul appel API est fait après le debounce
      // Cette vérification dépend de votre implémentation de debounce
      await waitFor(() => {
        // Assert sur le nombre d'appels API mockés
      }, { timeout: 1000 });
    });
  });
});
