#!/bin/bash

echo "🔧 Correction des imports vers les composants déplacés..."

# Mapping des composants vers leurs nouvelles locations
declare -A component_map=(
    ["AIIntelligence"]="@/features/ai-coach/components/AIIntelligence"
    ["UniformHeader"]="@/features/profile/components/UniformHeader"
    ["UserProfileTabs"]="@/features/profile/components/UserProfileTabs"
    ["AvatarUpload"]="@/features/profile/components/AvatarUpload"
    ["AppLoadingSpinner"]="@/shared/components/AppLoadingSpinner"
    ["MuscleRecoveryDashboard"]="@/features/recovery/components/MuscleRecoveryDashboard"
)

# Fichiers à corriger avec les composants spécifiques
echo "  ➤ Correction de AuthGuard.tsx..."
sed -i "s|@/components/AppLoadingSpinner|@/shared/components/AppLoadingSpinner|g" client/src/components/auth/AuthGuard.tsx

echo "  ➤ Correction de AdminPage.tsx..."
# Pour AdminDashboard qui est dans admin/, on le garde comme ça
# sed -i "s|@/components/admin|@/components/admin|g" client/src/features/admin/pages/AdminPage.tsx

echo "  ➤ Correction de RecoveryPage.tsx..."
sed -i "s|@/components/MuscleRecoveryDashboard|@/features/recovery/components/MuscleRecoveryDashboard|g" client/src/features/recovery/pages/RecoveryPage.tsx

echo "  ➤ Correction de SleepPage.tsx..."
sed -i "s|@/components/AIIntelligence|@/features/ai-coach/components/AIIntelligence|g" client/src/features/sleep/pages/SleepPage.tsx
sed -i "s|@/components/UniformHeader|@/features/profile/components/UniformHeader|g" client/src/features/sleep/pages/SleepPage.tsx

echo "  ➤ Correction de ProfilePage.tsx..."
sed -i "s|@/components/AvatarUpload|@/features/profile/components/AvatarUpload|g" client/src/features/profile/pages/ProfilePage.tsx
sed -i "s|@/components/UserProfileTabs|@/features/profile/components/UserProfileTabs|g" client/src/features/profile/pages/ProfilePage.tsx

echo "  ➤ Correction de SettingsPage.tsx..."
sed -i "s|@/components/UniformHeader|@/features/profile/components/UniformHeader|g" client/src/features/profile/pages/SettingsPage.tsx

echo "  ➤ Correction de NutritionPage.tsx..."
sed -i "s|@/components/UniformHeader|@/features/profile/components/UniformHeader|g" client/src/features/nutrition/pages/NutritionPage.tsx

echo "  ➤ Correction de SocialPage.tsx..."
sed -i "s|@/components/UniformHeader|@/features/profile/components/UniformHeader|g" client/src/features/social/pages/SocialPage.tsx

echo "✅ Tous les imports vers les composants ont été corrigés !"
