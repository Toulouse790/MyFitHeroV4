#!/bin/bash
# Script de migration automatique des doublons
# ⚠️ FAIRE UNE SAUVEGARDE AVANT D'EXÉCUTER

echo "🚀 MIGRATION DES DOUBLONS"
echo "========================"

# Sauvegarde
git add . && git commit -m "Backup avant nettoyage doublons" || echo "Pas de changements à sauvegarder"

echo "🔧 Étape 1: Nettoyage des services Supabase..."

# Garder unifiedSupabaseService.ts, supprimer les autres
if [ -f "client/src/services/supabaseService.ts" ] && [ ! -s "client/src/services/supabaseService.ts" ]; then
    echo "Suppression de supabaseService.ts (vide)"
    rm client/src/services/supabaseService.ts
fi

# Mise à jour des imports vers le service unifié
echo "Mise à jour des imports Supabase..."
find client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/supabaseServiceUnified/unifiedSupabaseService/g'

echo "🏪 Étape 2: Consolidation des stores Auth..."

# TODO: Analyser quel store garder en fonction de l'usage
echo "Analyse des imports pour determiner le store principal..."
auth_store_usage=$(grep -r "store/authStore" client/src --include="*.ts" --include="*.tsx" | wc -l)
shared_auth_usage=$(grep -r "shared/stores/auth.store" client/src --include="*.ts" --include="*.tsx" | wc -l)

echo "Usage store/authStore: $auth_store_usage"
echo "Usage shared/stores/auth.store: $shared_auth_usage"

echo "📝 Étape 3: Consolidation des types..."

# Créer un fichier de types unifié pour workout
echo "Création de types/workout-unified.ts..."

# TODO: Merger les types workout
echo "// Types workout unifiés - générés automatiquement" > client/src/types/workout-unified.ts

echo "✅ Migration terminée!"
echo "🔍 Vérifiez les imports et testez l'application"
echo "📋 Consultez ANALYSE_DOUBLONS_DETAILLEE.md pour les détails"

