import React, { useState, useMemo } from 'react';
import { 
  ChevronRight,
  Search,
  Timer,
  Trophy,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import AIIntelligence from '@/components/AIIntelligence';
import { UniformHeader } from '@/components/UniformHeader';
import { WorkoutCard, WorkoutInterface } from '@/components/WorkoutCard';

// --- TYPES ---
type Sport = 'basketball' | 'football' | 'american_football' | 'tennis' | 'rugby' | 'volleyball' | 'swimming' | 'running' | 'cycling' | 'musculation';

interface CategoryInterface {
  id: string;
  name: string;
  count: number;
}

interface SportConfig {
  emoji: string;
  motivationalMessage: string;
  categories: CategoryInterface[];
  workouts: Omit<WorkoutInterface, 'id' | 'rating' | 'participants' | 'emoji'>[];
}

// --- CONFIGURATION PERSONNALISÉE PAR SPORT ---
const sportsData: Record<Sport, SportConfig> = {
  basketball: {
    emoji: '🏀',
    motivationalMessage: 'Dominez le terrain, un dribble à la fois.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'power', name: 'Puissance', count: 1 },
      { id: 'skills', name: 'Dribble & Tir', count: 1 },
      { id: 'agility', name: 'Agilité', count: 1 },
      { id: 'conditioning', name: 'Condition', count: 1 }
    ],
    workouts: [
      { title: 'Entraînement Jump Vertical', duration: 45, difficulty: 'Avancé', calories: 400, category: 'power', tags: ['Détente', 'Explosivité'], description: 'Augmentez votre détente pour les dunks et les contres.', exerciseList: ['Jump Squats', 'Box Jumps', 'Depth Jumps', 'Plyometric Push-ups'] },
      { title: 'Maîtrise du Dribble', duration: 30, difficulty: 'Intermédiaire', calories: 250, category: 'skills', tags: ['Contrôle', 'Vitesse'], description: 'Devenez inarrêtable avec un contrôle de balle parfait.', exerciseList: ['Dribble bas', 'Crossovers', 'Spider Dribbling', 'Entre les jambes'] },
      { title: 'Agilité Défensive', duration: 35, difficulty: 'Intermédiaire', calories: 320, category: 'agility', tags: ['Défense', 'Rapidité'], description: 'Améliorez vos déplacements pour une défense de fer.', exerciseList: ['Defensive Slides', 'Ladder Drills', 'Reaction Sprints', 'Cone Weaving'] },
      { title: 'Condition Basketball', duration: 40, difficulty: 'Avancé', calories: 380, category: 'conditioning', tags: ['Endurance', 'Match'], description: 'Tenez la distance pendant 4 quart-temps.', exerciseList: ['Suicides', 'Full Court Sprints', 'Burpees', 'Mountain Climbers'] }
    ]
  },
  football: {
    emoji: '⚽',
    motivationalMessage: 'Le prochain but vous appartient.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'endurance', name: 'Endurance', count: 1 },
      { id: 'skills', name: 'Technique', count: 1 },
      { id: 'speed', name: 'Vitesse', count: 1 },
      { id: 'strength', name: 'Force', count: 1 }
    ],
    workouts: [
      { title: 'Technique de Frappe', duration: 40, difficulty: 'Intermédiaire', calories: 300, category: 'skills', tags: ['Précision', 'Puissance'], description: 'Améliorez la précision et la puissance de vos tirs.', exerciseList: ['Frappes enroulées', 'Tirs à l\'arrêt', 'Volées', 'Penalties'] },
      { title: 'Intervalles de Sprint', duration: 25, difficulty: 'Avancé', calories: 350, category: 'speed', tags: ['Explosivité', 'VMA'], description: 'Développez une vitesse de pointe pour dépasser les défenseurs.', exerciseList: ['Sprints 30m', 'Hill Sprints', 'Accélérations', 'Changements direction'] },
      { title: 'Endurance de Milieu', duration: 60, difficulty: 'Intermédiaire', calories: 500, category: 'endurance', tags: ['Cardio', 'Volume'], description: 'Tenez la distance pendant 90 minutes.', exerciseList: ['Course longue', 'Fartlek', 'Box-to-Box', 'Récupération active'] },
      { title: 'Force Fonctionnelle', duration: 50, difficulty: 'Avancé', calories: 420, category: 'strength', tags: ['Puissance', 'Contact'], description: 'Renforcez votre corps pour les duels.', exerciseList: ['Squats', 'Deadlifts', 'Bulgarian Split', 'Core Training'] }
    ]
  },
  musculation: {
    emoji: '💪',
    motivationalMessage: 'Chaque rep vous rapproche de votre objectif.',
    categories: [
      { id: 'all', name: 'Tous', count: 5 },
      { id: 'push', name: 'Poussée', count: 1 },
      { id: 'pull', name: 'Tirage', count: 1 },
      { id: 'legs', name: 'Jambes', count: 1 },
      { id: 'full_body', name: 'Full Body', count: 1 },
      { id: 'core', name: 'Core', count: 1 }
    ],
    workouts: [
      { title: 'Push Day Intensif', duration: 60, difficulty: 'Avancé', calories: 450, category: 'push', tags: ['Pectoraux', 'Épaules', 'Triceps'], description: 'Développez votre haut du corps avec ce push intensif.', exerciseList: ['Bench Press', 'Military Press', 'Dips', 'Lateral Raises'] },
      { title: 'Pull Day Complet', duration: 55, difficulty: 'Avancé', calories: 420, category: 'pull', tags: ['Dos', 'Biceps'], description: 'Sculptez un dos puissant et des biceps définis.', exerciseList: ['Pull-ups', 'Rows', 'Deadlifts', 'Bicep Curls'] },
      { title: 'Leg Day Massacre', duration: 65, difficulty: 'Avancé', calories: 500, category: 'legs', tags: ['Quadriceps', 'Ischio', 'Fessiers'], description: 'Le leg day qui forge des jambes d\'acier.', exerciseList: ['Squats', 'Romanian DL', 'Leg Press', 'Calf Raises'] },
      { title: 'Full Body Power', duration: 45, difficulty: 'Intermédiaire', calories: 380, category: 'full_body', tags: ['Fonctionnel', 'Explosivité'], description: 'Un entraînement complet pour tout le corps.', exerciseList: ['Thrusters', 'Pull-ups', 'Push-ups', 'Burpees'] },
      { title: 'Core Destroyer', duration: 30, difficulty: 'Intermédiaire', calories: 280, category: 'core', tags: ['Abdos', 'Stabilité'], description: 'Forgez un core d\'acier en 30 minutes.', exerciseList: ['Planks', 'Russian Twists', 'Dead Bugs', 'Hanging Knee Raises'] }
    ]
  },
  running: {
    emoji: '🏃‍♂️',
    motivationalMessage: 'Chaque kilomètre vous rend plus fort.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'speed', name: 'Vitesse', count: 1 },
      { id: 'endurance', name: 'Endurance', count: 1 },
      { id: 'intervals', name: 'Fractionné', count: 1 },
      { id: 'recovery', name: 'Récupération', count: 1 }
    ],
    workouts: [
      { title: 'Fractionnés Vitesse', duration: 35, difficulty: 'Avancé', calories: 400, category: 'speed', tags: ['VMA', 'Explosivité'], description: 'Améliorez votre vitesse maximale.', exerciseList: ['400m rapides', 'Récup 200m', '8 répétitions', 'Cool down'] },
      { title: 'Run Longue Distance', duration: 90, difficulty: 'Intermédiaire', calories: 800, category: 'endurance', tags: ['Base', 'Résistance'], description: 'Développez votre endurance fondamentale.', exerciseList: ['Échauffement 10min', 'Allure modérée 70min', 'Cool down 10min'] },
      { title: 'Intervalles Pyramide', duration: 45, difficulty: 'Avancé', calories: 450, category: 'intervals', tags: ['VO2max', 'Lactique'], description: 'Repoussez vos limites avec cette pyramide.', exerciseList: ['1min-2min-3min-2min-1min', 'Récup égale effort', 'Intensité 90%'] },
      { title: 'Footing Récupération', duration: 30, difficulty: 'Débutant', calories: 250, category: 'recovery', tags: ['Récup', 'Easy'], description: 'Course de récupération en douceur.', exerciseList: ['Allure très facile', 'Conversation possible', 'Détente musculaire'] }
    ]
  },
  tennis: {
    emoji: '🎾',
    motivationalMessage: 'Jeu, set et match. Visez la victoire.',
    categories: [
      { id: 'all', name: 'Tous', count: 3 },
      { id: 'agility', name: 'Agilité', count: 1 },
      { id: 'power', name: 'Puissance', count: 1 },
      { id: 'endurance', name: 'Endurance', count: 1 }
    ],
    workouts: [
      { title: 'Jeu de Jambes Tennis', duration: 40, difficulty: 'Intermédiaire', calories: 350, category: 'agility', tags: ['Déplacements', 'Réactivité'], description: 'Couvrez le court plus rapidement.', exerciseList: ['Lateral Lunges', 'Spider Drills', 'Split Steps', 'Cone Drills'] },
      { title: 'Puissance Service', duration: 30, difficulty: 'Avancé', calories: 280, category: 'power', tags: ['Service', 'Rotation'], description: 'Un service qui fait la différence.', exerciseList: ['Medicine Ball', 'Résistance épaules', 'Rotation trunk', 'Services répétés'] },
      { title: 'Endurance Match', duration: 50, difficulty: 'Avancé', calories: 420, category: 'endurance', tags: ['Match', '3 sets'], description: 'Tenez 3 sets sans faiblir.', exerciseList: ['Cardio tennis', 'Recovery drills', 'Match simulation', 'Mental training'] }
    ]
  },
  // Ajoutez les autres sports avec la même structure
  american_football: { emoji: '🏈', motivationalMessage: 'Chaque yard se gagne.', categories: [], workouts: [] },
  rugby: { emoji: '🏉', motivationalMessage: 'Prêt pour l\'impact.', categories: [], workouts: [] },
  volleyball: { emoji: '🏐', motivationalMessage: 'Visez au-dessus du filet.', categories: [], workouts: [] },
  swimming: { emoji: '🏊‍♂️', motivationalMessage: 'Fendez l\'eau.', categories: [], workouts: [] },
  cycling: { emoji: '🚴‍♂️', motivationalMessage: 'Pédalez vers la victoire.', categories: [], workouts: [] }
};

