#!/bin/bash

echo "🔧 Correction des imports use-toast..."

# Fichiers à corriger
files=(
    "client/src/components/ui/toaster.tsx"
    "client/src/services/sportsService.ts"
    "client/src/features/admin/pages/AdminPage.tsx"
    "client/src/features/sleep/components/SleepQualityForm.tsx"
    "client/src/features/sleep/components/SleepGoals.tsx"
    "client/src/features/sleep/pages/SleepPage.tsx"
    "client/src/features/profile/pages/SettingsPage.tsx"
    "client/src/features/social/pages/SocialPage.tsx"
    "client/src/features/hydration/pages/HydrationPage.tsx"
    "client/src/features/wearables/pages/WearableHubPage.tsx"
    "client/src/features/analytics/pages/AnalyticsPage.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ➤ Correction de $file"
        sed -i "s|@/hooks/use-toast|@/shared/hooks/use-toast|g" "$file"
    else
        echo "  ⚠️  Fichier non trouvé: $file"
    fi
done

echo "✅ Tous les imports use-toast ont été corrigés !"
