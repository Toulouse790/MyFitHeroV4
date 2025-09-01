// client/src/services/usePositions.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/shared/hooks/use-toast';

const CACHE_TTL = 5 * 60_000; // 5 minutes

async function getPositionsFromLibrary(sportId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('sports_library')
    .select('positions')
    .eq('id', sportId)
    .single();

  if (error || !data) {
    console.error('getPositionsFromLibrary:', error);
    return [];
  }
  return data.positions ?? [];
}

async function getPositionsFromDrills(sportName: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('sport_drills_library')
    .select('position')
    .eq('sport', sportName)
    .not('position', 'is', null);

  if (error || !data) {
    console.error('getPositionsFromDrills:', error);
    return [];
  }
  return Array.from(new Set(data.map(r => r.position).filter(Boolean)));
}

export function usePositions(sportId: number, sportName: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const libraryQuery = useQuery(
    ['positions', 'library', sportId],
    () => getPositionsFromLibrary(sportId),
    {
      staleTime: CACHE_TTL,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const drillsQuery = useQuery(
    ['positions', 'drills', sportName],
    () => getPositionsFromDrills(sportName),
    {
      enabled: libraryQuery.data?.length === 0,
      staleTime: CACHE_TTL,
      refetchOnWindowFocus: false,
    }
  );

  const positions = libraryQuery.data?.length ? libraryQuery.data : (drillsQuery.data ?? []);

  const isLoading =
    libraryQuery.isLoading || (libraryQuery.data?.length === 0 && drillsQuery.isLoading);

  return {
    positions,
    isLoading,
    error:
      libraryQuery.error || drillsQuery.error ? 'Erreur lors du chargement des positions' : null,
    refresh: () => {
      qc.invalidateQueries(['positions']);
    },
  };
}
