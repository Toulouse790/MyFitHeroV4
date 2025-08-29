// src/pages/ExercisesPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AiOutlineHeart, AiFillHeart, AiOutlineSearch } from 'react-icons/ai';

// ---------------- supabase client ----------------
const supabaseUrl = 'https://zfmlzxhxhaezdkzjanbc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbWx6eGh4aGFlemRremphbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDc4MzIsImV4cCI6MjA2NjMyMzgzMn0.x6GpX8ep6YxVEZQt7pcH0SIWzxhTYcXLnaVmD5IGErw'; // à remplacer réels
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------- Typescript Types ----------------

// Exercices principaux
export interface ExerciseLibrary {
  id: string;
  name: string;
  description: string | null;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'flexibility';
  muscle_groups: string[]; // tab de muscles ciblés
  equipment: 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_band' | 'machine' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string | null;
  notes: string | null;
  image_url: string | null;
  video_url: string | null;
  movement_type: 'push' | 'pull' | 'legs' | 'core' | 'full_body';
  exercise_mechanic: 'compound' | 'isolation';
  force_type: 'push' | 'pull' | 'static';
  level_of_home_use: 'no_equipment' | 'minimal_equipment' | 'some_equipment';
  is_outdoor_friendly: boolean;
}

// Drill sportifs (sport/niveau/poste/... spécifique)
export interface SportDrill {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  position: string | null;
  season_phase: 'pre_season' | 'in_season' | 'off_season' | 'recovery' | null;
  goal: 'speed' | 'power' | 'endurance' | 'skill' | 'agility' | 'technical' | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  duration_seconds: number | null;
  equipment: string | null;
  instructions: string | null;
  video_url: string | null;
}

// Sports catalogue
export interface Sport {
  id: number;
  name: string;
  name_en: string | null;
  category: string | null;
  country_code: string | null;
  is_popular: boolean;
  positions: string[] | null;
}

// ---------------- Zustand Favorites Store ----------------

interface FavoritesState {
  favorites: Set<string>;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set(),
      addFavorite: id => set(state => ({ favorites: new Set(state.favorites).add(id) })),
      removeFavorite: id =>
        set(state => {
          const newSet = new Set(state.favorites);
          newSet.delete(id);
          return { favorites: newSet };
        }),
      toggleFavorite: id => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.has(id)) removeFavorite(id);
        else addFavorite(id);
      },
    }),
    { name: 'myfithero-exercise-favorites' }
  )
);

// ---------------- React Query Data Fetch Hook ----------------

interface FetchExercisesParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  filterCategory?: string[];
  filterDifficulty?: string[];
  filterEquipment?: string[];
  filterMovementType?: string[];
  filterMuscleGroups?: string[];
  filterSport?: string;
  filterPosition?: string;
  filterSeasonPhase?: string;
}

async function fetchExercises({
  page,
  pageSize,
  searchTerm,
  filterCategory,
  filterDifficulty,
  filterEquipment,
  filterMovementType,
  filterMuscleGroups,
  filterSport,
  filterPosition,
  filterSeasonPhase,
}: FetchExercisesParams) {
  let query = supabase
    .from<ExerciseLibrary>('exercises_library')
    .select('*', { count: 'exact' })
    .order('name');

  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim().toLowerCase();
    query = query.ilike('name', `%${term}%`);
  }

  if (filterCategory && filterCategory.length > 0) {
    query = query.in('category', filterCategory);
  }
  if (filterDifficulty && filterDifficulty.length > 0) {
    query = query.in('difficulty', filterDifficulty);
  }
  if (filterEquipment && filterEquipment.length > 0) {
    query = query.in('equipment', filterEquipment);
  }
  if (filterMovementType && filterMovementType.length > 0) {
    query = query.in('movement_type', filterMovementType);
  }
  if (filterMuscleGroups && filterMuscleGroups.length > 0) {
    filterMuscleGroups.forEach(muscle => {
      query = query.contains('muscle_groups', [muscle]);
    });
  }

  // Note: filtering on sport, position, seasonPhase (sport_drills_library) should ideally be an RPC or view join.

  query = query.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return { exercises: data ?? [], count };
}

