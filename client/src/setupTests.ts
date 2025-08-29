/**
 * Configuration des tests pour MyFitHero
 * Setup global pour Jest, React Testing Library et MSW
 */

// RTL assertions (toBeInTheDocument, etc.)
import '@testing-library/jest-dom';

// MSW - Réactivé avec polyfills corrects
import { server } from './test-utils/mocks/server';

// ---- MSW lifecycle ---- 
beforeAll(() => {
  // Démarrer le serveur MSW avant tous les tests
  server.listen({ 
    onUnhandledRequest: 'warn'
  });
});

afterEach(() => {
  // Réinitialiser les handlers MSW après chaque test
  server.resetHandlers();

  // Nettoyage storage & timers entre tests
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllTimers();
  jest.clearAllMocks();
});

afterAll(() => {
  // Fermer le serveur MSW après tous les tests
  server.close();
});

// ---- Mocks d’APIs navigateur manquantes dans JSDOM ----
global.matchMedia =
  global.matchMedia ||
  (function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as any;
  } as any);

// ResizeObserver
(global as any).ResizeObserver = (global as any).ResizeObserver || jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver
(global as any).IntersectionObserver = (global as any).IntersectionObserver || jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Timeout global des tests async
jest.setTimeout(10000);

// ---- Filtrage de certains warnings de test ----
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
