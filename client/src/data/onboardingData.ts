// client/src/data/onboardingData.ts
import { OnboardingModule, SportOption } from '@/types/onboarding-types';

export const AVAILABLE_MODULES: OnboardingModule[] = [
  {
    id: 'sport',
    name: 'Sport & Performance',
    icon: '🏃‍♂️',
    description: 'Programmes d\'entraînement personnalisés pour votre sport et votre position',
    benefits: [
      'Programmes spécifiques à votre sport et position',
      'Suivi des performances et de la progression',
      'Planification basée sur les saisons sportives',
      'Analyse des métriques de performance en temps réel',
      'Exercices techniques adaptés à votre discipline'
    ]
  },
  {
    id: 'strength',
    name: 'Musculation & Force',
    icon: '💪',
    description: 'Développement musculaire et amélioration de la condition physique',
    benefits: [
      'Programmes de force et d\'hypertrophie personnalisés',
      'Prévention des blessures par le renforcement',
      'Amélioration des performances athlétiques globales',
      'Suivi détaillé de la progression des charges',
      'Exercices adaptés à votre niveau et équipement'
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition Sportive',
    icon: '🥗',
    description: 'Nutrition optimisée pour vos objectifs sportifs et de santé',
    benefits: [
      'Plans alimentaires personnalisés selon vos objectifs',
      'Calcul automatique des macronutriments',
      'Recettes adaptées à votre sport et préférences',
      'Timing nutritionnel pour optimiser les performances',
      'Gestion des compléments alimentaires'
    ]
  },
  {
    id: 'sleep',
    name: 'Sommeil & Récupération',
    icon: '😴',
    description: 'Optimisation de la récupération et de la qualité du sommeil',
    benefits: [
      'Analyse détaillée de la qualité de votre sommeil',
      'Conseils personnalisés pour améliorer la récupération',
      'Horaires de sommeil optimisés pour vos entraînements',
      'Techniques de relaxation et de préparation au sommeil',
      'Suivi de la récupération musculaire et mentale'
    ]
  },
  {
    id: 'hydration',
    name: 'Hydratation Intelligente',
    icon: '💧',
    description: 'Suivi et optimisation de votre hydratation quotidienne',
    benefits: [
      'Rappels d\'hydratation intelligents et personnalisés',
      'Objectifs d\'hydratation basés sur votre activité',
      'Suivi des performances liées à l\'hydratation',
      'Adaptation selon les conditions météorologiques',
      'Conseils sur les électrolytes et boissons sportives'
    ]
  },
  {
    id: 'wellness',
    name: 'Bien-être Global',
    icon: '🧘‍♀️',
    description: 'Approche holistique de la santé et du bien-être',
    benefits: [
      'Coordination de tous les aspects de votre santé',
      'Coaching IA personnalisé et adaptatif',
      'Équilibre optimal vie-travail-sport',
      'Gestion du stress et techniques de relaxation',
      'Suivi de votre état mental et émotionnel'
    ]
  }
];

export const MAIN_OBJECTIVES = [
  {
    id: 'performance',
    name: 'Performance Athlétique',
    description: 'Améliorer mes performances sportives et compétitives',
    icon: '🏆',
    recommended_modules: ['sport', 'strength', 'nutrition', 'sleep'],
    priority: 1
  },
  {
    id: 'health_wellness',
    name: 'Santé & Bien-être',
    description: 'Maintenir une santé optimale et un bien-être général',
    icon: '❤️',
    recommended_modules: ['nutrition', 'sleep', 'hydration', 'wellness'],
    priority: 2
  },
  {
    id: 'body_composition',
    name: 'Transformation Corporelle',
    description: 'Perdre du poids, prendre du muscle ou recomposer mon corps',
    icon: '⚖️',
    recommended_modules: ['strength', 'nutrition', 'hydration'],
    priority: 3
  },
  {
    id: 'energy_sleep',
    name: 'Énergie & Récupération',
    description: 'Améliorer mon niveau d\'énergie et ma capacité de récupération',
    icon: '⚡',
    recommended_modules: ['sleep', 'nutrition', 'hydration', 'wellness'],
    priority: 4
  },
  {
    id: 'holistic',
    name: 'Transformation Complète',
    description: 'Optimiser tous les aspects de ma vie et de ma santé',
    icon: '🌟',
    recommended_modules: ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'],
    priority: 5
  }
];

export const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: 'football',
    name: 'Football',
    emoji: '⚽',
    category: 'sport_collectif',
    positions: [
      'Gardien de but',
      'Défenseur central',
      'Latéral droit',
      'Latéral gauche',
      'Milieu défensif',
      'Milieu central',
      'Milieu offensif',
      'Ailier droit',
      'Ailier gauche',
      'Attaquant',
      'Avant-centre'
    ]
  },
  {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    category: 'sport_collectif',
    positions: [
      'Meneur (Point Guard)',
      'Arrière (Shooting Guard)',
      'Ailier (Small Forward)',
      'Ailier Fort (Power Forward)',
      'Pivot (Center)'
    ]
  },
  {
    id: 'rugby',
    name: 'Rugby',
    emoji: '🏉',
    category: 'sport_collectif',
    positions: [
      'Pilier gauche',
      'Pilier droit',
      'Talonneur',
      'Deuxième ligne',
      'Troisième ligne aile',
      'Troisième ligne centre',
      'Demi de mêlée',
      'Demi d\'ouverture',
      'Centre',
      'Ailier',
      'Arrière'
    ]
  },
  {
    id: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    category: 'sport_individuel',
    positions: [
      'Joueur de fond de court',
      'Joueur attaque-défense',
      'Joueur offensif',
      'Joueur polyvalent',
      'Spécialiste service-volée'
    ]
  },
  {
    id: 'american_football',
    name: 'Football Américain',
    emoji: '🏈',
    category: 'sport_collectif',
    positions: [
      'Quarterback (QB)',
      'Running Back (RB)',
      'Wide Receiver (WR)',
      'Tight End (TE)',
      'Offensive Line',
      'Defensive Line',
      'Linebacker (LB)',
      'Cornerback (CB)',
      'Safety (S)',
      'Kicker (K)'
    ]
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    emoji: '🏐',
    category: 'sport_collectif',
    positions: [
      'Passeur',
      'Attaquant',
      'Central',
      'Libéro',
      'Réceptionneur-attaquant',
      'Universel'
    ]
  },
  {
    id: 'running',
    name: 'Course à Pied',
    emoji: '🏃‍♂️',
    category: 'sport_individuel',
    positions: [
      'Sprint (100m-400m)',
      'Demi-fond (800m-1500m)',
      'Fond (5km-10km)',
      'Marathon et plus',
      'Trail running',
      'Course sur piste'
    ]
  },
  {
    id: 'cycling',
    name: 'Cyclisme',
    emoji: '🚴‍♂️',
    category: 'sport_individuel',
    positions: [
      'Cyclisme sur route',
      'VTT Cross-country',
      'VTT Enduro/DH',
      'Cyclisme sur piste',
      'BMX',
      'Gravel/Cyclocross'
    ]
  },
  {
    id: 'swimming',
    name: 'Natation',
    emoji: '🏊‍♂️',
    category: 'sport_individuel',
    positions: [
      'Nage libre (crawl)',
      'Brasse',
      'Dos crawlé',
      'Papillon',
      'Quatre nages (individuel)',
      'Eau libre'
    ]
  },
  {
    id: 'musculation',
    name: 'Musculation & Fitness',
    emoji: '💪',
    category: 'fitness',
    positions: [
      'Bodybuilding',
      'Powerlifting',
      'Haltérophilie',
      'CrossFit',
      'Fitness général',
      'Strongman'
    ]
  },
  {
    id: 'combat_sports',
    name: 'Sports de Combat',
    emoji: '🥊',
    category: 'sport_combat',
    positions: [
      'Boxe anglaise',
      'Boxe française',
      'MMA',
      'Judo',
      'Karaté',
      'Taekwondo',
      'Lutte'
    ]
  },
  {
    id: 'other',
    name: 'Autre sport',
    emoji: '🎯',
    category: 'autre',
    positions: []
  }
];

