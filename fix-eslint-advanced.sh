#!/bin/bash

# Script de correction ESLint automatique - Version améliorée
echo "🧹 Correction automatique des erreurs ESLint courantes..."

CLIENT_DIR="/workspaces/MyFitHeroV4/client/src"

# 1. Correction automatique ESLint standard
echo "1️⃣ Application des corrections automatiques ESLint..."
cd /workspaces/MyFitHeroV4/client
npm run lint -- --fix

# 2. Correction manuelle des apostrophes les plus communes
echo "2️⃣ Correction des apostrophes communes..."

# Fichiers spécifiques avec des erreurs d'apostrophes connues
declare -A apostrophe_fixes=(
    ["$CLIENT_DIR/features/admin/components/AdminDashboard.tsx"]="Aujourd'hui:Aujourd&apos;hui"
    ["$CLIENT_DIR/features/wearables/components/WearableNotificationCenter.tsx"]="d'activité:d&apos;activité"
    ["$CLIENT_DIR/features/workout/components/MuscleRecoveryDashboard.tsx"]="d'entraînement:d&apos;entraînement,l'entraînement:l&apos;entraînement"
)

for file in "${!apostrophe_fixes[@]}"; do
    if [ -f "$file" ]; then
        echo "  📝 Correction de $file"
        IFS=',' read -ra fixes <<< "${apostrophe_fixes[$file]}"
        for fix in "${fixes[@]}"; do
            IFS=':' read -ra parts <<< "$fix"
            if [ ${#parts[@]} -eq 2 ]; then
                sed -i "s/${parts[0]}/${parts[1]}/g" "$file"
            fi
        done
    fi
done

# 3. Suppression des imports inutilisés courants
echo "3️⃣ Suppression des imports inutilisés..."

# Fonction pour supprimer un import inutilisé
remove_unused_import() {
    local file="$1"
    local import_name="$2"
    
    if [ -f "$file" ]; then
        # Supprime l'import de la liste des imports
        sed -i "s/, *${import_name}//g" "$file"
        sed -i "s/${import_name}, *//g" "$file"
        sed -i "/^import.*${import_name}.*from/d" "$file"
    fi
}

# Liste des suppressions d'imports
remove_unused_import "$CLIENT_DIR/features/social/pages/SocialPage.tsx" "Zap"
remove_unused_import "$CLIENT_DIR/features/social/pages/SocialPage.tsx" "ChevronRight"
remove_unused_import "$CLIENT_DIR/features/social/pages/SocialPage.tsx" "Camera"
remove_unused_import "$CLIENT_DIR/features/social/pages/SocialPage.tsx" "Clock"
remove_unused_import "$CLIENT_DIR/features/social/pages/SocialPage.tsx" "Flame"

remove_unused_import "$CLIENT_DIR/features/social/pages/ChallengesPage.tsx" "useEffect"
remove_unused_import "$CLIENT_DIR/features/social/pages/ChallengesPage.tsx" "AnimatePresence"

remove_unused_import "$CLIENT_DIR/features/workout/components/MuscleRecoveryDashboard.tsx" "useEffect"

# 4. Nouvelle vérification
echo "4️⃣ Vérification des résultats..."
cd /workspaces/MyFitHeroV4/client

error_count=$(npm run lint 2>&1 | grep -c "error" || echo "0")
warning_count=$(npm run lint 2>&1 | grep -c "warning" || echo "0")

echo "📊 Résultats:"
echo "   • Erreurs: $error_count"
echo "   • Avertissements: $warning_count"

echo "✅ Script de correction terminé!"
