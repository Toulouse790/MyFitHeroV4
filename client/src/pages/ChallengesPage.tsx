import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { toast } from 'sonner';

// ---- Supabase client ----
const supabaseUrl = 'https://zfmlzxhxhaezdkzjanbc.supabase.co';
const supabaseAnonKey = 'VOTRE_ANON_KEY_PUBLIC';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- TypeScript types ----
interface Challenge {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'competition' | 'custom';
  goal_type: string;
  goal_target: number;
  is_active: boolean;
}

interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  joined_at: string;
  completed: boolean;
  completed_at?: string;
}

interface ChallengeReward {
  id: string;
  challenge_id: string;
  reward_type: 'badge' | 'points' | 'trophy' | 'discount';
  reward_value: string;
  description?: string;
}

// ---- Zustand store for user state ----
interface UserState {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const useUserStore = create<UserState>(set => ({
  userId: null,
  setUserId: id => set({ userId: id }),
}));

// ---- Fetch active challenges with pagination & filters ----
interface FetchChallengesParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  filterType?: string[];
}

async function fetchChallenges({ page, pageSize, searchTerm, filterType }: FetchChallengesParams) {
  let query = supabase
    .from<Challenge>('challenges')
    .select('*', { count: 'exact' })
    .order('start_date', { ascending: true })
    .eq('is_active', true);

  if (searchTerm?.trim()) {
    query = query.ilike('title', `%${searchTerm.trim()}%`);
  }

  if (filterType && filterType.length > 0) {
    query = query.in('challenge_type', filterType);
  }

  query = query.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { challenges: data ?? [], count };
}

function useChallenges(params: FetchChallengesParams) {
  const key = [
    'challenges',
    params.page,
    params.pageSize,
    params.searchTerm,
    params.filterType?.join(','),
  ];
  return useQuery(key, () => fetchChallenges(params), { keepPreviousData: true, staleTime: 30000 });
}

// ---- Fetch user participation for challenges ----
async function fetchUserParticipants(userId: string) {
  const { data, error } = await supabase
    .from<ChallengeParticipant>('challenge_participants')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

function useUserParticipants(userId: string | null) {
  return useQuery(
    ['user_participants', userId],
    () => {
      if (!userId) return Promise.resolve([]);
      return fetchUserParticipants(userId);
    },
    { enabled: !!userId, staleTime: 30000 }
  );
}

// ---- Mutations for join/leave challenge ----
async function joinChallenge(userId: string, challengeId: string) {
  const { error } = await supabase.from('challenge_participants').upsert(
    {
      user_id: userId,
      challenge_id: challengeId,
      progress: 0,
      completed: false,
    },
    { onConflict: ['user_id', 'challenge_id'] }
  );
  if (error) throw error;
}

async function leaveChallenge(userId: string, challengeId: string) {
  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);
  if (error) throw error;
}

// ---- Main Component ----
const PAGE_SIZE = 10;

