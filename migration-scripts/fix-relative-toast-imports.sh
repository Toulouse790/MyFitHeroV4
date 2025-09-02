#!/bin/bash

echo "🔧 Correction de tous les imports use-toast relatifs..."

# Liste des fichiers à corriger
files=(
    "client/src/__tests__/components/WorkoutCard.test.tsx"
    "client/src/components/ui/toaster.tsx"
    "client/src/services/sportsService.ts"
    "client/src/features/admin/pages/AdminPage.tsx"
    "client/src/features/sleep/components/SleepQualityForm.tsx"
    "client/src/features/sleep/components/SleepGoals.tsx"
    "client/src/features/sleep/hooks/useSleepAnalysis.ts"
    "client/src/features/sleep/pages/SleepPage.tsx"
    "client/src/features/ai-coach/components/OnboardingQuestionnaire.tsx"
    "client/src/features/ai-coach/components/DailyCheckIn.tsx"
    "client/src/features/ai-coach/hooks/usePositions.ts"
    "client/src/features/profile/components/AvatarUpload.tsx"
    "client/src/features/profile/pages/SettingsPage.tsx"
    "client/src/features/nutrition/hooks/useNutritionTracking.ts"
    "client/src/features/nutrition/pages/NutritionPage.tsx"
    "client/src/features/auth/components/ConversationalOnboarding.tsx"
    "client/src/features/auth/components/AuthPages.tsx"
    "client/src/features/auth/hooks/useConversationalOnboarding.ts"
    "client/src/features/auth/hooks/usePWA.ts"
    "client/src/features/social/components/SocialConnections.tsx"
    "client/src/features/social/components/PrivacyManager.tsx"
    "client/src/features/social/components/FriendsComparison.tsx"
    "client/src/features/social/components/SocialDashboard.tsx"
    "client/src/features/social/pages/SocialPage.tsx"
    "client/src/features/hydration/hooks/useHydrationReminders.ts"
    "client/src/features/hydration/pages/Hydration.tsx"
    "client/src/features/hydration/pages/HydrationPage.tsx"
    "client/src/features/wearables/components/WearableNotificationCenter.tsx"
    "client/src/features/wearables/hooks/useWearableSync.ts"
    "client/src/features/wearables/pages/WearableHubPage.tsx"
    "client/src/features/analytics/components/SportSelector.tsx"
    "client/src/features/analytics/components/StatsOverview.tsx"
    "client/src/features/analytics/components/SmartHealthDashboard.tsx"
    "client/src/features/analytics/pages/AnalyticsPage.tsx"
    "client/src/features/workout/components/BadgeDisplay.tsx"
    "client/src/features/workout/components/WorkoutCard.tsx"
    "client/src/features/workout/components/WorkoutDashboard.tsx"
    "client/src/features/workout/hooks/useWorkoutExercises.ts"
    "client/src/features/workout/hooks/useWorkoutSessionCore.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ➤ Correction de $file"
        sed -i "s|from '../use-toast'|from '@/shared/hooks/use-toast'|g" "$file"
        sed -i "s|from './use-toast'|from '@/shared/hooks/use-toast'|g" "$file"
        sed -i 's|from "../use-toast"|from "@/shared/hooks/use-toast"|g' "$file"
        sed -i 's|from "./use-toast"|from "@/shared/hooks/use-toast"|g' "$file"
    else
        echo "  ⚠️  Fichier non trouvé: $file"
    fi
done

echo "✅ Tous les imports use-toast relatifs ont été corrigés !"
