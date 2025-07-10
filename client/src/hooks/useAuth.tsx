import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { authClient } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setLocation('/auth');
      toast({
        title: 'Déconnexion',
        description: 'À bientôt !',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la déconnexion',
        variant: 'destructive'
      });
    }
  }, [setLocation, toast]);

  return {
    handleSignOut
  };
};
