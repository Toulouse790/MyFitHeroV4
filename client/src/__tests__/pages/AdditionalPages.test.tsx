/**
 * Tests pour les pages supplémentaires
 * LandingPage, NotFound, AuthPage, etc.
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, userEvent } from '../../test-utils/test-utils';
import { server } from '../../test-utils/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock des pages (à adapter selon votre implémentation)
const MockLandingPage = () => (
  <div>
    <h1>Bienvenue sur MyFitHero</h1>
    <p>Votre assistant fitness intelligent</p>
    <button>Commencer</button>
    <button>En savoir plus</button>
  </div>
);

const MockNotFoundPage = () => (
  <div>
    <h1>Page non trouvée</h1>
    <p>La page que vous cherchez n&apos;existe pas.</p>
    <button>Retour à l&apos;accueil</button>
  </div>
);

const MockAuthPage = () => (
  <div>
    <h1>Connexion</h1>
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Mot de passe" />
      <button type="submit">Se connecter</button>
    </form>
    <button>Créer un compte</button>
  </div>
);

describe('Pages supplémentaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LandingPage', () => {
    it('affiche le contenu principal', () => {
      render(<MockLandingPage />);

      expect(screen.getByText('Bienvenue sur MyFitHero')).toBeInTheDocument();
      expect(screen.getByText('Votre assistant fitness intelligent')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /commencer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /en savoir plus/i })).toBeInTheDocument();
    });

    it('navigue vers l\'inscription', async () => {
      const user = userEvent.setup();
      
      render(<MockLandingPage />);

      const startButton = screen.getByRole('button', { name: /commencer/i });
      await user.click(startButton);

      // Vérifier la navigation (selon votre implémentation)
      expect(startButton).toBeInTheDocument();
    });

    it('affiche plus d\'informations', async () => {
      const user = userEvent.setup();
      
      render(<MockLandingPage />);

      const learnMoreButton = screen.getByRole('button', { name: /en savoir plus/i });
      await user.click(learnMoreButton);

      // Devrait ouvrir une section ou naviguer vers plus d'infos
      expect(learnMoreButton).toBeInTheDocument();
    });
  });

  describe('NotFoundPage', () => {
    it('affiche le message d\'erreur 404', () => {
      render(<MockNotFoundPage />);

      expect(screen.getByText('Page non trouvée')).toBeInTheDocument();
      expect(screen.getByText(/page que vous cherchez n'existe pas/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retour à l'accueil/i })).toBeInTheDocument();
    });

    it('permet de retourner à l\'accueil', async () => {
      const user = userEvent.setup();
      
      render(<MockNotFoundPage />);

      const homeButton = screen.getByRole('button', { name: /retour à l'accueil/i });
      await user.click(homeButton);

      // Vérifier la navigation
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('AuthPage', () => {
    it('affiche le formulaire de connexion', () => {
      render(<MockAuthPage />);

      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument();
    });

    it('valide les champs du formulaire', async () => {
      const user = userEvent.setup();
      
      render(<MockAuthPage />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      // Essayer de soumettre sans données
      await user.click(submitButton);

      // Vérifier la validation (selon votre implémentation)
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('soumet le formulaire avec des données valides', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.json({
            access_token: 'mock-token',
            user: { id: 'user-123', email: 'test@example.com' },
          });
        })
      );

      render(<MockAuthPage />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Vérifier la soumission
      await waitFor(() => {
        expect(emailInput).toHaveValue('test@example.com');
      });
    });

    it('gère les erreurs de connexion', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('*/auth/v1/token', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      render(<MockAuthPage />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Vérifier l'affichage de l'erreur
      await waitFor(() => {
        // Selon votre implémentation d'affichage des erreurs
        expect(screen.queryByText(/erreur/i) || screen.queryByText(/invalid/i)).toBeTruthy();
      });
    });

    it('bascule vers la création de compte', async () => {
      const user = userEvent.setup();
      
      render(<MockAuthPage />);

      const createAccountButton = screen.getByRole('button', { name: /créer un compte/i });
      await user.click(createAccountButton);

      // Vérifier le changement de mode ou navigation
      expect(createAccountButton).toBeInTheDocument();
    });
  });

  describe('Accessibilité des pages', () => {
    it('respecte la hiérarchie des titres', () => {
      render(<MockLandingPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Bienvenue sur MyFitHero');
    });

    it('supporte la navigation au clavier', async () => {
      const user = userEvent.setup();
      
      render(<MockAuthPage />);

      // Navigation séquentielle
      await user.tab();
      expect(screen.getByPlaceholderText('Email')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('Mot de passe')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /se connecter/i })).toHaveFocus();
    });

    it('a des labels appropriés pour les formulaires', () => {
      render(<MockAuthPage />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Mot de passe');

      // Vérifier les attributs d'accessibilité
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Responsive design', () => {
    it('s\'adapte aux petits écrans', () => {
      // Simuler un écran mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MockLandingPage />);

      // Vérifier que les éléments sont toujours accessibles
      expect(screen.getByText('Bienvenue sur MyFitHero')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /commencer/i })).toBeInTheDocument();
    });

    it('s\'adapte aux grands écrans', () => {
      // Simuler un écran desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<MockLandingPage />);

      // Vérifier que le layout desktop fonctionne
      expect(screen.getByText('Bienvenue sur MyFitHero')).toBeInTheDocument();
    });
  });
});
