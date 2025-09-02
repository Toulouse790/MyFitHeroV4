#!/bin/bash
# Script de migration intelligent de l'architecture client - MyFitHeroV4
# Usage: ./migrate-client-architecture.sh

echo "🏗️ MIGRATION INTELLIGENTE DE L'ARCHITECTURE CLIENT"
echo "=================================================="

CLIENT_SRC="client/src"
BACKUP_DIR="architecture_backup_$(date +%Y%m%d_%H%M%S)"

# Sauvegarde complète
echo "💾 Création de la sauvegarde..."
mkdir -p "$BACKUP_DIR"
cp -r "$CLIENT_SRC" "$BACKUP_DIR/"

# Créer le commit de sauvegarde
cd client
git add . && git commit -m "🔒 Backup avant migration architecture" || echo "Pas de changements à sauvegarder"
cd ..

echo "📊 Analyse de la structure actuelle..."

# Fonction pour déterminer la feature appropriée
get_feature_for_file() {
    local filename="$1"
    local content="$2"
    
    case $filename in
        *[Ww]orkout*|*[Ee]xercise*|*[Tt]raining*|*[Mm]uscle*|*[Rr]ep*|*[Ss]et*) echo "workout" ;;
        *[Nn]utrition*|*[Ff]ood*|*[Mm]eal*|*[Cc]alorie*|*[Dd]iet*) echo "nutrition" ;;
        *[Hh]ydration*|*[Ww]ater*|*[Dd]rink*) echo "hydration" ;;
        *[Ss]leep*|*[Bb]edtime*|*[Dd]ream*) echo "sleep" ;;
        *[Ss]ocial*|*[Ff]riend*|*[Ss]hare*|*[Cc]ommunity*) echo "social" ;;
        *[Aa]uth*|*[Ll]ogin*|*[Rr]egister*|*[Ss]ign*) echo "auth" ;;
        *[Pp]rofile*|*[Ss]ettings*|*[Aa]ccount*|*[Aa]vatar*) echo "profile" ;;
        *[Aa]nalytics*|*[Cc]hart*|*[Ss]tats*|*[Rr]eport*|*[Dd]ashboard*|*[Pp]rogress*) echo "analytics" ;;
        *[Aa][Ii]*|*[Cc]oach*|*[Ii]ntelligence*|*[Rr]ecommend*) echo "ai-coach" ;;
        *[Oo]nboarding*|*[Ww]elcome*|*[Tt]utorial*) echo "auth" ;;
        *[Aa]dmin*) echo "admin" ;;
        *[Ww]earable*|*[Dd]evice*|*[Ss]cale*) echo "wearables" ;;
        *[Rr]ecovery*|*[Rr]est*) echo "recovery" ;;
        *) 
            # Analyser le contenu si le nom n'est pas explicite
            if grep -qi "workout\|exercise\|training" "$content" 2>/dev/null; then
                echo "workout"
            elif grep -qi "nutrition\|food\|meal" "$content" 2>/dev/null; then
                echo "nutrition"
            elif grep -qi "hydration\|water" "$content" 2>/dev/null; then
                echo "hydration"
            elif grep -qi "sleep" "$content" 2>/dev/null; then
                echo "sleep"
            elif grep -qi "social\|friend\|share" "$content" 2>/dev/null; then
                echo "social"
            elif grep -qi "auth\|login\|register" "$content" 2>/dev/null; then
                echo "auth"
            elif grep -qi "profile\|settings" "$content" 2>/dev/null; then
                echo "profile"
            elif grep -qi "analytics\|chart\|stats" "$content" 2>/dev/null; then
                echo "analytics"
            elif grep -qi "ai\|coach\|intelligence" "$content" 2>/dev/null; then
                echo "ai-coach"
            else
                echo "shared"
            fi
            ;;
    esac
}

# Fonction pour migrer un fichier
migrate_file() {
    local source_file="$1"
    local target_feature="$2"
    local file_type="$3" # components, hooks, types, services
    
    local filename=$(basename "$source_file")
    local target_dir="$CLIENT_SRC/features/$target_feature/$file_type"
    local target_file="$target_dir/$filename"
    
    # Créer le dossier cible s'il n'existe pas
    mkdir -p "$target_dir"
    
    # Déplacer le fichier
    if [ -f "$source_file" ]; then
        echo "📦 $source_file → features/$target_feature/$file_type/"
        mv "$source_file" "$target_file"
        
        # Mettre à jour les imports dans le fichier déplacé
        update_imports_in_file "$target_file" "$target_feature" "$file_type"
        
        return 0
    fi
    return 1
}