export const DIETARY_PREFERENCES = [
  {
    id: 'omnivore',
    name: 'Omnivore',
    description: 'Je mange de tout sans restriction particulière',
    icon: '🍽️'
  },
  {
    id: 'vegetarian',
    name: 'Végétarien',
    description: 'Pas de viande ni de poisson, mais œufs et produits laitiers acceptés',
    icon: '🥕'
  },
  {
    id: 'vegan',
    name: 'Végétalien',
    description: 'Aucun produit d\'origine animale',
    icon: '🌱'
  },
  {
    id: 'pescatarian',
    name: 'Pescétarien',
    description: 'Poisson et fruits de mer autorisés, mais pas de viande',
    icon: '🐟'
  },
  {
    id: 'flexitarian',
    name: 'Flexitarien',
    description: 'Principalement végétarien avec viande occasionnelle',
    icon: '🥗'
  },
  {
    id: 'keto',
    name: 'Cétogène',
    description: 'Très faible en glucides, riche en lipides',
    icon: '🥑'
  },
  {
    id: 'paleo',
    name: 'Paléolithique',
    description: 'Aliments non transformés, comme nos ancêtres chasseurs-cueilleurs',
    icon: '🥩'
  },
  {
    id: 'mediterranean',
    name: 'Méditerranéen',
    description: 'Régime traditionnel des pays méditerranéens',
    icon: '🫒'
  },
  {
    id: 'intermittent_fasting',
    name: 'Jeûne Intermittent',
    description: 'Alternance entre périodes de jeûne et d\'alimentation',
    icon: '⏰'
  }
];

