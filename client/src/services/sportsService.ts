// client/src/services/sportsService.ts
import { supabase } from '@/lib/supabase';
import { SportOption } from '@/types/onboarding';

export interface Sport {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
  positions?: string[];
  is_popular?: boolean; // Corrigé: is_active → is_popular
  created_at?: string;
  updated_at?: string;
}

export interface SportsData {
  sports: SportOption[];
  positions: Record<string, string[]>;
}

// Cache pour éviter les requêtes répétées
let sportsCache: SportsData | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class SportsService {
  
  /**
   * Récupère tous les sports depuis Supabase avec leurs positions
   */
  static async getSports(): Promise<SportsData> {
    // Vérifier le cache
    if (sportsCache && Date.now() < cacheExpiry) {
      return sportsCache;
    }

    try {
      const { data: sportsData, error } = await supabase
        .from('sports_library')
        .select('*')
        .eq('is_popular', true) // Corrigé: is_active → is_popular
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des sports:', error);
        return this.getFallbackSports();
      }

      if (!sportsData || sportsData.length === 0) {
        return this.getFallbackSports();
      }

      const sports: SportOption[] = sportsData.map(sport => ({
        id: sport.id,
        name: sport.name,
        emoji: sport.emoji || '🏃‍♂️',
        positions: sport.positions || []
      }));

      const positions: Record<string, string[]> = {};
      sportsData.forEach(sport => {
        if (sport.positions && sport.positions.length > 0) {
          positions[sport.id] = sport.positions;
        }
      });

      const result: SportsData = { sports, positions };
      
      // Mettre en cache
      sportsCache = result;
      cacheExpiry = Date.now() + CACHE_DURATION;
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des sports:', error);
      return this.getFallbackSports();
    }
  }

  /**
   * Récupère un sport spécifique avec ses positions
   */
  static async getSport(sportId: string): Promise<SportOption | null> {
    try {
      const { data: sport, error } = await supabase
        .from('sports_library')
        .select('*')
        .eq('id', sportId)
        .eq('is_popular', true) // Corrigé: is_active → is_popular
        .single();

      if (error || !sport) {
        console.error('Sport non trouvé:', sportId);
        return null;
      }

      return {
        id: sport.id,
        name: sport.name,
        emoji: sport.emoji || '🏃‍♂️',
        positions: sport.positions || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du sport:', error);
      return null;
    }
  }

  /**
   * Ajoute un nouveau sport suggéré par l'utilisateur
   */
  static async suggestNewSport(sportName: string, userPosition?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return false;
      }

      const { error } = await supabase
        .from('sport_suggestions')
        .insert({
          sport_name: sportName,
          suggested_position: userPosition,
          user_id: user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Erreur lors de la suggestion de sport:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suggestion de sport:', error);
      return false;
    }
  }

  /**
   * Recherche de sports avec autocomplétion
   */
  static async searchSports(query: string): Promise<SportOption[]> {
    try {
      const { data: sports, error } = await supabase
        .from('sports_library')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('is_popular', true) // Corrigé: is_active → is_popular
        .order('name')
        .limit(10);

      if (error) {
        console.error('Erreur lors de la recherche de sports:', error);
        return [];
      }

      return sports.map(sport => ({
        id: sport.id,
        name: sport.name,
        emoji: sport.emoji || '🏃‍♂️',
        positions: sport.positions || []
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche de sports:', error);
      return [];
    }
  }

  /**
   * Vide le cache des sports
   */
  static clearCache(): void {
    sportsCache = null;
    cacheExpiry = 0;
  }

  /**
   * Sports de fallback en cas d'erreur
   */
  private static getFallbackSports(): SportsData {
    const fallbackSports: SportOption[] = [
      {
        id: 'football',
        name: 'Football',
        emoji: '⚽',
        positions: ['Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif', 'Milieu central', 'Milieu offensif', 'Ailier droit', 'Ailier gauche', 'Attaquant', 'Avant-centre']
      },
      {
        id: 'basketball',
        name: 'Basketball',
        emoji: '🏀',
        positions: ['Meneur (PG)', 'Arrière (SG)', 'Ailier (SF)', 'Ailier Fort (PF)', 'Pivot (C)']
      },
      {
        id: 'tennis',
        name: 'Tennis',
        emoji: '🎾',
        positions: ['Joueur de fond de court', 'Joueur offensif', 'Joueur polyvalent']
      },
      {
        id: 'running',
        name: 'Course à Pied',
        emoji: '🏃‍♂️',
        positions: ['Sprint', 'Demi-fond', 'Fond', 'Marathon', 'Trail']
      },
      {
        id: 'cycling',
        name: 'Cyclisme',
        emoji: '🚴‍♂️',
        positions: ['Route', 'VTT', 'Piste', 'BMX']
      },
      {
        id: 'musculation',
        name: 'Musculation',
        emoji: '💪',
        positions: ['Bodybuilding', 'Powerlifting', 'Haltérophilie', 'CrossFit', 'Fitness général']
      },
      {
        id: 'other',
        name: 'Autre sport',
        emoji: '🎯',
        positions: []
      }
    ];

    const positions: Record<string, string[]> = {};
    fallbackSports.forEach(sport => {
      if (sport.positions && sport.positions.length > 0) {
        positions[sport.id] = sport.positions;
      }
    });

    return { sports: fallbackSports, positions };
  }
}

// Hook React pour utiliser les sports
export const useSports = () => {
  const [sports, setSports] = React.useState<SportOption[]>([]);
  const [positions, setPositions] = React.useState<Record<string, string[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SportsService.getSports();
        setSports(data.sports);
        setPositions(data.positions);
      } catch (err) {
        console.error('Erreur lors du chargement des sports:', err);
        setError('Erreur lors du chargement des sports');
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  return {
    sports,
    positions,
    loading,
    error,
    refreshSports: () => {
      SportsService.clearCache();
      return SportsService.getSports();
    }
  };
};

// Import React pour le hook
import React from 'react';
