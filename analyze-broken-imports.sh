#!/bin/bash

echo "🔍 Recherche de tous les imports cassés vers @/shared/hooks..."

# Chercher tous les fichiers qui importent depuis @/shared/hooks
grep -r "@/shared/hooks" client/src/ --include="*.ts" --include="*.tsx" | while IFS=':' read -r file line; do
    echo "Fichier: $file"
    
    # Extraire le nom du hook depuis la ligne d'import
    hook_name=$(echo "$line" | sed -n "s/.*@\/shared\/hooks\/\([^'\"]*\).*/\1/p")
    
    if [ ! -z "$hook_name" ]; then
        echo "  Hook: $hook_name"
        
        # Chercher où le hook existe réellement
        actual_location=$(find client/src/ -name "${hook_name}.ts" -o -name "${hook_name}.tsx" | head -1)
        
        if [ ! -z "$actual_location" ]; then
            echo "  Trouvé: $actual_location"
            
            # Créer le nouveau chemin d'import
            new_path=$(echo "$actual_location" | sed 's|client/src/||' | sed 's|\.tsx\?$||')
            echo "  Nouveau chemin: @/$new_path"
        else
            echo "  ❌ Hook non trouvé !"
        fi
    fi
    echo ""
done
