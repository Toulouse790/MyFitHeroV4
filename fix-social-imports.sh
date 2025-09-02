#!/bin/bash

# Script pour nettoyer les imports inutilisés dans les pages sociales
# Utilisation: ./fix-social-imports.sh

echo "🧹 Nettoyage des imports inutilisés dans les pages sociales..."

# SocialPage.tsx - Suppression des imports inutilisés
echo "Nettoyage de SocialPage.tsx..."

# Supprime les imports d'icônes non utilisées
sed -i '/import.*Zap.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*ChevronRight.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*X.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*Camera.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*Clock.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*Flame.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx
sed -i '/import.*Search.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/SocialPage.tsx

# ChallengesPage.tsx - Suppression des imports inutilisés
echo "Nettoyage de ChallengesPage.tsx..."

sed -i '/import.*useEffect.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/ChallengesPage.tsx
sed -i '/import.*AnimatePresence.*from/d' /workspaces/MyFitHeroV4/client/src/features/social/pages/ChallengesPage.tsx

echo "✅ Nettoyage terminé!"
