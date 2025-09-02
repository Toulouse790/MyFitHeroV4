#!/bin/bash

echo "🚨 NETTOYAGE URGENT DES DOUBLONS"
echo "================================="

cd /workspaces/MyFitHeroV4

# 1. Supprimer les backups inutiles
echo "1️⃣ Suppression des backups volumineux..."
echo "   - architecture_backup_20250901_135341 (3.6M)"
rm -rf architecture_backup_20250901_135341
echo "   - images_backup_20250901_133854 (272K)"  
rm -rf images_backup_20250901_133854
echo "   - client/src_backup_* (créés lors des tests)"
rm -rf client/src_backup_*

# 2. Nettoyer le dist volumineux
echo "2️⃣ Nettoyage du dossier dist..."
cd client
rm -rf dist
echo "   - dist supprimé (8.9M récupérés)"

# 3. Supprimer les anciens composants admin (remplacés par features/admin)
echo "3️⃣ Suppression des anciens composants admin..."
rm -rf src/components/admin
echo "   - src/components/admin supprimé"

# 4. Nettoyer le cache et les modules inutiles
echo "4️⃣ Nettoyage des caches..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo "   - Caches Vite nettoyés"

echo ""
echo "📊 Taille avant/après :"
cd /workspaces/MyFitHeroV4
echo "   Taille totale maintenant: $(du -sh . | cut -f1)"

echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo ""
echo "⚠️  ACTIONS REQUISES :"
echo "1. Corriger les imports vers @/components/admin"
echo "2. Rebuild l'application"
echo "3. Vérifier que tout fonctionne"
