# ANALYSE DE L'ARCHITECTURE CLIENT

## 📋 MÉTHODOLOGIE
- Analyse de la structure modulaire par features
- Vérification de la migration des pages vers features
- Audit des composants, hooks, types et services
- Recommandations d'organisation

---

## 📄 PAGES À MIGRER VERS FEATURES

### Pages actuellement dans /pages
- `client/src/pages/TermsPage.tsx` (12 lignes)
- `client/src/pages/Hydration.tsx` (848 lignes)
- `client/src/pages/index.tsx` (1924 lignes)
- `client/src/pages/PrivacyPage.tsx` (74 lignes)
- `client/src/pages/SupportPage.tsx` (12 lignes)
- `client/src/pages/NotFound.tsx` (24 lignes)

## 🏗️ STRUCTURE FEATURES ACTUELLE

### Feature: admin
**Pages:**
- `AdminPage.tsx` (120 lignes)
**Hooks:**
- `useAdmin.ts` (340 lignes)
**Types:**
- `index.ts` (34 lignes)
**Services:**
- `admin.service.ts` (43 lignes)

### Feature: ai-coach
**Pages:**
- `AICoachPage.tsx` (505 lignes)
**Hooks:**
- `useAICoach.ts` (96 lignes)
**Types:**
- `index.ts` (63 lignes)
**Services:**
- `ai-coach.service.ts` (33 lignes)

### Feature: analytics
**Pages:**
- `AnalyticsPage.tsx` (698 lignes)
**Hooks:**
- `useAnalytics.ts` (47 lignes)
**Types:**
- `index.ts` (39 lignes)
**Services:**
- `analytics.service.ts` (33 lignes)

### Feature: auth
**Pages:**
- `ProfileComplete.tsx` (441 lignes)
- `AuthPage.tsx` (599 lignes)
**Hooks:**
- `useAuth.ts` (375 lignes)
**Types:**
- `index.ts` (275 lignes)
**Services:**
- `auth.service.ts` (577 lignes)

### Feature: hydration
**Pages:**
- `HydrationPage.tsx` (848 lignes)
**Hooks:**
- `useHydrationStore.ts` (331 lignes)
- `useHydration.ts` (68 lignes)
**Types:**
- `index.ts` (107 lignes)
**Services:**
- `hydration.service.ts` (43 lignes)

### Feature: landing
**Pages:**
- `LandingPage.tsx` (11 lignes)
**Hooks:**
- `useLanding.ts` (479 lignes)
**Types:**
- `index.ts` (34 lignes)
**Services:**
- `landing.service.ts` (43 lignes)

### Feature: nutrition
**Pages:**
- `NutritionPage.tsx` (1012 lignes)
**Hooks:**
- `useNutrition.ts` (324 lignes)
**Types:**
- `index.ts` (180 lignes)
**Services:**
- `nutrition.service.ts` (461 lignes)

### Feature: profile
**Pages:**
- `ProfilePage.tsx` (535 lignes)
- `SettingsPage.tsx` (1061 lignes)
**Hooks:**
- `useProfile.ts` (229 lignes)
**Types:**
- `index.ts` (34 lignes)
**Services:**
- `profile.service.ts` (43 lignes)

### Feature: recovery
**Pages:**
- `RecoveryPage.tsx` (23 lignes)
**Hooks:**
- `useRecovery.ts` (178 lignes)
**Types:**
- `index.ts` (126 lignes)
**Services:**
- `recovery.service.ts` (216 lignes)

### Feature: sleep
**Pages:**
- `SleepPage.tsx` (1077 lignes)
**Components:**
- `SleepAnalytics.tsx` (239 lignes)
- `SleepQualityForm.tsx` (317 lignes)
- `SleepChart.tsx` (142 lignes)
- `SleepGoals.tsx` (259 lignes)
**Hooks:**
- `useSleep.ts` (68 lignes)
- `useSleepStore.ts` (356 lignes)
**Types:**
- `index.ts` (105 lignes)
**Services:**
- `sleep.service.ts` (43 lignes)

### Feature: social
**Pages:**
- `ChallengesPage.tsx` (369 lignes)
- `SocialPage.tsx` (1563 lignes)
**Hooks:**
- `useSocialStore.ts` (337 lignes)
- `useSocial.ts` (68 lignes)
**Types:**
- `index.ts` (213 lignes)
**Services:**
- `social.service.ts` (43 lignes)

