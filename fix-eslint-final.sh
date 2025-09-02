#!/bin/bash

# Script de nettoyage final pour les erreurs ESLint communes
echo "🔧 Nettoyage final des erreurs ESLint courantes..."

CLIENT_DIR="/workspaces/MyFitHeroV4/client/src"

# 1. Correction des variables inutilisées avec préfixe _
echo "1️⃣ Ajout de préfixes _ pour les paramètres inutilisés..."

# Fonction pour ajouter le préfixe _ à un paramètre
add_underscore_prefix() {
    local file="$1"
    local var_name="$2"
    local line_number="$3"
    
    if [ -f "$file" ]; then
        echo "  📝 Ajout du préfixe _ à '$var_name' dans $file:$line_number"
        sed -i "${line_number}s/\\b${var_name}\\b/_${var_name}/g" "$file"
    fi
}

# Corrections spécifiques basées sur les erreurs connues
declare -A underscore_fixes=(
    ["$CLIENT_DIR/features/social/pages/ChallengesPage.tsx:67"]="challenge"
    ["$CLIENT_DIR/features/social/pages/ChallengesPage.tsx:95"]="challenge"
    ["$CLIENT_DIR/features/social/pages/ChallengesPage.tsx:286"]="challenge"
    ["$CLIENT_DIR/features/workout/components/BadgeSystem.tsx:165"]="b"
    ["$CLIENT_DIR/features/workout/components/BadgeSystem.tsx:176"]="b"
    ["$CLIENT_DIR/features/workout/hooks/useWorkout.ts:253"]="exercise"
    ["$CLIENT_DIR/pages/index.tsx:844"]="get"
    ["$CLIENT_DIR/pages/index.tsx:921"]="state"
    ["$CLIENT_DIR/pages/index.tsx:1674"]="location"
    ["$CLIENT_DIR/pages/index.tsx:1762"]="user"
)

# Applique les corrections de préfixe
for fix in "${!underscore_fixes[@]}"; do
    IFS=':' read -ra parts <<< "$fix"
    if [ ${#parts[@]} -eq 2 ]; then
        file_path="${parts[0]}"
        line_number="${parts[1]}"
        var_name="${underscore_fixes[$fix]}"
        add_underscore_prefix "$file_path" "$var_name" "$line_number"
    fi
done

# 2. Suppression d'imports inutilisés
echo "2️⃣ Suppression d'imports inutilisés..."

# Fonction pour supprimer des imports
remove_import() {
    local file="$1"
    local import_item="$2"
    
    if [ -f "$file" ]; then
        echo "  🗑️ Suppression de '$import_item' dans $file"
        # Supprime l'item de la liste d'imports
        sed -i "s/, *${import_item}//g" "$file"
        sed -i "s/${import_item}, *//g" "$file"
        # Supprime la ligne d'import complète si c'est le seul import
        sed -i "/^import.*${import_item}.*from.*$/d" "$file"
    fi
}

# Liste des suppressions d'imports
declare -A import_removals=(
    ["$CLIENT_DIR/features/workout/components/MuscleRecoveryDashboard.tsx"]="useEffect"
    ["$CLIENT_DIR/features/social/pages/ChallengesPage.tsx"]="useEffect,AnimatePresence,ChallengeReward"
    ["$CLIENT_DIR/features/workout/components/WorkoutDashboard.tsx"]="Activity,Share2,cn"
    ["$CLIENT_DIR/features/workout/pages/ExercisesPage.tsx"]="useMemo,AnimatePresence"
    ["$CLIENT_DIR/pages/index.tsx"]="useMemo,useRef,ErrorInfo,Component,useRouter,onINP"
    ["$CLIENT_DIR/routes/hooks.ts"]="useRouter"
    ["$CLIENT_DIR/lib/api.ts"]="ApiResponse,UploadResponse"
    ["$CLIENT_DIR/store/appStore.ts"]="DailyNutritionTotals,ApiResponse"
)

for file in "${!import_removals[@]}"; do
    IFS=',' read -ra imports <<< "${import_removals[$file]}"
    for import_item in "${imports[@]}"; do
        remove_import "$file" "$import_item"
    done
done

# 3. Correction des apostrophes restantes
echo "3️⃣ Correction des apostrophes restantes..."

# Fichiers avec des apostrophes à corriger
declare -A apostrophe_files=(
    ["$CLIENT_DIR/features/workout/components/WorkoutCard.tsx"]=1
    ["$CLIENT_DIR/features/workout/components/WorkoutDashboard.tsx"]=1
    ["$CLIENT_DIR/features/workout/components/WorkoutSessionSummary.tsx"]=1
    ["$CLIENT_DIR/features/workout/components/WorkoutStartScreen.tsx"]=1
    ["$CLIENT_DIR/features/workout/pages/ExerciseDetailPage.tsx"]=1
    ["$CLIENT_DIR/features/workout/pages/WorkoutDetailPage.tsx"]=1
    ["$CLIENT_DIR/pages/TermsPage.tsx"]=1
    ["$CLIENT_DIR/shared/components/AppErrorBoundary.tsx"]=1
    ["$CLIENT_DIR/shared/components/ErrorBoundary.tsx"]=1
)

for file in "${!apostrophe_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  📝 Correction des apostrophes dans $file"
        # Correction des apostrophes les plus courantes
        sed -i "s/d'entraînement/d\&apos;entraînement/g" "$file"
        sed -i "s/l'entraînement/l\&apos;entraînement/g" "$file"
        sed -i "s/d'exercice/d\&apos;exercice/g" "$file"
        sed -i "s/l'exercice/l\&apos;exercice/g" "$file"
        sed -i "s/n'est/n\&apos;est/g" "$file"
        sed -i "s/c'est/c\&apos;est/g" "$file"
        sed -i "s/qu'il/qu\&apos;il/g" "$file"
        sed -i "s/s'il/s\&apos;il/g" "$file"
        sed -i "s/aujourd'hui/aujourd\&apos;hui/g" "$file"
        sed -i "s/j'ai/j\&apos;ai/g" "$file"
        sed -i "s/m'a/m\&apos;a/g" "$file"
        sed -i "s/t'es/t\&apos;es/g" "$file"
        sed -i "s/d'activité/d\&apos;activité/g" "$file"
        sed -i "s/l'activité/l\&apos;activité/g" "$file"
    fi
done

# 4. Test final
echo "4️⃣ Test final des améliorations..."
cd /workspaces/MyFitHeroV4/client

# Compte les erreurs et warnings
error_count=$(npm run lint 2>&1 | grep -c "error" || echo "0")
warning_count=$(npm run lint 2>&1 | grep -c "warning" || echo "0")

echo ""
echo "📊 Résultats finaux:"
echo "   • Erreurs: $error_count"
echo "   • Avertissements: $warning_count"
echo "   • Total: $((error_count + warning_count))"

echo ""
echo "✅ Nettoyage final terminé!"