function useExercises(params: FetchExercisesParams) {
  const key = [
    'exercises',
    params.page,
    params.pageSize,
    params.searchTerm,
    params.filterCategory?.join(','),
    params.filterDifficulty?.join(','),
    params.filterEquipment?.join(','),
    params.filterMovementType?.join(','),
    params.filterMuscleGroups?.join(','),
    params.filterSport,
    params.filterPosition,
    params.filterSeasonPhase,
  ];
  return useQuery(key, () => fetchExercises(params), {
    keepPreviousData: true,
    staleTime: 30000,
  });
}

// ---------------- Component SearchBar ----------------

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  const [value, setValue] = React.useState(searchTerm);

  const debounceChange = React.useMemo(() => debounce(onSearchChange, 400), [onSearchChange]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debounceChange(e.target.value);
  };

  React.useEffect(() => {
    setValue(searchTerm);
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Rechercher un exercice..."
        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        aria-label="Rechercher un exercice"
      />
      <AiOutlineSearch
        className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
        size={22}
      />
    </div>
  );
};

// ---------------- Component FilterPanel ----------------

interface FilterPanelProps {
  filters: {
    category: string[];
    difficulty: string[];
    equipment: string[];
    movementType: string[];
    muscleGroups: string[];
  };
  onChange: (field: keyof FilterPanelProps['filters'], values: string[]) => void;
}

const categories = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'flexibility'];
const difficulties = ['beginner', 'intermediate', 'advanced'];
const equipmentOptions = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'resistance_band',
  'machine',
  'other',
];
const movementTypes = ['push', 'pull', 'legs', 'core', 'full_body'];
const muscleGroups = [
  'pectorals',
  'triceps',
  'deltoids',
  'biceps',
  'quadriceps',
  'glutes',
  'hamstrings',
  'core',
  'calves',
  'back',
  'abdominals',
  'obliques',
  'forearms',
  'shoulders',
  'chest',
  'legs',
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange }) => {
  const renderCheckboxes = (field: keyof FilterPanelProps['filters'], values: string[]) => {
    return values.map(item => {
      const checked = filters[field].includes(item);
      return (
        <label
          key={item}
          className="inline-flex items-center space-x-2 cursor-pointer"
          aria-checked={checked}
          role="checkbox"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              toggle(item, field);
            }
          }}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={() => toggle(item, field)}
            aria-label={item}
          />
          <div
            className={clsx(
              'w-5 h-5 border rounded-md flex items-center justify-center',
              checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300',
              'dark:border-gray-600 dark:bg-gray-800'
            )}
          >
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 5.707 10.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
              </svg>
            )}
          </div>
          <span className="text-sm dark:text-gray-300">{item}</span>
        </label>
      );
    });
  };

  const toggle = useCallback(
    (item: string, field: keyof FilterPanelProps['filters']) => {
      const current = filters[field];
      if (current.includes(item)) {
        onChange(
          field,
          current.filter(v => v !== item)
        );
      } else {
        onChange(field, [...current, item]);
      }
    },
    [filters, onChange]
  );

  return (
    <section className="p-4 border rounded-md max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow mb-4">
      <h3 className="font-semibold mb-2 text-lg dark:text-gray-100">Filtres</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
        <div>
          <strong>Catégorie</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {renderCheckboxes('category', categories)}
          </div>
        </div>
        <div>
          <strong>Difficulté</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {renderCheckboxes('difficulty', difficulties)}
          </div>
        </div>
        <div>
          <strong>Equipement</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {renderCheckboxes('equipment', equipmentOptions)}
          </div>
        </div>
        <div>
          <strong>Type de mouvement</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {renderCheckboxes('movementType', movementTypes)}
          </div>
        </div>
        <div className="md:col-span-2">
          <strong>Groupes musculaires</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {renderCheckboxes('muscleGroups', muscleGroups)}
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------------- ExerciseCard ----------------

interface ExerciseCardProps {
  exercise: ExerciseLibrary;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isFavorite, onToggleFavorite }) => {
  return (
    <motion.article
      layout
      whileHover={{ scale: 1.03 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 flex flex-col"
      aria-label={`Exercice ${exercise.name}, catégorie ${exercise.category}, difficulté ${exercise.difficulty}`}
    >
      <div className="relative w-full pt-[56.25%] rounded overflow-hidden mb-2">
        {exercise.video_url ? (
          <video
            src={exercise.video_url}
            controls
            className="absolute top-0 left-0 w-full h-full object-cover rounded"
            aria-label={`${exercise.name} - vidéo démonstration`}
          />
        ) : exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={`Image exercice ${exercise.name}`}
            className="absolute top-0 left-0 w-full h-full object-cover rounded"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
            <p className="text-gray-500 dark:text-gray-300">Aucune image</p>
          </div>
        )}
      </div>
      <h4 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{exercise.name}</h4>
      <p className="flex-grow text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
        {exercise.description}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-2">
        <span>Équipement: {exercise.equipment}</span>
        <span>Difficulté: {exercise.difficulty}</span>
        <button
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={() => onToggleFavorite(exercise.id)}
          className="p-1 text-red-500 hover:text-red-600 focus:outline-none"
        >
          {isFavorite ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
        </button>
      </div>
    </motion.article>
  );
};

// ---------------- FavoritesList ----------------

const FavoritesList: React.FC<{ favoriteIds: Set<string> }> = ({ favoriteIds }) => {
  const [exercises, setExercises] = React.useState<ExerciseLibrary[]>([]);

  useEffect(() => {
    async function fetchFavorites() {
      if (favoriteIds.size === 0) {
        setExercises([]);
        return;
      }
      const idsArr = Array.from(favoriteIds);
      const { data, error } = await supabase
        .from<ExerciseLibrary>('exercises_library')
        .select('*')
        .in('id', idsArr);

      if (!error && data) setExercises(data);
    }
    fetchFavorites();
  }, [favoriteIds]);

  if (exercises.length === 0) return <p className="text-center p-4">Aucun favori ajouté.</p>;

  return (
    <section
      aria-label="Liste des exercices favoris"
      className="max-w-4xl mx-auto p-2 grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {exercises.map(ex => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          isFavorite={true}
          onToggleFavorite={() => {}} // NOP ici
        />
      ))}
    </section>
  );
};

