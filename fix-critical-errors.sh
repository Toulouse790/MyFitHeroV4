#!/bin/bash

# Script pour corriger les erreurs critiques TypeScript/ESLint

echo "🔧 Correction des erreurs critiques..."

# 1. Corriger les imports inutilisés dans SleepQualityForm
echo "📝 Correction de SleepQualityForm..."
sed -i 's/SleepFactor,//' /workspaces/MyFitHeroV4/client/src/features/sleep/components/SleepQualityForm.tsx

# 2. Corriger les variables inutilisées dans SleepPage
echo "📝 Correction de SleepPage..."
sed -i '/import { Target, Play, Pause, Bell }/c\import { Play }' /workspaces/MyFitHeroV4/client/src/features/sleep/pages/SleepPage.tsx

# 3. Corriger les apostrophes dans les entités React 
echo "📝 Correction des apostrophes dans SleepPage..."
sed -i "s/doesn't/doesn&apos;t/g" /workspaces/MyFitHeroV4/client/src/features/sleep/pages/SleepPage.tsx
sed -i "s/can't/can&apos;t/g" /workspaces/MyFitHeroV4/client/src/features/sleep/pages/SleepPage.tsx

# 4. Corriger les imports inutilisés dans social components
echo "📝 Correction des imports dans les composants sociaux..."
sed -i 's/baseConfig.*,//' /workspaces/MyFitHeroV4/client/src/features/social/components/BadgeNotification.tsx

# 5. Corriger les imports inutilisés dans FriendsComparison
sed -i '/TrendingDown,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/FriendsComparison.tsx
sed -i '/ChevronRight,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/FriendsComparison.tsx
sed -i '/Calendar,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/FriendsComparison.tsx

# 6. Corriger PrivacyManager
sed -i 's/updateAppStoreUserProfile.*,//' /workspaces/MyFitHeroV4/client/src/features/social/components/PrivacyManager.tsx

# 7. Corriger les quotes dans PrivacyManager
sed -i 's/"public"/"public"/g' /workspaces/MyFitHeroV4/client/src/features/social/components/PrivacyManager.tsx

# 8. Corriger SocialConnections - supprimer les imports inutilisés
echo "📝 Correction de SocialConnections..."
sed -i '/Trophy,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Target,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Calendar,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Crown,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Medal,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Activity,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/ChevronRight,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Filter,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/Phone,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i '/MapPin,/d' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx

# 9. Corriger les variables inutilisées dans SocialConnections
sed -i 's/const { appStoreUser }/const { }/' /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx

# 10. Corriger les apostrophes dans SocialConnections
sed -i "s/can't/can&apos;t/g" /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx
sed -i "s/doesn't/doesn&apos;t/g" /workspaces/MyFitHeroV4/client/src/features/social/components/SocialConnections.tsx

# 11. Corriger WorkoutDashboard - imports inutilisés
echo "📝 Correction de WorkoutDashboard..."
sed -i '/Activity,/d' /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx
sed -i '/Share2,/d' /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx
sed -i '/, cn/d' /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx

# 12. Corriger les variables inutilisées dans WorkoutDashboard
sed -i 's/(userId: string)/(_userId: string)/' /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx

# 13. Corriger les apostrophes dans WorkoutDashboard
sed -i "s/You're/You&apos;re/g" /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx
sed -i "s/you're/you&apos;re/g" /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx
sed -i "s/Let's/Let&apos;s/g" /workspaces/MyFitHeroV4/client/src/features/workout/components/WorkoutDashboard.tsx

echo "✅ Correction des erreurs critiques terminée!"
