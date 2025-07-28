// client/src/components/PackSelector.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Clock, ChevronRight } from 'lucide-react';
import { SMART_PACKS, getEstimatedTimeForPack } from '@/data/smartPacks';
import { cn } from '@/lib/utils';

interface PackSelectorProps {
  onSelect: (packId: string) => void;
  recommendedPacks?: string[];
}

export const PackSelector: React.FC<PackSelectorProps> = ({ 
  onSelect, 
  recommendedPacks = [] 
}) => {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [hoveredPack, setHoveredPack] = useState<string | null>(null);

  const handleSelect = (packId: string) => {
    setSelectedPack(packId);
    // Petit délai pour l'animation avant de continuer
    setTimeout(() => {
      onSelect(packId);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Choisissez votre programme
        </h2>
        <p className="text-gray-600">
          Sélectionnez le pack qui correspond le mieux à vos objectifs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {SMART_PACKS.map((pack) => {
          const isRecommended = recommendedPacks.includes(pack.id);
          const isSelected = selectedPack === pack.id;
          const isHovered = hoveredPack === pack.id;
          const estimatedTime = getEstimatedTimeForPack(pack.id);

          return (
            <Card
              key={pack.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 overflow-hidden",
                "hover:shadow-lg hover:scale-[1.02]",
                isSelected && "ring-2 ring-blue-500 shadow-lg scale-[1.02]",
                isRecommended && "border-blue-200 bg-gradient-to-br from-blue-50/50 to-transparent"
              )}
              onClick={() => handleSelect(pack.id)}
              onMouseEnter={() => setHoveredPack(pack.id)}
              onMouseLeave={() => setHoveredPack(null)}
            >
              {/* Badge Populaire */}
              {pack.popular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-orange-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}

              {/* Badge Recommandé */}
              {isRecommended && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-500 text-white border-0">
                    Recommandé
                  </Badge>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* En-tête */}
                <div className="flex items-start space-x-4">
                  <div className="text-4xl flex-shrink-0">{pack.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {pack.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {pack.description}
                    </p>
                  </div>
                </div>

                {/* Modules inclus */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Modules inclus :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pack.modules.map((module) => (
                      <Badge 
                        key={module} 
                        variant="outline" 
                        className="text-xs capitalize"
                      >
                        {module === 'strength' ? 'Musculation' : module}
                      </Badge>
                    ))}
                    {pack.id === 'custom' && (
                      <Badge variant="outline" className="text-xs">
                        À personnaliser
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Temps estimé */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>~{estimatedTime} minutes</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center text-sm font-medium transition-all duration-300",
                    isSelected && "text-blue-600",
                    isHovered && !isSelected && "text-gray-700 translate-x-1"
                  )}>
                    {isSelected ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Sélectionné
                      </>
                    ) : (
                      <>
                        Choisir
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Effet de survol */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none",
                isHovered && "opacity-100"
              )} />
            </Card>
          );
        })}
      </div>

      {/* Note pour le pack personnalisé */}
      {(hoveredPack === 'custom' || selectedPack === 'custom') && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 italic">
            💡 Le pack "Sur Mesure" vous permettra de choisir précisément les modules qui vous intéressent
          </p>
        </div>
      )}
    </div>
  );
};

export default PackSelector;
