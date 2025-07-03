import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Clock, 
  Flame, 
  Target,
  ChevronRight,
  Filter,
  Search,
  Timer,
  Users,
  Star
} from 'lucide-react';

// --- INTERFACES & TYPES ---

// Type pour les sports supportés
type Sport = 'basketball' | 'football' | 'american_football' | 'tennis' | 'rugby' | 'volleyball' | 'swimming';

// Interface pour l'utilisateur simulé
interface User {
  name: string;
  sport: Sport;
  sport_position: string;
}

// Interface enrichie pour les entraînements
interface WorkoutInterface {
  id: number;
  title: string;
  duration: number; // en minutes
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  calories: number;
  category: string; // ex: 'power', 'skills', 'endurance'
  rating: number;
  participants: number;
  tags: string[];
  description: string;
  exerciseList: string[]; // NOUVEAU: Liste des exercices spécifiques
}

// Interface pour les filtres de catégories
interface CategoryInterface {
  id: string;
  name: string;
  count: number;
}

// Interface pour la configuration de chaque sport
interface SportConfig {
  emoji: string;
  motivationalMessage: string;
  positions: string[];
  categories: CategoryInterface[];
  workouts: Omit<WorkoutInterface, 'id' | 'rating' | 'participants'>[];
}

// --- CONFIGURATION CENTRALISÉE DES SPORTS ---
// Base de données de tous les contenus personnalisés par sport.
const sportsData: Record<Sport, SportConfig> = {
  basketball: {
    emoji: '🏀',
    motivationalMessage: 'Dominez le terrain, un dribble à la fois.',
    positions: ['Point Guard', 'Shooting Guard', 'Center'],
    categories: [ { id: 'all', name: 'Tous', count: 3 }, { id: 'power', name: 'Puissance', count: 1 }, { id: 'skills', name: 'Dribble & Tir', count: 1 }, { id: 'agility', name: 'Agilité', count: 1 } ],
    workouts: [
      { title: 'Entraînement Jump Vertical', duration: 45, difficulty: 'Avancé', calories: 400, category: 'power', tags: ['Détente', 'Explosivité'], description: 'Augmentez votre détente pour les dunks et les contres.', exerciseList: ['Jump Squats', 'Box Jumps', 'Depth Jumps'] },
      { title: 'Maîtrise du Dribble', duration: 30, difficulty: 'Intermédiaire', calories: 250, category: 'skills', tags: ['Contrôle', 'Vitesse'], description: 'Devenez inarrêtable avec un contrôle de balle parfait.', exerciseList: ['Dribble bas', 'Crossovers', 'Spider Dribbling'] },
      { title: 'Agilité Défensive', duration: 35, difficulty: 'Intermédiaire', calories: 320, category: 'agility', tags: ['Défense', 'Rapidité'], description: 'Améliorez vos déplacements pour une défense de fer.', exerciseList: ['Defensive Slides', 'Ladder Drills', 'Reaction Sprints'] },
    ]
  },
  football: {
    emoji: '⚽',
    motivationalMessage: 'Le prochain but vous appartient.',
    positions: ['Goalkeeper', 'Midfielder', 'Striker'],
    categories: [ { id: 'all', name: 'Tous', count: 3 }, { id: 'endurance', name: 'Endurance', count: 1 }, { id: 'skills', name: 'Technique de Balle', count: 1 }, { id: 'speed', name: 'Vitesse', count: 1 } ],
    workouts: [
      { title: 'Technique de Frappe', duration: 40, difficulty: 'Intermédiaire', calories: 300, category: 'skills', tags: ['Précision', 'Puissance'], description: 'Améliorez la précision et la puissance de vos tirs.', exerciseList: ['Frappes enroulées', 'Tirs à l\'arrêt', 'Volées'] },
      { title: 'Intervalles de Sprint', duration: 25, difficulty: 'Avancé', calories: 350, category: 'speed', tags: ['Explosivité', 'VMA'], description: 'Développez une vitesse de pointe pour dépasser les défenseurs.', exerciseList: ['Sprints sur 30m', 'Hill Sprints', 'Suicide Sprints'] },
      { title: 'Endurance de Milieu de Terrain', duration: 60, difficulty: 'Intermédiaire', calories: 500, category: 'endurance', tags: ['Cardio', 'Volume'], description: 'Tenez la distance pendant 90 minutes et plus.', exerciseList: ['Course longue distance', 'Fartlek', 'Box-to-Box Drills'] },
    ]
  },
  american_football: {
    emoji: '🏈',
    motivationalMessage: 'Chaque yard se gagne. Allez chercher la victoire.',
    positions: ['Quarterback', 'Running Back', 'Wide Receiver'],
    categories: [ { id: 'all', name: 'Tous', count: 2 }, { id: 'power', name: 'Puissance', count: 1 }, { id: 'speed', name: 'Vitesse', count: 1 } ],
    workouts: [
      { title: 'Développement de la Puissance', duration: 60, difficulty: 'Avancé', calories: 450, category: 'power', tags: ['Force', 'Explosivité'], description: 'Construisez la force nécessaire pour dominer la ligne de front.', exerciseList: ['Power Cleans', 'Bench Press', 'Deadlifts'] },
      { title: 'Vitesse et Agilité (40-yard dash)', duration: 45, difficulty: 'Intermédiaire', calories: 380, category: 'speed', tags: ['Accélération', 'Combine'], description: 'Réduisez votre temps au 40-yard dash.', exerciseList: ['40-yard Dashes', 'Pro Agility (5-10-5) Drill', 'L-Drill'] },
    ]
  },
  tennis: {
    emoji: '🎾',
    motivationalMessage: 'Jeu, set et match. Visez la victoire.',
    positions: ['Baseliner', 'Serve-and-Volleyer'],
    categories: [ { id: 'all', name: 'Tous', count: 2 }, { id: 'agility', name: 'Agilité', count: 1 }, { id: 'power', name: 'Service', count: 1 } ],
    workouts: [
        { title: 'Jeu de Jambes et Agilité', duration: 40, difficulty: 'Intermédiaire', calories: 350, category: 'agility', tags: ['Déplacements', 'Endurance'], description: 'Couvrez le court plus rapidement et avec plus d\'efficacité.', exerciseList: ['Lateral Lunges', 'Spider Drills', 'Split Step Jumps'] },
        { title: 'Puissance et Précision du Service', duration: 30, difficulty: 'Avancé', calories: 280, category: 'power', tags: ['Service', 'Technique'], description: 'Développez un service qui met la pression sur vos adversaires.', exerciseList: ['Medicine Ball Throws', 'Bandes de résistance (épaule)', 'Corbeilles de service'] },
    ]
  },
  // Ajoutez ici les autres sports (rugby, volleyball, swimming) en suivant la même structure.
  rugby: { emoji: '🏉', motivationalMessage: 'Prêt pour l\'impact.', positions: ['Pilier', 'Hooker', 'Fly-half'], categories: [], workouts: [] },
  volleyball: { emoji: '🏐', motivationalMessage: 'Visez au-dessus du filet.', positions: ['Setter', 'Libero', 'Spiker'], categories: [], workouts: [] },
  swimming: { emoji: '🏊‍♂️', motivationalMessage: 'Fendez l\'eau.', positions: ['Sprinter', 'Long-distance'], categories: [], workouts: [] },
};


