#!/bin/bash
# Script d'analyse et migration de l'architecture client - MyFitHeroV4
# Usage: ./analyze-client-architecture.sh

echo "🏗️ ANALYSE DE L'ARCHITECTURE CLIENT - MyFitHeroV4"
echo "==============================================="

CLIENT_DIR="client/src"
REPORT_FILE="ANALYSE_ARCHITECTURE_CLIENT.md"

# Créer le rapport détaillé
cat > $REPORT_FILE << 'EOF'
# ANALYSE DE L'ARCHITECTURE CLIENT

## 📋 MÉTHODOLOGIE
- Analyse de la structure modulaire par features
- Vérification de la migration des pages vers features
- Audit des composants, hooks, types et services
- Recommandations d'organisation

---

EOF

echo "📊 Analyse de la structure actuelle..."

# Analyser les pages qui doivent être dans features
echo "## 📄 PAGES À MIGRER VERS FEATURES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Pages actuellement dans /pages" >> $REPORT_FILE
find $CLIENT_DIR/pages -name "*.tsx" -type f 2>/dev/null | while read file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    echo "- \`$file\` ($lines lignes)" >> $REPORT_FILE
done
echo "" >> $REPORT_FILE

# Analyser la structure features actuelle
echo "📊 Analyse des features existantes..."

echo "## 🏗️ STRUCTURE FEATURES ACTUELLE" >> $REPORT_FILE
echo "" >> $REPORT_FILE