# Fonction pour mettre à jour les imports dans un fichier
update_imports_in_file() {
    local file="$1"
    local feature="$2"
    local type="$3"
    
    # Mise à jour des imports relatifs courants
    sed -i "s|@/components/|@/shared/components/|g" "$file"
    sed -i "s|@/hooks/|@/shared/hooks/|g" "$file"
    sed -i "s|@/types/|@/shared/types/|g" "$file"
    sed -i "s|@/services/|@/shared/services/|g" "$file"
}

# Fonction pour mettre à jour tous les imports dans le projet
update_all_imports() {
    local moved_file="$1"
    local old_path="$2"
    local new_path="$3"
    
    # Trouver tous les fichiers qui importent ce fichier
    local filename_without_ext=$(basename "$moved_file" | sed 's/\.[^.]*$//')
    
    echo "🔄 Mise à jour des imports pour $filename_without_ext..."
    
    # Mettre à jour dans tous les fichiers TypeScript/JSX
    find "$CLIENT_SRC" -name "*.ts" -o -name "*.tsx" | while read file; do
        if grep -q "$old_path" "$file" 2>/dev/null; then
            sed -i "s|$old_path|$new_path|g" "$file"
            echo "   ✅ Mis à jour: $file"
        fi
    done
}

echo "🚀 Début de la migration..."

# 1. Migration des composants
echo ""
echo "🧩 MIGRATION DES COMPOSANTS"
echo "==========================="

components_migrated=0
find "$CLIENT_SRC/components" -maxdepth 1 -name "*.tsx" | while read component; do
    filename=$(basename "$component")
    target_feature=$(get_feature_for_file "$filename" "$component")
    
    if [ "$target_feature" != "shared" ]; then
        if migrate_file "$component" "$target_feature" "components"; then
            components_migrated=$((components_migrated + 1))
            
            # Mettre à jour les imports
            old_import="@/components/$filename"
            new_import="@/features/$target_feature/components/$filename"
            update_all_imports "$component" "$old_import" "$new_import"
        fi
    else
        # Déplacer vers shared
        mkdir -p "$CLIENT_SRC/shared/components"
        echo "📦 $component → shared/components/"
        mv "$component" "$CLIENT_SRC/shared/components/"
        components_migrated=$((components_migrated + 1))
    fi
done

# 2. Migration des hooks
echo ""
echo "🪝 MIGRATION DES HOOKS"
echo "====================="

hooks_migrated=0
find "$CLIENT_SRC/hooks" -name "*.ts" | while read hook; do
    filename=$(basename "$hook")
    target_feature=$(get_feature_for_file "$filename" "$hook")
    
    if [ "$target_feature" != "shared" ]; then
        if migrate_file "$hook" "$target_feature" "hooks"; then
            hooks_migrated=$((hooks_migrated + 1))
            
            # Mettre à jour les imports
            hook_name=$(basename "$hook" .ts)
            old_import="@/hooks/$hook_name"
            new_import="@/features/$target_feature/hooks/$hook_name"
            update_all_imports "$hook" "$old_import" "$new_import"
        fi
    else
        # Déplacer vers shared
        mkdir -p "$CLIENT_SRC/shared/hooks"
        echo "📦 $hook → shared/hooks/"
        mv "$hook" "$CLIENT_SRC/shared/hooks/"
        hooks_migrated=$((hooks_migrated + 1))
    fi
done

# 3. Migration des types
echo ""
echo "📝 MIGRATION DES TYPES"
echo "====================="

