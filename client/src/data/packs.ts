// src/data/packs.ts
export type ModuleId = 'sport' | 'strength' | 'nutrition' | 'hydration' | 'sleep' | 'wellness';

export interface Pack {
  id: string;
  name: string;
  modules: ModuleId[];
  description: string;
}

export const PACKS: Pack[] = [
  {
    id: 'sport_full',
    name: 'Sport Complet',
    // 👇 Ajout de "sleep"
    modules: ['sport', 'strength', 'nutrition', 'hydration', 'sleep'],
    description: 'Programme global : entraînement, récupération et alimentation.',
  },
  {
    id: 'health',
    name: 'Forme & Santé',
    modules: ['strength', 'nutrition', 'sleep'],
    description: 'Remise en forme douce et hygiène de vie.',
  },
  {
    id: 'nutrition',
    name: 'Pack Nutrition',
    modules: ['nutrition', 'hydration'],
    description: 'Alimentation équilibrée + suivi hydratation.',
  },
  {
    id: 'recovery',
    name: 'Pack Récupération',
    modules: ['sleep', 'hydration'],
    description: 'Optimisez vos nuits et votre hydratation.',
  },
  {
    id: 'custom',
    name: 'Pack Personnalisé',
    modules: [],
    description: 'Composez librement vos modules.',
  },
];
