import React, { useState } from 'react';
import {
  User,
  Target,
  Dumbbell,
  Clock,
  TrendingUp,
  Heart,
  Brain,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Award,
  Calendar,
  AlertCircle,
  Ruler, // Import pour la taille
  Scale // Import pour le poids
} from 'lucide-react';

// Exportation de cette interface pour être utilisée par App.tsx
export interface UserProfileOnboarding {
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
  available_time_per_day: number | null; // minutes
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  injuries: string[];
  height_cm: number | null; // NOUVEAU : Taille
  weight_kg: number | null; // NOUVEAU : Poids

  primary_goals: string[];
  motivation: string;

  fitness_goal?: string | null;
  sport: string | null;
  sport_position: string | null;
  sport_level: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | null;
  training_frequency: number | null;
  season_period: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
}

interface OnboardingQuestionnaireProps {
  onComplete: (profile: UserProfileOnboarding) => void; // Utilise le type exporté
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfileOnboarding>({ // Utilise le type exporté
    age: null,
    gender: null,
    lifestyle: null,
    available_time_per_day: null,
    fitness_experience: null,
    injuries: [],
    height_cm: null, // Initialisation
    weight_kg: null, // Initialisation
    primary_goals: [],
    motivation: '',
    sport: null,
    sport_position: null,
    sport_level: null,
    training_frequency: null,
    season_period: null
  });

  const totalSteps = 3; // Le nombre d'étapes reste le même, mais leur contenu change
  const progressPercentage = (currentStep / totalSteps) * 100;

  const goalOptions = [
    { id: 'performance', label: 'Performance sportive', icon: '🏆', description: 'Améliorer mes performances dans mon sport' },
    { id: 'muscle_gain', label: 'Prise de muscle', icon: '💪', description: 'Développer ma masse musculaire' },
    { id: 'weight_loss', label: 'Perte de poids', icon: '🔥', description: 'Perdre du poids et sculpter ma silhouette' },
    { id: 'endurance', label: 'Condition physique', icon: '🏃', description: 'Améliorer mon endurance et ma forme générale' },
    { id: 'recovery', label: 'Récupération & bien-être', icon: '😌', description: 'Mieux récupérer et gérer le stress' },
    { id: 'strength', label: 'Force pure', icon: '⚡', description: 'Devenir plus fort sur les mouvements de base' },
    { id: 'flexibility', label: 'Souplesse & mobilité', icon: '🤸', description: 'Améliorer ma flexibilité et prévenir les blessures' },
    { id: 'general_health', label: 'Santé générale', icon: '❤️', description: 'Adopter un mode de vie plus sain' }
  ];

  const sportsOptions = [
    'Rugby', 'Football', 'Basketball', 'Tennis', 'Natation', 'Course à pied',
    'Cyclisme', 'Musculation', 'CrossFit', 'Arts martiaux', 'Volleyball',
    'Handball', 'Hockey', 'Escalade', 'Autre'
  ];

