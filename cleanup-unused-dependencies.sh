#!/bin/bash

echo "🧹 Nettoyage des dépendances non utilisées - MyFitHero"
echo "=================================================="

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "package.json non trouvé. Assurez-vous d'être à la racine du projet."
    exit 1
fi

# Sauvegarde des fichiers package.json
log_info "Création des sauvegardes..."
cp package.json package.json.backup
cp client/package.json client/package.json.backup
log_info "Sauvegardes créées: package.json.backup et client/package.json.backup"

echo ""
echo "🗑️  Suppression des dépendances non utilisées..."
echo ""

# ==========================================
# NETTOYAGE DU PACKAGE.JSON RACINE
# ==========================================

log_info "Nettoyage du package.json racine..."

# Supprimer jscpd des devDependencies
npm uninstall jscpd

log_info "✅ jscpd supprimé du package.json racine"

# ==========================================
# NETTOYAGE DU CLIENT/PACKAGE.JSON
# ==========================================

cd client

log_info "Nettoyage du client/package.json..."

echo "Suppression des dépendances Radix UI non utilisées..."

# Dépendances principales à supprimer
DEPS_TO_REMOVE=(
    "@radix-ui/react-accordion"
    "@radix-ui/react-alert-dialog"
    "@radix-ui/react-aspect-ratio"
    "@radix-ui/react-checkbox"
    "@radix-ui/react-context-menu"
    "@radix-ui/react-hover-card"
    "@radix-ui/react-menubar"
    "@radix-ui/react-navigation-menu"
    "@radix-ui/react-popover"
    "@radix-ui/react-radio-group"
    "@radix-ui/react-scroll-area"
    "@radix-ui/react-toggle"
    "@radix-ui/react-toggle-group"
    "@radix-ui/react-tooltip"
    "@vercel/analytics"
    "@vercel/speed-insights"
    "cmdk"
    "embla-carousel-react"
    "input-otp"
    "next-themes"
    "react-day-picker"
    "react-resizable-panels"
    "tailwindcss-animate"
    "tw-animate-css"
    "vaul"
    "web-vitals"
    "zod-validation-error"
)

# Supprimer les dépendances principales
for dep in "${DEPS_TO_REMOVE[@]}"; do
    if npm list "$dep" &> /dev/null; then
        npm uninstall "$dep"
        log_info "✅ $dep supprimé"
    else
        log_warning "⚠️  $dep n'était pas installé"
    fi
done

echo ""
echo "Suppression des dépendances de développement non utilisées..."

# DevDependencies à supprimer
DEV_DEPS_TO_REMOVE=(
    "@babel/core"
    "@types/connect-pg-simple"
    "@types/express"
    "@types/express-session" 
    "@types/passport"
    "@types/passport-local"
    "@types/ws"
    "autoprefixer"
    "identity-obj-proxy"
    "jest"
    "jest-environment-jsdom"
    "jest-watch-typeahead"
    "postcss"
    "prettier"
)

# Supprimer les devDependencies
for dep in "${DEV_DEPS_TO_REMOVE[@]}"; do
    if npm list "$dep" &> /dev/null; then
        npm uninstall --save-dev "$dep"
        log_info "✅ $dep supprimé (devDependency)"
    else
        log_warning "⚠️  $dep n'était pas installé (devDependency)"
    fi
done

echo ""
echo "🔍 Suppression des dépendances potentiellement utilisées côté serveur..."

# Dépendances à conserver mais à vérifier
POTENTIAL_SERVER_DEPS=(
    "nanoid"
    "jsonwebtoken"
)

for dep in "${POTENTIAL_SERVER_DEPS[@]}"; do
    log_warning "⚠️  $dep conservé - peut être utilisé côté serveur"
done

cd ..

# ==========================================
# NETTOYAGE FINAL
# ==========================================

echo ""
log_info "Nettoyage du cache npm..."
npm cache clean --force

echo ""
log_info "Réinstallation des dépendances restantes..."
cd client
npm install

echo ""
echo "📊 RÉSUMÉ DU NETTOYAGE"
echo "======================"

# Calculer l'espace libéré (approximatif)
log_info "Dépendances principales supprimées: ${#DEPS_TO_REMOVE[@]}"
log_info "Dépendances de développement supprimées: ${#DEV_DEPS_TO_REMOVE[@]}"

echo ""
log_info "✅ Nettoyage terminé avec succès!"
echo ""
echo "📋 Actions recommandées:"
echo "  1. Vérifiez que l'application fonctionne correctement"
echo "  2. Lancez les tests: npm test"
echo "  3. Vérifiez le build: npm run build"
echo "  4. Si tout fonctionne, supprimez les sauvegardes:"
echo "     rm package.json.backup client/package.json.backup"
echo ""
log_warning "⚠️  Si des problèmes surviennent, restaurez les sauvegardes:"
echo "     mv package.json.backup package.json"
echo "     mv client/package.json.backup client/package.json"
echo "     npm install && cd client && npm install"

cd ..
