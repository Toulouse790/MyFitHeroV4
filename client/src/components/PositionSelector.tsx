// client/src/components/PositionSelector.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  Plus, 
  Search, 
  Star,
  Users,
  TrendingUp,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SportOption } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { SportsService } from '@/services/sportsService';

/* ================================================================== */
/*                            INTERFACES                              */
/* ================================================================== */

interface PositionSelectorProps {
  sport: SportOption;
  onSelect: (position: string) => void;
  selectedPosition?: string | null;
  allowCustom?: boolean;
  showPopularity?: boolean;
  variant?: 'default' | 'compact' | 'grid';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxSuggestions?: number;
}

interface PositionWithMetadata {
  name: string;
  popularity?: number;
  isRecommended?: boolean;
  isTrending?: boolean;
  userCount?: number;
  category?: string;
  description?: string;
}

interface PositionState {
  searchQuery: string;
  filteredPositions: PositionWithMetadata[];
  showCustomInput: boolean;
  customPosition: string;
  loading: boolean;
  error: string | null;
  suggestions: string[];
}

/* ================================================================== */
/*                        COMPOSANT PRINCIPAL                         */
/* ================================================================== */

export default function PositionSelector({
  sport,
  onSelect,
  selectedPosition = null,
  allowCustom = true,
  showPopularity = true,
  variant = 'default',
  disabled = false,
  className = '',
  placeholder = 'Rechercher une position...',
  maxSuggestions = 5
}: PositionSelectorProps) {

  /* ========================== HOOKS ET STATE ========================= */

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<PositionState>({
    searchQuery: '',
    filteredPositions: [],
    showCustomInput: false,
    customPosition: '',
    loading: false,
    error: null,
    suggestions: []
  });

  // Debounce pour la recherche
  const debouncedSearchQuery = useDebounce(state.searchQuery, 300);

  /* ========================= COMPUTED VALUES ========================== */

  // Positions enrichies avec métadonnées
  const enrichedPositions = useMemo((): PositionWithMetadata[] => {
    if (!sport.positions || sport.positions.length === 0) return [];

    return sport.positions.map((position, index) => ({
      name: position,
      popularity: Math.max(0, 100 - index * 5), // Simulation basée sur l'ordre
      isRecommended: index < 3, // Top 3 recommandées
      isTrending: Math.random() > 0.8, // Simulation trending
      userCount: Math.floor(Math.random() * 10000) + 100, // Simulation
      category: getPositionCategory(position),
      description: getPositionDescription(position, sport.name)
    }));
  }, [sport.positions, sport.name]);

  // Positions filtrées selon la recherche
  const displayPositions = useMemo(() => {
    if (state.searchQuery.length === 0) {
      return enrichedPositions;
    }

    return enrichedPositions.filter(position =>
      position.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
  }, [enrichedPositions, state.searchQuery]);

  /* ========================== EFFECTS ========================== */

  // Mise à jour des positions filtrées
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredPositions: displayPositions,
      showCustomInput: displayPositions.length === 0 && allowCustom && state.searchQuery.length > 0,
      customPosition: displayPositions.length === 0 ? state.searchQuery : prev.customPosition
    }));
  }, [displayPositions, allowCustom, state.searchQuery]);

  // Chargement des suggestions de positions populaires
  useEffect(() => {
    if (sport.id && showPopularity) {
      loadPositionSuggestions();
    }
  }, [sport.id, showPopularity]);

  /* ========================= FONCTIONS ========================= */

  const loadPositionSuggestions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulation de chargement de suggestions (à remplacer par une vraie API)
      const suggestions = await getSportPositionSuggestions(sport.id);
      
      setState(prev => ({ 
        ...prev, 
        suggestions, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur lors du chargement des suggestions',
        loading: false 
      }));
    }
  }, [sport.id]);

  const handleSelectPosition = useCallback((position: string) => {
    onSelect(position);
    setState(prev => ({ 
      ...prev, 
      searchQuery: '',
      showCustomInput: false 
    }));

    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'position_selected', {
        sport_id: sport.id,
        sport_name: sport.name,
        position: position,
        is_custom: !sport.positions?.includes(position)
      });
    }

    toast({
      title: "Position sélectionnée",
      description: `${position} pour ${sport.name}`,
    });
  }, [onSelect, sport.id, sport.name, sport.positions, toast]);

  const handleSelectCustomPosition = useCallback(async () => {
    const trimmedPosition = state.customPosition.trim();
    if (!trimmedPosition) return;

    try {
      // Optionnel : suggérer la nouvelle position à l'équipe
      if (allowCustom) {
        await SportsService.suggestSport(sport.name, {
          suggested_position: trimmedPosition
        });
      }

      handleSelectPosition(trimmedPosition);
      
      toast({
        title: "Position personnalisée ajoutée",
        description: "Votre position a été ajoutée à votre profil",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter cette position",
        variant: "destructive",
      });
    }
  }, [state.customPosition, allowCustom, sport.name, handleSelectPosition, toast]);

  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, searchQuery: value }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      searchQuery: '',
      showCustomInput: false 
    }));
    inputRef.current?.focus();
  }, []);

  /* ========================= RENDER HELPERS ========================= */

  const renderPositionItem = useCallback((position: PositionWithMetadata, index: number) => (
    <button
      key={position.name}
      onClick={() => handleSelectPosition(position.name)}
      disabled={disabled}
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selectedPosition === position.name
          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        variant === 'compact' && "p-2"
      )}
      aria-label={`Sélectionner la position ${position.name}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-gray-900 truncate">
            {position.name}
          </span>
          
          {position.isRecommended && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Recommandé
            </Badge>
          )}
          
          {position.isTrending && (
            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendance
            </Badge>
          )}
        </div>
        
        {variant !== 'compact' && (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {position.description && (
              <span className="truncate">{position.description}</span>
            )}
            {showPopularity && position.userCount && (
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {position.userCount.toLocaleString()}
              </span>
            )}
            {position.popularity && position.popularity > 80 && (
              <span className="flex items-center text-amber-600">
                <Star className="w-3 h-3 mr-1" />
                Populaire
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {selectedPosition === position.name ? (
          <Check className="h-5 w-5 text-blue-600 animate-in zoom-in-50" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </div>
    </button>
  ), [handleSelectPosition, selectedPosition, disabled, variant, showPopularity]);

  const renderSelectedPosition = () => {
    if (!selectedPosition) return null;

    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-lg">{selectedPosition}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Position sélectionnée
                  </Badge>
                  <span className="text-sm text-blue-600">pour {sport.name}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, searchQuery: '' }))}
              disabled={disabled}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchBar = () => {
    if (!sport.positions || sport.positions.length <= 6) return null;

    return (
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={disabled || state.loading}
          className="pl-10 pr-10 border-2 focus:border-blue-500 transition-colors"
          aria-label="Rechercher une position"
        />
        {state.searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const renderNoPositionsState = () => {
    if (sport.positions && sport.positions.length > 0) return null;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{sport.emoji}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {sport.name}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Ce sport n'a pas de positions spécifiques prédéfinies. Vous pouvez ajouter votre spécialité ou continuer sans position particulière.
        </p>
        
        {allowCustom && (
          <div className="max-w-md mx-auto mb-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Votre spécialité ou niveau (optionnel)"
                value={state.customPosition}
                onChange={(e) => setState(prev => ({ ...prev, customPosition: e.target.value }))}
                disabled={disabled}
                className="flex-1"
              />
              <Button
                onClick={handleSelectCustomPosition}
                disabled={!state.customPosition.trim() || disabled}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => handleSelectPosition('Général')}
          variant="outline"
          size="lg"
          disabled={disabled}
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <Check className="h-4 w-4 mr-2" />
          Continuer sans spécialité
        </Button>
      </div>
    );
  };

  const renderCustomPositionInput = () => {
    if (!state.showCustomInput || !allowCustom) return null;

    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 mt-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Plus className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                Position non trouvée ? Créez la vôtre !
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Ajoutez une position personnalisée qui correspond à votre pratique.
              </p>
              <div className="flex space-x-2">
                <Input
                  value={state.customPosition}
                  onChange={(e) => setState(prev => ({ ...prev, customPosition: e.target.value }))}
                  placeholder="Votre position personnalisée"
                  disabled={disabled}
                  className="flex-1 border-amber-200 focus:border-amber-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSelectCustomPosition()}
                />
                <Button
                  onClick={handleSelectCustomPosition}
                  disabled={!state.customPosition.trim() || disabled}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Cette position sera ajoutée à votre profil personnel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptySearchState = () => {
    if (state.searchQuery.length === 0 || state.filteredPositions.length > 0 || state.showCustomInput) {
      return null;
    }

    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-medium text-gray-900 mb-2">
          Aucune position trouvée
        </h3>
        <p className="text-gray-500 mb-4">
          Aucun résultat pour "{state.searchQuery}"
        </p>
        {allowCustom && (
          <Button
            onClick={() => setState(prev => ({ 
              ...prev, 
              showCustomInput: true,
              customPosition: prev.searchQuery 
            }))}
            variant="outline"
            size="sm"
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer cette position
          </Button>
        )}
      </div>
    );
  };

  const renderPositionsList = () => {
    if (state.loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (state.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{state.error}</p>
            <Button 
              onClick={loadPositionSuggestions} 
              variant="outline" 
              size="sm"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className={cn(
        "space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
        variant === 'grid' && "grid grid-cols-2 gap-2 space-y-0"
      )}>
        {state.filteredPositions.map((position, index) => renderPositionItem(position, index))}
      </div>
    );
  };

  const renderGeneralOption = () => {
    if (selectedPosition || state.filteredPositions.length === 0) return null;

    return (
      <div className="pt-4 border-t">
        <Button
          onClick={() => handleSelectPosition('Autre')}
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          Je n'ai pas de position spécifique
        </Button>
      </div>
    );
  };

  /* ========================== RENDER PRINCIPAL ======================= */

  // État sans positions prédéfinies
  if (!sport.positions || sport.positions.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {renderNoPositionsState()}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* En-tête du sport */}
      <div className="text-center">
        <div className="text-4xl mb-2">{sport.emoji}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {sport.name}
        </h3>
        <p className="text-gray-600">
          Sélectionnez votre position ou spécialité
        </p>
      </div>

      {/* Position actuellement sélectionnée */}
      {renderSelectedPosition()}

      {/* Barre de recherche */}
      {renderSearchBar()}

      {/* Liste des positions ou état vide */}
      {state.filteredPositions.length > 0 ? (
        renderPositionsList()
      ) : (
        renderEmptySearchState()
      )}

      {/* Input pour position personnalisée */}
      {renderCustomPositionInput()}

      {/* Option générale */}
      {renderGeneralOption()}
    </div>
  );
}

/* ================================================================== */
/*                        FONCTIONS UTILITAIRES                       */
/* ================================================================== */

function getPositionCategory(position: string): string {
  // Logique simple de catégorisation
  const categories: Record<string, string[]> = {
    'Attaque': ['attaquant', 'avant', 'ailier', 'buteur'],
    'Défense': ['défenseur', 'gardien', 'libéro'],
    'Milieu': ['milieu', 'meneur', 'playmaker'],
    'Support': ['pivot', 'centre', 'soutien']
  };

  const positionLower = position.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => positionLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'Général';
}

function getPositionDescription(position: string, sportName: string): string {
  // Descriptions génériques basées sur la position
  const descriptions: Record<string, string> = {
    'Gardien': 'Protège les buts et initie les actions',
    'Défenseur': 'Récupère le ballon et protège la défense',
    'Milieu': 'Liaison entre défense et attaque',
    'Attaquant': 'Finalise les actions offensives',
    'Pivot': 'Poste central polyvalent',
    'Ailier': 'Évolue sur les côtés du terrain'
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (position.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }

  return `Position spécialisée en ${sportName}`;
}

async function getSportPositionSuggestions(sportId: string): Promise<string[]> {
  // Simulation d'API pour récupérer des suggestions populaires
  // À remplacer par une vraie requête Supabase
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `Position populaire 1 pour ${sportId}`,
        `Position populaire 2 pour ${sportId}`,
        `Position populaire 3 pour ${sportId}`
      ]);
    }, 500);
  });
}

/* ================================================================== */
/*                              EXPORTS                               */
/* ================================================================== */

// Variants pour différents usages
export const CompactPositionSelector: React.FC<Omit<PositionSelectorProps, 'variant'>> = (props) => (
  <PositionSelector {...props} variant="compact" showPopularity={false} />
);

export const GridPositionSelector: React.FC<Omit<PositionSelectorProps, 'variant'>> = (props) => (
  <PositionSelector {...props} variant="grid" />
);
