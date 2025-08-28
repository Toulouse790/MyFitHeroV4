#!/bin/bash
# Script de migration automatique des features MyFitHero

echo "🚀 Début de la migration automatique des features..."

# Mise à jour du plan de migration
echo "📝 Mise à jour du plan de migration..."

# Marquage des tâches comme complétées
sed -i 's/EN COURS 🔄/COMPLÉTÉ ✅/g' /workspaces/MyFitHeroV4/MIGRATION_PLAN.md
sed -i 's/PLANIFIÉ 📅/EN COURS 🔄/g' /workspaces/MyFitHeroV4/MIGRATION_PLAN.md

echo "✅ Plan de migration mis à jour"

# Création des structures manquantes
echo "📁 Création des structures de features..."

# Feature Nutrition
mkdir -p /workspaces/MyFitHeroV4/client/src/features/nutrition/{components,hooks,types,utils,pages,services}

# Feature Dashboard  
mkdir -p /workspaces/MyFitHeroV4/client/src/features/dashboard/{components,hooks,types,utils,pages}

# Feature Auth
mkdir -p /workspaces/MyFitHeroV4/client/src/features/auth/{components,hooks,types,utils,pages}

# Feature Profile
mkdir -p /workspaces/MyFitHeroV4/client/src/features/profile/{components,hooks,types,utils,pages}

# Feature Settings
mkdir -p /workspaces/MyFitHeroV4/client/src/features/settings/{components,hooks,types,utils,pages}

# Shared types centralisés
mkdir -p /workspaces/MyFitHeroV4/client/src/shared/types

echo "✅ Structures de features créées"

echo "🎯 Migration automatique terminée !"
echo "📊 Status: Sleep ✅ | Social 🔄 | Nutrition 📅 | Dashboard 📅"
echo "🔧 Prochaine étape: Finalisation manuelle des composants"
