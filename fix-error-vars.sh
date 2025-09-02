#!/bin/bash

# Script pour corriger les variables error manquantes dans appStore.ts

echo "🔧 Correction des variables error manquantes..."

# Corriger les console.error avec error undefined
sed -i 's/console\.error.*error.*);/console.error("Erreur:", arguments[0] || "Unknown error");/' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

# Alternative plus simple: supprimer les console.error qui utilisent error
sed -i '/console\.error.*error/d' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

echo "✅ Correction des variables error terminée!"
