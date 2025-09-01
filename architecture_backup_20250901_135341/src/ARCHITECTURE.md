# Architecture MyFitHero - Documentation complète

## 🏗️ Vue d'ensemble de l'architecture

MyFitHero implémente une **architecture feature-first moderne** avec les
meilleures pratiques React/TypeScript pour une application de santé et bien-être
scalable et maintenable.

## 📁 Structure organisationnelle

```
src/
├── app/                    # Configuration application
│   ├── providers/         # Context providers globaux
│   ├── router/           # Configuration routing avec code-splitting
│   └── store/            # Store global configuration
├── shared/               # Ressources partagées entre features
│   ├── components/       # Design system components atomiques
│   ├── hooks/           # Hooks réutilisables (useLocalStorage, useAsync...)
│   ├── stores/          # Stores Zustand centralisés (auth, app, notifications)
│   ├── services/        # Services partagés (API, analytics, notifications)
│   ├── types/           # Types TypeScript globaux
│   └── utils/           # Utilitaires et helpers
├── features/            # Modules métier organisés par domaine
│   ├── hydration/       # Module suivi hydratation
│   │   ├── components/  # Composants spécifiques hydratation
│   │   ├── hooks/       # Hooks métier hydratation
│   │   ├── types/       # Types spécifiques hydratation
│   │   ├── utils/       # Utilitaires calculs hydratation
│   │   └── HydrationPage.tsx
│   ├── sleep/           # Module analyse sommeil
│   ├── social/          # Module communauté
│   ├── auth/            # Module authentification
│   ├── nutrition/       # Module nutrition (à créer)
│   └── dashboard/       # Module tableau de bord unifié
├── pages/              # Pages legacy en migration vers features/
├── components/         # Composants legacy en migration vers shared/
└── assets/             # Ressources statiques
```

## 🔧 Patterns architecturaux implementés

### 1. Design System avec composants atomiques

**Localisation :** `src/shared/components/`

Chaque composant suit la structure :

```typescript
// Structure standardisée des composants
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const Component = React.forwardRef<HTMLElement, ComponentProps>(({ ... }) => {
  return (
    <element className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </element>
  );
});
```

**Composants disponibles :**

- `Button` : Boutons avec variants, tailles, états loading
- `Input` : Champs de saisie avec validation, icônes, types password
- `Card` : Cartes avec header/footer, variants d'élévation
- `Loading` : Indicateurs de chargement (spinner, dots, skeleton)
- `Modal`, `Form`, `Chart` : À implémenter selon besoins

### 2. Stores Zustand standardisés avec persistence

**Localisation :** `src/shared/stores/` et `src/features/*/hooks/`

Pattern unifié pour tous les stores :

```typescript
interface FeatureState {
  data: Data[];
  isLoading: boolean;
  error: string | null;
}

interface FeatureActions {
  loadData: () => Promise<void>;
  addItem: (item: NewItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const useFeatureStore = create<FeatureState & FeatureActions>()(
  persist(
    (set, get) => ({
      // État initial
      data: [],
      isLoading: false,
      error: null,

      // Actions avec gestion d'erreurs standardisée
      loadData: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiCall();
          set({ data, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },
      // ...autres actions
    }),
    {
      name: 'feature-storage',
      partialize: state => ({
        /* sélection des données à persister */
      }),
    }
  )
);
```

### 3. Hooks partagés pour patterns récurrents

**Localisation :** `src/shared/hooks/`

Hooks réutilisables standardisés :

```typescript
// useLocalStorage - Persistence locale typée
const [value, setValue, removeValue] = useLocalStorage('key', initialValue);

// useDebounce - Optimisation performance
const debouncedValue = useDebounce(searchTerm, 300);

// useAsync - Gestion async standardisée
const { execute, data, loading, error, reset } = useAsync(asyncFunction);
```

### 4. Routing optimisé avec code-splitting

**Localisation :** `src/app/router/`

Configuration centralisée avec :

- **Lazy loading** automatique de toutes les pages
- **Métadonnées** typées par route (title, description, auth)
- **Protection de routes** avec redirections automatiques
- **Gestion d'erreurs** avec ErrorBoundary par route

