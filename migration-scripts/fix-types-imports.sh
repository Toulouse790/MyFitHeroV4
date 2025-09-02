#!/bin/bash

echo "🔧 Correction des imports types depuis @/types/ vers @/shared/types/..."

# Chercher tous les fichiers avec des imports types cassés
grep -r "@/types/" client/src/ --include="*.ts" --include="*.tsx" -l | while read file; do
    echo "  ➤ Correction de $file"
    
    # Remplacer les imports spécifiques
    sed -i "s|@/types/toast|@/shared/types/toast|g" "$file"
    sed -i "s|@/types/workout.types|@/shared/types/workout.types|g" "$file"
    sed -i "s|@/types/workout|@/shared/types/workout.types|g" "$file"
    sed -i "s|@/types/onboarding|@/shared/types/onboarding|g" "$file"
    sed -i "s|@/types/database|@/shared/types/database|g" "$file"
    sed -i "s|@/types/supabase|@/shared/types/supabase|g" "$file"
done

echo "✅ Tous les imports types ont été corrigés !"
