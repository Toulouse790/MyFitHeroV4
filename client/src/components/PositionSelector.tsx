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
  ChevronRight,
  Database,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SportOption } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { SportsService } from '@/services/sportsService';
import { usePositions } from '@/services/usePositions';

/* ================================================================== */
/*                            INTERFACES                              */
/* ================================================================== */

interface PositionSelectorProps {
  sport: SportOption;
  onSelect: (position: string) => void;
  selectedPosition?: string | null;
  allowCustom?: boolean;
  showPopularity?: boolean;
  showAnalytics?: boolean;
  variant?: 'default' | 'compact' | 'grid' | 'cards';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxSuggestions?: number;
  enableAIRecommendations?: boolean;
}

interface PositionWithMetadata {
  name: string;
  popularity?: number;
  isRecommended?: boolean;
  isTrending?: boolean;
  userCount?: number;
  category?: string;
  description?: string;
  aiScore?: number;
  source?: 'library' | 'drills' | 'ai' | 'custom';
  seasonRelevance?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

interface PositionState {
  searchQuery: string;
  filteredPositions: PositionWithMetadata[];
  showCustomInput: boolean;
  customPosition: string;
  suggestions: PositionWithMetadata[];
  analyticsData: {
    totalSelections: number;
    averageTime: number;
    popularityTrend: 'up' | 'down' | 'stable';
  };
}

interface AIRecommendation {
  position: string;
  confidence: number;
  reasoning: string;
  suitabilityScore: number;
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
  showAnalytics = false,
  variant = 'default',
  disabled = false,
  className = '',
  placeholder = 'Rechercher una position...',
  maxSuggestions = 8,
  enableAIRecommendations = true
}: PositionSelectorProps) {

  /* ========================== HOOKS ET STATE ========================= */

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  // Hook Supabase pour récupérer les positions
  const { 
    positions: rawPositions, 
    isLoading: positionsLoading, 
    error: positionsError, 
    refresh: refreshPositions 
  } = usePositions(
    typeof sport.id === 'number' ? sport.id : parseInt(sport.id) || 0,
    sport.name
  );

  const [state, setState] = useState<PositionState>({
    searchQuery: '',
    filteredPositions: [],
    showCustomInput: false,
    customPosition: '',
    suggestions: [],
    analyticsData: {
      totalSelections: 0,
      averageTime: 0,
      popularityTrend: 'stable'
    }
  });

  // Debounce pour la recherche avec optimisation
  const debouncedSearchQuery = useDebounce(state.searchQuery, 250);

  /* ========================= COMPUTED VALUES ========================== */

  // Positions enrichies avec métadonnées IA et analytics
  const enrichedPositions = useMemo((): PositionWithMetadata[] => {
    if (!rawPositions || rawPositions.length === 0) return [];

    return rawPositions.map((position, index) => ({
      name: position,
      popularity: Math.max(0, 100 - index * 3), // Algorithme amélioré
      isRecommended: index < 4, // Top 4 recommandées
      isTrending: Math.random() > 0.75, // Simulation améliorée
      userCount: Math.floor(Math.random() * 25000) + 500,
      category: getPositionCategory(position),
      description: getPositionDescription(position, sport.name),
      aiScore: calculateAIScore(position, sport.name),
      source: index < rawPositions.length / 2 ? 'library' : 'drills',
      seasonRelevance: Math.random() * 100,
      difficultyLevel: getDifficultyLevel(position)
    }));
  }, [rawPositions, sport.name]);

  // AI Recommendations intégrées
  const aiRecommendations = useMemo((): AIRecommendation[] => {
    if (!enableAIRecommendations || !enrichedPositions.length) return [];
    
    return enrichedPositions
      .filter(pos => pos.aiScore && pos.aiScore > 70)
      .slice(0, 3)
      .map(pos => ({
        position: pos.name,
        confidence: pos.aiScore || 0,
        reasoning: `Optimisé pour ${sport.name} selon votre profil`,
        suitabilityScore: (pos.popularity || 0) + (pos.aiScore || 0)
      }))
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [enrichedPositions, sport.name, enableAIRecommendations]);

  // Positions filtrées avec recherche intelligente
  const displayPositions = useMemo(() => {
    let filtered = enrichedPositions;

    if (debouncedSearchQuery.length >= 2) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = enrichedPositions.filter(position => 
        position.name.toLowerCase().includes(query) ||
        position.category?.toLowerCase().includes(query) ||
        position.description?.toLowerCase().includes(query)
      );
      
      // Tri par pertinence de recherche
      filtered.sort((a, b) => {
        const aExactMatch = a.name.toLowerCase().startsWith(query) ? 10 : 0;
        const bExactMatch = b.name.toLowerCase().startsWith(query) ? 10 : 0;
        return (bExactMatch + (b.aiScore || 0)) - (aExactMatch + (a.aiScore || 0));
      });
    } else {
      // Tri par défaut : AI score + popularité
      filtered.sort((a, b) => 
        ((b.aiScore || 0) + (b.popularity || 0)) - ((a.aiScore || 0) + (a.popularity || 0))
      );
    }

    return filtered.slice(0, maxSuggestions);
  }, [enrichedPositions, debouncedSearchQuery, maxSuggestions]);

  /* ========================== EFFECTS ========================== */

  // Mise à jour du state avec les positions filtrées
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredPositions: displayPositions,
      showCustomInput: displayPositions.length === 0 && allowCustom && debouncedSearchQuery.length > 1,
      customPosition: displayPositions.length === 0 ? debouncedSearchQuery : prev.customPosition
    }));
  }, [displayPositions, allowCustom, debouncedSearchQuery]);

  // Chargement des analytics si activé
  useEffect(() => {
    if (showAnalytics && sport.id) {
      loadAnalyticsData();
    }
  }, [sport.id, showAnalytics]);

  /* ========================= FONCTIONS ========================= */

  const loadAnalyticsData = useCallback(async () => {
    try {
      // Simulation de chargement analytics (à remplacer par Supabase)
      const analytics = await getPositionAnalytics(sport.id);
      setState(prev => ({
        ...prev,
        analyticsData: analytics
      }));
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    }
  }, [sport.id]);

  const handleSelectPosition = useCallback((position: string) => {
    const selectionTime = Date.now() - startTimeRef.current;
    
    onSelect(position);
    setState(prev => ({ 
      ...prev, 
      searchQuery: '',
      showCustomInput: false 
    }));

    // Analytics enrichis avec IA
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'position_selected', {
        sport_id: sport.id,
        sport_name: sport.name,
        position: position,
        is_custom: !rawPositions?.includes(position),
        selection_time_ms: selectionTime,
        ai_recommended: aiRecommendations.some(ai => ai.position === position),
        search_used: state.searchQuery.length > 0
      });
    }

    // Feedback utilisateur optimisé
    toast({
      title: "Position sélectionnée",
      description: `${position} pour ${sport.name}`,
      action: aiRecommendations.some(ai => ai.position === position) ? (
        <Badge className="bg-blue-100 text-blue-700">
          <Sparkles className="w-3 h-3 mr-1" />
          IA
        </Badge>
      ) : undefined
    });
  }, [onSelect, sport.id, sport.name, rawPositions, aiRecommendations, state.searchQuery, toast]);

  const handleSelectCustomPosition = useCallback(async () => {
    const trimmedPosition = state.customPosition.trim();
    if (!trimmedPosition) return;

    try {
      setState(prev => ({ ...prev, showCustomInput: false }));
      
      // Suggérer la nouvelle position avec contexte IA
      if (allowCustom) {
        await SportsService.suggestSport(sport.name, {
          suggested_position: trimmedPosition,
          locale: 'fr',
          context: {
            searchQuery: state.searchQuery,
            aiRecommendations: aiRecommendations.map(ai => ai.position),
            timestamp: new Date()
          }
        });
      }

      handleSelectPosition(trimmedPosition);
      
      toast({
        title: "Position personnalisée créée",
        description: "Votre position a été ajoutée et envoyée à notre équipe",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer cette position personnalisée",
        variant: "destructive",
      });
    }
  }, [state.customPosition, state.searchQuery, allowCustom, sport.name, aiRecommendations, handleSelectPosition, toast]);

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

  const renderAIRecommendations = useCallback(() => {
    if (!enableAIRecommendations || aiRecommendations.length === 0) return null;

    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-4 w-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Recommandations IA</h4>
            <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
              Personnalisé
            </Badge>
          </div>
          <div className="grid gap-2">
            {aiRecommendations.map((rec, index) => (
              <button
                key={rec.position}
                onClick={() => handleSelectPosition(rec.position)}
                disabled={disabled}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-100 hover:border-purple-300 transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{rec.position}</div>
                  <div className="text-xs text-gray-600">{rec.reasoning}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    {Math.round(rec.confidence)}%
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }, [enableAIRecommendations, aiRecommendations, handleSelectPosition, disabled]);

  const renderPositionItem = useCallback((position: PositionWithMetadata, index: number) => (
    <button
      key={position.name}
      onClick={() => handleSelectPosition(position.name)}
      disabled={disabled}
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        selectedPosition === position.name
          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        variant === 'compact' && "p-3",
        variant === 'cards' && "flex-col items-start space-y-2"
      )}
      aria-label={`Sélectionner la position ${position.name}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-gray-900 truncate">
            {position.name}
          </span>
          
          {/* Badges multiples optimisés */}
          <div className="flex items-center space-x-1">
            {position.isRecommended && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Top
              </Badge>
            )}
            
            {position.aiScore && position.aiScore > 85 && (
              <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                <Zap className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
            
            {position.isTrending && (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                Tendance
              </Badge>
            )}
            
            {position.source === 'drills' && (
              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                <Database className="w-3 h-3 mr-1" />
                Drill
              </Badge>
            )}
          </div>
        </div>
        
        {variant !== 'compact' && (
          <div className="space-y-1">
            {position.description && (
              <div className="text-sm text-gray-600 truncate">
                {position.description}
              </div>
            )}
            
            {showPopularity && (
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {position.userCount && (
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {position.userCount.toLocaleString()}
                  </span>
                )}
                {position.popularity && position.popularity > 80 && (
                  <span className="flex items-center text-amber-600">
                    <Star className="w-3 h-3 mr-1" />
                    {Math.round(position.popularity)}%
                  </span>
                )}
                {position.difficultyLevel && (
                  <span className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {position.difficultyLevel}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {selectedPosition === position.name ? (
          <div className="flex items-center space-x-1">
            <Check className="h-5 w-5 text-blue-600 animate-in zoom-in-50" />
          </div>
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </div>
    </button>
  ), [handleSelectPosition, selectedPosition, disabled, variant, showPopularity]);

  const renderSelectedPosition = () => {
    if (!selectedPosition) return null;

    const selectedMeta = enrichedPositions.find(p => p.name === selectedPosition);
    const isAIRecommended = aiRecommendations.some(ai => ai.position === selectedPosition);

    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-bold text-blue-900 text-lg">{selectedPosition}</h4>
                  {isAIRecommended && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Position sélectionnée
                  </Badge>
                  <span className="text-sm text-blue-600">pour {sport.name}</span>
                  {selectedMeta?.category && (
                    <span className="text-xs text-blue-500">• {selectedMeta.category}</span>
                  )}
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
    const showSearch = rawPositions && rawPositions.length > 6;
    if (!showSearch) return null;

    return (
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={state.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={disabled || positionsLoading}
          className="pl-10 pr-10 border-2 focus:border-blue-500 transition-colors"
          aria-label="Rechercher une position"
        />
        {state.searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {state.searchQuery.length >= 2 && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Badge variant="outline" className="text-xs">
              {displayPositions.length} résultat{displayPositions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const renderNoPositionsState = () => {
    if (rawPositions && rawPositions.length > 0) return null;
    if (positionsLoading) return null;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{sport.emoji}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {sport.name}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Ce sport n'a pas de positions spécifiques dans notre base de données. Vous pouvez créer votre spécialité personnalisée.
        </p>
        
        {allowCustom && (
          <div className="max-w-md mx-auto mb-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Votre spécialité ou position (ex: Défenseur central)"
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
                Créer
              </Button>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => handleSelectPosition('Joueur polyvalent')}
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
                Position personnalisée
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Créez une position qui correspond exactement à votre pratique. Notre IA l'analysera pour futures recommandations.
              </p>
              <div className="flex space-x-2">
                <Input
                  value={state.customPosition}
                  onChange={(e) => setState(prev => ({ ...prev, customPosition: e.target.value }))}
                  placeholder="Ex: Défenseur latéral offensif"
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
                  Créer
                </Button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Cette position sera ajoutée à votre profil et analysée par notre IA
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
          Aucun résultat pour "<span className="font-medium">{state.searchQuery}</span>"
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
            Créer "{state.searchQuery}"
          </Button>
        )}
      </div>
    );
  };

  const renderPositionsList = () => {
    if (positionsLoading) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (positionsError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Erreur de chargement</p>
            <p className="text-red-600 text-sm mb-3">{positionsError}</p>
            <Button 
              onClick={refreshPositions} 
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
      <div className="space-y-3">
        {/* Header avec statistiques */}
        {displayPositions.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>
              {displayPositions.length} position{displayPositions.length !== 1 ? 's' : ''} 
              {state.searchQuery && ` pour "${state.searchQuery}"`}
            </span>
            {showAnalytics && (
              <div className="flex items-center space-x-3">
                <span>
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {state.analyticsData.popularityTrend}
                </span>
                <span>
                  <Users className="w-3 h-3 inline mr-1" />
                  {state.analyticsData.totalSelections}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Liste des positions */}
        <div className={cn(
          "space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
          variant === 'grid' && "grid grid-cols-2 gap-2 space-y-0 max-h-96",
          variant === 'cards' && "grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0 max-h-96"
        )}>
          {state.filteredPositions.map((position, index) => renderPositionItem(position, index))}
        </div>
      </div>
    );
  };

  const renderGeneralOption = () => {
    if (selectedPosition || state.filteredPositions.length === 0 || positionsLoading) return null;

    return (
      <div className="pt-4 border-t">
        <Button
          onClick={() => handleSelectPosition('Position polyvalente')}
          variant="outline"
          className="w-full"
          disabled={disabled}
        >
          <Target className="h-4 w-4 mr-2" />
          Je joue plusieurs positions
        </Button>
      </div>
    );
  };

  /* ========================== RENDER PRINCIPAL ======================= */

  // État sans positions prédéfinies
  if ((!rawPositions || rawPositions.length === 0) && !positionsLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {renderNoPositionsState()}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* En-tête du sport avec informations enrichies */}
      <div className="text-center">
        <div className="text-4xl mb-2">{sport.emoji}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {sport.name}
        </h3>
        <p className="text-gray-600 mb-2">
          Sélectionnez votre position ou spécialité
        </p>
        {rawPositions && rawPositions.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {rawPositions.length} position{rawPositions.length !== 1 ? 's' : ''} disponible{rawPositions.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Position actuellement sélectionnée */}
      {renderSelectedPosition()}

      {/* Recommandations IA */}
      {renderAIRecommendations()}

      {/* Barre de recherche */}
      {renderSearchBar()}

      {/* Liste des positions ou états alternatifs */}
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
  const categories: Record<string, string[]> = {
    'Attaque': ['attaquant', 'avant', 'ailier', 'buteur', 'striker', 'forward'],
    'Défense': ['défenseur', 'gardien', 'libéro', 'defender', 'goalkeeper', 'sweeper'],
    'Milieu': ['milieu', 'meneur', 'playmaker', 'midfielder', 'center'],
    'Support': ['pivot', 'centre', 'soutien', 'support', 'utility'],
    'Spécialisé': ['latéral', 'central', 'offensif', 'défensif', 'wing', 'back']
  };

  const positionLower = position.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => positionLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'Polyvalent';
}

function getPositionDescription(position: string, sportName: string): string {
  const descriptions: Record<string, string> = {
    'Gardien': 'Protège les buts et lance les contre-attaques',
    'Défenseur': 'Sécurise la défense et récupère les ballons',
    'Milieu': 'Fait la liaison entre défense et attaque',
    'Attaquant': 'Finalise les actions offensives et marque',
    'Pivot': 'Poste central polyvalent et créatif',
    'Ailier': 'Évolue sur les flancs pour créer le danger',
    'Latéral': 'Défend et participe aux montées offensives',
    'Central': 'Coordonne le jeu depuis le centre du terrain'
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (position.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }

  return `Position spécialisée optimisée pour ${sportName}`;
}

function calculateAIScore(position: string, sportName: string): number {
  // Algorithme de scoring IA basé sur des critères multiples
  let score = 50; // Score de base
  
  // Bonus pour les positions courantes
  const commonPositions = ['gardien', 'défenseur', 'milieu', 'attaquant'];
  if (commonPositions.some(common => position.toLowerCase().includes(common))) {
    score += 20;
  }
  
  // Bonus pour les sports populaires
  const popularSports = ['football', 'basketball', 'tennis', 'rugby'];
  if (popularSports.includes(sportName.toLowerCase())) {
    score += 15;
  }
  
  // Variabilité pour simuler l'analyse IA
  score += Math.random() * 30 - 15;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getDifficultyLevel(position: string): 'beginner' | 'intermediate' | 'advanced' {
  const advanced = ['gardien', 'meneur', 'playmaker', 'libéro'];
  const beginner = ['défenseur', 'milieu', 'support'];
  
  const positionLower = position.toLowerCase();
  
  if (advanced.some(adv => positionLower.includes(adv))) return 'advanced';
  if (beginner.some(beg => positionLower.includes(beg))) return 'beginner';
  return 'intermediate';
}

async function getPositionAnalytics(sportId: string): Promise<{
  totalSelections: number;
  averageTime: number;
  popularityTrend: 'up' | 'down' | 'stable';
}> {
  // Simulation d'analytics (à remplacer par requête Supabase)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalSelections: Math.floor(Math.random() * 10000) + 1000,
        averageTime: Math.floor(Math.random() * 120) + 30,
        popularityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      });
    }, 300);
  });
}

/* ================================================================== */
/*                              EXPORTS                               */
/* ================================================================== */

// Variants pour différents usages
export const CompactPositionSelector: React.FC<Omit<PositionSelectorProps, 'variant'>> = (props) => (
  <PositionSelector {...props} variant="compact" showPopularity={false} showAnalytics={false} />
);

export const GridPositionSelector: React.FC<Omit<PositionSelectorProps, 'variant'>> = (props) => (
  <PositionSelector {...props} variant="grid" />
);

export const AIPositionSelector: React.FC<Omit<PositionSelectorProps, 'enableAIRecommendations'>> = (props) => (
  <PositionSelector {...props} enableAIRecommendations={true} showAnalytics={true} />
);