const Workout: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // Simulez l'utilisateur connecté ici. Changez ces valeurs pour tester !
  const currentUser: User = {
    name: 'Alex',
    sport: 'basketball',          // essayez 'football' ou 'american_football'
    sport_position: 'Point Guard' // essayez 'Striker' ou 'Quarterback'
  };

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- DATA PERSONALIZATION LOGIC ---

  // useMemo pour éviter de recalculer à chaque rendu, sauf si l'utilisateur change.
  const personalizedData = useMemo(() => {
    const config = sportsData[currentUser.sport];
    
    // Génère les workouts complets en ajoutant des données dynamiques
    const workouts: WorkoutInterface[] = config.workouts.map((workout, index) => ({
      ...workout,
      id: index + 1,
      // Ajoute la position de l'utilisateur comme tag
      tags: [...workout.tags, currentUser.sport_position],
      // Données simulées pour la démo
      rating: Math.round((4.5 + Math.random() * 0.4) * 10) / 10,
      participants: Math.floor(Math.random() * 1500) + 500,
      exerciseCount: workout.exerciseList.length
    }));
    
    return {
      ...config,
      workouts
    };
  }, [currentUser.sport, currentUser.sport_position]);


  // Logique de filtrage et de recherche
  const filteredWorkouts = useMemo(() => 
    personalizedData.workouts.filter(workout => {
      const matchesFilter = activeFilter === 'all' || workout.category === activeFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = workout.title.toLowerCase().includes(query) ||
                           workout.tags.some(tag => tag.toLowerCase().includes(query)) ||
                           workout.exerciseList.some(ex => ex.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    }), [activeFilter, searchQuery, personalizedData.workouts]);

  // --- HELPER FUNCTIONS ---

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-yellow-600 bg-yellow-100';
      case 'Avancé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const toTitleCase = (str: string) => str.replace(/\b\w/g, char => char.toUpperCase());

  // --- SUB-COMPONENTS ---

  const WorkoutCard: React.FC<{ workout: WorkoutInterface }> = ({ workout }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl">{personalizedData.emoji}</div>
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{workout.rating}</span>
            <span className="text-xs text-gray-500">({workout.participants})</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-1">{workout.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{workout.description}</p>
        
        <div className="mb-4">
            <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Exercices Clés</h4>
            <div className="flex flex-wrap gap-2">
            {workout.exerciseList.map((exercise, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                {exercise}
                </span>
            ))}
            </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {workout.tags.map((tag, index) => (
            <span key={index} className={`px-2 py-1 text-xs rounded-full ${tag === currentUser.sport_position ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50/70 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center"><Clock size={14} className="mr-1 text-gray-400" /> {workout.duration}min</span>
                <span className="flex items-center"><Flame size={14} className="mr-1 text-orange-400" /> {workout.calories} kcal</span>
                <span className="flex items-center"><Target size={14} className="mr-1 text-blue-400" /> {workout.exerciseList.length} exos</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                {workout.difficulty}
            </span>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-4xl">{personalizedData.emoji}</span> 
                {toTitleCase(currentUser.sport.replace('_', ' '))}
              </h1>
              <p className="text-gray-600 mt-1">{personalizedData.motivationalMessage}</p>
            </div>
            <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        <div className="bg-red-600 p-4 rounded-xl text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Statistiques de la semaine</h3>
            <Timer size={20} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-white/80 text-sm">Séances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2h15</div>
              <div className="text-white/80 text-sm">Temps total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">890</div>
              <div className="text-white/80 text-sm">Calories</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un exercice, un tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {personalizedData.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === category.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        <main className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredWorkouts.length} entraînement{filteredWorkouts.length > 1 ? 's' : ''}
            </h2>
            <button className="text-red-600 text-sm font-medium flex items-center">
              Trier <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          {filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
             <div className="text-center py-10 px-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700">Aucun résultat</h3>
                <p className="text-sm text-gray-500 mt-1">Essayez de modifier votre recherche ou vos filtres.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Workout;
