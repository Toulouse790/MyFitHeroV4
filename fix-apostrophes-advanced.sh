#!/bin/bash

# Script amélioré pour corriger les apostrophes dans tout le projet
echo "🔧 Correction automatique des apostrophes non échappées..."

# Fonction pour traiter un fichier
fix_apostrophes_in_file() {
    local file="$1"
    echo "  📝 Traitement de $file"
    
    # Remplace toutes les apostrophes dans le texte JSX par &apos;
    # Attention à ne pas modifier les chaînes dans le code JavaScript
    sed -i "s/>\([^<]*\)'\([^<]*\)</>\1\&apos;\2</g" "$file"
    sed -i "s/=\"\([^\"]*\)'\([^\"]*\)\"/=\"\1\&apos;\2\"/g" "$file"
}

# Parcourt tous les fichiers TypeScript et TSX
find /workspaces/MyFitHeroV4/client/src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    if grep -q "react/no-unescaped-entities" <(cd /workspaces/MyFitHeroV4/client && npx eslint "$file" 2>&1); then
        fix_apostrophes_in_file "$file"
    fi
done

echo "✅ Correction des apostrophes terminée!"
