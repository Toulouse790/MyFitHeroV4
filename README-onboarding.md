# 🎯 Onboarding Conversationnel - MyFitHero V4

## ✨ Présentation

L'onboarding conversationnel de MyFitHero V4 est un système révolutionnaire qui transforme la configuration initiale en une expérience interactive et personnalisée. Il guide intelligemment les utilisateurs à travers un processus adaptatif qui s'ajuste selon leurs besoins et objectifs.

## 🚀 Démarrage rapide

### 1. Installation
```bash
# Installer les dépendances
pnpm install

# Installer les dépendances UI spécifiques
pnpm install @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-slot class-variance-authority lucide-react
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Configurer vos variables Supabase
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Base de données
```bash
# Appliquer les migrations
supabase db push

# Ou exécuter manuellement le SQL
# Fichier: supabase/migrations/04_onboarding_conversational.sql
```

### 4. Démarrage
```bash
# Utiliser le script automatique
./start-onboarding.sh

# Ou démarrer manuellement
pnpm run dev
```

## 🎨 Fonctionnalités

### ✅ Implémentées
- **Flux conversationnel** : Interface de dialogue intuitive
- **Modules adaptatifs** : Étapes conditionnelles selon les sélections
- **Données dynamiques** : Sports et positions depuis Supabase
- **Validation temps réel** : Feedback immédiat sur les erreurs
- **Sauvegarde automatique** : Progression sauvegardée à chaque étape
- **Recherche intelligente** : Autocomplétion pour les sports
- **Suggestions personnalisées** : Recommandations basées sur les objectifs
- **Design responsive** : Interface optimisée mobile/desktop
- **Gestion des erreurs** : Fallback et récupération automatique

### 🔄 Modules intégrés
- **Sport** : Sélection + position + niveau + équipement
- **Musculation** : Objectifs + expérience + matériel
- **Nutrition** : Régime + allergies + objectifs
- **Sommeil** : Durée + qualité + environnement
- **Hydratation** : Objectifs + rappels + contexte
- **Bien-être** : Stress + mental + récupération

## 🏗️ Architecture

### Structure des composants
```
📁 components/
├── 🎯 ConversationalOnboarding.tsx    # Composant principal
├── 🏃 SportSelector.tsx               # Sélection de sport
├── 🎯 PositionSelector.tsx            # Sélection de position
├── 👤 PersonalInfoForm.tsx            # Informations personnelles
├── 🎮 OnboardingDemo.tsx              # Démonstration
└── 📝 OnboardingQuestionnaire.tsx     # Wrapper compatible

📁 types/
└── 🔧 conversationalOnboarding.ts     # Types TypeScript

📁 data/
└── 🌊 conversationalFlow.ts           # Configuration du flux

📁 services/
└── 🏃 sportsService.ts                # Service API sports
```

### Flux de données
```
1. Utilisateur → ConversationalOnboarding
2. ConversationalOnboarding → Flow Configuration
3. Flow → Étapes conditionnelles
4. Étapes → Validation + Sauvegarde
5. Sauvegarde → Supabase
6. Finalisation → Callback completion
```

## 🎯 Utilisation

### Intégration basique
```tsx
import ConversationalOnboarding from '@/components/ConversationalOnboarding';

function App() {
  const handleComplete = (data: OnboardingData) => {
    console.log('Onboarding terminé:', data);
    // Redirection vers le dashboard
  };

  return (
    <ConversationalOnboarding
      onComplete={handleComplete}
    />
  );
}
```

### Personnalisation avancée
```tsx
// Ajouter une étape personnalisée
const customStep: ConversationalStep = {
  id: 'custom_step',
  type: 'question',
  title: 'Ma question personnalisée',
  inputType: 'single-select',
  options: [
    { id: 'opt1', label: 'Option 1', value: 'value1' },
    { id: 'opt2', label: 'Option 2', value: 'value2' }
  ],
  condition: (data) => data.selectedModules?.includes('custom'),
  nextStep: 'next_step'
};
```

## 🧪 Tests

### Composant de démonstration
```tsx
import OnboardingDemo from '@/components/OnboardingDemo';

// Accéder à /onboarding-test
function TestPage() {
  return <OnboardingDemo />;
}
```

### Tests unitaires
```bash
# Lancer les tests
pnpm test

