/**
 * Utilitaires et helpers pour les tests
 * Wrappers customisés pour React Testing Library avec providers
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/ThemeProvider';

// Types pour les options de rendu personnalisées
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  theme?: 'light' | 'dark' | 'system';
}

// Wrapper avec tous les providers nécessaires
const AllTheProviders = ({
  children,
  queryClient,
  initialEntries = ['/'],
  theme = 'light',
}: {
  children: ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
  theme?: 'light' | 'dark' | 'system';
}) => {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme={theme} storageKey="test-theme">
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Fonction de rendu personnalisée
const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { initialEntries, queryClient, theme, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders queryClient={queryClient} initialEntries={initialEntries} theme={theme}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockWorkout = (overrides = {}) => ({
  id: 'workout-123',
  name: 'Test Workout',
  description: 'A test workout routine',
  duration: 45,
  difficulty: 'intermediate',
  category: 'strength',
  exercises: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-123',
  ...overrides,
});

export const createMockExercise = (overrides = {}) => ({
  id: 'exercise-123',
  name: 'Test Exercise',
  description: 'A test exercise',
  muscle_groups: ['chest', 'triceps'],
  equipment: ['dumbbells'],
  difficulty: 'beginner',
  instructions: ['Step 1', 'Step 2'],
  image_url: 'https://example.com/exercise.jpg',
  video_url: 'https://example.com/exercise.mp4',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockChallenge = (overrides = {}) => ({
  id: 'challenge-123',
  title: 'Test Challenge',
  description: 'A test fitness challenge',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  difficulty: 'medium',
  category: 'cardio',
  participants_count: 50,
  completed: false,
  progress: 0,
  ...overrides,
});

// Helpers pour les tests d'accessibilité
export const expectAccessibleButton = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('role', 'button');
  expect(element).not.toHaveAttribute('aria-disabled', 'true');
};

export const expectAccessibleInput = (element: HTMLElement, label: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveAccessibleName(label);
};

// Helper pour attendre les queries async
export const waitForLoadingToFinish = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
