# ANALYSE DÉTAILLÉE DES DOUBLONS

## 📋 MÉTHODOLOGIE
- Analyse par patterns de noms similaires
- Comparaison du contenu des fichiers
- Détection des imports croisés
- Évaluation de l'impact

---

## 🔧 SERVICES DUPLIQUÉS

### Services Supabase
- `client/src/services/supabaseService.ts` (0 lignes)
- `client/src/services/supabaseServiceUnified.ts` (245 lignes)
- `client/src/services/supabaseService.examples.tsx` (342 lignes)

### Services API
- `client/src/services/ApiService.ts` (273 lignes)

## 🏪 STORES DUPLIQUÉS

### Stores Auth
- `client/src/store/authStore.ts` (162 lignes)

### Stores App
- `client/src/store/useAppStore.ts` (951 lignes)
- `client/src/store/appStore.ts` (727 lignes)

## 📝 TYPES DUPLIQUÉS

### Types Workout
- `client/src/features/workout/services/workout.service.ts` (81 lignes)
- `client/src/services/workout.service.ts` (262 lignes)
- `client/src/store/slices/workout.slice.ts` (258 lignes)
- `client/src/types/workout.ts` (40 lignes)
- `client/src/types/workout.types.ts` (153 lignes)
- `client/src/shared/types/workout.types.ts` (216 lignes)

### Types Onboarding
- `client/src/data/onboardingData.ts` (784 lignes)
- `client/src/types/onboarding-types.ts` (108 lignes)
- `client/src/types/onboarding.ts` (58 lignes)

## 🔗 ANALYSE DES IMPORTS

### Imports de services Supabase
```bash
client/src/services/supabaseService.examples.tsx:import SupabaseService, { useSupabaseQuery } from '@/services/supabaseService';
```

### Imports de stores Auth
```bash
```

## 🧩 COMPOSANTS POTENTIELLEMENT DUPLIQUÉS

### Composant: AppRouter
- `client/src/router/AppRouter.tsx` (98 lignes)
- `client/src/routes/AppRouter.tsx` (45 lignes)

### Composant: Layout
- `client/src/shared/components/Layout/Layout.tsx` (236 lignes)
- `client/src/components/Layout.tsx` (110 lignes)

### Composant: ProtectedRoute
- `client/src/router/components/ProtectedRoute.tsx` (44 lignes)
- `client/src/components/ProtectedRoute.tsx` (168 lignes)

### Composant: WorkoutPage
- `client/src/features/workout/pages/WorkoutPage.tsx` (794 lignes)
- `client/src/pages/WorkoutPage.tsx` (794 lignes)

### Composant: index
- `client/src/app/router/index.tsx` (203 lignes)
- `client/src/pages/index.tsx` (1924 lignes)

## 🚀 SCRIPT DE MIGRATION GÉNÉRÉ

Un script de migration automatique a été créé: `migration-doublons.sh`

⚠️ **IMPORTANT**: Faire une sauvegarde Git avant d'exécuter le script!

```bash
./migration-doublons.sh
```
