// client/src/components/DailyCheckIn.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserDataService, DailyCheckin } from '@/services/userDataService';
import { BadgeService } from '@/services/badgeService';
import { supabase } from '@/lib/supabase';

interface DailyCheckInProps {
  className?: string;
  onCheckInComplete?: (checkin: DailyCheckin) => void;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ 
  className = '', 
  onCheckInComplete 
}) => {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      await loadTodayCheckin(user.id);
    };

    initialize();
  }, []);

  const loadTodayCheckin = async (uid: string) => {
    try {
      setLoading(true);
      const todayCheckin = await UserDataService.getDailyCheckin(uid, today);
      
      if (todayCheckin) {
        setCheckin(todayCheckin);
      } else {
        // Créer un nouveau check-in par défaut
        const newCheckin: DailyCheckin = {
          id: '',
          user_id: uid,
          date: today,
          workout_completed: false,
          nutrition_logged: false,
          sleep_tracked: false,
          hydration_logged: false,
          mood_score: 5,
          energy_level: 5,
          notes: '',
          created_at: '',
          updated_at: ''
        };
        setCheckin(newCheckin);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du check-in:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du check-in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: keyof Pick<DailyCheckin, 'workout_completed' | 'nutrition_logged' | 'sleep_tracked' | 'hydration_logged'>) => {
    if (!checkin || !userId) return;

    const updatedCheckin = {
      ...checkin,
      [field]: !checkin[field]
    };

    setCheckin(updatedCheckin);
    await saveCheckin(updatedCheckin);
  };

  const saveCheckin = async (checkinData: DailyCheckin) => {
    if (!userId) return;

    try {
      setSaving(true);
      const success = await UserDataService.saveOrUpdateDailyCheckin({
        user_id: userId,
        date: today,
        workout_completed: checkinData.workout_completed,
        nutrition_logged: checkinData.nutrition_logged,
        sleep_tracked: checkinData.sleep_tracked,
        hydration_logged: checkinData.hydration_logged,
        mood_score: checkinData.mood_score,
        energy_level: checkinData.energy_level,
        notes: checkinData.notes
      });

      if (success) {
        // Vérifier les badges après chaque mise à jour
        await BadgeService.checkAndAwardBadges(userId);
        
        if (onCheckInComplete) {
          onCheckInComplete(checkinData);
        }

        // Afficher un toast de succès si le check-in est complet
        if (isCheckinComplete(checkinData)) {
          toast({
            title: "🎉 Check-in complet !",
            description: "Bravo ! Vous avez complété tous vos objectifs aujourd'hui.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du check-in:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le check-in",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const isCheckinComplete = (checkinData: DailyCheckin): boolean => {
    return checkinData.workout_completed &&
           checkinData.nutrition_logged &&
           checkinData.sleep_tracked &&
           checkinData.hydration_logged;
  };

  const getCompletionPercentage = (): number => {
    if (!checkin) return 0;
    
    const completed = [
      checkin.workout_completed,
      checkin.nutrition_logged,
      checkin.sleep_tracked,
      checkin.hydration_logged
    ].filter(Boolean).length;
    
    return Math.round((completed / 4) * 100);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Check-in Quotidien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checkin) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Check-in Quotidien</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">Erreur lors du chargement du check-in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Check-in Quotidien</span>
          <Badge variant={isCheckinComplete(checkin) ? "default" : "secondary"}>
            {getCompletionPercentage()}% complet
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Piliers */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={checkin.workout_completed ? "default" : "outline"}
            onClick={() => handleToggle('workout_completed')}
            disabled={saving}
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">🏋️‍♂️</span>
            <span className="text-sm">Workout</span>
          </Button>
          
          <Button
            variant={checkin.nutrition_logged ? "default" : "outline"}
            onClick={() => handleToggle('nutrition_logged')}
            disabled={saving}
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">🥗</span>
            <span className="text-sm">Nutrition</span>
          </Button>
          
          <Button
            variant={checkin.sleep_tracked ? "default" : "outline"}
            onClick={() => handleToggle('sleep_tracked')}
            disabled={saving}
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">😴</span>
            <span className="text-sm">Sommeil</span>
          </Button>
          
          <Button
            variant={checkin.hydration_logged ? "default" : "outline"}
            onClick={() => handleToggle('hydration_logged')}
            disabled={saving}
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-1">💧</span>
            <span className="text-sm">Hydratation</span>
          </Button>
        </div>

        {/* Indicateur de sauvegarde */}
        {saving && (
          <div className="flex items-center justify-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Sauvegarde en cours...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;
