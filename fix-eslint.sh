#!/bin/bash

# Script pour corriger automatiquement les erreurs ESLint courantes

echo "Correction des apostrophes non échappées..."

# Corriger les apostrophes dans les fichiers
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/l'entraînement/l\&apos;entraînement/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/d'entraînement/d\&apos;entraînement/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/aujourd'hui/aujourd\&apos;hui/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/qu'il/qu\&apos;il/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/c'est/c\&apos;est/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/n'est/n\&apos;est/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/s'entraîne/s\&apos;entraîne/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/m'entraîner/m\&apos;entraîner/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/d'activité/d\&apos;activité/g" {} \;
find /workspaces/MyFitHeroV4/client/src -name "*.tsx" -type f -exec sed -i "s/l'utilisateur/l\&apos;utilisateur/g" {} \;

echo "Corrections terminées!"
