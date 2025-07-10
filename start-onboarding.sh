#!/bin/bash

# Script pour démarrer MyFitHero V4 avec l'onboarding conversationnel

echo "🚀 Démarrage de MyFitHero V4 - Onboarding Conversationnel"
echo "============================================================"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm trouvé"
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    echo "✅ npm trouvé"
    PKG_MANAGER="npm"
else
    echo "❌ Erreur: pnpm ou npm requis"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    $PKG_MANAGER install
fi

# Installer les dépendances spécifiques à l'onboarding
echo "📦 Installation des dépendances UI..."
$PKG_MANAGER install @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-slot class-variance-authority lucide-react

# Vérifier les variables d'environnement
echo "🔧 Vérification de la configuration..."
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️  Attention: Aucun fichier .env trouvé"
    echo "   Créez un fichier .env avec vos variables Supabase"
    echo ""
    echo "   Exemple:"
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
fi

# Vérifier si Supabase est disponible
echo "🔍 Vérification de Supabase..."
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI trouvé"
    
    # Vérifier le statut de Supabase
    if supabase status &> /dev/null; then
        echo "✅ Supabase local démarré"
    else
        echo "⚠️  Supabase local non démarré"
        echo "   Voulez-vous démarrer Supabase local ? (y/n)"
        read -r response
        if [[ "$response" == "y" || "$response" == "Y" ]]; then
            supabase start
        fi
    fi
else
    echo "⚠️  Supabase CLI non trouvé - utilisation de l'instance distant"
fi

# Exécuter les migrations si nécessaire
if [ -d "supabase/migrations" ] && command -v supabase &> /dev/null; then
    echo "🔄 Application des migrations..."
    supabase db push
fi

# Construire l'application
echo "🏗️  Construction de l'application..."
$PKG_MANAGER run build

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
echo ""
echo "📱 L'application sera disponible sur:"
echo "   - http://localhost:5173 (développement)"
echo "   - http://localhost:4173 (production)"
echo ""
echo "🎯 Pour tester l'onboarding conversationnel:"
echo "   - Ouvrez /onboarding-test dans votre navigateur"
echo "   - Ou utilisez le composant OnboardingDemo"
echo ""
echo "📚 Documentation disponible dans:"
echo "   - docs/onboarding-conversationnel.md"
echo ""

# Choix du mode de démarrage
echo "Mode de démarrage:"
echo "1) Développement (hot reload)"
echo "2) Production (build + preview)"
echo "3) Storybook (composants isolés)"
echo ""
echo "Votre choix (1-3): "
read -r choice

case $choice in
    1)
        echo "🔥 Démarrage en mode développement..."
        $PKG_MANAGER run dev
        ;;
    2)
        echo "🏗️  Démarrage en mode production..."
        $PKG_MANAGER run build
        $PKG_MANAGER run preview
        ;;
    3)
        echo "📚 Démarrage de Storybook..."
        if $PKG_MANAGER run storybook &> /dev/null; then
            $PKG_MANAGER run storybook
        else
            echo "❌ Storybook non configuré"
            echo "🔥 Démarrage en mode développement..."
            $PKG_MANAGER run dev
        fi
        ;;
    *)
        echo "🔥 Démarrage en mode développement (défaut)..."
        $PKG_MANAGER run dev
        ;;
esac
