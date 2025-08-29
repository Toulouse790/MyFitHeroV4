<<<<<<< HEAD:client/jest.config.js

export default {
  preset: 'ts-jest',
=======
/** @type {import('jest').Config} */
module.exports = {
>>>>>>> 6eb05951e33be558c27f306f45a77f0c767e4d9c:client/jest.config.cjs
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: ['/node_modules/(?!(.*))'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test-utils/**',
    '!src/__tests__/**',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
  testTimeout: 10000,
  maxWorkers: '50%',
  clearMocks: true,
  restoreMocks: true,
};
