// client/src/components/SportSelector.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  Star, 
  TrendingUp, 
  Globe,
  AlertCircle,
  Sparkles,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSports } from '@/services/sportsService';
import { SportOption } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

/* ================================================================== */
/*                           INTERFACES                               */
/* ================================================================== */

interface SportSelectorProps {
  onSelect: (sport: SportOption) => void;
  selectedSport?: SportOption | null;
  placeholder?: string;
  allowCustom?: boolean;
  showPopular?: boolean;
  showCategories?: boolean;
  maxResults?: number;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'card';
  locale?: 'fr' | 'en';
}

interface SportWithMetadata extends SportOption {
  popularity?: number;
  isRecommended?: boolean;
  isTrending?: boolean;
  category?: string;
  searchScore?: number;
  userCount?: number;
  lastUpdated?: Date;
}

interface SearchState {
  query: string;
  results: SportWithMetadata[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  showSuggestion: boolean;
  customSportName: string;
}

/* ================================================================== */
/*                        COMPOSANT PRINCIPAL                         */
/* ================================================================== */

export default function SportSelector({
  onSelect,
  selectedSport = null,
  placeholder = "Recherchez votre sport...",
  allowCustom = true,
  showPopular = true,
  showCategories = false,
  maxResults = 20,
  disabled = false,
  className = "",
  variant = 'default',
  locale = 'fr'
}: SportSelectorProps) {
  
  /* ========================== HOOKS ET STATE ========================= */
  
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    hasSearched: false,
    showSuggestion: false,
    customSportName: ''
  });

  // Hook personnalisé pour récupérer les sports depuis Supabase
  const { 
    sports: allSports,
    popularSports,
    searchSports,
    suggestSport,
    loading: sportsLoading,
    error: sportsError,
    refresh: refreshSports
  } = useSports();

  // Debounce de la recherche pour optimiser les performances
  const debouncedSearchQuery = useDebounce(searchState.query, 300);

  /* ========================= COMPUTED VALUES ========================== */

  // Sports à afficher selon le contexte
  const displaySports = useMemo(() => {
    if (searchState.query.length >= 2) {
      return searchState.results.slice(0, maxResults);
    }
    
    if (showPopular && popularSports.length > 0) {
      return popularSports.slice(0, 8).map(sport => ({
        ...sport,
        isRecommended: true
      }));
    }

    return allSports.slice(0, 12).map(sport => ({
      ...sport,
      popularity: Math.random() * 100 // Simulation pour la démo
    }));
  }, [searchState.query, searchState.results, popularSports, allSports, showPopular, maxResults]);

  // Catégories de sports si activées
  const sportCategories = useMemo(() => {
    if (!showCategories) return {};
    
    return displaySports.reduce((acc, sport) => {
      const category = sport.category || 'Autres';
      if (!acc[category]) acc[category] = [];
      acc[category].push(sport);
      return acc;
    }, {} as Record<string, SportWithMetadata[]>);
  }, [displaySports, showCategories]);

  /* ========================== EFFECTS ========================== */

  // Recherche automatique avec debounce
  useEffect(() => {
    if (debouncedSearchQuery.length < 2) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        loading: false,
        hasSearched: false,
        showSuggestion: false
      }));
      return;
    }

    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Fermer le sélecteur au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ========================= FONCTIONS ========================= */

  const performSearch = useCallback(async (query: string) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await searchSports(query);
      
      // Enrichir les résultats avec des métadonnées
      const enrichedResults: SportWithMetadata[] = results.map((sport, index) => ({
        ...sport,
        searchScore: (results.length - index) / results.length * 100,
        isRecommended: index < 3, // Top 3 recommandés
        isTrending: Math.random() > 0.7 // Simulation trending
      }));

      setSearchState(prev => ({
        ...prev,
        results: enrichedResults,
        loading: false,
        hasSearched: true,
        showSuggestion: enrichedResults.length === 0 && allowCustom,
        customSportName: enrichedResults.length === 0 ? query : ''
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la recherche';
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        results: []
      }));

      toast({
        title: "Erreur de recherche",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [searchSports, allowCustom, toast]);

  const handleSelectSport = useCallback((sport: SportWithMetadata) => {
    onSelect(sport);
    setIsOpen(false);
    setSearchState(prev => ({ ...prev, query: '' }));
    
    // Analytics - track sport selection
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sport_selected', {
        sport_id: sport.id,
        sport_name: sport.name,
        search_query: searchState.query,
        is_popular: sport.isRecommended
      });
    }
  }, [onSelect, searchState.query]);

  const handleSuggestCustomSport = useCallback(async () => {
    if (!searchState.customSportName.trim()) return;

    try {
      const success = await suggestSport(searchState.customSportName, {
        userContext: {
          searchQuery: searchState.query,
          timestamp: new Date(),
          locale
        }
      });

      if (success) {
        // Créer un sport temporaire pour l'utilisateur
        const customSport: SportWithMetadata = {
          id: `custom_${Date.now()}`,
          name: searchState.customSportName,
          emoji: '🎯',
          category: 'custom',
          positions: [],
          isRecommended: false,
          popularity: 0
        };

        handleSelectSport(customSport);
        
        toast({
          title: "Sport suggéré !",
          description: "Votre suggestion a été envoyée à notre équipe. Merci !",
        });

        setSearchState(prev => ({ 
          ...prev, 
          showSuggestion: false,
          customSportName: ''
        }));
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre suggestion. Réessayez plus tard.",
        variant: "destructive",
      });
    }
  }, [searchState.customSportName, searchState.query, suggestSport, handleSelectSport, toast, locale]);

  const handleInputChange = useCallback((value: string) => {
    setSearchState(prev => ({ ...prev, query: value }));
    if (!isOpen) setIsOpen(true);
  }, [isOpen]);

  const handleClearSelection = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  /* ========================= RENDER HELPERS ========================= */

  const renderSportItem = useCallback((sport: SportWithMetadata, index: number) => (
    <button
      key={sport.id}
      onClick={() => handleSelectSport(sport)}
      disabled={disabled}
      className={cn(
        "group flex items-center space-x-3 p-3 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selectedSport?.id === sport.id
          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        variant === 'compact' && "p-2 space-x-2"
      )}
      aria-label={`Sélectionner ${sport.name}`}
    >
      <div className="relative">
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {sport.emoji}
        </span>
        {sport.isRecommended && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 truncate">
            {sport.name}
          </span>
          {sport.isRecommended && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Recommandé
            </Badge>
          )}
          {sport.isTrending && (
            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendance
            </Badge>
          )}
        </div>
        
        {variant !== 'compact' && (
          <div className="flex items-center space-x-4 mt-1">
            {sport.positions && sport.positions.length > 0 && (
              <span className="text-sm text-gray-500">
                {sport.positions.length} position{sport.positions.length !== 1 ? 's' : ''}
              </span>
            )}
            {sport.userCount && (
              <span className="text-sm text-gray-500 flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                {sport.userCount.toLocaleString()} utilisateurs
              </span>
            )}
            {sport.popularity && sport.popularity > 80 && (
              <span className="text-sm text-amber-600 flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Populaire
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {selectedSport?.id === sport.id && (
          <Check className="h-5 w-5 text-blue-600 animate-in zoom-in-50" />
        )}
      </div>
    </button>
  ), [handleSelectSport, selectedSport, disabled, variant]);

  const renderSelectedSport = () => {
    if (!selectedSport || isOpen) return null;

    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedSport.emoji}</span>
              <div>
                <h3 className="font-bold text-blue-900 text-lg">{selectedSport.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    <Check className="w-3 h-3 mr-1" />
                    Sélectionné
                  </Badge>
                  {selectedSport.category && (
                    <span className="text-sm text-blue-600 capitalize">
                      {selectedSport.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
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

  const renderSearchInterface = () => {
    if (selectedSport && !isOpen) return null;

    return (
      <div className="space-y-4" ref={inputRef}>
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchState.query}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled || sportsLoading}
            className={cn(
              "pl-10 pr-12 py-3 text-lg border-2 focus:border-blue-500 transition-colors",
              searchState.error && "border-red-300 focus:border-red-500"
            )}
            onFocus={() => setIsOpen(true)}
            aria-label="Rechercher un sport"
            autoComplete="off"
          />
          
          {/* Indicateurs de chargement/erreur */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {searchState.loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            )}
            {searchState.error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        {/* Interface de sélection ouverte */}
        {isOpen && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {renderSearchResults()}
          </div>
        )}
      </div>
    );
  };

  const renderSearchResults = () => {
    // État de chargement initial
    if (sportsLoading && allSports.length === 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    // Erreur de chargement des sports
    if (sportsError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Erreur de chargement</p>
            <p className="text-red-600 text-sm mb-3">{sportsError}</p>
            <Button 
              onClick={refreshSports} 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        {/* En-tête des résultats */}
        {renderResultsHeader()}
        
        {/* Liste des sports */}
        {displaySports.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {showCategories ? renderCategorizedSports() : renderSportsList()}
          </div>
        ) : (
          renderEmptyState()
        )}

        {/* Suggestion de sport personnalisé */}
        {renderCustomSportSuggestion()}

        {/* Actions */}
        {renderActions()}
      </>
    );
  };

  const renderResultsHeader = () => {
    const title = searchState.hasSearched 
      ? `Résultats pour "${searchState.query}"`
      : showPopular && popularSports.length > 0
        ? "Sports populaires"
        : "Tous les sports";

    const count = displaySports.length;

    return (
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center">
          {searchState.hasSearched && <Search className="w-4 h-4 mr-2" />}
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {count} résultat{count !== 1 ? 's' : ''}
          </Badge>
          {showCategories && (
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Filter className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSportsList = () => (
    <div className="grid gap-2">
      {displaySports.map((sport, index) => renderSportItem(sport, index))}
    </div>
  );

  const renderCategorizedSports = () => (
    <div className="space-y-4">
      {Object.entries(sportCategories).map(([category, sports]) => (
        <div key={category}>
          <h4 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
            {category}
          </h4>
          <div className="grid gap-2 ml-2">
            {sports.map((sport, index) => renderSportItem(sport, index))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => {
    if (!searchState.hasSearched) return null;

    return (
      <div className="text-center py-12 px-4">
        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-medium text-gray-900 mb-2">
          Aucun sport trouvé
        </h3>
        <p className="text-gray-500 mb-4">
          Aucun résultat pour "{searchState.query}"
        </p>
        {allowCustom && (
          <Button
            onClick={() => setSearchState(prev => ({ 
              ...prev, 
              showSuggestion: true, 
              customSportName: prev.query 
            }))}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Suggérer ce sport
          </Button>
        )}
      </div>
    );
  };

  const renderCustomSportSuggestion = () => {
    if (!searchState.showSuggestion || !allowCustom) return null;

    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Plus className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                Sport non trouvé ? Aidez-nous à l'ajouter !
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Votre suggestion sera examinée par notre équipe et pourra être ajoutée pour tous les utilisateurs.
              </p>
              <div className="flex space-x-2">
                <Input
                  value={searchState.customSportName}
                  onChange={(e) => setSearchState(prev => ({ 
                    ...prev, 
                    customSportName: e.target.value 
                  }))}
                  placeholder="Nom du sport"
                  className="flex-1 border-amber-200 focus:border-amber-400"
                  disabled={disabled}
                />
                <Button
                  onClick={handleSuggestCustomSport}
                  size="sm"
                  disabled={!searchState.customSportName.trim() || disabled}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Suggérer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActions = () => {
    if (!isOpen || !selectedSport) return null;

    return (
      <div className="flex justify-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="flex items-center"
          disabled={disabled}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
      </div>
    );
  };

  /* ========================== RENDER PRINCIPAL ======================= */

  return (
    <div className={cn("relative", className)}>
      {renderSelectedSport()}
      {renderSearchInterface()}
    </div>
  );
}

/* ================================================================== */
/*                        VARIANTS ET EXPORTS                          */
/* ================================================================== */

// Variant compact pour utilisation dans des formulaires
export const CompactSportSelector: React.FC<Omit<SportSelectorProps, 'variant'>> = (props) => (
  <SportSelector {...props} variant="compact" showPopular={false} />
);

// Variant avec catégories pour une interface plus riche
export const CategorizedSportSelector: React.FC<Omit<SportSelectorProps, 'variant' | 'showCategories'>> = (props) => (
  <SportSelector {...props} variant="default" showCategories={true} />
);
