import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, ChevronLeft, User, Target, Clock, Trophy, Heart, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  age: number | '';
  gender: 'male' | 'female' | '';
  sport: string;
  sport_position: string;
  sport_level: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | '';
  lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired' | '';
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  primary_goals: string[];
  training_frequency: number | '';
  available_time_per_day: number | '';
  profile_type: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus' | '';
  motivation: string;
}

interface OnboardingQuestionnaireProps {
  user: any;
  onComplete: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ user, onComplete }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    age: '',
    gender: '',
    sport: '',
    sport_position: '',
    sport_level: '',
    lifestyle: '',
    fitness_experience: '',
    primary_goals: [],
    training_frequency: '',
    available_time_per_day: '',
    profile_type: '',
    motivation: ''
  });

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primary_goals: prev.primary_goals.includes(goal)
        ? prev.primary_goals.filter(g => g !== goal)
        : [...prev.primary_goals, goal]
    }));
  };

  const submitProfile = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          active_modules: getActiveModules(),
          modules: getActiveModules()
        })
      });

      if (response.ok) {
        toast({
          title: 'Profil créé avec succès',
          description: 'Bienvenue dans MyFitHero !',
          variant: 'success'
        });
        onComplete();
      } else {
        throw new Error('Erreur lors de la création du profil');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de votre profil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveModules = () => {
    const modules = [];
    if (formData.profile_type === 'complete') {
      modules.push('sport', 'nutrition', 'sleep', 'hydration');
    } else if (formData.profile_type === 'wellness') {
      modules.push('nutrition', 'sleep', 'hydration');
    } else if (formData.profile_type === 'sport_only') {
      modules.push('sport', 'hydration');
    } else if (formData.profile_type === 'sleep_focus') {
      modules.push('sleep', 'hydration');
    }
    return modules;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitProfile();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const sports = [
    'Basketball', 'Football', 'Tennis', 'Natation', 'Course à pied', 'Cyclisme',
    'Musculation', 'Volleyball', 'Rugby', 'Athlétisme', 'Boxing', 'MMA', 'Autre'
  ];

  const goals = [
    'Perte de poids', 'Prise de muscle', 'Amélioration performance', 
    'Bien-être général', 'Endurance', 'Force', 'Flexibilité', 'Récupération'
  ];

  const steps = [
    {
      title: 'Informations personnelles',
      icon: User,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre âge"
              min="13"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <div className="grid grid-cols-2 gap-3">
              {['male', 'female'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleInputChange('gender', gender)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.gender === gender 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {gender === 'male' ? 'Homme' : 'Femme'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style de vie</label>
            <select
              value={formData.lifestyle}
              onChange={(e) => handleInputChange('lifestyle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez votre style de vie</option>
              <option value="student">Étudiant</option>
              <option value="office_worker">Travail de bureau</option>
              <option value="physical_job">Travail physique</option>
              <option value="retired">Retraité</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: 'Sport et niveau',
      icon: Dumbbell,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sport principal</label>
            <select
              value={formData.sport}
              onChange={(e) => handleInputChange('sport', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez votre sport</option>
              {sports.map((sport) => (
                <option key={sport} value={sport.toLowerCase()}>{sport}</option>
              ))}
            </select>
          </div>

          {formData.sport && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position/Spécialité</label>
              <input
                type="text"
                value={formData.sport_position}
                onChange={(e) => handleInputChange('sport_position', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Défenseur, Sprinter, etc."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau sportif</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'recreational', label: 'Loisir' },
                { value: 'amateur_competitive', label: 'Amateur compétitif' },
                { value: 'semi_professional', label: 'Semi-professionnel' },
                { value: 'professional', label: 'Professionnel' }
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInputChange('sport_level', level.value)}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    formData.sport_level === level.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expérience fitness</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'beginner', label: 'Débutant' },
                { value: 'intermediate', label: 'Intermédiaire' },
                { value: 'advanced', label: 'Avancé' },
                { value: 'expert', label: 'Expert' }
              ].map((exp) => (
                <button
                  key={exp.value}
                  type="button"
                  onClick={() => handleInputChange('fitness_experience', exp.value)}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    formData.fitness_experience === exp.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Objectifs et entraînement',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs principaux</label>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    formData.primary_goals.includes(goal)
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence d'entraînement (par semaine)</label>
            <input
              type="number"
              value={formData.training_frequency}
              onChange={(e) => handleInputChange('training_frequency', parseInt(e.target.value) || '')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de séances par semaine"
              min="1"
              max="14"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temps disponible par jour (minutes)</label>
            <input
              type="number"
              value={formData.available_time_per_day}
              onChange={(e) => handleInputChange('available_time_per_day', parseInt(e.target.value) || '')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Temps disponible en minutes"
              min="15"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivation personnelle</label>
            <textarea
              value={formData.motivation}
              onChange={(e) => handleInputChange('motivation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Qu'est-ce qui vous motive ? Quels sont vos défis ?"
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      title: 'Type de profil',
      icon: Trophy,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choisissez le type de profil qui vous correspond le mieux
            </label>
            <div className="space-y-4">
              {[
                {
                  value: 'complete',
                  title: 'Profil Complet',
                  description: 'Sport, Nutrition, Sommeil et Hydratation',
                  icon: Heart,
                  color: 'bg-green-50 border-green-200 text-green-700'
                },
                {
                  value: 'wellness',
                  title: 'Bien-être',
                  description: 'Nutrition, Sommeil et Hydratation',
                  icon: Heart,
                  color: 'bg-blue-50 border-blue-200 text-blue-700'
                },
                {
                  value: 'sport_only',
                  title: 'Sport Uniquement',
                  description: 'Focus sur l\'entraînement et l\'hydratation',
                  icon: Dumbbell,
                  color: 'bg-orange-50 border-orange-200 text-orange-700'
                },
                {
                  value: 'sleep_focus',
                  title: 'Focus Sommeil',
                  description: 'Optimisation du sommeil et hydratation',
                  icon: Clock,
                  color: 'bg-purple-50 border-purple-200 text-purple-700'
                }
              ].map((profile) => (
                <button
                  key={profile.value}
                  type="button"
                  onClick={() => handleInputChange('profile_type', profile.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.profile_type === profile.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <profile.icon size={20} />
                    <div>
                      <div className="font-medium">{profile.title}</div>
                      <div className="text-sm text-gray-600">{profile.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Configuration de votre profil</h2>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <currentStepData.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{currentStepData.title}</h3>
            </div>
            
            {currentStepData.content}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Précédent</span>
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Création...' : isLastStep ? 'Terminer' : 'Suivant'}</span>
              {!loading && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;