export const COMMON_ALLERGIES = [
  { id: 'gluten', name: 'Gluten', severity: 'high' },
  { id: 'lactose', name: 'Lactose', severity: 'medium' },
  { id: 'nuts', name: 'Fruits à coque', severity: 'high' },
  { id: 'peanuts', name: 'Arachides', severity: 'high' },
  { id: 'eggs', name: 'Œufs', severity: 'medium' },
  { id: 'fish', name: 'Poisson', severity: 'high' },
  { id: 'shellfish', name: 'Crustacés et mollusques', severity: 'high' },
  { id: 'soy', name: 'Soja', severity: 'medium' },
  { id: 'sesame', name: 'Sésame', severity: 'medium' },
  { id: 'sulfites', name: 'Sulfites', severity: 'low' }
];

export const STRENGTH_OBJECTIVES = [
  {
    id: 'strength',
    name: 'Force Pure',
    description: 'Développer la force maximale et la puissance',
    icon: '🏋️‍♂️',
    focus: 'Force'
  },
  {
    id: 'power',
    name: 'Puissance Explosive',
    description: 'Améliorer l\'explosivité et la vitesse de contraction',
    icon: '💥',
    focus: 'Puissance'
  },
  {
    id: 'hypertrophy',
    name: 'Prise de Masse',
    description: 'Développer le volume et la masse musculaire',
    icon: '💪',
    focus: 'Volume'
  },
  {
    id: 'injury_prevention',
    name: 'Prévention des Blessures',
    description: 'Renforcer pour prévenir les blessures et déséquilibres',
    icon: '🛡️',
    focus: 'Prévention'
  },
  {
    id: 'endurance',
    name: 'Endurance Musculaire',
    description: 'Améliorer la résistance et l\'endurance des muscles',
    icon: '🔄',
    focus: 'Endurance'
  },
  {
    id: 'functional',
    name: 'Force Fonctionnelle',
    description: 'Développer la force applicable aux mouvements sportifs',
    icon: '🤸‍♂️',
    focus: 'Fonctionnel'
  }
];

