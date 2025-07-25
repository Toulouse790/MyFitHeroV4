import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useWearableSync } from '../useWearableSync';

// Mock toast to avoid side effects
vi.mock('../use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('useWearableSync caching', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('caches and retrieves wearable data', () => {
    const { result } = renderHook(() => useWearableSync());
    const sample = {
      steps: 1000,
      heartRate: [60, 62],
      sleepSessions: [
        { id: '1', startTime: new Date(0), endTime: new Date(60000), duration: 1, quality: 'good' as const }
      ],
      lastSync : nouvelle  date ( '2024-01-01T10:00:00.000Z' ) ,
      calories brûlées : 50 ,
      distance : 1200 ,
      Minutes actives : 30 ,
    } ;

    agir ( ( )  =>  {
      résultat . current . cacheData ( échantillon ) ;
    } ) ;

    const  restauré  =  résultat . courant . getCachedData ( ) ;
    attendre ( restauré ) . pas . toBeNull ( ) ;
    attendre ( restauré ! . étapes ) . être ( 1000 ) ;
    attendre ( restauré ! . heartRate . length ) . toBe ( 2 ) ;
    attendre ( restauré ! . lastSync . getTime ( ) ) . toBe ( échantillon . lastSync . getTime ( ) ) ;
    attendre ( restauré ! . sleepSessions [ 0 ] . startTime . getTime ( ) ) . toBe ( échantillon . sleepSessions [ 0 ] . startTime . getTime ( ) ) ;
  });
});
