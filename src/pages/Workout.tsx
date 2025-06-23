import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  Flame, 
  Target,
  ChevronRight,
  Filter,
  Search,
  Dumbbell,
  Heart,
  Zap,
  Star,
  Timer,
  Users
} from 'lucide-react';

const Workout = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Données mockées des workouts
  const workoutCategories = [
    { id: 'all', name: 'Tous', count: 24 },
    { id: 'strength', name: 'Musculation', count: 12 },
    { id: 'cardio', name: 'Cardio', count: 8 },
    { id: 'hiit', name: 'HIIT', count: 4 }
  ];

  const workouts = [
    {
      id: 1,
      title: 'Push Day - Pectoraux & Triceps',
      duration: 45,
      difficulty: 'Intermédiaire',
      calories: 320,
      exercises: 8,
      category: 'strength',
      rating: 4.8,
      participants: 1234,
      image: '💪',
      tags: ['Pectoraux', 'Triceps', 'Épaules'],
      description: 'Séance complète pour développer le haut du corps'
    },
    {
      id: 2,
      title: 'HIIT Cardio Intense',
      duration: 25,
      difficulty: 'Avancé',
      calories: 380,
      exercises: 6,
      category: 'hiit',
      rating: 4.9,
      participants: 892,
      image: '🔥',
      tags: ['Cardio', 'Brûle-graisse', 'Intense'],
      description: 'Session explosive pour brûler un maximum de calories'
    },
    {
      id: 3,
      title: 'Pull Day - Dos & Biceps',
      duration: 50,
      difficulty: 'Intermédiaire',
      calories: 340,
      exercises: 9,
      category: 'strength',
      rating: 4.7,
      participants: 1089,
      image: '🎯',
      tags: ['Dos', 'Biceps', 'Tractions'],
      description: 'Développer la largeur et l\'épaisseur du dos'
    },
    {
      id: 4,
      title: 'Cardio Running',
      duration: 30,
      difficulty: 'Débutant',
      calories: 250,
      exercises: 1,
      category: 'cardio',
      rating: 4.5,
      participants: 2156,
      image: '🏃‍♂️',
      tags: ['Endurance', 'Course', 'Facile'],
      description: 'Course légère pour améliorer l\'endurance'
    },
    {
      id: 5,
      title: 'Leg Day - Jambes',
      duration: 60,
      difficulty: 'Avancé',
      calories: 420,
      exercises: 10,
      category: 'strength',
      rating: 4.6,
      participants: 743,
      image: '🦵',
      tags: ['Quadriceps', 'Fessiers', 'Mollets'],
      description: 'Séance intense pour des jambes puissantes'
    },
    {
      id: 6,
      title: 'HIIT Débutant',
      duration: 15,
      difficulty: 'Débutant',
      calories: 180,
      exercises: 4,
      category: 'hiit',
      rating: 4.4,
      participants: 1567,
      image: '⚡',
      tags: ['Débutant', 'Court', 'Efficace'],
      description: 'Introduction parfaite au HIIT'
    }
  ];

  const filteredWorkouts = workouts.filter(workout => {
    const matchesFilter = activeFilter === 'all' || workout.category === activeFilter;
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-yellow-600 bg-yellow-100';
      case 'Avancé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const WorkoutCard = ({ workout }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      {/* Header avec image et rating */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl">{workout.image}</div>
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{workout.rating}</span>
            <span className="text-xs text-gray-500">({workout.participants})</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-1">{workout.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{workout.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {workout.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {workout.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{workout.tags.length - 2}
            </span>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <Clock size={16} className="text-gray-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.duration}min</span>
          </div>
          <div className="text-center">
            <Flame size={16} className="text-orange-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.calories}</span>
          </div>
          <div className="text-center">
            <Target size={16} className="text-blue-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.exercises} ex</span>
          </div>
          <div className="text-center">
            <Users size={16} className="text-green-500 mx-auto mb-1" />
            <span className="text-xs text-gray-600">{workout.participants}</span>
          </div>
        </div>
        
        {/* Difficulté et bouton */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
            {workout.difficulty}
          </span>
          <button className="bg-fitness-energy text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center hover:bg-fitness-energy/90 transition-colors">
            <Play size={14} className="mr-1" />
            Commencer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workouts</h1>
            <p className="text-gray-600">Choisissez votre entraînement du jour</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-energy p-4 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Cette semaine</h3>
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

        {/* Barre de recherche */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un workout..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fitness-energy/20 focus:border-fitness-energy"
          />
        </div>

        {/* Filtres par catégorie */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {workoutCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === category.id
                  ? 'bg-fitness-energy text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Liste des workouts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredWorkouts.length} workout{filteredWorkouts.length > 1 ? 's' : ''} disponible{filteredWorkouts.length > 1 ? 's' : ''}
            </h2>
            <button className="text-fitness-energy text-sm font-medium flex items-center">
              Trier <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Workout;