  const updateProfile = (updates: Partial<UserProfileOnboarding>) => { // Utilise le type exporté
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleGoal = (goalId: string) => {
    const currentGoals = profile.primary_goals;
    if (currentGoals.includes(goalId)) {
      updateProfile({ primary_goals: currentGoals.filter(g => g !== goalId) });
    } else {
      if (currentGoals.length < 3) { // Limite à 3 objectifs pour le moment
        updateProfile({ primary_goals: [...currentGoals, goalId] });
      }
    }
  };

  const hasPerformanceGoal = profile.primary_goals.includes('performance');

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // ÉTAPE 1: Sélection des Piliers (Objectifs)
        return profile.primary_goals.length > 0;
      case 2: // ÉTAPE 2: Profil Personnel (Infos générales + Poids/Taille)
        return profile.age && profile.gender && profile.lifestyle &&
               profile.available_time_per_day && profile.fitness_experience &&
               profile.height_cm && profile.weight_kg &&
               profile.height_cm > 0 && profile.weight_kg > 0;
      case 3: // ÉTAPE 3: Contexte Sportif (Conditionnel si objectif "Performance")
        if (hasPerformanceGoal) {
          return profile.sport && profile.sport_level && profile.training_frequency;
        }
        return true; // Si pas d'objectif performance, cette étape n'est pas bloquante
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        const finalProfile = {
          ...profile,
          // S'assurer que fitness_goal est défini même si un seul objectif est choisi
          fitness_goal: profile.primary_goals.length > 0 ? profile.primary_goals[0] : null
        };
        onComplete(finalProfile);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header avec progression */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Brain className="mr-3" size={28} />
              Configuration MyFitHero
            </h1>
            <span className="text-sm opacity-90">Étape {currentStep} / {totalSteps}</span>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-8">
          {/* ÉTAPE 1: Objectifs Prioritaires (NOUVELLE PREMIÈRE ÉTAPE) */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Target className="mx-auto text-purple-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Vos objectifs prioritaires</h2>
                <p className="text-gray-600">Sélectionnez jusqu'à 3 objectifs principaux (nous adapterons l'interface)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalOptions.map((goal) => {
                  const isSelected = profile.primary_goals.includes(goal.id);
                  const canSelect = profile.primary_goals.length < 3 || isSelected;

                  return (
                    <button
                      key={goal.id}
                      onClick={() => canSelect && toggleGoal(goal.id)}
                      disabled={!canSelect}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105'
                          : canSelect
                          ? 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{goal.label}</h3>
                          <p className={`text-sm ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                            {goal.description}
                          </p>
                        </div>
                        {isSelected && <CheckCircle size={20} className="text-white mt-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {profile.primary_goals.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-2">Objectifs sélectionnés:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.primary_goals.map((goalId) => {
                      const goal = goalOptions.find(g => g.id === goalId);
                      return (
                        <span key={goalId} className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm">
                          {goal?.icon} {goal?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2: Profil Personnel (ANCIENNE ÉTAPE 1 + Poids/Taille) */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <User className="mx-auto text-blue-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Parlons de vous</h2>
                <p className="text-gray-600">Ces informations nous aident à personnaliser votre expérience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Âge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Votre âge</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={profile.age || ''}
                    onChange={(e) => updateProfile({ age: parseInt(e.target.value) || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 25"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'other'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => updateProfile({ gender })}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          profile.gender === gender
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {gender === 'male' ? 'Homme' : gender === 'female' ? 'Femme' : 'Autre'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taille */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taille (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      min="50"
                      max="250"
                      value={profile.height_cm || ''}
                      onChange={(e) => updateProfile({ height_cm: parseInt(e.target.value) || null })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 175"
                    />
                  </div>
                </div>

                {/* Poids */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      value={profile.weight_kg || ''}
                      onChange={(e) => updateProfile({ weight_kg: parseFloat(e.target.value) || null })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 70.5"
                    />
                  </div>
                </div>

                {/* Mode de vie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode de vie</label>
                  <select
                    value={profile.lifestyle || ''}
                    onChange={(e) => updateProfile({ lifestyle: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="student">Étudiant</option>
                    <option value="office_worker">Travail de bureau</option>
                    <option value="physical_job">Travail physique</option>
                    <option value="retired">Retraité</option>
                  </select>
                </div>

                {/* Temps disponible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temps disponible par jour (min)</label>
                  <select
                    value={profile.available_time_per_day || ''}
                    onChange={(e) => updateProfile({ available_time_per_day: parseInt(e.target.value) || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="15">15-30 minutes</option>
                    <option value="45">30-60 minutes</option>
                    <option value="90">1h-1h30</option>
                    <option value="120">Plus de 2 heures</option>
                  </select>
                </div>

                {/* Expérience fitness */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expérience en fitness</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([
                      { value: 'beginner', label: 'Débutant', desc: 'Moins de 6 mois' },
                      { value: 'intermediate', label: 'Intermédiaire', desc: '6 mois - 2 ans' },
                      { value: 'advanced', label: 'Avancé', desc: '2-5 ans' },
                      { value: 'expert', label: 'Expert', desc: 'Plus de 5 ans' }
                    ] as const).map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updateProfile({ fitness_experience: level.value })}
                        className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                          profile.fitness_experience === level.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs opacity-75">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Contexte Sportif (ANCIENNE ÉTAPE 3, CONDITIONNELLE) */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Dumbbell className="mx-auto text-green-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Contexte sportif</h2>
                <p className="text-gray-600">
                  Configurons votre profil sportif pour un entraînement optimal
                  {hasPerformanceGoal ? '' : ' (optionnel, car vous n\'avez pas sélectionné "Performance sportive")'}
                </p>
              </div>

              {/* Les questions sportives sont affichées mais deviennent obligatoires
                  seulement si l'objectif "performance" est sélectionné */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sport principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport principal {hasPerformanceGoal ? '*' : '(optionnel)'}</label>
                  <select
                    value={profile.sport || ''}
                    onChange={(e) => updateProfile({ sport: e.target.value || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Aucun sport spécifique / Fitness général</option>
                    {sportsOptions.map(sport => (
                      <option key={sport} value={sport.toLowerCase()}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* Niveau sportif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de pratique {hasPerformanceGoal ? '*' : '(optionnel)'}</label>
                  <select
                    value={profile.sport_level || ''}
                    onChange={(e) => updateProfile({ sport_level: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="recreational">Loisir</option>
                    <option value="amateur_competitive">Amateur compétitif</option>
                    <option value="semi_professional">Semi-professionnel</option>
                    <option value="professional">Professionnel</option>
                  </select>
                </div>

                {/* Fréquence d'entraînement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entraînements par semaine {hasPerformanceGoal ? '*' : '(optionnel)'}</label>
                  <select
                    value={profile.training_frequency || ''}
                    onChange={(e) => updateProfile({ training_frequency: parseInt(e.target.value) || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">1 fois par semaine</option>
                    <option value="2">2 fois par semaine</option>
                    <option value="3">3 fois par semaine</option>
                    <option value="4">4 fois par semaine</option>
                    <option value="5">5 fois par semaine</option>
                    <option value="6">6 fois par semaine</option>
                    <option value="7">Tous les jours</option>
                  </select>
                </div>

                {/* Période de la saison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période actuelle {hasPerformanceGoal ? '*' : '(optionnel)'}</label>
                  <select
                    value={profile.season_period || ''}
                    onChange={(e) => updateProfile({ season_period: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="off_season">Hors saison</option>
                    <option value="pre_season">Pré-saison</option>
                    <option value="in_season">En saison</option>
                    <option value="recovery">Récupération</option>
                  </select>
                </div>
              </div>

              {/* Résumé final */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-green-600" size={20} />
                  Votre profil MyFitHero
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Objectifs principaux:</span>
                    <div className="mt-1">
                      {profile.primary_goals.map(goalId => {
                        const goal = goalOptions.find(g => g.id === goalId);
                        return (
                          <span key={goalId} className="inline-block bg-white px-2 py-1 rounded mr-2 mb-1">
                            {goal?.icon} {goal?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Disponibilité:</span>
                    <p className="text-gray-600">
                      {profile.available_time_per_day && profile.available_time_per_day < 30 ? '15-30 min/jour' :
                       profile.available_time_per_day && profile.available_time_per_day < 60 ? '30-60 min/jour' :
                       profile.available_time_per_day && profile.available_time_per_day < 120 ? '1h-1h30/jour' : '2h+/jour'}
                    </p>
                  </div>
                  {profile.sport && (
                    <div>
                      <span className="font-medium text-gray-700">Sport:</span>
                      <p className="text-gray-600">{profile.sport} - {profile.sport_level}</p>
                    </div>
                  )}
                  {profile.height_cm && (
                    <div>
                      <span className="font-medium text-gray-700">Taille:</span>
                      <p className="text-gray-600">{profile.height_cm} cm</p>
                    </div>
                  )}
                   {profile.weight_kg && (
                    <div>
                      <span className="font-medium text-gray-700">Poids:</span>
                      <p className="text-gray-600">{profile.weight_kg} kg</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft size={18} />
              <span>Précédent</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {!canProceedToNextStep() && (
                <>
                  <AlertCircle size={16} className="text-orange-500" />
                  <span>Veuillez remplir tous les champs obligatoires</span>
                </>
              )}
            </div>

            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                canProceedToNextStep()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{currentStep === totalSteps ? 'Finaliser' : 'Suivant'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;
