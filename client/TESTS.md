# Tests MyFitHero - Documentation Complète

## 📋 Vue d'ensemble

Cette suite de tests automatisés complète garantit la stabilité et la qualité de l'application MyFitHero avant la production. Elle couvre tous les composants, pages et fonctionnalités critiques.

## 🏗️ Architecture des tests

### Structure des dossiers

```
client/src/
├── __tests__/
│   ├── components/           # Tests des composants UI
│   │   ├── WorkoutCard.test.tsx
│   │   └── UIComponents.test.tsx
│   ├── hooks/               # Tests des hooks personnalisés
│   │   └── customHooks.test.tsx
│   ├── pages/               # Tests des pages principales
│   │   ├── ExercisesPage.test.tsx
│   │   ├── WorkoutPage.test.tsx
│   │   ├── ChallengesPage.test.tsx
│   │   └── AdditionalPages.test.tsx
│   └── integration.test.tsx # Tests d'intégration
├── test-utils/              # Utilitaires de test
│   ├── test-utils.tsx       # Helpers et wrappers
│   └── mocks/
│       └── server.ts        # Configuration MSW
├── setupTests.ts            # Configuration globale Jest
└── __mocks__/               # Mocks des modules
```

## 🔧 Configuration technique

### Technologies utilisées

- **Jest** - Framework de test principal
- **React Testing Library** - Tests des composants React
- **MSW (Mock Service Worker)** - Mock des API REST/GraphQL
- **TypeScript** - Support complet TypeScript
- **User Events** - Simulation des interactions utilisateur

### Scripts disponibles

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests pour CI/CD
npm run test:ci

# Tests en mode debug
npm run test:debug
```

## 📊 Couverture de tests

### Pages testées
- ✅ **ExercisesPage** - Recherche, filtrage, favoris
- ✅ **WorkoutPage** - Sessions, timer, progression
- ✅ **ChallengesPage** - Défis, participation, classements
- ✅ **LandingPage** - Page d'accueil et onboarding
- ✅ **AuthPage** - Authentification et inscription
- ✅ **NotFoundPage** - Gestion des erreurs 404

### Composants testés
- ✅ **WorkoutCard** - Carte d'entraînement interactive
- ✅ **Button, Input, Badge** - Composants UI de base
- ✅ **Modal, Form, Navigation** - Composants complexes

### Hooks testés
- ✅ **useWorkoutSession** - Gestion des sessions d'entraînement
- ✅ **useWorkoutTimer** - Timer et chronométrage
- ✅ **useAuth** - Authentification utilisateur
- ✅ **useLocalStorage** - Persistance locale

## 🎯 Types de tests implémentés

### Tests unitaires
- Rendu des composants
- Logique des hooks
- Validation des données
- Gestion des erreurs

### Tests d'intégration
- Flux utilisateur complets
- Interaction entre composants
- Communication avec les APIs
- Synchronisation d'état

### Tests d'accessibilité
- Navigation au clavier
- Support des lecteurs d'écran
- Structure sémantique
- Contraste et lisibilité

### Tests de performance
- Chargement lazy des composants
- Optimisation des re-renders
- Gestion de la mémoire
- Temps de réponse

## 🚀 Scénarios de test couverts

### Flux d'authentification
```typescript
✅ Connexion utilisateur
✅ Inscription nouveau compte
✅ Déconnexion
✅ Gestion des erreurs d'auth
✅ Persistance de session
```

### Flux d'entraînement
```typescript
✅ Sélection d'un workout
✅ Démarrage de session
✅ Timer et chronométrage
✅ Progression exercices
✅ Sauvegarde automatique
✅ Fin de session
```

### Flux de recherche
```typescript
✅ Recherche par nom
✅ Filtrage par catégorie
✅ Filtrage par difficulté
✅ Combinaison de filtres
✅ Gestion résultats vides
✅ Pagination
```

### Flux social
```typescript
✅ Participation aux défis
✅ Consultation classements
✅ Partage d'activités
✅ Suivi de progression
```

## 🌐 Mocks et données de test

### APIs mockées avec MSW
- **Supabase Auth** - Authentification complète
- **Exercices** - CRUD complet avec filtres
- **Workouts** - Sessions et progression
- **Challenges** - Défis et participation
- **Profils utilisateur** - Données personnelles

### Données de test
```typescript
// Exemples de factories
createMockUser()       // Utilisateur avec données complètes
createMockWorkout()    // Entraînement avec exercices
createMockExercise()   // Exercice avec métadonnées
createMockChallenge()  // Défi avec participants
```

## 🎨 Helpers et utilitaires

### Wrappers personnalisés
```typescript
// Rendu avec tous les providers
render(<Component />, {
  initialEntries: ['/workout'],
  queryClient: customQueryClient,
  theme: 'dark'
});

// Helpers d'accessibilité
expectAccessibleButton(element);
expectAccessibleInput(element, 'Label');
```

### Simulation utilisateur
```typescript
const user = userEvent.setup();

// Interactions réalistes
await user.type(input, 'texte');
await user.click(button);
await user.selectOptions(select, 'option');
await user.upload(fileInput, file);
```

## 🔍 Debugging des tests

### Outils de diagnostic
```bash
# Tests en mode debug avec plus de détails
npm run test:debug

# Afficher les éléments rendus
screen.debug();

# Chercher des éléments
screen.logTestingPlaygroundURL();

# Vérifier les queries disponibles
screen.getByRole('button', { name: /submit/i });
```

### Gestion des erreurs courantes
```typescript
// Attendre les éléments async
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Nettoyer après chaque test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
```

## 📈 Métriques de qualité

### Objectifs de couverture
- **Branches**: 70% minimum
- **Functions**: 70% minimum  
- **Lines**: 70% minimum
- **Statements**: 70% minimum

### Performance des tests
- ⚡ **Vitesse**: < 30s pour toute la suite
- 🔄 **Parallelisation**: 50% des workers CPU
- 💾 **Mémoire**: Nettoyage automatique entre tests

## 🚀 Intégration CI/CD

### GitHub Actions
```yaml
# Exemple de workflow
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v1
```

### Pre-commit hooks
```bash
# Lancer les tests avant commit
npx husky add .husky/pre-commit "npm run test:ci"
```

## 📚 Bonnes pratiques

### Structure des tests
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('displays correctly', () => {});
  });
  
  describe('Interactions', () => {
    it('handles clicks', () => {});
  });
  
  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {});
  });
});
```

### Nommage des tests
- ✅ `it('allows user to submit form with valid data')`
- ❌ `it('test form submission')`

### Sélecteurs recommandés
1. `getByRole()` - Préféré pour l'accessibilité
2. `getByLabelText()` - Pour les formulaires
3. `getByText()` - Pour le contenu
4. `getByTestId()` - En dernier recours

## 🔮 Extension future

### Tests à ajouter
- Tests E2E avec Playwright
- Tests de performance avec Lighthouse
- Tests de sécurité
- Tests cross-browser
- Tests mobile responsive

### Monitoring en production
- Intégration avec Sentry
- Métriques de performance utilisateur
- A/B testing
- Analytics d'utilisation

---

## 📞 Support

Pour toute question sur les tests :
1. Consulter la documentation des composants
2. Vérifier les exemples dans `/test-utils/`
3. Lancer `npm run test:debug` pour diagnostiquer

**Suite de tests complète et prête pour la production ! 🎉**
