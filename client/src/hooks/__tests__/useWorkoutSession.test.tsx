import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useWorkoutSession } from '../useWorkoutSession';
import { useAppStore } from '@/stores/useAppStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock toast to avoid side effects
vi.mock('../use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock supabase client used inside the hook
const upsert = vi.fn().mockResolvedValue({ error: null });
const selectChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error: null })
};
vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ upsert, ...selectChain })) }
}));

describe('useWorkoutSession', () => {
  beforeEach(() => {
    localStorage.clear();
    // ensure user exists for startSession
    useAppStore.setState({ appStoreUser: { id: 'user1', weight_kg: 80 } } as any);
    vi.clearAllMocks();
  });

  it('handles start, pause and resume flow', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useWorkoutSession(), { wrapper });

    await act(async () => {
      await result.current.startSession('Test Workout');
    });

    expect(result.current.isSessionActive).toBe(true);
    expect(result.current.currentSession?.status).toBe('active');

    const stored = JSON.parse(localStorage.getItem('currentWorkoutSession')!);
    expect(stored.status).toBe('active');

    await act(async () => {
      await result.current.pauseSession();
    });

    expect(result.current.isSessionActive).toBe(false);
    expect(result.current.currentSession?.status).toBe('paused');
    expect(JSON.parse(localStorage.getItem('currentWorkoutSession')!).status).toBe('paused');

    await act(async () => {
      await result.current.resumeSession();
    });

    expect(result.current.isSessionActive).toBe(true);
    expect(result.current.currentSession?.status).toBe('active');
    expect(JSON.parse(localStorage.getItem('currentWorkoutSession')!).status).toBe('active');
  });
});
