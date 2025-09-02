// client/src/services/sportsService.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SportOption } from '@/shared/types/onboarding';
import { useToast } from '@/shared/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // facultatif
import React from 'react';

/* ------------------------------------------------------------------ */
/*                          CONFIG SUPABASE                           */
/* ------------------------------------------------------------------ */

const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

/* ------------------------------------------------------------------ */
/*                            TYPES                                   */
/* ------------------------------------------------------------------ */

export interface SportRow {
  id: string;
  name: string;
  emoji: string | null;
  icon: string | null;
  category: string | null;
  positions: string[] | null;
  is_popular: boolean | null;
  user_count: number | null;
  updated_at: string;
}

export interface SportSuggestionPayload {
  sport_name: string;
  suggested_position?: string;
  locale?: string;
  user_id?: string;
}

/* ------------------------------------------------------------------ */
/*                       CONSTANTES / CACHE                           */
/* ------------------------------------------------------------------ */

const CACHE_TTL = 5 * 60_000; // 5 min
const MEMO_KEY = 'sports-cache-v1';

/* mémoire : { data, expiry } */
let memoryCache: { data: SportRow[]; expiry: number } | null = null;

/* ------------------------------------------------------------------ */
/*                       FONCTIONS BAS NIVEAU                         */
/* ------------------------------------------------------------------ */

/** Lecture (et mise en cache) de la table `sports_library` */
async function fetchAllSports(): Promise<SportRow[]> {
  // 1. Cache mémoire
  if (memoryCache && memoryCache.expiry > Date.now()) {
    return memoryCache.data;
  }

  // 2. Cache sessionStorage (pour F5)
  const cached = sessionStorage.getItem(MEMO_KEY);
  if (cached) {
    const { data, expiry } = JSON.parse(cached) as typeof memoryCache;
    if (expiry > Date.now()) {
      memoryCache = { data, expiry };
      return data;
    }
  }

  // 3. Requête Supabase
  const { data: _data, error: _error } = await supabase
    .from('sports_library')
    .select('id, name, emoji, icon, category, positions, is_popular, user_count, updated_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('[sportService] fetchAllSports:', error);
    throw error;
  }

  // 4. Cache
  const payload = { data, expiry: Date.now() + CACHE_TTL };
  memoryCache = payload;
  sessionStorage.setItem(MEMO_KEY, JSON.stringify(payload));

  return data as SportRow[];
}

/** Conversion SQL → SportOption (côté UI) */
function mapRow(row: SportRow): SportOption {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? '🏃‍♂️',
    positions: row.positions ?? [],
  };
}

/* ------------------------------------------------------------------ */
/*                MÉTHODES PUBLIQUES – ACCÈS/SEARCH                    */
/* ------------------------------------------------------------------ */

export const SportsService = {
  /** Tous les sports (avec cache)  */
  async getSports(): Promise<SportOption[]> {
    const rows = await fetchAllSports();
    return rows.map(mapRow);
  },

  /** Sports populaires */
  async getPopularSports(limit = 12): Promise<SportOption[]> {
    const rows = await fetchAllSports();
    return rows
      .filter(r => r.is_popular)
      .slice(0, limit)
      .map(mapRow);
  },

  /** Recherche full-text ; retourne max 15 résultats */
  async searchSports(query: string): Promise<SportOption[]> {
    if (!query || query.length < 2) return [];

    // Recherche locale d’abord (perfs)
    const localRows = (await fetchAllSports()).filter(r =>
      r.name.toLowerCase().includes(query.toLowerCase())
    );

    if (localRows.length > 0) return localRows.map(mapRow);

    // Recherche SQL ILIKE
    const { data: _data, error: _error } = await supabase
      .from('sports_library')
      .select('id, name, emoji, icon, category, positions')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(15);

    if (error) {
      console.error('[sportService] searchSports:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  /** Détails d’un sport */
  async getSportById(id: string): Promise<SportOption | null> {
    const { data: _data, error: _error } = await supabase
      .from('sports_library')
      .select('id, name, emoji, icon, category, positions')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[sportService] getSportById:', error);
      return null;
    }
    return mapRow(data as SportRow);
  },

  /** Suggestion utilisateur → table `sport_suggestions` */
  async suggestSport(
    sportName: string,
    opts: { suggested_position?: string; locale?: string } = {}
  ): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const payload: SportSuggestionPayload = {
      sport_name: sportName,
      suggested_position: opts.suggested_position,
      locale: opts.locale ?? 'fr',
      user_id: userData?.user?.id ?? undefined,
    };

    const { error } = await supabase.from('sport_suggestions').insert(payload);

    if (error) {
      console.error('[sportService] suggestSport:', error);
      return false;
    }
    return true;
  },

  /** Invalidation totale du cache */
  clearCache() {
    memoryCache = null;
    sessionStorage.removeItem(MEMO_KEY);
  },
};

/* ------------------------------------------------------------------ */
/*                       HOOKS REACT (React Query)                     */
/* ------------------------------------------------------------------ */

export function useSports(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery(['sports', 'all'], () => SportsService.getSports(), {
    staleTime: CACHE_TTL,
    cacheTime: CACHE_TTL * 2,
    enabled: options?.enabled ?? true,
    onError: err => {
      console.error(err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des sports',
        variant: 'destructive',
      });
    },
  });

  return {
    sports: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? 'Erreur de chargement' : null,
    refreshSports: () => {
      SportsService.clearCache();
      queryClient.invalidateQueries(['sports', 'all']);
    },
  };
}

/* ------------------------------------------------------------------ */
/*          HOOK LÉGER Fallback (si React Query n’est pas utilisé)     */
/* ------------------------------------------------------------------ */

export function useSportsFallback() {
  const { toast } = useToast();
  const [state, setState] = React.useState<{
    sports: SportOption[];
    loading: boolean;
    error: string | null;
  }>({
    sports: [],
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    SportsService.getSports()
      .then(s => setState({ sports: s, loading: false, error: null }))
      .catch(e => {
        console.error(e);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les sports',
          variant: 'destructive',
        });
        setState({
          sports: [],
          loading: false,
          error: 'Erreur de chargement',
        });
      });
  }, [toast]);

  return { ...state, refreshSports: SportsService.clearCache };
}
