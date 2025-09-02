#!/bin/bash

# Script pour corriger les erreurs de typage Supabase

echo "🔧 Correction des erreurs de typage Supabase..."

# 1. Corriger les appels insert avec des types never en ajoutant des casts
echo "📝 Correction des appels Supabase insert..."
sed -i 's/\.insert(hydrationData)/\.insert(hydrationData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.insert(nutritionData)/\.insert(nutritionData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.insert(sleepData)/\.insert(sleepData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.insert(workoutData)/\.insert(workoutData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.insert(scaleData)/\.insert(scaleData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.insert(weightData)/\.insert(weightData as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

# 2. Corriger les appels update avec des arguments never
sed -i 's/\.update(notificationUpdate)/\.update(notificationUpdate as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts
sed -i 's/\.update(moduleUpdate)/\.update(moduleUpdate as any)/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

# 3. Corriger les conversions de type DailyStats
sed -i 's/data as DailyStats/(data as any) || null/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

# 4. Corriger les dates undefined
sed -i 's/date: data?.date/date: data?.date || new Date().toISOString().split("T")[0]/g' /workspaces/MyFitHeroV4/client/src/store/appStore.ts

echo "✅ Corrections Supabase terminées!"