### Feature: wearables
**Pages:**
- `WearableHubPage.tsx` (513 lignes)
**Hooks:**
- `useWearables.ts` (68 lignes)
- `useWearableSync.ts` (75 lignes)
**Types:**
- `index.ts` (43 lignes)
**Services:**
- `wearables.service.ts` (43 lignes)
- `wearable.service.ts` (41 lignes)

### Feature: workout
**Pages:**
- `WorkoutDetailPage.tsx` (17 lignes)
- `ExercisesPage.tsx` (566 lignes)
- `WorkoutPage.tsx` (794 lignes)
- `ExerciseDetailPage.tsx` (12 lignes)
**Components:**
- `WorkoutProgressCard.tsx` (68 lignes)
- `WorkoutTipCard.tsx` (59 lignes)
- `ExerciseCard.tsx` (139 lignes)
- `WorkoutSessionHeader.tsx` (45 lignes)
- `WorkoutSessionSummary.tsx` (151 lignes)
- `WorkoutStartScreen.tsx` (163 lignes)
- `WorkoutStatsCard.tsx` (93 lignes)
**Hooks:**
- `useWorkout.ts` (274 lignes)
- `useWorkoutExercises.ts` (118 lignes)
- `useWorkoutTimer.ts` (61 lignes)
**Types:**
- `index.ts` (53 lignes)
- `WorkoutTypes.ts` (223 lignes)
**Services:**
- `workout.service.ts` (81 lignes)
- `WorkoutService.ts` (372 lignes)

## 🧩 COMPOSANTS À RÉORGANISER

### Composants dans /components (à dispatcher)
- `client/src/components/ProgressCharts.tsx` (14 lignes) → **analytics**
- `client/src/components/BalanceConnectButton.tsx` (192 lignes) → **shared**
- `client/src/components/DebugPage.tsx` (14 lignes) → **shared**
- `client/src/components/SportSelector.tsx` (690 lignes) → **shared**
- `client/src/components/PWAControls.tsx` (75 lignes) → **shared**
- `client/src/components/PersonalInfoForm.tsx` (567 lignes) → **shared**
- `client/src/components/ProtectedRoute.tsx` (168 lignes) → **shared**
- `client/src/components/AdvancedCharts.tsx` (304 lignes) → **analytics**
- `client/src/components/UniformHeader.tsx` (210 lignes) → **shared**
- `client/src/components/LanguageSelector.tsx` (64 lignes) → **shared**
- `client/src/components/WorkoutTimer.tsx` (234 lignes) → **workout**
- `client/src/components/PositionSelector.tsx` (365 lignes) → **shared**
- `client/src/components/AppErrorBoundary.tsx` (67 lignes) → **shared**
- `client/src/components/USMarketOnboarding.tsx` (321 lignes) → **shared**
- `client/src/components/SocialConnections.tsx` (466 lignes) → **social**
- `client/src/components/PillarHeader.tsx` (355 lignes) → **shared**
- `client/src/components/PrivacyManager.tsx` (453 lignes) → **shared**
- `client/src/components/ConversationalOnboarding.tsx` (1257 lignes) → **shared**
- `client/src/components/AIIntelligence.tsx` (486 lignes) → **ai-coach**
- `client/src/components/AnimatedToast.tsx` (107 lignes) → **shared**

## 🪝 HOOKS À RÉORGANISER