types_migrated=0
find "$CLIENT_SRC/types" -name "*.ts" | while read type_file; do
    filename=$(basename "$type_file")
    target_feature=$(get_feature_for_file "$filename" "$type_file")
    
    if [ "$target_feature" != "shared" ]; then
        if migrate_file "$type_file" "$target_feature" "types"; then
            types_migrated=$((types_migrated + 1))
            
            # Mettre à jour les imports
            type_name=$(basename "$type_file" .ts)
            old_import="@/types/$type_name"
            new_import="@/features/$target_feature/types/$type_name"
            update_all_imports "$type_file" "$old_import" "$new_import"
        fi
    else
        # Déplacer vers shared
        mkdir -p "$CLIENT_SRC/shared/types"
        echo "📦 $type_file → shared/types/"
        mv "$type_file" "$CLIENT_SRC/shared/types/"
        types_migrated=$((types_migrated + 1))
    fi
done

# 4. Migration des pages restantes
echo ""
echo "📄 MIGRATION DES PAGES"
echo "====================="

pages_migrated=0
find "$CLIENT_SRC/pages" -name "*.tsx" | while read page; do
    filename=$(basename "$page")
    
    # Les pages spéciales restent dans /pages
    case $filename in
        "NotFound.tsx"|"PrivacyPage.tsx"|"TermsPage.tsx"|"SupportPage.tsx"|"index.tsx")
            echo "📌 Conservation: $filename (page système)"
            ;;
        *)
            target_feature=$(get_feature_for_file "$filename" "$page")
            if migrate_file "$page" "$target_feature" "pages"; then
                pages_migrated=$((pages_migrated + 1))
                
                # Mettre à jour les imports
                page_name=$(basename "$page" .tsx)
                old_import="@/pages/$page_name"
                new_import="@/features/$target_feature/pages/$page_name"
                update_all_imports "$page" "$old_import" "$new_import"
            fi
            ;;
    esac
done

# 5. Créer les fichiers index pour chaque feature
echo ""
echo "📋 CRÉATION DES INDEX DE FEATURES"
echo "================================="

for feature_dir in "$CLIENT_SRC/features"/*; do
    if [ -d "$feature_dir" ]; then
        feature_name=$(basename "$feature_dir")
        echo "📝 Création des index pour: $feature_name"
        
        # Index des composants
        if [ -d "$feature_dir/components" ] && [ "$(ls -A "$feature_dir/components" 2>/dev/null)" ]; then
            echo "// Export des composants de la feature $feature_name" > "$feature_dir/components/index.ts"
            find "$feature_dir/components" -name "*.tsx" -exec basename {} .tsx \; | while read comp; do
                echo "export { default as $comp } from './$comp';" >> "$feature_dir/components/index.ts"
            done
        fi
        
        # Index des hooks
        if [ -d "$feature_dir/hooks" ] && [ "$(ls -A "$feature_dir/hooks" 2>/dev/null)" ]; then
            echo "// Export des hooks de la feature $feature_name" > "$feature_dir/hooks/index.ts"
            find "$feature_dir/hooks" -name "*.ts" -exec basename {} .ts \; | while read hook; do
                echo "export * from './$hook';" >> "$feature_dir/hooks/index.ts"
            done
        fi
        
        # Index des types
        if [ -d "$feature_dir/types" ] && [ "$(ls -A "$feature_dir/types" 2>/dev/null)" ]; then
            echo "// Export des types de la feature $feature_name" > "$feature_dir/types/index.ts"
            find "$feature_dir/types" -name "*.ts" -exec basename {} .ts \; | while read type; do
                echo "export * from './$type';" >> "$feature_dir/types/index.ts"
            done
        fi
    fi
done

echo ""
echo "✅ MIGRATION TERMINÉE!"
echo "====================="
echo ""
echo "📊 RÉSUMÉ:"
echo "- Composants migrés: $(find "$CLIENT_SRC/features" -name "*.tsx" | wc -l)"
echo "- Hooks migrés: $(find "$CLIENT_SRC/features" -name "*.ts" -path "*/hooks/*" | wc -l)"
echo "- Types migrés: $(find "$CLIENT_SRC/features" -name "*.ts" -path "*/types/*" | wc -l)"
echo "- Pages migrées: $(find "$CLIENT_SRC/features" -name "*.tsx" -path "*/pages/*" | wc -l)"
echo ""
echo "💾 Sauvegarde disponible dans: $BACKUP_DIR"
echo "🔍 Vérifiez les imports et testez l'application"
echo "📋 Exécutez 'npm run build' pour vérifier la compilation"
