// client/src/services/positionService.ts
import { supabase } from '@/lib/supabase';

const CACHE_TTL = 5 * 60_000;
const __MEMO_KEY = 'positions-cache-v1';
let memoryCache: { [sportId: string]: { data: string[]; expiry: number } } = {};

export class PositionService {
  // Récupère les positions depuis le champ ARRAY de sports_library
  static async getPositionsFromLibrary(sportId: number): Promise<string[]> {
    const cache = memoryCache[sportId];
    if (cache && cache.expiry > Date.now()) return cache.data;

    const { data: _data, error: _error } = await supabase
      .from('sports_library')
      .select('positions')
      .eq('id', sportId)
      .single();

    if (error || !data) {
      console.error('getPositionsFromLibrary:', error);
      return [];
    }
    const positions = data.positions ?? [];
    memoryCache[sportId] = { data: positions, expiry: Date.now() + CACHE_TTL };
    return positions;
  }

  // Bonus : extraire les positions uniques depuis sport_drills_library
  static async getPositionsFromDrills(sportName: string): Promise<string[]> {
    const cache = memoryCache[`drills_${sportName}`];
    if (cache && cache.expiry > Date.now()) return cache.data;

    const { data: _data, error: _error } = await supabase
      .from('sport_drills_library')
      .select('position')
      .eq('sport', sportName)
      .neq('position', null);

    if (error || !data) {
      console.error('getPositionsFromDrills:', error);
      return [];
    }
    const positions = Array.from(new Set(data.map(r => r.position!).filter(Boolean)));
    memoryCache[`drills_${sportName}`] = { data: positions, expiry: Date.now() + CACHE_TTL };
    return positions;
  }

  static clearCache() {
    memoryCache = {};
  }
}
