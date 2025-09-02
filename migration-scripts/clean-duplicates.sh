#!/bin/bash

echo "🧹 Nettoyage des doublons dans MyFitHeroV4"
echo "=========================================="

# Sauvegarde avant nettoyage
echo "📁 Création d'une sauvegarde de sécurité..."
cp -r client/src client/src_backup_$(date +%Y%m%d_%H%M%S)

cd client/src

echo ""
echo "🔍 Analyse des doublons détectés :"
echo ""

# 1. Vérifier les doublons Admin
echo "1️⃣ Composants Admin :"
echo "   - Ancien: ./components/admin/ ($(find ./components/admin -name "*.tsx" | wc -l) fichiers)"
echo "   - Nouveau: ./features/admin/ ($(find ./features/admin -name "*.tsx" 2>/dev/null | wc -l) fichiers)"

# 2. Vérifier les doublons Auth  
echo "2️⃣ Composants Auth :"
echo "   - Ancien: ./components/auth/ ($(find ./components/auth -name "*.tsx" 2>/dev/null | wc -l) fichiers)"
echo "   - Nouveau: ./features/auth/ ($(find ./features/auth -name "*.tsx" 2>/dev/null | wc -l) fichiers)"
echo "   - Shared: ./shared/hooks/useAuth.ts"

# 3. Analyser tous les anciens composants
echo "3️⃣ Tous les anciens composants :"
find ./components -name "*.tsx" | while read file; do
    filename=$(basename "$file" .tsx)
    # Chercher le même composant dans features
    feature_files=$(find ./features -name "${filename}.tsx" 2>/dev/null)
    if [ ! -z "$feature_files" ]; then
        echo "   ⚠️  DOUBLON: $file <-> $feature_files"
    fi
done

echo ""
echo "💾 Taille actuelle du dossier src: $(du -sh . | cut -f1)"
echo ""
echo "❓ Voulez-vous procéder au nettoyage automatique ? (y/N)"
