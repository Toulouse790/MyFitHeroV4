// client/src/components/PositionSelector.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SportOption } from '@/types/onboarding';

interface PositionSelectorProps {
  sport: SportOption;
  onSelect: (position: string) => void;
  selectedPosition?: string;
  allowCustom?: boolean;
}

export default function PositionSelector({ 
  sport, 
  onSelect, 
  selectedPosition,
  allowCustom = true 
}: PositionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPositions, setFilteredPositions] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPosition, setCustomPosition] = useState('');

  // Filtrer les positions selon la recherche
  useEffect(() => {
    if (!sport.positions) {
      setFilteredPositions([]);
      return;
    }

    if (searchQuery.length === 0) {
      setFilteredPositions(sport.positions);
      setShowCustomInput(false);
      return;
    }

    const filtered = sport.positions.filter(position =>
      position.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredPositions(filtered);
    
    // Afficher l'option personnalisée si pas de résultats
    if (filtered.length === 0 && allowCustom) {
      setShowCustomInput(true);
      setCustomPosition(searchQuery);
    } else {
      setShowCustomInput(false);
    }
  }, [searchQuery, sport.positions, allowCustom]);

  const handleSelectPosition = (position: string) => {
    onSelect(position);
    setSearchQuery('');
    setShowCustomInput(false);
  };

  const handleSelectCustomPosition = () => {
    if (customPosition.trim()) {
      handleSelectPosition(customPosition.trim());
    }
  };

  // Si le sport n'a pas de positions définies
  if (!sport.positions || sport.positions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">{sport.emoji}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {sport.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Ce sport n'a pas de positions spécifiques prédéfinies.
          </p>
          
          {allowCustom && (
            <div className="max-w-md mx-auto">
              <div className="flex space-x-2">
                <Input
                  placeholder="Votre spécialité ou niveau (optionnel)"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                />
                <Button
                  onClick={handleSelectCustomPosition}
                  disabled={!customPosition.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <Button
              onClick={() => handleSelectPosition('Général')}
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Check className="h-4 w-4 mr-2" />
              Continuer sans spécialité
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="text-center">
        <div className="text-4xl mb-2">{sport.emoji}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {sport.name}
        </h3>
        <p className="text-gray-600">
          Sélectionnez votre position ou spécialité
        </p>
      </div>

      {/* Position sélectionnée */}
      {selectedPosition && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">{selectedPosition}</h4>
                  <p className="text-sm text-blue-600">Position sélectionnée</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                Sélectionné
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche */}
      {sport.positions.length > 6 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Liste des positions */}
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {filteredPositions.map((position) => (
          <button
            key={position}
            onClick={() => handleSelectPosition(position)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
              selectedPosition === position
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <span className="font-medium">{position}</span>
            {selectedPosition === position && (
              <Check className="h-5 w-5 text-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Option personnalisée */}
      {showCustomInput && allowCustom && (
        <div className="border-t pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Plus className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Position non trouvée ? Ajoutez-la !
              </span>
            </div>
            <div className="flex space-x-2">
              <Input
                value={customPosition}
                onChange={(e) => setCustomPosition(e.target.value)}
                placeholder="Votre position personnalisée"
                className="flex-1"
              />
              <Button
                onClick={handleSelectCustomPosition}
                disabled={!customPosition.trim()}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Cette position sera ajoutée à votre profil
            </p>
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {searchQuery.length > 0 && filteredPositions.length === 0 && !showCustomInput && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>Aucune position trouvée pour "{searchQuery}"</p>
        </div>
      )}

      {/* Bouton "Autre" si pas de position spécifique */}
      {!selectedPosition && (
        <div className="pt-2">
          <Button
            onClick={() => handleSelectPosition('Autre')}
            variant="outline"
            className="w-full"
          >
            Je n'ai pas de position spécifique
          </Button>
        </div>
      )}
    </div>
  );
}
