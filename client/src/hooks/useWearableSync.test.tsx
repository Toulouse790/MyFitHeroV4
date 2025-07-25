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
      lastSync: new Date(),
      caloriesBurned: 50,
      distance: 1200,
      activeMinutes: 30,
    };

    act(() => {
      result.current.cacheData(sample);
    });

    const restored = result.current.getCachedData();
    expect(restored).not.toBeNull();
    expect(restored!.steps).toBe(1000);
    expect(restored!.heartRate.length).toBe(2);
    expect(restored!.lastSync instanceof Date).toBe(true);
    expect(restored!.sleepSessions[0].startTime instanceof Date).toBe(true);
    expect(restored!.sleepSessions[0].startTime.getTime()).toBe(sample.sleepSessions[0].startTime.getTime());
  });
});
