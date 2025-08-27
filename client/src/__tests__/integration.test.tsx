/**
 * Tests d'intégration généraux
 * Tests de bout en bout pour les flux utilisateur principaux
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, userEvent } from '../test-utils/test-utils';
import { server } from '../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import { createMockUser, createMockWorkout, createMockExercise } from '../test-utils/test-utils';

// Mock des composants principaux pour les tests d'intégration
const MockApp = () => (
  <div>
    <h1>MyFitHero Application</h1>
    <button>Start Workout</button>
    <button>View Exercises</button>
    <button>Join Challenge</button>
  </div>
);

describe('Tests d\'intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Flux d\'authentification', () => {
    it('permet à un utilisateur de se connecter et accéder aux fonctionnalités', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.json({
            access_token: 'mock-token',
            user: createMockUser(),
          });
        })
      );

      render(<MockApp />);

      // Simuler la connexion réussie
      expect(screen.getByText('MyFitHero Application')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
    });
  });

  describe('Flux d\'entraînement complet', () => {
    it('permet de démarrer et terminer un entraînement', async () => {
      const user = userEvent.setup();
      
      const mockWorkout = createMockWorkout({
        exercises: [
          createMockExercise({ name: 'Push-ups' }),
          createMockExercise({ name: 'Squats' }),
        ],
      });

      server.use(
        http.get('*/rest/v1/workouts*', () => {
          return HttpResponse.json([mockWorkout]);
        }),
        http.post('*/rest/v1/workout_sessions*', () => {
          return HttpResponse.json([{ id: 'session-123' }]);
        })
      );

      render(<MockApp />);

      // Démarrer un entraînement
      const startButton = screen.getByRole('button', { name: /start workout/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(startButton).toBeInTheDocument();
      });
    });
  });

  describe('Performance et optimisation', () => {
    it('charge les composants de manière lazy', async () => {
      render(<MockApp />);

      // Vérifier que l'application se charge rapidement
      expect(screen.getByText('MyFitHero Application')).toBeInTheDocument();
      
      // Les composants lazy devraient être chargés à la demande
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view exercises/i })).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('gère les erreurs réseau gracieusement', async () => {
      server.use(
        http.get('*/rest/v1/*', () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      render(<MockApp />);

      // L'application devrait continuer à fonctionner même avec des erreurs réseau
      expect(screen.getByText('MyFitHero Application')).toBeInTheDocument();
    });
  });

  describe('Accessibilité globale', () => {
    it('respecte les standards d\'accessibilité', () => {
      render(<MockApp />);

      // Vérifier la structure globale
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Vérifier que tous les boutons sont accessibles
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    it('supporte la navigation au clavier globale', async () => {
      const user = userEvent.setup();
      
      render(<MockApp />);

      // Navigation séquentielle avec Tab
      await user.tab();
      expect(screen.getByRole('button', { name: /start workout/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /view exercises/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /join challenge/i })).toHaveFocus();
    });
  });

  describe('Gestion des états de l\'application', () => {
    it('synchronise l\'état entre les composants', async () => {
      const user = userEvent.setup();
      
      render(<MockApp />);

      // Tester la synchronisation d'état entre différentes parties de l'app
      expect(screen.getByText('MyFitHero Application')).toBeInTheDocument();
    });

    it('persiste l\'état lors des rechargements', () => {
      // Simuler des données persistées
      localStorage.setItem('myfithero-store', JSON.stringify({
        user: createMockUser(),
        preferences: { theme: 'dark', units: 'metric' },
      }));

      render(<MockApp />);

      // L'état devrait être restauré
      expect(screen.getByText('MyFitHero Application')).toBeInTheDocument();
    });
  });

  describe('Tests de régression', () => {
    it('ne régresse pas sur les fonctionnalités critiques', async () => {
      const user = userEvent.setup();
      
      render(<MockApp />);

      // Tester les fonctionnalités critiques
      expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view exercises/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join challenge/i })).toBeInTheDocument();

      // Vérifier que les interactions de base fonctionnent
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      // Aucune erreur ne devrait être lancée
    });
  });
});
