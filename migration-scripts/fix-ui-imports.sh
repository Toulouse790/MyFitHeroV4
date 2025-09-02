#!/bin/bash

echo "🔧 Correction des imports UI depuis @/shared/components/ui vers @/components/ui..."

# Chercher tous les fichiers avec des imports UI cassés
grep -r "@/shared/components/ui/" client/src/ --include="*.ts" --include="*.tsx" -l | while read file; do
    echo "  ➤ Correction de $file"
    sed -i "s|@/shared/components/ui/|@/components/ui/|g" "$file"
done

echo "✅ Tous les imports UI ont été corrigés !"
