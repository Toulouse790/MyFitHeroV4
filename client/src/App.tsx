// client/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n/i18n';
import './index.css'; // ✅ CSS global, souvent Tailwind ou équivalent

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Élément root introuvable. Assurez-vous que votre fichier HTML contient un div avec id="root".');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