const Workout: React.FC = () => {
  // --- DONNÉES RÉELLES DU STORE ---
  const { appStoreUser } = useAppStore();

  // --- MAPPING SPORT UTILISATEUR ---
  const getSportKey = (sport: string): Sport => {
    const mappings: Record<string, Sport> = {
      'basketball': 'basketball',
      'football': 'football',
      'american_football': 'american_football', 
      'tennis': 'tennis',
      'rugby': 'rugby',
      'volleyball': 'volleyball',
      'swimming': 'swimming',
      'running': 'running',
      'course à pied': 'running',
      'cycling': 'cycling',
      'musculation': 'musculation',
      'powerlifting': 'musculation',
      'crossfit': 'musculation',
      'weightlifting': 'musculation'
    };
    return mappings[sport?.toLowerCase()] || 'musculation';
  };

  const userSport = getSportKey(appStoreUser.sport || 'none');
  const personalizedData = useMemo(() => {
    const config = sportsData[userSport];
    
    // Adaptation selon le niveau d'expérience
    const workouts: WorkoutInterface[] = config.workouts.map((workout, index) => {
      let adjustedDifficulty = workout.difficulty;
      let adjustedDuration = workout.duration;
      let adjustedCalories = workout.calories;
      
      // Ajustements selon l'expérience fitness
      if (appStoreUser.fitness_experience === 'beginner') {
        adjustedDuration = Math.round(workout.duration * 0.8);
        adjustedCalories = Math.round(workout.calories * 0.8);
        if (workout.difficulty === 'Avancé') adjustedDifficulty = 'Intermédiaire';
        if (workout.difficulty === 'Intermédiaire') adjustedDifficulty = 'Débutant';
      } else if (appStoreUser.fitness_experience === 'expert') {
        adjustedDuration = Math.round(workout.duration * 1.2);
        adjustedCalories = Math.round(workout.calories * 1.2);
      }
      
      // Ajustements selon l'âge
      if (appStoreUser.age && appStoreUser.age > 45) {
        adjustedDuration = Math.round(adjustedDuration * 0.9);
        adjustedCalories = Math.round(adjustedCalories * 0.9);
      }
      
      // Ajout de tags personnalisés
      const personalizedTags = [...workout.tags];
      if (appStoreUser.sport_position) {
        personalizedTags.push(appStoreUser.sport_position);
      }
      if (appStoreUser.primary_goals?.includes('weight_loss')) {
        personalizedTags.push('Perte poids');
      }
      if (appStoreUser.primary_goals?.includes('muscle_gain')) {
        personalizedTags.push('Masse musculaire');
      }
      
      return {
        ...workout,
        id: index + 1,
        duration: adjustedDuration,
        calories: adjustedCalories,
        difficulty: adjustedDifficulty,
        tags: personalizedTags,
        rating: Math.round((4.2 + Math.random() * 0.6) * 10) / 10,
        participants: Math.floor(Math.random() * 1200) + 300,
        emoji: config.emoji,
      };
    });
    
    return { ...config, workouts };
  }, [userSport, appStoreUser]);

  // --- STATES ---
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- FILTRAGE ---
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
  const toTitleCase = (str: string) => str.replace(/\b\w/g, char => char.toUpperCase());

  // --- MESSAGES PERSONNALISÉS ---
  const getMotivationalMessage = () => {
    const goals = appStoreUser.primary_goals || [];
    if (goals.includes('performance')) {
      return `🏆 ${personalizedData.motivationalMessage} Performance en vue !`;
    } else if (goals.includes('weight_loss')) {
      return `🔥 ${personalizedData.motivationalMessage} Chaque calorie compte !`;
    } else if (goals.includes('muscle_gain')) {
      return `💪 ${personalizedData.motivationalMessage} Construisez du muscle !`;
    }
    return personalizedData.motivationalMessage;
  };

  // --- STATS SIMULÉES PERSONNALISÉES ---
  const getPersonalizedStats = () => {
    const baseWeeklyWorkouts = 3;
    const experienceMultiplier = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.3,
      'expert': 1.5
    }[appStoreUser.fitness_experience || 'intermediate'] || 1.0;
    
    return {
      workouts: Math.round(baseWeeklyWorkouts * experienceMultiplier),
      time: Math.round(135 * experienceMultiplier),
      calories: Math.round(890 * experienceMultiplier)
    };
  };

  const stats = getPersonalizedStats();

  // Gestionnaire pour démarrer un entraînement
  const handleStartWorkout = (workout: WorkoutInterface) => {
    console.log('Starting workout:', workout.title);
    // Ici on pourrait rediriger vers une page d'entraînement détaillée
    // ou ouvrir un modal avec les exercices
  };

  // --- COMPOSANTS ---

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Header Uniforme */}
        <UniformHeader
          title={toTitleCase(appStoreUser.sport?.replace('_', ' ') || 'Fitness')}
          subtitle={`${personalizedData.emoji} ${getMotivationalMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Stats Personnalisées */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Vos Stats de la Semaine</h3>
            <Timer size={20} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.workouts}</div>
              <div className="text-white/80 text-sm">Séances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(stats.time / 60)}h{stats.time % 60}</div>
              <div className="text-white/80 text-sm">Temps total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.calories}</div>
              <div className="text-white/80 text-sm">Calories</div>
            </div>
          </div>
        </div>

        {/* Insights Personnalisés */}
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-start space-x-3">
            <Award size={20} className="text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">Programmes Adaptés</h3>
              <p className="text-purple-700 text-sm">
                Niveau {appStoreUser.fitness_experience || 'intermédiaire'} • 
                {appStoreUser.age || '?'} ans • 
                Objectifs: {appStoreUser.primary_goals?.join(', ') || 'performance'}
              </p>
              <div className="mt-2 text-xs text-purple-600">
                ✨ Durées et intensités ajustées à votre profil
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
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

        {/* Filtres de Catégories */}
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

        {/* Liste des Entraînements */}
        <main className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredWorkouts.length} entraînement{filteredWorkouts.length > 1 ? 's' : ''} pour vous
            </h2>
            <button className="text-red-600 text-sm font-medium flex items-center">
              Trier <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          {filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  onStartWorkout={handleStartWorkout}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700">Aucun résultat</h3>
              <p className="text-sm text-gray-500 mt-1">
                Essayez de modifier votre recherche ou vos filtres.
              </p>
            </div>
          )}
        </main>

        {/* Intelligence AI - Analyse Workout */}
        <AIIntelligence
          pillar="workout"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />

        {/* Recommandation Personnalisée */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-start space-x-3">
            <Trophy size={20} className="text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 mb-1">Recommandation du Coach</h3>
              <p className="text-green-700 text-sm">
                En tant que {appStoreUser.fitness_experience || 'pratiquant'} de {appStoreUser.sport}, 
                commencez par 2-3 séances par semaine. Votre progression sera optimale !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workout;
