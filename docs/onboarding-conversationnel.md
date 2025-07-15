# 🎯 MyFitHero V4 - Onboarding Conversationnel

## 📋 Vue d'ensemble

L'onboarding conversationnel de MyFitHero V4 est un système intelligent et adaptatif qui guide les utilisateurs à travers un processus de configuration personnalisé. Il s'adapte dynamiquement aux modules sélectionnés et utilise des données en temps réel depuis Supabase.

## 🏗️ Architecture

### Structure des fichiers

```
client/src/
├── components/
│   ├── ConversationalOnboarding.tsx      # Composant principal
│   ├── SportSelector.tsx                 # Sélecteur de sport avec recherche
│   ├── PositionSelector.tsx             # Sélecteur de position sportive
│   ├── PersonalInfoForm.tsx             # Formulaire d'informations personnelles
│   └── OnboardingQuestionnaire.tsx      # Wrapper compatible
├── types/
│   └── conversationalOnboarding.ts       # Types TypeScript
├── data/
│   └── conversationalFlow.ts             # Configuration du flux
├── services/
│   └── sportsService.ts                  # Service pour les sports
└── hooks/
    └── useSports.ts                      # Hook React pour les sports
```

## 🔧 Fonctionnalités clés

### 1. Flux adaptatif
- **Étapes conditionnelles** : Seules les étapes pertinentes aux modules sélectionnés sont affichées
- **Navigation intelligente** : L'ordre des étapes s'adapte aux choix de l'utilisateur
- **Sauvegarde automatique** : Les données sont sauvegardées à chaque étape

### 2. Données dynamiques
- **Sports en temps réel** : Chargement depuis `sports_library` avec fallback
- **Positions adaptatives** : Positions spécifiques selon le sport sélectionné
- **Recherche avancée** : Autocomplétion avec suggestions personnalisées

### 3. UX moderne
- **Design conversationnel** : Interface en forme de dialogue
- **Progression claire** : Barre de progression avec temps estimé
- **Validation temps réel** : Retours immédiats sur les erreurs
- **Conseils contextuels** : Tips adaptatifs selon l'étape

## 🚀 Utilisation

### Installation

```bash
# Installer les dépendances
pnpm install @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-slot class-variance-authority lucide-react

# Vérifier les composants UI
ls client/src/components/ui/
```

### Intégration basique

```tsx
import ConversationalOnboarding from '@/components/ConversationalOnboarding';

function App() {
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding terminé:', data);
    // Rediriger vers le dashboard
  };

  return (
    <ConversationalOnboarding
      onComplete={handleOnboardingComplete}
    />
  );
}
```

## 📊 Structure des données

### OnboardingData

```typescript
interface OnboardingData {
  // Progression
  progress: OnboardingProgress;
  startedAt: Date;
  lastUpdated: Date;
  
  // Informations de base
  firstName?: string;
  age?: number;
  gender?: 'male' | 'female';
  mainObjective?: string;
  selectedModules?: string[];
  
  // Données spécifiques par module
  sport?: string;
  sportPosition?: string;
  // ... autres champs
}
```

### Configuration des étapes

```typescript
interface ConversationalStep {
  id: string;
  type: 'question' | 'info' | 'confirmation' | 'summary';
  title: string;
  inputType?: 'text' | 'single-select' | 'multi-select' | 'slider' | 'toggle';
  options?: ConversationalOption[];
  validation?: ValidationRule[];
  nextStep?: string | ((response: any, data: OnboardingData) => string);
  condition?: (data: OnboardingData) => boolean;
}
```

## 🔄 Flux de l'onboarding

### Étapes principales

1. **Accueil** (`welcome`)
   - Présentation de MyFitHero
   - Estimation du temps nécessaire

2. **Prénom** (`get_name`)
   - Saisie du prénom
   - Validation temps réel

3. **Objectif principal** (`main_objective`)
   - Sélection parmi les objectifs prédéfinis
   - Recommandation automatique de modules

4. **Modules** (`module_selection`)
   - Sélection des modules désirés
   - Modules recommandés mis en avant

5. **Informations personnelles** (`personal_info`)
   - Formulaire multi-étapes
   - Âge, genre, style de vie, temps disponible

6. **Modules spécifiques** (conditionnels)
   - Sport : sélection + position + niveau
   - Musculation : objectif + expérience
   - Nutrition : régime + objectifs + allergies
   - Sommeil : durée + difficultés
   - Hydratation : objectif + rappels

7. **Finalisation** (`final_questions`, `summary`, `completion`)
   - Motivation personnelle
   - Résumé du profil
   - Consentements

## 🎨 Personnalisation

### Ajouter une nouvelle étape

