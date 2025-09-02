#!/bin/bash

# Script pour corriger automatiquement les variables non utilisées

echo "Correction des variables non utilisées..."

# Corriger les paramètres non utilisés avec le préfixe _
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bfallbackValue:/\_fallbackValue:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bfields:/\_fields:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bget:/\_get:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bstate:/\_state:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\buserId:/\_userId:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bstartDate:/\_startDate:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bendDate:/\_endDate:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bprovider:/\_provider:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bdata:/\_data:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bperiod:/\_period:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bfriendId:/\_friendId:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bcolor:/\_color:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\bexercise:/\_exercise:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\buserProfile:/\_userProfile:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\binitialEntries:/\_initialEntries:/g'
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\brequest:/\_request:/g'

echo "Corrections des variables non utilisées terminées!"
