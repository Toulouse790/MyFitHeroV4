import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// __dirname n’existe pas en ES Modules, on le reconstruit à partir de import.meta
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Vite
// - Active le plugin React pour gérer correctement JSX/TSX.
// - Configure l’alias "@" pour pointer vers le dossier "src", ce qui permet à Vite
//   de résoudre des imports comme "@/hooks/use-toast" ou "@/components/…".
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
