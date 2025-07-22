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
      console.log('🔄 Début de la finalisation de l\'onboarding', { userId: user?.id, data });
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          profile_type: 'complete',
          modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
          active_modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('🔴 Erreur Supabase lors de la mise à jour:', error);
        console.error('🔴 Détails de l\'erreur:', error.message);
        console.error('🔴 Code d\'erreur:', error.code);
        console.error('🔴 User ID utilisé:', user.id);
        
        // ⚠️ MÊME EN CAS D'ERREUR, on continue vers le dashboard
        // L'essentiel est que le profil de base existe déjà
        toast({
          title: 'Profil partiellement sauvegardé',
          description: 'Certaines données n\'ont pas pu être sauvegardées, mais vous pouvez continuer.',
          variant: 'destructive'
        });
        
        // ✅ TOUJOURS appeler onComplete pour éviter de bloquer l'utilisateur
        console.log('🟡 Redirection vers dashboard malgré l\'erreur Supabase');
        onComplete();
        return;
      }

      console.log('🟢 Mise à jour Supabase réussie');

      toast({
        title: 'Bienvenue dans MyFitHero !',
        description: 'Votre profil a été créé avec succès.',
      });

      console.log('🟢 Redirection vers dashboard');
      onComplete();
      
    } catch (error) {
      console.error('🔴 Erreur lors de la finalisation:', error);
      
      // ⚠️ MÊME EN CAS D'ERREUR CRITIQUE, on redirige
      // Mieux vaut avoir un utilisateur sur le dashboard qu'en boucle d'inscription
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Une erreur est survenue, mais vous pouvez accéder à votre compte.',
        variant: 'destructive'
      });
      
      // ✅ TOUJOURS rediriger pour éviter la boucle infinie
      console.log('🟡 Redirection forcée vers dashboard après erreur');
      onComplete();
    }
  };

  return (
    <ConversationalOnboarding
      onComplete={handleConversationalComplete}
    />
  );
};

export default OnboardingQuestionnaire;