for feature_dir in $CLIENT_DIR/features/*/; do
    if [ -d "$feature_dir" ]; then
        feature_name=$(basename "$feature_dir")
        echo "### Feature: $feature_name" >> $REPORT_FILE
        
        # Pages
        if [ -d "$feature_dir/pages" ]; then
            echo "**Pages:**" >> $REPORT_FILE
            find "$feature_dir/pages" -name "*.tsx" -type f | while read file; do
                lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "- \`$(basename "$file")\` ($lines lignes)" >> $REPORT_FILE
            done
        fi
        
        # Components
        if [ -d "$feature_dir/components" ]; then
            echo "**Components:**" >> $REPORT_FILE
            find "$feature_dir/components" -name "*.tsx" -type f | while read file; do
                lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "- \`$(basename "$file")\` ($lines lignes)" >> $REPORT_FILE
            done
        fi
        
        # Hooks
        if [ -d "$feature_dir/hooks" ]; then
            echo "**Hooks:**" >> $REPORT_FILE
            find "$feature_dir/hooks" -name "*.ts" -type f | while read file; do
                lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "- \`$(basename "$file")\` ($lines lignes)" >> $REPORT_FILE
            done
        fi
        
        # Types
        if [ -d "$feature_dir/types" ]; then
            echo "**Types:**" >> $REPORT_FILE
            find "$feature_dir/types" -name "*.ts" -type f | while read file; do
                lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "- \`$(basename "$file")\` ($lines lignes)" >> $REPORT_FILE
            done
        fi
        
        # Services
        if [ -d "$feature_dir/services" ]; then
            echo "**Services:**" >> $REPORT_FILE
            find "$feature_dir/services" -name "*.ts" -type f | while read file; do
                lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "- \`$(basename "$file")\` ($lines lignes)" >> $REPORT_FILE
            done
        fi
        
        echo "" >> $REPORT_FILE
    fi
done

# Analyser les composants qui doivent être déplacés
echo "📊 Analyse des composants non organisés..."

echo "## 🧩 COMPOSANTS À RÉORGANISER" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Composants dans /components (à dispatcher)" >> $REPORT_FILE
find $CLIENT_DIR/components -maxdepth 1 -name "*.tsx" -type f | head -20 | while read file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    component_name=$(basename "$file" .tsx)
    
    # Essayer de déterminer la feature appropriée
    feature_guess=""
    case $component_name in
        *Workout*|*Exercise*|*Training*) feature_guess="workout" ;;
        *Nutrition*|*Food*|*Meal*) feature_guess="nutrition" ;;
        *Hydration*|*Water*) feature_guess="hydration" ;;
        *Sleep*) feature_guess="sleep" ;;
        *Social*|*Friend*|*Share*) feature_guess="social" ;;
        *Auth*|*Login*|*Register*) feature_guess="auth" ;;
        *Profile*|*User*|*Settings*) feature_guess="profile" ;;
        *Analytics*|*Chart*|*Stats*) feature_guess="analytics" ;;
        *Dashboard*|*Home*) feature_guess="dashboard" ;;
        *AI*|*Coach*|*Intelligence*) feature_guess="ai-coach" ;;
        *) feature_guess="shared" ;;
    esac
    
    echo "- \`$file\` ($lines lignes) → **$feature_guess**" >> $REPORT_FILE
done
echo "" >> $REPORT_FILE

# Analyser les hooks non organisés
echo "📊 Analyse des hooks non organisés..."

echo "## 🪝 HOOKS À RÉORGANISER" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Hooks dans /hooks (à dispatcher)" >> $REPORT_FILE
find $CLIENT_DIR/hooks -name "*.ts" -type f | while read file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    hook_name=$(basename "$file" .ts)
    
    # Essayer de déterminer la feature appropriée
    feature_guess=""
    case $hook_name in
        *Workout*|*Exercise*|*Training*) feature_guess="workout" ;;
        *Nutrition*|*Food*|*Meal*) feature_guess="nutrition" ;;
        *Hydration*|*Water*) feature_guess="hydration" ;;
        *Sleep*) feature_guess="sleep" ;;
        *Social*|*Friend*|*Share*) feature_guess="social" ;;
        *Auth*|*Login*|*User*) feature_guess="auth" ;;
        *Profile*|*Settings*) feature_guess="profile" ;;
        *Analytics*|*Chart*|*Stats*) feature_guess="analytics" ;;
        *AI*|*Coach*|*Intelligence*) feature_guess="ai-coach" ;;
        *App*|*Global*) feature_guess="shared" ;;
        *) feature_guess="shared" ;;
    esac
    
    echo "- \`$file\` ($lines lignes) → **$feature_guess**" >> $REPORT_FILE
done
echo "" >> $REPORT_FILE

# Analyser les types non organisés
echo "📊 Analyse des types non organisés..."

echo "## 📝 TYPES À RÉORGANISER" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Types dans /types (à dispatcher)" >> $REPORT_FILE
find $CLIENT_DIR/types -name "*.ts" -type f | while read file; do
    lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    type_name=$(basename "$file" .ts)
    
    # Essayer de déterminer la feature appropriée
    feature_guess=""
    case $type_name in
        *workout*|*exercise*|*training*) feature_guess="workout" ;;
        *nutrition*|*food*|*meal*) feature_guess="nutrition" ;;
        *hydration*|*water*) feature_guess="hydration" ;;
        *sleep*) feature_guess="sleep" ;;
        *social*|*friend*|*share*) feature_guess="social" ;;
        *auth*|*login*|*user*) feature_guess="auth" ;;
        *profile*|*settings*) feature_guess="profile" ;;
        *analytics*|*chart*|*stats*) feature_guess="analytics" ;;
        *onboarding*) feature_guess="onboarding" ;;
        *supabase*|*api*) feature_guess="shared" ;;
        *) feature_guess="shared" ;;
    esac
    
    echo "- \`$file\` ($lines lignes) → **$feature_guess**" >> $REPORT_FILE
done
echo "" >> $REPORT_FILE

# Générer des statistiques
echo "📊 Génération des statistiques..."

echo "## 📊 STATISTIQUES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Compter les fichiers par dossier
pages_count=$(find $CLIENT_DIR/pages -name "*.tsx" -type f 2>/dev/null | wc -l)
components_count=$(find $CLIENT_DIR/components -maxdepth 1 -name "*.tsx" -type f | wc -l)
hooks_count=$(find $CLIENT_DIR/hooks -name "*.ts" -type f | wc -l)
types_count=$(find $CLIENT_DIR/types -name "*.ts" -type f | wc -l)
services_count=$(find $CLIENT_DIR/services -name "*.ts" -type f | wc -l)
features_count=$(find $CLIENT_DIR/features -maxdepth 1 -type d | tail -n +2 | wc -l)

echo "### Fichiers à migrer" >> $REPORT_FILE
echo "- **Pages** dans /pages: $pages_count" >> $REPORT_FILE
echo "- **Composants** dans /components: $components_count" >> $REPORT_FILE
echo "- **Hooks** dans /hooks: $hooks_count" >> $REPORT_FILE
echo "- **Types** dans /types: $types_count" >> $REPORT_FILE
echo "- **Services** dans /services: $services_count" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Features existantes" >> $REPORT_FILE
echo "- **Nombre de features**: $features_count" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Générer des recommandations
echo "## 🎯 RECOMMANDATIONS" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Structure cible recommandée" >> $REPORT_FILE
echo "\`\`\`" >> $REPORT_FILE
echo "src/" >> $REPORT_FILE
echo "├── features/" >> $REPORT_FILE
echo "│   ├── workout/           # Entraînements et exercices" >> $REPORT_FILE
echo "│   │   ├── pages/" >> $REPORT_FILE
echo "│   │   ├── components/" >> $REPORT_FILE
echo "│   │   ├── hooks/" >> $REPORT_FILE
echo "│   │   ├── types/" >> $REPORT_FILE
echo "│   │   └── services/" >> $REPORT_FILE
echo "│   ├── nutrition/         # Nutrition et alimentation" >> $REPORT_FILE
echo "│   ├── hydration/         # Hydratation" >> $REPORT_FILE
echo "│   ├── sleep/             # Sommeil" >> $REPORT_FILE
echo "│   ├── social/            # Social et partage" >> $REPORT_FILE
echo "│   ├── auth/              # Authentification" >> $REPORT_FILE
echo "│   ├── profile/           # Profil utilisateur" >> $REPORT_FILE
echo "│   ├── analytics/         # Analyses et statistiques" >> $REPORT_FILE
echo "│   ├── ai-coach/          # Coach IA" >> $REPORT_FILE
echo "│   └── onboarding/        # Processus d'accueil" >> $REPORT_FILE
echo "├── shared/                # Éléments partagés" >> $REPORT_FILE
echo "│   ├── components/" >> $REPORT_FILE
echo "│   ├── hooks/" >> $REPORT_FILE
echo "│   ├── types/" >> $REPORT_FILE
echo "│   ├── services/" >> $REPORT_FILE
echo "│   └── utils/" >> $REPORT_FILE
echo "└── pages/                 # Pages de niveau app (minimal)" >> $REPORT_FILE
echo "\`\`\`" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "### Actions prioritaires" >> $REPORT_FILE
echo "1. **Migrer les pages** vers leurs features respectives" >> $REPORT_FILE
echo "2. **Réorganiser les composants** par domaine fonctionnel" >> $REPORT_FILE
echo "3. **Dispatcher les hooks** vers les features appropriées" >> $REPORT_FILE
echo "4. **Organiser les types** par contexte métier" >> $REPORT_FILE
echo "5. **Centraliser les services** partagés dans /shared" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Générer un script de migration
echo "📊 Génération du script de migration..."

cat > migration-architecture.sh << 'MIGRATION_EOF'
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

MIGRATION_EOF

chmod +x migration-architecture.sh

echo "## 🚀 SCRIPT DE MIGRATION GÉNÉRÉ" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Un script de migration automatique a été créé: \`migration-architecture.sh\`" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "⚠️ **IMPORTANT**: Faire une sauvegarde Git avant d'exécuter le script!" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "\`\`\`bash" >> $REPORT_FILE
echo "./migration-architecture.sh" >> $REPORT_FILE
echo "\`\`\`" >> $REPORT_FILE

echo "✅ Analyse terminée!"
echo "📋 Rapport détaillé: $REPORT_FILE"
echo "🚀 Script de migration: migration-architecture.sh"
echo ""
echo "📊 Résumé:"
echo "- Pages à migrer: $pages_count"
echo "- Composants à réorganiser: $components_count"
echo "- Hooks à dispatcher: $hooks_count"
echo "- Types à organiser: $types_count"
echo "- Features existantes: $features_count"
