#!/bin/bash

# 🚀 Script de déploiement MyFitHero V4
# Auteur: MyFitHero Team
# Date: $(date)

set -e

echo "🚀 Démarrage du déploiement MyFitHero V4..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. Vérifications préliminaires
log "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

if ! command -v pnpm &> /dev/null; then
    error "pnpm n'est pas installé"
fi

success "Node.js et pnpm sont installés"

# 2. Nettoyage et installation des dépendances
log "Installation des dépendances..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi

# 3. Tests TypeScript
log "Vérification TypeScript..."
cd client && npx tsc --noEmit --skipLibCheck
cd ..
success "Vérification TypeScript réussie"

# 4. Build de production
log "Build de production..."
pnpm build
success "Build terminé"

# 5. Vérification de la taille du bundle
log "Analyse de la taille du bundle..."
du -sh client/dist/
success "Analyse terminée"

# 6. Préparation des fichiers de déploiement
log "Préparation des fichiers..."

# Copier les fichiers nécessaires
cp -r client/dist/* dist/public/ 2>/dev/null || mkdir -p dist/public && cp -r client/dist/* dist/public/

# 7. Validation du déploiement
log "Validation du déploiement..."

if [ ! -f "dist/public/index.html" ]; then
    error "Fichier index.html manquant"
fi

if [ ! -d "dist/public/assets" ]; then
    error "Dossier assets manquant"
fi

success "Validation réussie"

# 8. Affichage des informations finales
echo ""
echo "🎉 Déploiement MyFitHero V4 prêt !"
echo ""
echo "📁 Fichiers de production dans: ./dist/public/"
echo "📊 Taille du build: $(du -sh dist/public/ | cut -f1)"
echo ""
echo "🌐 Options de déploiement disponibles:"
echo "   • Vercel: vercel --prod"
echo "   • Netlify: netlify deploy --prod --dir=dist/public"
echo "   • Railway: railway deploy"
echo "   • GitHub Pages: voir deploy-github.sh"
echo ""
echo "✨ Fonctionnalités incluses:"
echo "   ✅ Dashboard intelligent avec IA"
echo "   ✅ Synchronisation wearables (Apple Health, Google Fit)"
echo "   ✅ Suivi nutrition, hydratation, sommeil"
echo "   ✅ Interface admin complète"
echo "   ✅ Support multi-langues (FR/EN)"
echo "   ✅ PWA avec mode hors-ligne"
echo "   ✅ Sécurité Supabase intégrée"
echo ""
success "Déploiement prêt ! 🚀"
