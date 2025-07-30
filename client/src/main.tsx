// client/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n/i18n';
import './index.css'; // ✅ CSS global, souvent Tailwind ou équivalent

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("❌ Impossible de monter l'application : #root introuvable dans index.html");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
