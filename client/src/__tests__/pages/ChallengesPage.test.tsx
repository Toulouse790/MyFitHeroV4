/**
 * Tests pour ChallengesPage
 * Tests pour la page des défis fitness
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render, userEvent, createMockChallenge } from '../../test-utils/test-utils';
import { server } from '../../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import ChallengesPage from '../../pages/ChallengesPage';

describe('ChallengesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Affichage des défis', () => {
    it('affiche la liste des défis disponibles', async () => {
      const mockChallenges = [
        createMockChallenge({
          id: '1',
          title: '30-Day Push-up Challenge',
          description: 'Build upper body strength',
          difficulty: 'medium',
          participants_count: 150,
        }),
        createMockChallenge({
          id: '2',
          title: 'Marathon Training',
          description: 'Prepare for your first marathon',
          difficulty: 'hard',
          participants_count: 75,
        }),
      ];

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json(mockChallenges);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText('30-Day Push-up Challenge')).toBeInTheDocument();
        expect(screen.getByText('Marathon Training')).toBeInTheDocument();
        expect(screen.getByText(/150.*participants/i)).toBeInTheDocument();
        expect(screen.getByText(/75.*participants/i)).toBeInTheDocument();
      });
    });

    it('affiche les détails d\'un défi', async () => {
      const mockChallenge = createMockChallenge({
        title: '30-Day Push-up Challenge',
        description: 'Build your upper body strength with daily push-up goals',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        difficulty: 'medium',
      });

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([mockChallenge]);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        const challengeCard = screen.getByTestId('challenge-card');
        expect(within(challengeCard).getByText('30-Day Push-up Challenge')).toBeInTheDocument();
        expect(within(challengeCard).getByText(/Build your upper body strength/)).toBeInTheDocument();
        expect(within(challengeCard).getByText(/medium|moyen/i)).toBeInTheDocument();
        expect(within(challengeCard).getByText(/1.*jan.*31.*jan/i)).toBeInTheDocument();
      });
    });

    it('filtre les défis par catégorie', async () => {
      const user = userEvent.setup();
      
      const mockChallenges = [
        createMockChallenge({ id: '1', category: 'cardio', title: 'Running Challenge' }),
        createMockChallenge({ id: '2', category: 'strength', title: 'Strength Challenge' }),
      ];

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json(mockChallenges);
        })
      );

      render(<ChallengesPage />);

      // Filtrer par catégorie
      const categoryFilter = screen.getByLabelText(/catégorie/i);
      await user.selectOptions(categoryFilter, 'cardio');

      await waitFor(() => {
        expect(screen.getByText('Running Challenge')).toBeInTheDocument();
        expect(screen.queryByText('Strength Challenge')).not.toBeInTheDocument();
      });
    });

    it('filtre les défis par niveau de difficulté', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      const difficultyFilter = screen.getByLabelText(/difficulté/i);
      await user.selectOptions(difficultyFilter, 'easy');

      await waitFor(() => {
        const challengeCards = screen.getAllByTestId('challenge-card');
        challengeCards.forEach(card => {
          expect(within(card).getByText(/easy|facile/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Participation aux défis', () => {
    it('permet de rejoindre un défi', async () => {
      const user = userEvent.setup();
      
      const mockChallenge = createMockChallenge({
        title: 'Test Challenge',
        completed: false,
      });

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([mockChallenge]);
        }),
        http.post('*/rest/v1/user_challenges*', () => {
          return HttpResponse.json([{
            id: 'user-challenge-1',
            challenge_id: mockChallenge.id,
            user_id: 'user-123',
            joined_at: '2024-01-01T00:00:00Z',
          }], { status: 201 });
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Challenge')).toBeInTheDocument();
      });

      const joinButton = screen.getByRole('button', { name: /rejoindre.*défi/i });
      await user.click(joinButton);

      // Vérifier que le bouton change d'état
      await waitFor(() => {
        expect(screen.getByText(/défi rejoint/i)).toBeInTheDocument();
      });
    });

    it('affiche la progression pour les défis rejoints', async () => {
      const mockChallenge = createMockChallenge({
        title: 'Active Challenge',
        completed: false,
        progress: 45,
      });

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([mockChallenge]);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText('Active Challenge')).toBeInTheDocument();
        expect(screen.getByText(/45%/)).toBeInTheDocument();
        
        // Vérifier la barre de progression
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '45');
      });
    });

    it('marque les défis complétés', async () => {
      const mockChallenge = createMockChallenge({
        title: 'Completed Challenge',
        completed: true,
        progress: 100,
      });

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([mockChallenge]);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText('Completed Challenge')).toBeInTheDocument();
        expect(screen.getByText(/terminé|completed/i)).toBeInTheDocument();
        expect(screen.getByText(/100%/)).toBeInTheDocument();
      });
    });
  });

  describe('Interaction avec les défis', () => {
    it('ouvre la modal de détails lors du clic sur un défi', async () => {
      const user = userEvent.setup();
      
      const mockChallenge = createMockChallenge({
        title: 'Detailed Challenge',
        description: 'This is a detailed description of the challenge',
      });

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([mockChallenge]);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText('Detailed Challenge')).toBeInTheDocument();
      });

      const challengeCard = screen.getByTestId('challenge-card');
      await user.click(challengeCard);

      // Vérifier que la modal s'ouvre
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/This is a detailed description/)).toBeInTheDocument();
      });
    });

    it('ferme la modal de détails', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      // Ouvrir la modal (supposons qu'un défi soit déjà présent)
      await waitFor(() => screen.findByTestId('challenge-card'));
      
      const challengeCard = screen.getByTestId('challenge-card');
      await user.click(challengeCard);

      // Fermer la modal
      const closeButton = screen.getByRole('button', { name: /fermer/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('États de chargement et d\'erreur', () => {
    it('affiche un état de chargement', () => {
      render(<ChallengesPage />);
      
      expect(screen.getByTestId('challenges-loading') || screen.getByText(/chargement/i)).toBeInTheDocument();
    });

    it('affiche un message quand aucun défi n\'est disponible', async () => {
      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([]);
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText(/aucun défi disponible/i)).toBeInTheDocument();
      });
    });

    it('gère les erreurs de chargement', async () => {
      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json(
            { error: 'Server Error' },
            { status: 500 }
          );
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText(/erreur.*chargement.*défis/i)).toBeInTheDocument();
      });
    });

    it('permet de réessayer après une erreur', async () => {
      const user = userEvent.setup();
      
      // D'abord une erreur
      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      render(<ChallengesPage />);

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });

      // Puis succès
      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json([createMockChallenge()]);
        })
      );

      const retryButton = screen.getByRole('button', { name: /réessayer/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('challenge-card')).toBeInTheDocument();
      });
    });
  });

  describe('Fonctionnalités sociales', () => {
    it('affiche le classement des participants', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      const leaderboardButton = screen.getByRole('button', { name: /classement/i });
      await user.click(leaderboardButton);

      expect(screen.getByText(/top.*participants/i)).toBeInTheDocument();
    });

    it('permet de partager un défi', async () => {
      const user = userEvent.setup();
      
      // Mock de l'API de partage du navigateur
      const mockShare = jest.fn();
      Object.assign(navigator, {
        share: mockShare,
      });

      render(<ChallengesPage />);

      await waitFor(() => screen.findByTestId('challenge-card'));

      const shareButton = screen.getByRole('button', { name: /partager/i });
      await user.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          url: expect.any(String),
        })
      );
    });
  });

  describe('Recherche et tri', () => {
    it('recherche des défis par nom', async () => {
      const user = userEvent.setup();
      
      const mockChallenges = [
        createMockChallenge({ id: '1', title: 'Running Challenge' }),
        createMockChallenge({ id: '2', title: 'Strength Challenge' }),
      ];

      server.use(
        http.get('*/rest/v1/challenges*', () => {
          return HttpResponse.json(mockChallenges);
        })
      );

      render(<ChallengesPage />);

      const searchInput = screen.getByPlaceholderText(/rechercher.*défi/i);
      await user.type(searchInput, 'running');

      await waitFor(() => {
        expect(screen.getByText('Running Challenge')).toBeInTheDocument();
        expect(screen.queryByText('Strength Challenge')).not.toBeInTheDocument();
      });
    });

    it('trie les défis par popularité', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      const sortSelect = screen.getByLabelText(/trier par/i);
      await user.selectOptions(sortSelect, 'popularity');

      // Vérifier que les défis sont retriés
      await waitFor(() => {
        const challengeCards = screen.getAllByTestId('challenge-card');
        expect(challengeCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibilité', () => {
    it('a une structure accessible', async () => {
      render(<ChallengesPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      
      // Vérifier les labels appropriés
      expect(screen.getByLabelText(/rechercher/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
    });

    it('supporte la navigation au clavier', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      await user.tab();
      expect(screen.getByPlaceholderText(/rechercher/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/catégorie/i)).toHaveFocus();
    });

    it('annonce les changements de statut', async () => {
      const user = userEvent.setup();
      
      render(<ChallengesPage />);

      await waitFor(() => screen.findByRole('button', { name: /rejoindre/i }));
      
      const joinButton = screen.getByRole('button', { name: /rejoindre/i });
      await user.click(joinButton);

      // Vérifier la présence d'une annonce pour les lecteurs d'écran
      expect(screen.getByRole('status')).toHaveTextContent(/défi rejoint/i);
    });
  });
});
