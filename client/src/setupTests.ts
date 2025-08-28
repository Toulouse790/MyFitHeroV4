/**
 * Configuration des tests pour MyFitHero
 * Setup global pour Jest, React Testing Library et MSW
 */

// import '@testing-library/jest-dom';
import { server } from './test-utils/mocks/server';

// Configuration MSW pour mocker les API
beforeAll(() => {
  // Démarrer le serveur MSW avant tous les tests
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

afterEach(() => {
  // Reset des handlers après chaque test pour éviter les interférences
  server.resetHandlers();
  
  // Nettoyage du localStorage et sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset des timers si utilisés
  jest.clearAllTimers();
});

afterAll(() => {
  // Fermer le serveur MSW après tous les tests
  server.close();
});

// Mock des API du navigateur non disponibles en environnement test
global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock de ResizeObserver pour les composants qui l'utilisent
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock du fetch global si pas déjà présent
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Configuration de timeouts pour les tests async
jest.setTimeout(10000);

// Suppress console errors dans les tests pour un output plus propre
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