### Hooks dans /hooks (à dispatcher)
- `client/src/hooks/useLoadingState.ts` (237 lignes) → **shared**
- `client/src/hooks/useUserPreferences.ts` (173 lignes) → **auth**
- `client/src/hooks/useAdminApi.ts` (0 lignes) → **shared**
- `client/src/hooks/useIntelligentPreloading.ts` (98 lignes) → **shared**
- `client/src/hooks/useAnimations.ts` (128 lignes) → **shared**
- `client/src/hooks/useErrorHandler.ts` (288 lignes) → **shared**
- `client/src/hooks/useUnifiedLoading.ts` (184 lignes) → **shared**
- `client/src/hooks/usePositions.ts` (74 lignes) → **shared**
- `client/src/hooks/useSleepAnalysis.ts` (461 lignes) → **sleep**
- `client/src/hooks/useLocalStorage.ts` (29 lignes) → **shared**
- `client/src/hooks/useUnitPreferences.ts` (51 lignes) → **shared**
- `client/src/hooks/index.ts` (56 lignes) → **shared**
- `client/src/hooks/useRealtimeSync.ts` (79 lignes) → **shared**
- `client/src/hooks/usemobile.ts` (15 lignes) → **shared**
- `client/src/hooks/useHydrationReminders.ts` (367 lignes) → **hydration**
- `client/src/hooks/useAuth.ts` (96 lignes) → **auth**
- `client/src/hooks/usePWA.ts` (290 lignes) → **shared**
- `client/src/hooks/onboarding/useConversationalOnboarding.ts` (533 lignes) → **shared**
- `client/src/hooks/useNutritionTracking.ts` (126 lignes) → **nutrition**
- `client/src/hooks/use-debounce.ts` (158 lignes) → **shared**
- `client/src/hooks/useMuscleRecovery.ts` (261 lignes) → **shared**
- `client/src/hooks/use-toast.ts` (81 lignes) → **shared**
- `client/src/hooks/workout/useWorkoutPersistence.ts` (74 lignes) → **workout**
- `client/src/hooks/workout/useWorkoutExercises.ts` (157 lignes) → **workout**
- `client/src/hooks/workout/useWorkoutSession.ts` (47 lignes) → **workout**
- `client/src/hooks/workout/useWorkoutSessionCore.ts` (318 lignes) → **workout**
- `client/src/hooks/workout/useWorkoutTimer.ts` (119 lignes) → **workout**
- `client/src/hooks/workout/useExerciseHistory.ts` (106 lignes) → **workout**
- `client/src/hooks/useWearableSync.ts` (307 lignes) → **shared**
- `client/src/hooks/useAuthStatus.ts` (67 lignes) → **auth**
- `client/src/hooks/usePerformanceMonitoring.ts` (207 lignes) → **shared**
- `client/src/hooks/use-supabase-query.ts` (251 lignes) → **shared**
- `client/src/hooks/usePerformance.ts` (170 lignes) → **shared**

## 📝 TYPES À RÉORGANISER

### Types dans /types (à dispatcher)
- `client/src/types/jest.d.ts` (17 lignes) → **shared**
- `client/src/types/database.ts` (1747 lignes) → **shared**
- `client/src/types/supabase.ts` (613 lignes) → **shared**
- `client/src/types/api.ts` (114 lignes) → **shared**
- `client/src/types/userProfile.ts` (98 lignes) → **auth**
- `client/src/types/hydration-types.ts` (19 lignes) → **hydration**
- `client/src/types/conversationalOnboarding.ts` (788 lignes) → **shared**
- `client/src/types/index.ts` (271 lignes) → **shared**
- `client/src/types/toast.ts` (3 lignes) → **shared**
- `client/src/types/muscleRecovery.ts` (85 lignes) → **shared**
- `client/src/types/common.ts` (366 lignes) → **shared**
- `client/src/types/dashboard.ts` (46 lignes) → **shared**
- `client/src/types/onboarding-types.ts` (108 lignes) → **onboarding**

## 📊 STATISTIQUES

### Fichiers à migrer
- **Pages** dans /pages: 6
- **Composants** dans /components: 53
- **Hooks** dans /hooks: 33
- **Types** dans /types: 13
- **Services** dans /services: 14

### Features existantes
- **Nombre de features**: 13

## 🎯 RECOMMANDATIONS

### Structure cible recommandée
```
src/
├── features/
│   ├── workout/           # Entraînements et exercices
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── services/
│   ├── nutrition/         # Nutrition et alimentation
│   ├── hydration/         # Hydratation
│   ├── sleep/             # Sommeil
│   ├── social/            # Social et partage
│   ├── auth/              # Authentification
│   ├── profile/           # Profil utilisateur
│   ├── analytics/         # Analyses et statistiques
│   ├── ai-coach/          # Coach IA
│   └── onboarding/        # Processus d'accueil
├── shared/                # Éléments partagés
│   ├── components/
│   ├── hooks/
│   ├── types/
│   ├── services/
│   └── utils/
└── pages/                 # Pages de niveau app (minimal)
```

### Actions prioritaires
1. **Migrer les pages** vers leurs features respectives
2. **Réorganiser les composants** par domaine fonctionnel
3. **Dispatcher les hooks** vers les features appropriées
4. **Organiser les types** par contexte métier
5. **Centraliser les services** partagés dans /shared

## 🚀 SCRIPT DE MIGRATION GÉNÉRÉ

Un script de migration automatique a été créé: `migration-architecture.sh`

⚠️ **IMPORTANT**: Faire une sauvegarde Git avant d'exécuter le script!

```bash
./migration-architecture.sh
```
