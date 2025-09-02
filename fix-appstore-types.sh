#!/bin/bash

# Script de correction automatique des types 'any' dans appStore.ts

cd /workspaces/MyFitHeroV4/client

# Correction des (supabase as any) vers typage strict
sed -i 's/(supabase as any)/supabase/g' src/store/appStore.ts

# Correction des (appStoreUser as any).active_modules
sed -i 's/(appStoreUser as any)\.active_modules/appStoreUser.active_modules/g' src/store/appStore.ts

# Correction des } as any)
sed -i 's/} as any)/})/g' src/store/appStore.ts

# Correction des filtres avec paramètre any
sed -i 's/filter(module => module !== moduleId)/filter((module: string) => module !== moduleId)/g' src/store/appStore.ts

echo "✅ Corrections appliquées à appStore.ts"

# Vérification des erreurs restantes
echo "📊 Erreurs restantes:"
npx eslint src/store/appStore.ts --format=stylish | grep -E "(error|warning)" | wc -l
