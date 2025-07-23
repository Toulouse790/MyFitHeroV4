// client/src/services/usePositions.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PositionService } from './positionService';
import { useToast } from '@/hooks/use-toast';

export function usePositions(sportId: number, sportName: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  // 1. Essayer d’abord la table library
  const libraryQuery = useQuery(
    ['positions', 'library', sportId],
    () => PositionService.getPositionsFromLibrary(sportId),
    {
      staleTime: CACHE_TTL,
      refetchOnWindowFocus: false,
      onError: (err) => {
        console.error(err);
        toast({ title: 'Erreur', description: 'Impossible de charger les positions', variant: 'destructive' });
      },
      retry: 1,
    }
  );

  // 2. Si aucun résultat, fallback sur drills
  const drillsQuery = useQuery(
    ['positions', 'drills', sportName],
    () => PositionService.getPositionsFromDrills(sportName),
    {
      enabled: libraryQuery.data?.length === 0,
      staleTime: CACHE_TTL,
      refetchOnWindowFocus: false,
      onError: (err) => console.error(err),
    }
  );

  const positions = libraryQuery.data?.length
    ? libraryQuery.data
    : drillsQuery.data ?? [];

  const isLoading = libraryQuery.isLoading || (libraryQuery.data?.length === 0 && drillsQuery.isLoading);
  const error = libraryQuery.error || drillsQuery.error;

  return {
    positions,
    isLoading,
    error: error ? 'Erreur lors du chargement des positions' : null,
    refresh: () => {
      PositionService.clearCache();
      qc.invalidateQueries(['positions']);
    }
  };
}
