// client/src/data/sportsWorkoutConfig.ts
export type Sport =
  | 'basketball'
  | 'football'
  | 'american_football'
  | 'tennis'
  | 'rugby'
  | 'volleyball'
  | 'swimming'
  | 'running'
  | 'cycling'
  | 'musculation';

export interface CategoryInterface {
  id: string;
  name: string;
  count: number;
}

export interface BaseWorkout {
  title: string;
  duration: number;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  calories: number;
  category: string;
  tags: string[];
  description: string;
  exerciseList: string[];
}

export interface SportConfig {
  emoji: string;
  motivationalMessage: string;
  categories: CategoryInterface[];
  workouts: BaseWorkout[];
}

export const sportsWorkoutConfig: Record<Sport, SportConfig> = {
  basketball: {
    emoji: '🏀',
    motivationalMessage: 'Dominez le terrain, un dribble à la fois.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'power', name: 'Puissance', count: 1 },
      { id: 'skills', name: 'Dribble & Tir', count: 1 },
      { id: 'agility', name: 'Agilité', count: 1 },
      { id: 'conditioning', name: 'Condition', count: 1 },
    ],
    workouts: [
      {
        title: 'Entraînement Jump Vertical',
        duration: 45,
        difficulty: 'Avancé',
        calories: 400,
        category: 'power',
        tags: ['Détente', 'Explosivité'],
        description: 'Augmentez votre détente pour les dunks et les contres.',
        exerciseList: ['Jump Squats', 'Box Jumps', 'Depth Jumps', 'Plyometric Push-ups'],
      },
      {
        title: 'Maîtrise du Dribble',
        duration: 30,
        difficulty: 'Intermédiaire',
        calories: 250,
        category: 'skills',
        tags: ['Contrôle', 'Vitesse'],
        description: 'Devenez inarrêtable avec un contrôle de balle parfait.',
        exerciseList: ['Dribble bas', 'Crossovers', 'Spider Dribbling', 'Entre les jambes'],
      },
      {
        title: 'Agilité Défensive',
        duration: 35,
        difficulty: 'Intermédiaire',
        calories: 320,
        category: 'agility',
        tags: ['Défense', 'Rapidité'],
        description: 'Améliorez vos déplacements pour une défense de fer.',
        exerciseList: ['Defensive Slides', 'Ladder Drills', 'Reaction Sprints', 'Cone Weaving'],
      },
      {
        title: 'Condition Basketball',
        duration: 40,
        difficulty: 'Avancé',
        calories: 380,
        category: 'conditioning',
        tags: ['Endurance', 'Match'],
        description: 'Tenez la distance pendant 4 quart-temps.',
        exerciseList: ['Suicides', 'Full Court Sprints', 'Burpees', 'Mountain Climbers'],
      },
    ],
  },

  football: {
    emoji: '⚽',
    motivationalMessage: 'Le prochain but vous appartient.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'endurance', name: 'Endurance', count: 1 },
      { id: 'skills', name: 'Technique', count: 1 },
      { id: 'speed', name: 'Vitesse', count: 1 },
      { id: 'strength', name: 'Force', count: 1 },
    ],
    workouts: [
      {
        title: 'Technique de Frappe',
        duration: 40,
        difficulty: 'Intermédiaire',
        calories: 300,
        category: 'skills',
        tags: ['Précision', 'Puissance'],
        description: 'Améliorez la précision et la puissance de vos tirs.',
        exerciseList: ['Frappes enroulées', "Tirs à l'arrêt", 'Volées', 'Penalties'],
      },
      {
        title: 'Intervalles de Sprint',
        duration: 25,
        difficulty: 'Avancé',
        calories: 350,
        category: 'speed',
        tags: ['Explosivité', 'VMA'],
        description: 'Développez une vitesse de pointe pour dépasser les défenseurs.',
        exerciseList: ['Sprints 30m', 'Hill Sprints', 'Accélérations', 'Changements direction'],
      },
      {
        title: 'Endurance de Milieu',
        duration: 60,
        difficulty: 'Intermédiaire',
        calories: 500,
        category: 'endurance',
        tags: ['Cardio', 'Volume'],
        description: 'Tenez la distance pendant 90 minutes.',
        exerciseList: ['Course longue', 'Fartlek', 'Box-to-Box', 'Récupération active'],
      },
      {
        title: 'Force Fonctionnelle',
        duration: 50,
        difficulty: 'Avancé',
        calories: 420,
        category: 'strength',
        tags: ['Puissance', 'Contact'],
        description: 'Renforcez votre corps pour les duels.',
        exerciseList: ['Squats', 'Deadlifts', 'Bulgarian Split', 'Core Training'],
      },
    ],
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
      { id: 'core', name: 'Core', count: 1 },
    ],
    workouts: [
      {
        title: 'Push Day Intensif',
        duration: 60,
        difficulty: 'Avancé',
        calories: 450,
        category: 'push',
        tags: ['Pectoraux', 'Épaules', 'Triceps'],
        description: 'Développez votre haut du corps avec ce push intensif.',
        exerciseList: ['Bench Press', 'Military Press', 'Dips', 'Lateral Raises'],
      },
      {
        title: 'Pull Day Complet',
        duration: 55,
        difficulty: 'Avancé',
        calories: 420,
        category: 'pull',
        tags: ['Dos', 'Biceps'],
        description: 'Sculptez un dos puissant et des biceps définis.',
        exerciseList: ['Pull-ups', 'Rows', 'Deadlifts', 'Bicep Curls'],
      },
      {
        title: 'Leg Day Massacre',
        duration: 65,
        difficulty: 'Avancé',
        calories: 500,
        category: 'legs',
        tags: ['Quadriceps', 'Ischio', 'Fessiers'],
        description: "Le leg day qui forge des jambes d'acier.",
        exerciseList: ['Squats', 'Romanian DL', 'Leg Press', 'Calf Raises'],
      },
      {
        title: 'Full Body Power',
        duration: 45,
        difficulty: 'Intermédiaire',
        calories: 380,
        category: 'full_body',
        tags: ['Fonctionnel', 'Explosivité'],
        description: 'Un entraînement complet pour tout le corps.',
        exerciseList: ['Thrusters', 'Pull-ups', 'Push-ups', 'Burpees'],
      },
      {
        title: 'Core Destroyer',
        duration: 30,
        difficulty: 'Intermédiaire',
        calories: 280,
        category: 'core',
        tags: ['Abdos', 'Stabilité'],
        description: "Forgez un core d'acier en 30 minutes.",
        exerciseList: ['Planks', 'Russian Twists', 'Dead Bugs', 'Hanging Knee Raises'],
      },
    ],
  },

  running: {
    emoji: '🏃‍♂️',
    motivationalMessage: 'Chaque kilomètre vous rend plus fort.',
    categories: [
      { id: 'all', name: 'Tous', count: 4 },
      { id: 'speed', name: 'Vitesse', count: 1 },
      { id: 'endurance', name: 'Endurance', count: 1 },
      { id: 'intervals', name: 'Fractionné', count: 1 },
      { id: 'recovery', name: 'Récupération', count: 1 },
    ],
    workouts: [
      {
        title: 'Fractionnés Vitesse',
        duration: 35,
        difficulty: 'Avancé',
        calories: 400,
        category: 'speed',
        tags: ['VMA', 'Explosivité'],
        description: 'Améliorez votre vitesse maximale.',
        exerciseList: ['400m rapides', 'Récup 200m', '8 répétitions', 'Cool down'],
      },
      {
        title: 'Run Longue Distance',
        duration: 90,
        difficulty: 'Intermédiaire',
        calories: 800,
        category: 'endurance',
        tags: ['Base', 'Résistance'],
        description: 'Développez votre endurance fondamentale.',
        exerciseList: ['Échauffement 10min', 'Allure modérée 70min', 'Cool down 10min'],
      },
      {
        title: 'Intervalles Pyramide',
        duration: 45,
        difficulty: 'Avancé',
        calories: 450,
        category: 'intervals',
        tags: ['VO2max', 'Lactique'],
        description: 'Repoussez vos limites avec cette pyramide.',
        exerciseList: ['1min-2min-3min-2min-1min', 'Récup égale effort', 'Intensité 90%'],
      },
      {
        title: 'Footing Récupération',
        duration: 30,
        difficulty: 'Débutant',
        calories: 250,
        category: 'recovery',
        tags: ['Récup', 'Easy'],
        description: 'Course de récupération en douceur.',
        exerciseList: ['Allure très facile', 'Conversation possible', 'Détente musculaire'],
      },
    ],
  },

  tennis: {
    emoji: '🎾',
    motivationalMessage: 'Jeu, set et match. Visez la victoire.',
    categories: [
      { id: 'all', name: 'Tous', count: 3 },
      { id: 'agility', name: 'Agilité', count: 1 },
      { id: 'power', name: 'Puissance', count: 1 },
      { id: 'endurance', name: 'Endurance', count: 1 },
    ],
    workouts: [
      {
        title: 'Jeu de Jambes Tennis',
        duration: 40,
        difficulty: 'Intermédiaire',
        calories: 350,
        category: 'agility',
        tags: ['Déplacements', 'Réactivité'],
        description: 'Couvrez le court plus rapidement.',
        exerciseList: ['Lateral Lunges', 'Spider Drills', 'Split Steps', 'Cone Drills'],
      },
      {
        title: 'Puissance Service',
        duration: 30,
        difficulty: 'Avancé',
        calories: 280,
        category: 'power',
        tags: ['Service', 'Rotation'],
        description: 'Un service qui fait la différence.',
        exerciseList: ['Medicine Ball', 'Résistance épaules', 'Rotation trunk', 'Services répétés'],
      },
      {
        title: 'Endurance Match',
        duration: 50,
        difficulty: 'Avancé',
        calories: 420,
        category: 'endurance',
        tags: ['Match', '3 sets'],
        description: 'Tenez 3 sets sans faiblir.',
        exerciseList: ['Cardio tennis', 'Recovery drills', 'Match simulation', 'Mental training'],
      },
    ],
  },

  // Sports avec configuration basique (à compléter selon besoins)
  american_football: {
    emoji: '🏈',
    motivationalMessage: 'Chaque yard se gagne.',
    categories: [{ id: 'all', name: 'Tous', count: 1 }],
    workouts: [
      {
        title: 'Entraînement Football Américain',
        duration: 60,
        difficulty: 'Avancé',
        calories: 500,
        category: 'all',
        tags: ['Force', 'Contact'],
        description: 'Entraînement complet pour le football américain.',
        exerciseList: ['Tackling', 'Sprint', 'Blocking', 'Agility'],
      },
    ],
  },

  rugby: {
    emoji: '🏉',
    motivationalMessage: "Prêt pour l'impact.",
    categories: [{ id: 'all', name: 'Tous', count: 1 }],
    workouts: [
      {
        title: 'Entraînement Rugby',
        duration: 75,
        difficulty: 'Avancé',
        calories: 550,
        category: 'all',
        tags: ['Contact', 'Endurance'],
        description: 'Entraînement physique pour le rugby.',
        exerciseList: ['Scrums', 'Rucks', 'Sprint', 'Force fonctionnelle'],
      },
    ],
  },

  volleyball: {
    emoji: '🏐',
    motivationalMessage: 'Visez au-dessus du filet.',
    categories: [{ id: 'all', name: 'Tous', count: 1 }],
    workouts: [
      {
        title: 'Entraînement Volleyball',
        duration: 45,
        difficulty: 'Intermédiaire',
        calories: 350,
        category: 'all',
        tags: ['Saut', 'Réflexes'],
        description: 'Améliorez votre jeu de volleyball.',
        exerciseList: ['Jump training', 'Reflexes', 'Spike practice', 'Blocking'],
      },
    ],
  },

  swimming: {
    emoji: '🏊‍♂️',
    motivationalMessage: "Fendez l'eau.",
    categories: [{ id: 'all', name: 'Tous', count: 1 }],
    workouts: [
      {
        title: 'Entraînement Natation',
        duration: 60,
        difficulty: 'Intermédiaire',
        calories: 400,
        category: 'all',
        tags: ['Endurance', 'Technique'],
        description: 'Perfectionnez votre technique de nage.',
        exerciseList: ['Freestyle', 'Backstroke', 'Butterfly', 'Breaststroke'],
      },
    ],
  },

  cycling: {
    emoji: '🚴‍♂️',
    motivationalMessage: 'Pédalez vers la victoire.',
    categories: [{ id: 'all', name: 'Tous', count: 1 }],
    workouts: [
      {
        title: 'Entraînement Cyclisme',
        duration: 90,
        difficulty: 'Intermédiaire',
        calories: 600,
        category: 'all',
        tags: ['Endurance', 'Vitesse'],
        description: 'Améliorez vos performances à vélo.',
        exerciseList: ['Intervalles', 'Côtes', 'Sprint', 'Endurance'],
      },
    ],
  },
};

export const getSportMapping = (sport: string): Sport => {
  const mappings: Record<string, Sport> = {
    basketball: 'basketball',
    football: 'football',
    american_football: 'american_football',
    tennis: 'tennis',
    rugby: 'rugby',
    volleyball: 'volleyball',
    swimming: 'swimming',
    running: 'running',
    'course à pied': 'running',
    cycling: 'cycling',
    musculation: 'musculation',
    powerlifting: 'musculation',
    crossfit: 'musculation',
    weightlifting: 'musculation',
  };
  return mappings[sport?.toLowerCase()] || 'musculation';
};
