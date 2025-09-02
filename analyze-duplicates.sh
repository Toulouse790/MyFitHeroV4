#!/bin/bash
# Script d'analyse automatique des doublons - MyFitHeroV4
# Usage: ./analyze-duplicates.sh

set -euo pipefail

echo "🔍 ANALYSE DES DOUBLONS - MyFitHeroV4"
echo "===================================="

CLIENT_DIR="client/src"
REPORT_FILE="ANALYSE_DOUBLONS_DETAILLEE.md"

# Créer le rapport détaillé
cat > "$REPORT_FILE" <<'REPORT_EOF'
# ANALYSE DÉTAILLÉE DES DOUBLONS

## 📋 MÉTHODOLOGIE
- Analyse par patterns de noms similaires
- Comparaison du contenu des fichiers
- Détection des imports croisés
- Évaluation de l'impact

---

REPORT_EOF

echo "📊 Analyse des services..."

echo "## 🔧 SERVICES DUPLIQUÉS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Services Supabase" >> "$REPORT_FILE"
find "$CLIENT_DIR" -name "*supabase*Service*" -type f | while read -r file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

echo "### Services API" >> "$REPORT_FILE"
find "$CLIENT_DIR" \( -name "*api*Service*" -o -name "*Api*Service*" \) -type f | while read -r file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

echo "📊 Analyse des stores..."

echo "## 🏪 STORES DUPLIQUÉS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Stores Auth" >> "$REPORT_FILE"
find "$CLIENT_DIR" \( -name "*auth*Store*" -o -name "*Auth*Store*" \) -type f | while read -r file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

echo "### Stores App" >> "$REPORT_FILE"
find "$CLIENT_DIR" \( -name "*app*Store*" -o -name "*App*Store*" \) -type f | while read -r file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

echo "📊 Analyse des types..."

echo "## 📝 TYPES DUPLIQUÉS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Types Workout" >> "$REPORT_FILE"
find "$CLIENT_DIR" -name "*workout*" -name "*.ts" -type f | while read -r file; do
    if grep -Eq "(type|interface)" "$file"; then
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
    fi
done
echo "" >> "$REPORT_FILE"

echo "### Types Onboarding" >> "$REPORT_FILE"
find "$CLIENT_DIR" -name "*onboarding*" -name "*.ts" -type f | while read -r file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

echo "📊 Analyse des imports..."

echo "## 🔗 ANALYSE DES IMPORTS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Imports de services Supabase" >> "$REPORT_FILE"
echo '```bash' >> "$REPORT_FILE"
grep -r "import.*supabase.*Service" "$CLIENT_DIR" --include="*.ts" --include="*.tsx" | head -10 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Imports de stores Auth" >> "$REPORT_FILE"
echo '```bash' >> "$REPORT_FILE"
grep -r "import.*auth.*Store" "$CLIENT_DIR" --include="*.ts" --include="*.tsx" | head -10 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "📊 Analyse des composants..."

echo "## 🧩 COMPOSANTS POTENTIELLEMENT DUPLIQUÉS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Chercher des noms de composants similaires
find "$CLIENT_DIR" -name "*.tsx" -type f | xargs -r basename -s .tsx | sort | uniq -d | while read -r comp; do
    echo "### Composant: $comp" >> "$REPORT_FILE"
    find "$CLIENT_DIR" -name "$comp.tsx" -type f | while read -r file; do
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "- \`$file\` ($lines lignes)" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
done

# Générer un script de migration
echo "📊 Génération du script de migration..."

cat > migration-doublons.sh <<'MIGRATION_EOF'
#!/bin/bash
# Script de migration automatique des doublons
# ⚠️ FAIRE UNE SAUVEGARDE AVANT D'EXÉCUTER

set -euo pipefail

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
find client/src \( -name "*.ts" -o -name "*.tsx" \) -type f | xargs sed -i 's/supabaseServiceUnified/unifiedSupabaseService/g'

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

MIGRATION_EOF

chmod +x migration-doublons.sh

echo "## 🚀 SCRIPT DE MIGRATION GÉNÉRÉ" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Un script de migration automatique a été créé: \`migration-doublons.sh\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "⚠️ **IMPORTANT**: Faire une sauvegarde Git avant d'exécuter le script!" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```bash' >> "$REPORT_FILE"
echo "./migration-doublons.sh" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "✅ Analyse terminée!"
echo "📋 Rapport détaillé: $REPORT_FILE"
echo "🚀 Script de migration: migration-doublons.sh"
echo ""
echo "📊 Résumé:"
services_count=$(find "$CLIENT_DIR" -name "*Service*" -type f | wc -l)
stores_count=$(find "$CLIENT_DIR" \( -name "*Store*" -o -name "*store*" \) -type f | wc -l)
types_count=$(find "$CLIENT_DIR/types" -name "*.ts" -type f | wc -l)

echo "- Services trouvés: $services_count"
echo "- Stores trouvés: $stores_count"
echo "- Fichiers types: $types_count"
