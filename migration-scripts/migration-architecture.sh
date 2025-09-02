#!/bin/bash
# Script de migration de l'architecture client
# ⚠️ FAIRE UNE SAUVEGARDE AVANT D'EXÉCUTER

echo "🏗️ MIGRATION DE L'ARCHITECTURE CLIENT"
echo "====================================="

# Sauvegarde
git add . && git commit -m "Backup avant réorganisation architecture" || echo "Pas de changements à sauvegarder"

echo "📁 Création de la structure de features manquantes..."

# Créer les structures de features si elles n'existent pas
features=("workout" "nutrition" "hydration" "sleep" "social" "auth" "profile" "analytics" "ai-coach" "onboarding")

for feature in "${features[@]}"; do
    feature_dir="client/src/features/$feature"
    if [ ! -d "$feature_dir" ]; then
        echo "Création de la feature: $feature"
        mkdir -p "$feature_dir"/{pages,components,hooks,types,services}
        
        # Créer un fichier index pour chaque sous-dossier
        touch "$feature_dir/pages/index.ts"
        touch "$feature_dir/components/index.ts"
        touch "$feature_dir/hooks/index.ts"
        touch "$feature_dir/types/index.ts"
        touch "$feature_dir/services/index.ts"
    fi
done

echo "🚀 Étape 1: Migration des pages vers features..."

# TODO: Implémenter la migration automatique des pages
echo "Migration des pages à implémenter..."

echo "🧩 Étape 2: Migration des composants vers features..."

# TODO: Implémenter la migration automatique des composants
echo "Migration des composants à implémenter..."

echo "🪝 Étape 3: Migration des hooks vers features..."

# TODO: Implémenter la migration automatique des hooks
echo "Migration des hooks à implémenter..."

echo "📝 Étape 4: Migration des types vers features..."

# TODO: Implémenter la migration automatique des types
echo "Migration des types à implémenter..."

echo "✅ Migration terminée!"
echo "🔍 Vérifiez les imports et testez l'application"
echo "📋 Consultez ANALYSE_ARCHITECTURE_CLIENT.md pour les détails"