export const NUTRITION_OBJECTIVES = [
  {
    id: 'muscle_gain',
    name: 'Prise de Masse Musculaire',
    description: 'Développer la masse musculaire avec surplus calorique contrôlé',
    icon: '📈',
    calorie_target: 'surplus'
  },
  {
    id: 'weight_loss',
    name: 'Perte de Poids',
    description: 'Réduire la masse grasse en maintenant la masse musculaire',
    icon: '📉',
    calorie_target: 'deficit'
  },
  {
    id: 'maintenance',
    name: 'Maintien du Poids',
    description: 'Maintenir le poids actuel et optimiser la composition corporelle',
    icon: '⚖️',
    calorie_target: 'maintenance'
  },
  {
    id: 'performance',
    name: 'Performance Sportive',
    description: 'Optimiser l\'alimentation pour les performances athlétiques',
    icon: '🏃‍♂️',
    calorie_target: 'performance'
  },
  {
    id: 'recomposition',
    name: 'Recomposition Corporelle',
    description: 'Perdre de la graisse et gagner du muscle simultanément',
    icon: '🔄',
    calorie_target: 'recomp'
  }
];

export const LIFESTYLE_OPTIONS = [
  {
    id: 'student',
    name: 'Étudiant(e)',
    description: 'Horaires flexibles, budget étudiant, vie sociale active',
    icon: '🎓',
    characteristics: ['flexible_schedule', 'budget_conscious', 'social_eating']
  },
  {
    id: 'office_worker',
    name: 'Travailleur de Bureau',
    description: 'Travail sédentaire, horaires fixes, déjeuners souvent à l\'extérieur',
    icon: '💼',
    characteristics: ['sedentary', 'fixed_schedule', 'eating_out']
  },
  {
    id: 'physical_job',
    name: 'Travail Physique',
    description: 'Activité physique professionnelle, besoins énergétiques élevés',
    icon: '🔧',
    characteristics: ['physical_activity', 'high_energy_needs', 'irregular_breaks']
  },
  {
    id: 'parent',
    name: 'Parent',
    description: 'Horaires contraints par la famille, préparation pour plusieurs personnes',
    icon: '👨‍👩‍👧‍👦',
    characteristics: ['family_meals', 'time_constrained', 'batch_cooking']
  },
  {
    id: 'retired',
    name: 'Retraité(e)',
    description: 'Temps disponible, focus sur la santé et le bien-être',
    icon: '🌅',
    characteristics: ['flexible_time', 'health_focused', 'cooking_time']
  },
  {
    id: 'athlete',
    name: 'Athlète',
    description: 'Entraînements intensifs, besoins nutritionnels spécifiques',
    icon: '🏆',
    characteristics: ['high_training_volume', 'precise_nutrition', 'recovery_focused']
  }
];

export const EQUIPMENT_LEVELS = [
  {
    id: 'no_equipment',
    name: 'Aucun Matériel',
    description: 'Entraînements au poids du corps uniquement',
    icon: '🤸‍♂️',
    available_equipment: ['bodyweight']
  },
  {
    id: 'minimal_equipment',
    name: 'Matériel Minimal',
    description: 'Élastiques, poids légers, tapis de sol',
    icon: '🏠',
    available_equipment: ['resistance_bands', 'light_weights', 'mat']
  },
  {
    id: 'home_gym_basic',
    name: 'Home Gym de Base',
    description: 'Haltères réglables, barre de traction, banc',
    icon: '🏋️‍♀️',
    available_equipment: ['adjustable_dumbbells', 'pull_up_bar', 'bench', 'kettlebells']
  },
  {
    id: 'home_gym_complete',
    name: 'Home Gym Complet',
    description: 'Rack, barres olympiques, plaques, machines',
    icon: '🏠💪',
    available_equipment: ['power_rack', 'olympic_bar', 'plates', 'machines']
  },
  {
    id: 'commercial_gym',
    name: 'Salle de Sport Commerciale',
    description: 'Accès complet à tous types d\'équipements',
    icon: '🏢',
    available_equipment: ['full_equipment', 'cardio_machines', 'free_weights', 'machines']
  }
];