const ChallengesPage: React.FC = () => {
  const userId = useUserStore(state => state.userId);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useChallenges({
    page,
    pageSize: PAGE_SIZE,
    searchTerm,
    filterType: challengeTypeFilter,
  });

  const challenges = data?.challenges ?? [];
  const totalCount = data?.count ?? 0;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  const { data: userParticipants } = useUserParticipants(userId);

  const joinMutation = useMutation(
    (challengeId: string) => {
      if (!userId) return Promise.reject('User not logged in');
      return joinChallenge(userId, challengeId);
    },
    {
      onSuccess: () => {
        toast.success('Inscription au défi réussie');
        queryClient.invalidateQueries(['user_participants', userId]);
      },
      onError: (e: any) => toast.error(`Erreur inscription : ${e.message || e}`),
    }
  );

  const leaveMutation = useMutation(
    (challengeId: string) => {
      if (!userId) return Promise.reject('User not logged in');
      return leaveChallenge(userId, challengeId);
    },
    {
      onSuccess: () => {
        toast.success('Désinscription du défi réussie');
        queryClient.invalidateQueries(['user_participants', userId]);
      },
      onError: (e: any) => toast.error(`Erreur désinscription : ${e.message || e}`),
    }
  );

  const isUserJoined = useCallback(
    (challengeId: string) => {
      return userParticipants?.some(p => p.challenge_id === challengeId) ?? false;
    },
    [userParticipants]
  );

  const handleJoinClick = (challengeId: string) => {
    if (isUserJoined(challengeId)) {
      leaveMutation.mutate(challengeId);
    } else {
      joinMutation.mutate(challengeId);
    }
  };

  // Filter challenge types options
  const challengeTypes = ['daily', 'weekly', 'monthly', 'competition', 'custom'];

  const toggleChallengeTypeFilter = (type: string) => {
    setChallengeTypeFilter(current =>
      current.includes(type) ? current.filter(t => t !== type) : [...current, type]
    );
    setPage(0);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Défis MyFitHero</h1>

      {/* Search bar */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          placeholder="Rechercher un défi..."
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          aria-label="Rechercher un défi"
        />
      </div>

      {/* Challenge type filter */}
      <fieldset
        className="flex flex-wrap justify-center gap-3 mb-6"
        aria-label="Filtres types de défis"
      >
        {challengeTypes.map(type => {
          const checked = challengeTypeFilter.includes(type);
          return (
            <label
              key={type}
              className={clsx(
                'cursor-pointer select-none rounded px-3 py-1 border',
                checked
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleChallengeTypeFilter(type)}
                className="sr-only"
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          );
        })}
      </fieldset>

      {/* Challenges list */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading &&
          Array.from({ length: PAGE_SIZE }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 border rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse h-48"
            />
          ))}
        {isError && (
          <div className="col-span-full text-center text-red-600">
            Erreur de chargement des défis.
          </div>
        )}
        {!isLoading && challenges.length === 0 && (
          <div className="text-center text-gray-600">Aucun défi trouvé.</div>
        )}

        {challenges.map(challenge => {
          const joined = isUserJoined(challenge.id);
          return (
            <motion.article
              key={challenge.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow flex flex-col"
              aria-live="polite"
              aria-label={`Défi ${challenge.title}`}
            >
              <h2 className="text-xl font-semibold mb-2">{challenge.title}</h2>
              <p className="flex-grow text-gray-700 dark:text-gray-300 mb-4 line-clamp-4">
                {challenge.description}
              </p>
              <div className="mb-4 text-sm">
                <span>
                  <strong>Type :</strong> {challenge.challenge_type}
                </span>
                <br />
                <span>
                  <strong>Objectif :</strong> {challenge.goal_type} - {challenge.goal_target}
                </span>
                <br />
                <span>
                  Période : {new Date(challenge.start_date).toLocaleDateString()} -{' '}
                  {new Date(challenge.end_date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => handleJoinClick(challenge.id)}
                disabled={joinMutation.isLoading || leaveMutation.isLoading}
                className={clsx(
                  'px-4 py-2 rounded-md font-semibold',
                  joined
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
                aria-pressed={joined}
                aria-label={
                  joined
                    ? `Se désinscrire du défi ${challenge.title}`
                    : `S'inscrire au défi ${challenge.title}`
                }
              >
                {joined ? 'Se désinscrire' : "S'inscrire"}
              </button>
            </motion.article>
          );
        })}
      </div>

      {/* Pagination */}
      <nav
        className="flex justify-center items-center mt-8 space-x-4"
        aria-label="Pagination des défis"
      >
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          aria-label="Page précédente"
        >
          Précédent
        </button>
        <span aria-live="polite" aria-atomic="true" className="text-lg">
          Page {page + 1} / {pageCount}
        </span>
        <button
          onClick={() => setPage(p => (p + 1 < pageCount ? p + 1 : p))}
          disabled={page + 1 >= pageCount}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          aria-label="Page suivante"
        >
          Suivant
        </button>
      </nav>
    </main>
  );
};

export default ChallengesPage;
