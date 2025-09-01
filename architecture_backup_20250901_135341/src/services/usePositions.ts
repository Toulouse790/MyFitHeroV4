// client/src/services/usePositions.ts

import { useMemo } from 'react';

type Sport = 'football' | 'basketball' | 'volleyball' | 'rugby' | 'tennis' | 'autre';

type Position = {
  value: string;
  label: string;
};

const POSITIONS: Record<Sport, Position[]> = {
  football: [
    { value: 'gardien', label: 'Gardien de but' },
    { value: 'defenseur', label: 'Défenseur' },
    { value: 'milieu', label: 'Milieu' },
    { value: 'attaquant', label: 'Attaquant' },
  ],
  basketball: [
    { value: 'meneur', label: 'Meneur' },
    { value: 'arriere', label: 'Arrière' },
    { value: 'ailier', label: 'Ailier' },
    { value: 'ailier_fort', label: 'Ailier fort' },
    { value: 'pivot', label: 'Pivot' },
  ],
  volleyball: [
    { value: 'passeur', label: 'Passeur' },
    { value: 'central', label: 'Central' },
    { value: 'pointu', label: 'Pointu' },
    { value: 'receptionneur', label: 'Réceptionneur-attaquant' },
    { value: 'libero', label: 'Libéro' },
  ],
  rugby: [
    { value: 'pilier', label: 'Pilier' },
    { value: 'talonneur', label: 'Talonneur' },
    { value: 'deuxieme_ligne', label: 'Deuxième ligne' },
    { value: 'troisieme_ligne', label: 'Troisième ligne' },
    { value: 'demi_melée', label: 'Demi de mêlée' },
    { value: 'ouvreur', label: 'Ouvreur' },
    { value: 'centre', label: 'Centre' },
    { value: 'ailier', label: 'Ailier' },
    { value: 'arriere', label: 'Arrière' },
  ],
  tennis: [
    { value: 'simple', label: 'Simple' },
    { value: 'double', label: 'Double' },
  ],
  autre: [{ value: 'autre', label: 'Autre' }],
};

export function usePositions(sport: Sport = 'football') {
  return useMemo(() => {
    return POSITIONS[sport] || POSITIONS['autre'];
  }, [sport]);
}
