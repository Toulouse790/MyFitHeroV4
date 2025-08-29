// client/src/main.tsx - Version simplifiée sans i18n
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Élément root introuvable. Assurez-vous que votre fichier HTML contient un div avec id="root".'
  );
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