export const SPORT_LEVELS = [
  {
    id: 'recreational',
    name: 'Loisir',
    description: 'Pratique pour le plaisir et maintenir la forme physique',
    icon: '😊',
    training_frequency: '2-3x/week',
    competition_level: 'none'
  },
  {
    id: 'amateur_competitive',
    name: 'Amateur Compétitif',
    description: 'Compétitions locales et régionales, entraînement régulier',
    icon: '🥉',
    training_frequency: '4-5x/week',
    competition_level: 'local'
  },
  {
    id: 'club_competitive',
    name: 'Compétiteur Club',
    description: 'Compétitions inter-clubs et régionales de haut niveau',
    icon: '🥈',
    training_frequency: '5-6x/week',
    competition_level: 'regional'
  },
  {
    id: 'semi_professional',
    name: 'Semi-Professionnel',
    description: 'Niveau élevé, entraînement intensif, quelques revenus du sport',
    icon: '🏅',
    training_frequency: '6-8x/week',
    competition_level: 'national'
  },
  {
    id: 'professional',
    name: 'Professionnel',
    description: 'Sport de haut niveau, revenus principaux du sport',
    icon: '🏆',
    training_frequency: '8-12x/week',
    competition_level: 'international'
  }
];

export const FITNESS_EXPERIENCE_LEVELS = [
  {
    id: 'complete_beginner',
    name: 'Débutant Complet',
    description: 'Aucune expérience ou moins de 3 mois',
    icon: '🌱',
    experience_months: 0
  },
  {
    id: 'beginner',
    name: 'Débutant',
    description: '3 à 12 mois d\'expérience régulière',
    icon: '🔰',
    experience_months: 6
  },
  {
    id: 'intermediate',
    name: 'Intermédiaire',
    description: '1 à 3 ans d\'expérience avec progression constante',
    icon: '💪',
    experience_months: 24
  },
  {
    id: 'advanced',
    name: 'Avancé',
    description: '3 à 5 ans d\'expérience avec maîtrise technique',
    icon: '🏋️‍♂️',
    experience_months: 48
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Plus de 5 ans d\'expérience, connaissances approfondies',
    icon: '🏆',
    experience_months: 60
  }
];

export const SEASON_PERIODS = [
  {
    id: 'off_season',
    name: 'Hors Saison',
    description: 'Période de récupération active et développement des qualités physiques',
    icon: '🛌',
    focus: 'development',
    duration_weeks: 12
  },
  {
    id: 'pre_season',
    name: 'Pré-Saison',
    description: 'Préparation physique et technique pour la saison à venir',
    icon: '🏃‍♂️',
    focus: 'preparation',
    duration_weeks: 8
  },
  {
    id: 'early_season',
    name: 'Début de Saison',
    description: 'Adaptation à la compétition et maintien de la condition',
    icon: '🌅',
    focus: 'adaptation',
    duration_weeks: 6
  },
  {
    id: 'in_season',
    name: 'En Saison',
    description: 'Période de compétition principale, maintien des acquis',
    icon: '🏁',
    focus: 'maintenance',
    duration_weeks: 16
  },
  {
    id: 'championship',
    name: 'Championnats',
    description: 'Pic de forme pour les compétitions les plus importantes',
    icon: '🏆',
    focus: 'peak',
    duration_weeks: 4
  },
  {
    id: 'recovery',
    name: 'Récupération',
    description: 'Phase de récupération active après la saison',
    icon: '🧘‍♂️',
    focus: 'recovery',
    duration_weeks: 4
  }
];

