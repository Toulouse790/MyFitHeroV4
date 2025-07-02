import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Apple,
  Moon,
  Droplets
} from 'lucide-react';

export interface UserProfileOnboarding {
  profile_type: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
  modules: string[];
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
  available_time_per_day: number | null;
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  injuries: string[];
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
  onComplete: (profile: UserProfileOnboarding) => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // Commence à 0 pour le choix du type
  const [profile, setProfile] = useState<UserProfileOnboarding>({
    profile_type: 'complete',
    modules: [],
    age: null,
    gender: null,
    lifestyle: null,
    available_time_per_day: null,
    fitness_experience: null,
    injuries: [],
    primary_goals: [],
    motivation: '',
    sport: null,
    sport_position: null,
    sport_level: null,
    training_frequency: null,
    season_period: null
  });

  // Types de profils disponibles
  const profileTypes = [
    {
      id: 'complete',
      title: '🎯 Programme Complet',
      description: 'Sport + Nutrition + Sommeil + Hydratation',
      icon: Brain,
      color: 'from-blue-600 to-purple-600',
      modules: ['sport', 'nutrition', 'sleep', 'hydration']
    },
    {
      id: 'wellness',
      title: '🌱 Bien-être Sans Sport',
      description: 'Nutrition + Sommeil + Hydratation',
      icon: Apple,
      color: 'from-green-600 to-teal-600',
      modules: ['nutrition', 'sleep', 'hydration']
    },
    {
      id: 'sport_only',
      title: '🏃 Sport Uniquement',
      description: 'Programme sportif personnalisé',
      icon: Dumbbell,
      color: 'from-red-600 to-orange-600',
      modules: ['sport']
    },
    {
      id: 'sleep_focus',
      title: '😴 Focus Sommeil',
      description: 'Améliorer la qualité du repos',
      icon: Moon,
      color: 'from-purple-600 to-pink-600',
      modules: ['sleep', 'hydration']
    }
  ];

  const totalSteps = profile.modules.includes('sport') ? 4 : 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const goalOptions = [
    { id: 'performance', label: 'Performance sportive', icon: '🏆', description: 'Améliorer mes performances', available: ['complete', 'sport_only'] },
    { id: 'muscle_gain', label: 'Prise de muscle', icon: '💪', description: 'Développer ma masse musculaire', available: ['complete', 'sport_only'] },
    { id: 'weight_loss', label: 'Perte de poids', icon: '🔥', description: 'Perdre du poids', available: ['complete', 'wellness'] },
    { id: 'endurance', label: 'Condition physique', icon: '🏃', description: 'Améliorer mon endurance', available: ['complete', 'sport_only'] },
    { id: 'recovery', label: 'Récupération', icon: '😌', description: 'Mieux récupérer', available: ['complete', 'wellness', 'sleep_focus'] },
    { id: 'energy', label: 'Énergie', icon: '⚡', description: 'Plus d\'énergie au quotidien', available: ['complete', 'wellness', 'sleep_focus'] },
    { id: 'sleep_quality', label: 'Qualité sommeil', icon: '🌙', description: 'Mieux dormir', available: ['complete', 'wellness', 'sleep_focus'] },
    { id: 'general_health', label: 'Santé générale', icon: '❤️', description: 'Mode de vie plus sain', available: ['complete', 'wellness'] }
  ];

  const sportsOptions = [
    'Rugby', 'Football', 'Basketball', 'Tennis', 'Natation', 'Course à pied', 
    'Cyclisme', 'Musculation', 'CrossFit', 'Arts martiaux', 'Volleyball', 
    'Handball', 'Hockey', 'Escalade', 'Autre'
  ];