```typescript
// Dans conversationalFlow.ts
{
  id: 'my_custom_step',
  type: 'question',
  title: 'Mon étape personnalisée',
  question: 'Quelle est votre question ?',
  inputType: 'single-select',
  options: [
    { id: 'option1', label: 'Option 1', value: 'opt1' },
    { id: 'option2', label: 'Option 2', value: 'opt2' }
  ],
  condition: (data) => data.selectedModules?.includes('custom'),
  nextStep: 'next_step_id'
}
```

### Modifier les sports disponibles

```typescript
// Via le service
import { SportsService } from '@/services/sportsService';

// Ajouter un nouveau sport
await SportsService.suggestNewSport('Mon Sport', 'Ma Position');

// Rechercher des sports
const results = await SportsService.searchSports('foot');
```

## 🔍 Validation et erreurs

### Règles de validation

```typescript
validation: [
  { type: 'required', message: 'Ce champ est obligatoire' },
  { type: 'min', value: 13, message: 'Âge minimum: 13 ans' },
  { type: 'max', value: 100, message: 'Âge maximum: 100 ans' },
  { type: 'custom', validator: (value) => value.length > 0, message: 'Erreur personnalisée' }
]
```

### Gestion des erreurs

```typescript
// Affichage automatique des erreurs
const [validationErrors, setValidationErrors] = useState<string[]>([]);

// Validation à chaque étape
const validateResponse = (step: ConversationalStep, response: any) => {
  // Logique de validation
  return errors;
};
```

## 💾 Sauvegarde et synchronisation

### Sauvegarde automatique

```typescript
const saveProgress = async (data: OnboardingData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      first_name: data.firstName,
      age: data.age,
      // ... autres champs
    });
};
```

### Reprise de session

```typescript
// Récupération des données existantes
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Initialisation avec les données existantes
const [onboardingData, setOnboardingData] = useState<OnboardingData>({
  firstName: profile?.first_name,
  age: profile?.age,
  // ... autres champs
});
```

## 🎭 Thèmes et styles

### Variables CSS personnalisées

```css
:root {
  --primary: 220 89% 50%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 94%;
  --muted: 210 40% 96%;
  --border: 214 32% 91%;
  --ring: 222 84% 5%;
}
```

### Personnalisation des couleurs

```typescript
// Dans getModuleColor()
const colors: Record<string, string> = {
  sport: '#3B82F6',
  strength: '#EF4444',
  nutrition: '#10B981',
  sleep: '#8B5CF6',
  hydration: '#06B6D4',
  wellness: '#F59E0B'
};
```

## 🧪 Tests et débogage

### Tests unitaires

```typescript
// Test d'une étape
describe('ConversationalOnboarding', () => {
  it('should validate age input', () => {
    const step = findStep('get_age');
    const errors = validateResponse(step, 15);
    expect(errors).toHaveLength(0);
  });
});
```

### Debug mode

```typescript
// Activer le mode debug
const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');

// Logs détaillés
if (debugMode) {
  console.log('Current step:', currentStep);
  console.log('Onboarding data:', onboardingData);
}
```

## 🔧 Maintenance et mises à jour

### Ajout de nouveaux modules

1. Ajouter le module dans `AVAILABLE_MODULES`
2. Créer les étapes correspondantes dans `conversationalFlow.ts`
3. Ajouter les conditions et la logique de navigation
4. Mettre à jour les types TypeScript

### Modification des sports

1. Mettre à jour la table `sports_library` dans Supabase
2. Le cache se mettra à jour automatiquement (5 minutes)
3. Forcer la mise à jour avec `SportsService.clearCache()`

## 📈 Analytics et métriques

### Événements trackés

- Début d'onboarding
- Progression par étape
- Modules sélectionnés
- Temps passé par étape
- Taux d'abandon
- Finalisation réussie

### Exemple d'implémentation

```typescript
// Dans analytics.ts
export const trackOnboardingStep = (stepId: string, data: OnboardingData) => {
  analytics.track('onboarding_step_completed', {
    step_id: stepId,
    progress: data.progress.completedSteps.length,
    modules: data.selectedModules
  });
};
```

## 🚨 Troubleshooting

### Erreurs communes

1. **Composants UI manquants** : Vérifier l'installation des dépendances Radix UI
2. **Sports non chargés** : Vérifier la connection Supabase et la table `sports_library`
3. **Navigation bloquée** : Vérifier les conditions et la validation des étapes
4. **Données non sauvegardées** : Vérifier les permissions RLS dans Supabase

### Solutions

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
pnpm install

# Vérifier la base de données
pnpm supabase status
pnpm supabase db reset

# Logs de debug
export DEBUG=myfithero:*
```

## 🎉 Conclusion

L'onboarding conversationnel de MyFitHero V4 offre une expérience utilisateur moderne et personnalisée. Le système est extensible, maintenu et optimisé pour une utilisation en production.

Pour toute question ou contribution, consultez la documentation développeur ou ouvrez une issue sur le repository.
