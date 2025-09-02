#!/bin/bash

echo "🔧 Correction des imports services depuis @/shared/services vers @/services..."

# Chercher tous les fichiers avec des imports services cassés
grep -r "@/shared/services" client/src/ --include="*.ts" --include="*.tsx" -l | while read file; do
    echo "  ➤ Correction de $file"
    sed -i "s|@/shared/services/|@/services/|g" "$file"
done

echo "✅ Tous les imports services ont été corrigés !"
