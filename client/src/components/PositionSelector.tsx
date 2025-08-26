import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Plus, Star, Target, Users, TrendingUp } from 'lucide-react';
import { SportOption } from '../types/onboarding';

interface Position {
  id: string;
  name: string;
  sport: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  popularity?: number;
  isCustom?: boolean;
}

interface PositionWithMetadata extends Position {
  aiRecommendation?: {
    score: number;
    reasoning: string;
    personalizedTips: string[];
  };
  similarPositions?: string[];
  requiredSkills?: string[];
  physicalDemands?: {
    strength: number;
    endurance: number;
    flexibility: number;
    coordination: number;
  };
}

interface PositionSelectorProps {
  sport: SportOption;
  selectedPositions: string[];
  onPositionChange: (positions: string[]) => void;
  maxSelections?: number;
  showAiRecommendations?: boolean;
  allowCustomPositions?: boolean;
}

// Simulation du hook usePositions
const usePositions = (sportId: string) => {
  const [positions, setPositions] = useState<PositionWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      try {
        // Simulation de données de positions pour différents sports
        const mockPositions: Record<string, PositionWithMetadata[]> = {
          football: [
            {
              id: 'goalkeeper',
              name: 'Gardien de but',
              sport: 'football',
              description: 'Protège les buts et organise la défense',
              difficulty: 'intermediate',
              popularity: 8,
              aiRecommendation: {
                score: 85,
                reasoning: 'Excellente position pour développer la coordination et les réflexes',
                personalizedTips: ['Travaillez vos réflexes', 'Améliorez votre communication']
              },
              physicalDemands: { strength: 7, endurance: 6, flexibility: 8, coordination: 9 }
            },
            {
              id: 'striker',
              name: 'Attaquant',
              sport: 'football',
              description: 'Marque des buts et crée des occasions',
              difficulty: 'advanced',
              popularity: 9,
              physicalDemands: { strength: 8, endurance: 8, flexibility: 6, coordination: 7 }
            }
          ],
          basketball: [
            {
              id: 'point-guard',
              name: 'Meneur de jeu',
              sport: 'basketball',
              description: 'Organise le jeu et distribue les passes',
              difficulty: 'advanced',
              popularity: 8,
              physicalDemands: { strength: 6, endurance: 8, flexibility: 7, coordination: 9 }
            }
          ]
        };

        setTimeout(() => {
          setPositions(mockPositions[sportId] || []);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Erreur lors du chargement des positions');
        setLoading(false);
      }
    };

    fetchPositions();
  }, [sportId]);

  return { positions, loading, error };
};

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  sport,
  selectedPositions,
  onPositionChange,
  maxSelections = 3,
  showAiRecommendations = true,
  allowCustomPositions = true
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customPosition, setCustomPosition] = useState({ name: '', description: '' });

  const { positions, loading, error } = usePositions(String(sport.id));

  // Recherche avec debounce
  const filteredPositions = useMemo(() => {
    if (!searchTerm) return positions;
    return positions.filter(position =>
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  // Recommandations IA
  const aiRecommendations = useMemo(() => {
    return positions
      .filter(p => p.aiRecommendation && p.aiRecommendation.score > 80)
      .sort((a, b) => (b.aiRecommendation?.score || 0) - (a.aiRecommendation?.score || 0))
      .slice(0, 2);
  }, [positions]);

  const handlePositionToggle = (positionId: string) => {
    const isSelected = selectedPositions.includes(positionId);
    let newSelections: string[];

    if (isSelected) {
      newSelections = selectedPositions.filter(id => id !== positionId);
    } else {
      if (selectedPositions.length >= maxSelections) {
        return;
      }
      newSelections = [...selectedPositions, positionId];
    }

    onPositionChange(newSelections);
  };

  const handleCustomPositionAdd = () => {
    if (customPosition.name.trim()) {
      const customId = `custom-${Date.now()}`;
      handlePositionToggle(customId);
      setCustomPosition({ name: '', description: '' });
      setShowCustomForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des positions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Recommandations IA */}
      {showAiRecommendations && aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Recommandations IA pour vous</h3>
          </div>
          <div className="space-y-2">
            {aiRecommendations.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
              >
                <div>
                  <p className="font-medium text-gray-900">{position.name}</p>
                  <p className="text-sm text-gray-600">{position.aiRecommendation?.reasoning}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      Score: {position.aiRecommendation?.score}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePositionToggle(position.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedPositions.includes(position.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {selectedPositions.includes(position.id) ? 'Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des positions */}
      <div className="grid gap-3">
        {filteredPositions.map((position) => {
          const isSelected = selectedPositions.includes(position.id);
          const isMaxReached = selectedPositions.length >= maxSelections && !isSelected;

          return (
            <div
              key={position.id}
              className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isMaxReached
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => !isMaxReached && handlePositionToggle(position.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{position.name}</h3>
                    {position.difficulty && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          position.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : position.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {position.difficulty}
                      </span>
                    )}
                  </div>
                  {position.description && (
                    <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                  )}
                  
                  {/* Demandes physiques */}
                  {position.physicalDemands && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1 text-gray-400" />
                        <span>Force: {position.physicalDemands.strength}/10</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1 text-gray-400" />
                        <span>Endurance: {position.physicalDemands.endurance}/10</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Position personnalisée */}
      {allowCustomPositions && (
        <div className="border-t pt-4">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une position personnalisée</span>
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Nom de la position"
                value={customPosition.name}
                onChange={(e) => setCustomPosition(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optionnel)"
                value={customPosition.description}
                onChange={(e) => setCustomPosition(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCustomPositionAdd}
                  disabled={!customPosition.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomPosition({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information sur la sélection */}
      <div className="text-sm text-gray-600 text-center">
        {selectedPositions.length} / {maxSelections} positions sélectionnées
      </div>
    </div>
  );
};

export default PositionSelector;