# Tests spécifiques à l'onboarding
pnpm test -- --testNamePattern="ConversationalOnboarding"
```

## 🎨 Personnalisation

### Couleurs et thèmes
```css
/* Variables CSS personnalisées */
:root {
  --primary: 220 89% 50%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 94%;
  --success: 142 76% 36%;
  --warning: 47 96% 53%;
  --error: 0 84% 60%;
}
```

### Modules personnalisés
```typescript
// Ajouter un nouveau module
const customModule: OnboardingModule = {
  id: 'custom',
  name: 'Module personnalisé',
  icon: '🎯',
  description: 'Description du module',
  benefits: ['Avantage 1', 'Avantage 2']
};
```

## 📊 Analytics

### Événements trackés
- `onboarding_started` : Début de l'onboarding
- `onboarding_step_completed` : Étape terminée
- `onboarding_module_selected` : Module sélectionné
- `onboarding_abandoned` : Abandon du processus
- `onboarding_completed` : Finalisation réussie

### Métriques disponibles
```sql
-- Taux de complétion
SELECT * FROM onboarding_stats;

-- Sports populaires
SELECT * FROM popular_sports;

-- Durée moyenne par étape
SELECT 
  step_id,
  AVG(duration_seconds) as avg_duration
FROM onboarding_analytics
GROUP BY step_id;
```

## 🔧 Configuration

### Variables d'environnement
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optionnel)
VITE_ANALYTICS_ID=your-analytics-id

# Debug (développement)
VITE_DEBUG_ONBOARDING=true
```

### Configuration du flux
```typescript
// Dans conversationalFlow.ts
export const ONBOARDING_CONFIG = {
  // Durée estimée par défaut
  estimatedDuration: 15,
  
  // Modules disponibles
  availableModules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration'],
  
  // Cache des sports (minutes)
  sportsCacheDuration: 5,
  
  // Sauvegarde automatique
  autoSaveInterval: 30000, // 30 secondes
};
```

## 🚨 Dépannage

### Erreurs communes

1. **Composants UI manquants**
   ```bash
   # Réinstaller les dépendances Radix UI
   pnpm install @radix-ui/react-slider @radix-ui/react-switch
   ```

2. **Sports non chargés**
   ```bash
   # Vérifier la connexion Supabase
   supabase status
   
   # Appliquer les migrations
   supabase db push
   ```

3. **Erreurs de types TypeScript**
   ```bash
   # Régénérer les types
   pnpm run type-check
   ```

### Logs de debug
```typescript
// Activer le mode debug
localStorage.setItem('debug', 'myfithero:onboarding');

// Voir les logs dans la console
console.log('Onboarding data:', data);
```

## 📈 Performance

### Optimisations implémentées
- **Lazy loading** : Composants chargés à la demande
- **Memoization** : Évite les re-rendus inutiles
- **Cache intelligent** : Sports mis en cache (5 minutes)
- **Validation optimisée** : Debounce sur les champs texte
- **Bundle splitting** : Code séparé par module

### Métriques cibles
- **Temps de chargement** : < 2 secondes
- **Fluidité** : 60 FPS sur mobile
- **Taille du bundle** : < 500 KB (gzipped)
- **Taux de complétion** : > 80%

## 🌟 Feuille de route

### Prochaines fonctionnalités
- [ ] **IA conversationnelle** : Responses générées par IA
- [ ] **Recommandations prédictives** : ML pour les suggestions
- [ ] **Onboarding vocal** : Interface voice-to-text
- [ ] **Réalité augmentée** : Visualisation des exercices
- [ ] **Gamification** : Badges et progression
- [ ] **Intégration wearables** : Données des montres connectées

### Améliorations UX
- [ ] **Animations fluides** : Transitions entre étapes
- [ ] **Mode sombre** : Interface adaptative
- [ ] **Accessibilité** : Support lecteurs d'écran
- [ ] **Multi-langue** : Support i18n
- [ ] **Offline first** : Fonctionnement hors ligne

## 🤝 Contribution

### Comment contribuer
1. Fork le repository
2. Créer une branche feature
3. Implémenter les changements
4. Ajouter des tests
5. Créer une Pull Request

### Standards de code
- **TypeScript** : Types stricts requis
- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **Tests** : Couverture > 80%

## 📞 Support

### Documentation
- **Guide développeur** : `docs/onboarding-conversationnel.md`
- **API Reference** : `docs/api/`
- **Exemples** : `examples/`

### Community
- **Discord** : [Lien vers le serveur]
- **GitHub Issues** : [Signaler un bug]
- **Stack Overflow** : Tag `myfithero`

---

**Créé avec ❤️ par l'équipe MyFitHero**

*Pour une expérience utilisateur révolutionnaire dans le fitness*
