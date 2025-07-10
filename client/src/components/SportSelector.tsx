// client/src/components/SportSelector.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SportsService } from '@/services/sportsService';
import { SportOption } from '@/types/onboarding';

interface SportSelectorProps {
  onSelect: (sport: SportOption) => void;
  selectedSport?: SportOption;
  placeholder?: string;
  allowCustom?: boolean;
}

export default function SportSelector({ 
  onSelect, 
  selectedSport, 
  placeholder = "Recherchez votre sport...",
  allowCustom = true
}: SportSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SportOption[]>([]);
  const [popularSports, setPopularSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [customSportName, setCustomSportName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Charger les sports populaires au démarrage
  useEffect(() => {
    const loadPopularSports = async () => {
      try {
        const data = await SportsService.getSports();
        setPopularSports(data.sports.slice(0, 8)); // Top 8 sports
      } catch (error) {
        console.error('Erreur lors du chargement des sports populaires:', error);
      }
    };

    loadPopularSports();
  }, []);

  // Recherche en temps réel
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchSports = async () => {
      setLoading(true);
      try {
        const results = await SportsService.searchSports(searchQuery);
        setSearchResults(results);
        
        // Suggérer d'ajouter un sport si aucun résultat
        if (results.length === 0 && allowCustom) {
          setShowSuggestion(true);
          setCustomSportName(searchQuery);
        } else {
          setShowSuggestion(false);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSports, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allowCustom]);

  const handleSelectSport = (sport: SportOption) => {
    onSelect(sport);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSuggestCustomSport = async () => {
    if (!customSportName.trim()) return;

    try {
      const success = await SportsService.suggestNewSport(customSportName);
      if (success) {
        // Créer un sport temporaire pour l'utilisateur
        const customSport: SportOption = {
          id: `custom_${Date.now()}`,
          name: customSportName,
          emoji: '🎯',
          positions: []
        };
        
        handleSelectSport(customSport);
        setShowSuggestion(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suggestion:', error);
    }
  };

  const sportsToShow = searchQuery.length >= 2 ? searchResults : popularSports;

  return (
    <div className="relative">
      {/* Sport sélectionné */}
      {selectedSport && !isOpen && (
        <div className="mb-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedSport.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">{selectedSport.name}</h3>
                    <p className="text-sm text-blue-600">Sport sélectionné</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interface de sélection */}
      {(!selectedSport || isOpen) && (
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
              onFocus={() => setIsOpen(true)}
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Résultats de recherche ou sports populaires */}
          {isOpen && (
            <div className="space-y-3">
              {searchQuery.length >= 2 && (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Résultats pour "{searchQuery}"
                  </h3>
                  <Badge variant="outline">
                    {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
              
              {searchQuery.length < 2 && (
                <h3 className="font-semibold text-gray-900">Sports populaires</h3>
              )}

              {/* Liste des sports */}
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {sportsToShow.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handleSelectSport(sport)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
                      selectedSport?.id === sport.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-2xl">{sport.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium">{sport.name}</div>
                      {sport.positions && sport.positions.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {sport.positions.length} position{sport.positions.length !== 1 ? 's' : ''} disponible{sport.positions.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    {selectedSport?.id === sport.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Suggestion de sport personnalisé */}
              {showSuggestion && allowCustom && (
                <div className="border-t pt-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Plus className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Sport non trouvé ? Suggérez-le !
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={customSportName}
                        onChange={(e) => setCustomSportName(e.target.value)}
                        placeholder="Nom du sport"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSuggestCustomSport}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Suggérer
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Votre suggestion sera examinée par notre équipe
                    </p>
                  </div>
                </div>
              )}

              {/* Aucun résultat */}
              {searchQuery.length >= 2 && searchResults.length === 0 && !loading && !showSuggestion && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun sport trouvé pour "{searchQuery}"</p>
                </div>
              )}

              {/* Bouton annuler */}
              {isOpen && selectedSport && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