```typescript
const routes: RouteConfig[] = [
  {
    path: '/hydration',
    element: lazy(() => import('@/features/hydration/HydrationPage')),
    meta: {
      title: 'Hydratation - MyFitHero',
      requiresAuth: true,
      description: "Suivez votre consommation d'eau quotidienne",
    },
  },
];
```

## 🎯 Standards de développement

### TypeScript Configuration stricte

Configuration dans `tsconfig.json` :

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true
}
```

### Path Mapping optimisé

Alias configurés pour import clean :

```typescript
import { Button, Card } from '@/shared/components';
import { useHydrationStore } from '@/features/hydration/hooks';
import { useAuthStore } from '@/shared/stores';
```

### Code Formatting automatique

- **Prettier** : Formatage automatique cohérent
- **ESLint** : Règles de qualité de code
- **Husky** : Pre-commit hooks pour qualité

## 🔄 Migration strategy des pages existantes

### Étapes de migration standardisées

1. **Analyser la page existante** dans `/pages/`
2. **Identifier les patterns réutilisables**
3. **Créer la structure feature** dans `/features/`
4. **Migrer les composants** vers la nouvelle architecture
5. **Implémenter le store Zustand** avec persistence
6. **Mettre à jour le routing** avec lazy loading
7. **Supprimer l'ancienne page** après validation

### Exemple : Migration HydrationPage

```typescript
// AVANT: /pages/Hydration.tsx
// - État local avec useState
// - Logique métier mélangée avec UI
// - Composants inline non réutilisables

// APRÈS: /features/hydration/
├── HydrationPage.tsx          # Page principale clean
├── components/
│   ├── HydrationChart.tsx     # Graphiques modulaires
│   ├── WaterIntakeForm.tsx    # Formulaire optimisé
│   └── HydrationGoals.tsx     # Gestion objectifs
├── hooks/
│   └── useHydrationStore.ts   # Store Zustand complet
├── types/
│   └── index.ts               # Types TypeScript stricts
└── utils/
    └── calculations.ts        # Logique métier pure
```

## 📊 Métriques de qualité

### Objectifs mesurables

- **Réduction duplication** : 40% de code dupliqué éliminé
- **Performance** : 30% amélioration temps de chargement
- **Type safety** : 0 erreur TypeScript en production
- **Test coverage** : 80% minimum modules critiques
- **Bundle size** : Réduction 25% grâce au code-splitting

### Outils de monitoring

- **jscpd** : Détection duplication de code
- **Webpack Bundle Analyzer** : Analyse taille bundles
- **Lighthouse** : Métriques performance web
- **SonarQube** : Qualité de code global

## 🚀 Fonctionnalités à implémenter

### Phase 2 : Modules manquants

1. **Nutrition tracking** : Extension naturelle des patterns hydratation
2. **Workout planning** : Intégration avec tracking activité
3. **AI recommendations** : Suggestions basées sur données utilisateur
4. **Admin panel** : Interface modération et analytics

### Phase 3 : Optimisations avancées

1. **PWA capabilities** : Service workers pour offline-first
2. **Micro-frontend** : Architecture modulaire pour scaling
3. **Real-time collaboration** : Features sociales temps réel
4. **Wearables integration** : Synchronisation appareils connectés

## 🛠️ Guide de développement

### Créer un nouveau feature module

```bash
# Structure à créer
mkdir -p src/features/[feature-name]/{components,hooks,types,utils}

# Templates à suivre
# - Store Zustand avec persistence
# - Types TypeScript stricts
# - Composants avec design system
# - Tests unitaires et intégration
```

### Standards de commits

```
feat(hydration): add water intake tracking
fix(auth): resolve token refresh issue
refactor(shared): standardize button component
test(sleep): add unit tests for sleep calculations
docs(architecture): update feature structure guide
```

### Review checklist

- [ ] TypeScript strict mode sans erreurs
- [ ] Composants utilisent le design system
- [ ] Store Zustand suit le pattern standardisé
- [ ] Tests unitaires présents et passants
- [ ] Code formaté avec Prettier
- [ ] Performance optimisée (lazy loading, memoization)

---

**Architecture évolutive et maintenable pour une application de santé moderne !
🏆**
