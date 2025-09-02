#!/bin/bash
# Script d'optimisation des images - MyFitHeroV4
# Usage: ./optimize-images.sh

echo "🖼️ OPTIMISATION DES IMAGES - MyFitHeroV4"
echo "========================================"

# Créer un dossier de sauvegarde
backup_dir="images_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

echo "📋 Analyse des images avant optimisation..."

# Fonction pour analyser une image
analyze_image() {
    local file="$1"
    if [ -f "$file" ]; then
        local size=$(stat -c%s "$file" 2>/dev/null || echo "0")
        local size_kb=$((size / 1024))
        echo "- $(basename "$file"): ${size_kb}K"
    fi
}

# Fonction pour optimiser une image PNG
optimize_png() {
    local file="$1"
    local backup_file="$backup_dir/$(basename "$file")"
    
    if [ ! -f "$file" ]; then
        echo "❌ Fichier non trouvé: $file"
        return 1
    fi
    
    echo "🔄 Optimisation de $(basename "$file")..."
    
    # Sauvegarde originale
    cp "$file" "$backup_file"
    
    # Taille avant
    local size_before=$(stat -c%s "$file")
    local size_before_kb=$((size_before / 1024))
    
    # Optimisation avec optipng (compression sans perte)
    optipng -o7 -quiet "$file" 2>/dev/null
    
    # Optimisation supplémentaire avec pngcrush
    pngcrush -q -rem allb -brute "$file" "${file}.tmp" 2>/dev/null && mv "${file}.tmp" "$file"
    
    # Taille après
    local size_after=$(stat -c%s "$file")
    local size_after_kb=$((size_after / 1024))
    
    # Calcul du gain
    local gain=$((size_before - size_after))
    local gain_kb=$((gain / 1024))
    local gain_percent=$((gain * 100 / size_before))
    
    echo "✅ $(basename "$file"): ${size_before_kb}K → ${size_after_kb}K (-${gain_kb}K, -${gain_percent}%)"
    
    return 0
}

# Fonction pour redimensionner et optimiser les icônes Android
optimize_android_icon() {
    local file="$1"
    local target_size="$2"
    local backup_file="$backup_dir/$(basename "$file")"
    
    if [ ! -f "$file" ]; then
        echo "❌ Fichier non trouvé: $file"
        return 1
    fi
    
    echo "🔄 Redimensionnement et optimisation de $(basename "$file")..."
    
    # Sauvegarde originale
    cp "$file" "$backup_file"
    
    # Taille avant
    local size_before=$(stat -c%s "$file")
    local size_before_kb=$((size_before / 1024))
    
    # Redimensionnement et optimisation avec ImageMagick
    convert "$file" -resize "${target_size}x${target_size}" -strip -quality 95 "${file}.tmp"
    
    # Optimisation PNG
    optipng -o7 -quiet "${file}.tmp" 2>/dev/null
    pngcrush -q -rem allb -brute "${file}.tmp" "$file" 2>/dev/null
    rm -f "${file}.tmp"
    
    # Taille après
    local size_after=$(stat -c%s "$file")
    local size_after_kb=$((size_after / 1024))
    
    # Calcul du gain
    local gain=$((size_before - size_after))
    local gain_kb=$((gain / 1024))
    local gain_percent=$((gain * 100 / size_before))
    
    echo "✅ $(basename "$file"): ${size_before_kb}K → ${size_after_kb}K (-${gain_kb}K, -${gain_percent}%)"
    
    return 0
}

echo ""
echo "📊 Tailles AVANT optimisation:"
analyze_image "public/android-chrome-512x512.png"
analyze_image "public/android-chrome-192x192.png" 
analyze_image "public/apple-touch-icon.png"
analyze_image "public/favicon.ico"
analyze_image "public/favicon-32x32.png"
analyze_image "public/favicon-16x16.png"

echo ""
echo "🚀 Début de l'optimisation..."

# Optimiser les icônes Android (les plus lourdes)
if [ -f "public/android-chrome-512x512.png" ]; then
    # Redimensionner à 512x512 avec optimisation agressive
    optimize_android_icon "public/android-chrome-512x512.png" 512
fi

if [ -f "public/android-chrome-192x192.png" ]; then
    # Optimiser sans redimensionnement
    optimize_png "public/android-chrome-192x192.png"
fi

# Optimiser l'icône Apple
if [ -f "public/apple-touch-icon.png" ]; then
    # Redimensionner à 180x180 (taille standard Apple)
    optimize_android_icon "public/apple-touch-icon.png" 180
fi

# Optimiser les favicons PNG
if [ -f "public/favicon-32x32.png" ]; then
    optimize_png "public/favicon-32x32.png"
fi

if [ -f "public/favicon-16x16.png" ]; then
    optimize_png "public/favicon-16x16.png"
fi

# Note: favicon.ico ne peut pas être optimisé avec ces outils PNG

echo ""
echo "📊 Tailles APRÈS optimisation:"
analyze_image "public/android-chrome-512x512.png"
analyze_image "public/android-chrome-192x192.png" 
analyze_image "public/apple-touch-icon.png"
analyze_image "public/favicon.ico"
analyze_image "public/favicon-32x32.png"
analyze_image "public/favicon-16x16.png"

echo ""
echo "💾 Sauvegarde créée dans: $backup_dir"
echo "✅ Optimisation terminée!"

# Calculer le gain total
total_before=$(du -sb public/*.png 2>/dev/null | awk '{sum+=$1} END {print sum}')
total_after=$(du -sb public/*.png 2>/dev/null | awk '{sum+=$1} END {print sum}')

if [ ! -z "$total_before" ] && [ ! -z "$total_after" ]; then
    total_gain=$((total_before - total_after))
    total_gain_kb=$((total_gain / 1024))
    total_gain_percent=$((total_gain * 100 / total_before))
    
    echo ""
    echo "🎯 GAIN TOTAL: ${total_gain_kb}K économisés (-${total_gain_percent}%)"
fi

echo ""
echo "🔍 Pour annuler les changements:"
echo "cp $backup_dir/* public/"
