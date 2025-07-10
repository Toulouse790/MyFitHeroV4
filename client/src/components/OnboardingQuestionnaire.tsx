import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface OnboardingQuestionnaireProps {
  user: any;
  onComplete: () => void;
}

interface ProfileData {
  age: number;
  gender: 'male' | 'female';
  fitness_goal: string;
  activity_level: string;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    age: 25,
    gender: 'male',
    fitness_goal: 'lose_weight',
    activity_level: 'moderate'
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
          username: user.user_metadata?.username || user.email.split('@')[0],
          full_name: user.user_metadata?.full_name || user.user_metadata?.username,
          modules: ['nutrition', 'workout', 'sleep', 'hydration'],
          active_modules: ['nutrition', 'workout'],
          profile_type: 'complete'
        })
        .select()
        .single();

      if (!error) {
        toast({
          title: 'Profil créé !',
          description: 'Bienvenue dans MyFitHero !',
          variant: 'success'
        });
        onComplete();
      } else {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le profil. Réessayez.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Quel âge avez-vous ?</h2>
            <input
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value)})}
              className="w-full p-3 border rounded-lg text-lg"
              min="13"
              max="100"
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Quel est votre genre ?</h2>
            <div className="space-y-3">
              {['male', 'female'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setProfileData({...profileData, gender: gender as 'male' | 'female'})}
                  className={`w-full p-3 rounded-lg border-2 ${
                    profileData.gender === gender ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {gender === 'male' ? 'Homme' : 'Femme'}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Quel est votre objectif principal ?</h2>
            <div className="space-y-3">
              {[
                { id: 'lose_weight', label: 'Perdre du poids' },
                { id: 'gain_muscle', label: 'Prendre du muscle' },
                { id: 'maintain', label: 'Maintenir ma forme' },
                { id: 'improve_health', label: 'Améliorer ma santé' }
              ].map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setProfileData({...profileData, fitness_goal: goal.id})}
                  className={`w-full p-3 rounded-lg border-2 text-left ${
                    profileData.fitness_goal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Quel est votre niveau d'activité ?</h2>
            <div className="space-y-3">
              {[
                { id: 'sedentary', label: 'Sédentaire (peu d\'exercice)' },
                { id: 'light', label: 'Léger (1-3 fois/semaine)' },
                { id: 'moderate', label: 'Modéré (3-5 fois/semaine)' },
                { id: 'active', label: 'Actif (6-7 fois/semaine)' }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setProfileData({...profileData, activity_level: level.id})}
                  className={`w-full p-3 rounded-lg border-2 text-left ${
                    profileData.activity_level === level.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Configuration</h1>
            <span className="text-sm text-gray-500">{step}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {renderStep()}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Précédent
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : step === 4 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;