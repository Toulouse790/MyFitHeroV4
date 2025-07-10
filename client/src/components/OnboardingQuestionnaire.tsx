import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ConversationalOnboarding from './ConversationalOnboarding';
import { OnboardingData } from '@/types/conversationalOnboarding';

interface OnboardingQuestionnaireProps {
  user: any;
  onComplete: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ user, onComplete }) => {
  const { toast } = useToast();

  // Gérer la finalisation du nouvel onboarding
  const handleConversationalComplete = async (data: OnboardingData) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          profile_type: 'complete',
          active_modules: data.selectedModules || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Bienvenue dans MyFitHero !',
        description: 'Votre profil a été créé avec succès.',
      });

      onComplete();
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la finalisation.',
        variant: 'destructive'
      });
    }
  };

  return (
    <ConversationalOnboarding
      onComplete={handleConversationalComplete}
    />
  );
};

export default OnboardingQuestionnaire;