export const TRAINING_AVAILABILITY = [
  {
    id: 'low',
    name: '2-3 sessions/semaine',
    description: 'Disponibilité limitée, séances courtes',
    icon: '⏰',
    sessions_per_week: 2.5,
    session_duration: 45
  },
  {
    id: 'moderate',
    name: '4-5 sessions/semaine',
    description: 'Disponibilité modérée, séances moyennes',
    icon: '📅',
    sessions_per_week: 4.5,
    session_duration: 60
  },
  {
    id: 'high',
    name: '6-7 sessions/semaine',
    description: 'Haute disponibilité, séances complètes',
    icon: '💪',
    sessions_per_week: 6.5,
    session_duration: 75
  },
  {
    id: 'very_high',
    name: '8+ sessions/semaine',
    description: 'Disponibilité maximale, entraînement intensif',
    icon: '🏆',
    sessions_per_week: 9,
    session_duration: 90
  }
];

export const HEALTH_CONDITIONS = [
  {
    id: 'none',
    name: 'Aucune condition particulière',
    description: 'Pas de problème de santé connu',
    restrictions: []
  },
  {
    id: 'joint_issues',
    name: 'Problèmes articulaires',
    description: 'Douleurs ou limitations articulaires',
    restrictions: ['low_impact_preferred', 'joint_mobility_focus']
  },
  {
    id: 'back_problems',
    name: 'Problèmes de dos',
    description: 'Douleurs lombaires ou cervicales',
    restrictions: ['core_strengthening', 'posture_focus']
  },
  {
    id: 'cardiovascular',
    name: 'Conditions cardiovasculaires',
    description: 'Hypertension, problèmes cardiaques',
    restrictions: ['heart_rate_monitoring', 'gradual_intensity']
  },
  {
    id: 'diabetes',
    name: 'Diabète',
    description: 'Diabète de type 1 ou 2',
    restrictions: ['blood_sugar_monitoring', 'meal_timing']
  },
  {
    id: 'other',
    name: 'Autre condition',
    description: 'Autre condition médicale spécifique',
    restrictions: ['medical_clearance_required']
  }
];

// Configuration par défaut pour l'onboarding
export const DEFAULT_ONBOARDING_CONFIG = {
  selectedModules: ['sport', 'nutrition', 'sleep', 'hydration'],
  minimumModules: 2,
  maximumModules: 6,
  recommendedModules: 4,
  stepOrder: [
    'objectives',
    'modules',
    'sport_selection',
    'experience_level',
    'availability',
    'equipment',
    'nutrition_preferences',
    'health_assessment',
    'final_customization'
  ]
};

// Questions conditionnelles basées sur les sélections
export const CONDITIONAL_QUESTIONS = {
  sport_specific: {
    condition: (data: any) => data.selectedModules?.includes('sport'),
    questions: ['sport_selection', 'sport_level', 'season_period', 'position']
  },
  strength_specific: {
    condition: (data: any) => data.selectedModules?.includes('strength'),
    questions: ['strength_objectives', 'equipment_level', 'experience_level']
  },
  nutrition_specific: {
    condition: (data: any) => data.selectedModules?.includes('nutrition'),
    questions: ['nutrition_objectives', 'dietary_preferences', 'allergies', 'cooking_skills']
  },
  sleep_specific: {
    condition: (data: any) => data.selectedModules?.includes('sleep'),
    questions: ['sleep_schedule', 'sleep_quality', 'recovery_needs']
  },
  hydration_specific: {
    condition: (data: any) => data.selectedModules?.includes('hydration'),
    questions: ['daily_activity', 'climate_conditions', 'sweat_rate']
  },
  wellness_specific: {
    condition: (data: any) => data.selectedModules?.includes('wellness'),
    questions: ['stress_level', 'lifestyle', 'work_life_balance']
  }
};
