#!/bin/bash
# Script de démarrage pour MyFitHero V4

echo "🚀 Démarrage de MyFitHero V4..."
echo "📍 Répertoire: $(pwd)"

cd /workspaces/MyFitHeroV4

echo "🔧 Vérification des dépendances..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ PNPM n'est pas installé"
    exit 1
fi

echo "📦 Installation des dépendances..."
pnpm install

echo "🏗️ Vérification de la configuration..."
if [ ! -f "client/.env" ]; then
    echo "❌ Fichier client/.env manquant"
    exit 1
fi

echo "🌐 Démarrage du serveur de développement..."
cd client && pnpm run dev