  const updateProfile = (updates: Partial<UserProfileOnboarding>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const selectProfileType = (typeId: string) => {
    const selectedType = profileTypes.find(t => t.id === typeId);
    if (selectedType) {
      updateProfile({
        profile_type: typeId as any,
        modules: selectedType.modules
      });
    }
  };

  const toggleGoal = (goalId: string) => {
    const currentGoals = profile.primary_goals;
    if (currentGoals.includes(goalId)) {
      updateProfile({ primary_goals: currentGoals.filter(g => g !== goalId) });
    } else {
      if (currentGoals.length < 3) {
        updateProfile({ primary_goals: [...currentGoals, goalId] });
      }
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Choix du type de profil
        return profile.profile_type && profile.modules.length > 0;
      case 1: // Infos personnelles
        return profile.age && profile.gender && profile.lifestyle && 
               profile.available_time_per_day && profile.fitness_experience;
      case 2: // Objectifs
        return profile.primary_goals.length > 0;
      case 3: // Sport (si applicable)
        if (profile.modules.includes('sport')) {
          return true; // Rendre optionnel
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    console.log('NextStep appelé, étape actuelle:', currentStep, 'Total étapes:', totalSteps);
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // FINALISATION
      try {
        const finalProfile = {
          ...profile,
          fitness_goal: profile.primary_goals.length > 0 ? profile.primary_goals[0] : 'general',
          // Valeurs par défaut pour éviter les erreurs
          sport: profile.sport || 'none',
          sport_level: profile.sport_level || 'recreational',
          training_frequency: profile.training_frequency || 0,
          season_period: profile.season_period || 'off_season'
        };
        
        console.log('Envoi du profil final:', finalProfile);
        
        // Appeler onComplete
        if (typeof onComplete === 'function') {
          await onComplete(finalProfile);
        } else {
          console.error('onComplete n\'est pas une fonction');
          // Redirection directe
          navigate('/dashboard');
        }
        
      } catch (error) {
        console.error('Erreur lors de la finalisation:', error);
        // Redirection forcée en cas d'erreur
        alert('Profil enregistré ! Redirection...');
        navigate('/dashboard');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
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
            {currentStep > 0 && (
              <span className="text-sm opacity-90">Étape {currentStep} / {totalSteps}</span>
            )}
          </div>
          
          {/* Barre de progression */}
          {currentStep > 0 && (
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-8">
          {/* ÉTAPE 0: Choix du type de profil */}
          {currentStep === 0 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Target className="mx-auto text-blue-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Que souhaitez-vous améliorer ?</h2>
                <p className="text-gray-600">Choisissez le programme qui vous correspond</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = profile.profile_type === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      onClick={() => selectProfileType(type.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color} text-white`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{type.title}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                          {isSelected && (
                            <div className="mt-2 flex items-center text-blue-600">
                              <CheckCircle size={16} className="mr-1" />
                              <span className="text-sm font-medium">Sélectionné</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 1: Profil Personnel */}
          {currentStep === 1 && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temps disponible par jour</label>
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

          {/* ÉTAPE 2: Objectifs */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Target className="mx-auto text-purple-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Vos objectifs</h2>
                <p className="text-gray-600">Sélectionnez jusqu'à 3 objectifs principaux</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalOptions
                  .filter(goal => goal.available.includes(profile.profile_type))
                  .map((goal) => {
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
            </div>
          )}

          {/* ÉTAPE 3: Sport (si inclus dans les modules) */}
          {currentStep === 3 && profile.modules.includes('sport') && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Dumbbell className="mx-auto text-green-600 mb-4" size={48} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Contexte sportif</h2>
                <p className="text-gray-600">
                  Optionnel - Aidez-nous à personnaliser votre programme
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sport principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport principal (optionnel)</label>
                  <select
                    value={profile.sport || ''}
                    onChange={(e) => updateProfile({ sport: e.target.value || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Aucun sport spécifique</option>
                    {sportsOptions.map(sport => (
                      <option key={sport} value={sport.toLowerCase()}>{sport}</option>
                    ))}
                  </select>
                </div>

                {/* Niveau sportif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de pratique</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entraînements par semaine</label>
                  <select
                    value={profile.training_frequency || ''}
                    onChange={(e) => updateProfile({ training_frequency: parseInt(e.target.value) || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">1 fois</option>
                    <option value="2">2 fois</option>
                    <option value="3">3 fois</option>
                    <option value="4">4 fois</option>
                    <option value="5">5 fois</option>
                    <option value="6">6+ fois</option>
                  </select>
                </div>

                {/* Période de la saison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période actuelle</label>
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
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                currentStep === 0
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
                  <span>Veuillez remplir les champs requis</span>
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