// ---------------- Main ExercisesPage ----------------

const PAGE_SIZE = 20;

const ExercisesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: [] as string[],
    difficulty: [] as string[],
    equipment: [] as string[],
    movementType: [] as string[],
    muscleGroups: [] as string[],
  });
  const [page, setPage] = useState(0);
  const { favorites, toggleFavorite } = useFavoritesStore();

  const { data, isLoading, isError } = useExercises({
    page,
    pageSize: PAGE_SIZE,
    searchTerm,
    filterCategory: filters.category,
    filterDifficulty: filters.difficulty,
    filterEquipment: filters.equipment,
    filterMovementType: filters.movementType,
    filterMuscleGroups: filters.muscleGroups,
  });

  const exercises = data?.exercises ?? [];
  const totalCount = data?.count ?? 0;
  const pageCount = Math.ceil(totalCount / PAGE_SIZE);

  const handleFilterChange = (field: keyof typeof filters, values: string[]) => {
    setFilters(f => ({ ...f, [field]: values }));
    setPage(0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const canNextPage = page + 1 < pageCount;
  const canPrevPage = page > 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-6 px-4">
      <h1 className="text-3xl font-extrabold text-center mb-6">Exercices MyFitHero</h1>
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <FilterPanel filters={filters} onChange={handleFilterChange} />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
          ))
        ) : isError ? (
          <div className="col-span-full text-center text-red-600">Erreur chargement exercices.</div>
        ) : exercises.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
            Aucun exercice trouvé.
          </div>
        ) : (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={favorites.has(exercise.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
      <nav className="flex justify-center items-center mt-8 space-x-4">
        <button
          onClick={() => canPrevPage && setPage(p => p - 1)}
          disabled={!canPrevPage}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          aria-label="Page précédente"
        >
          Précédent
        </button>
        <span aria-live="polite" aria-atomic="true" className="text-lg">
          Page {page + 1} / {pageCount}
        </span>
        <button
          onClick={() => canNextPage && setPage(p => p + 1)}
          disabled={!canNextPage}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          aria-label="Page suivante"
        >
          Suivant
        </button>
      </nav>
      <section aria-label="Vos exercices favoris" className="mt-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Vos favoris</h2>
        <FavoritesList favoriteIds={favorites} />
      </section>
    </main>
  );
};

export default ExercisesPage;
