import React, { useState, useCallback } from 'react';
import { Target, Clock, Moon, Sun, CheckCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { useSleepStore } from '../hooks/useSleepStore';
import { formatDuration } from '../utils/sleepConfig';

interface SleepGoalsProps {
  className?: string;
}

export const SleepGoals: React.FC<SleepGoalsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { currentGoal, setGoal, updateGoal, isLoading } = useSleepStore();

  const [isEditing, setIsEditing] = useState(!currentGoal);
  const [formData, setFormData] = useState({
    targetDuration: currentGoal?.targetDuration || 480, // 8h par défaut
    targetBedtime: currentGoal?.targetBedtime || '23:00',
    targetWakeTime: currentGoal?.targetWakeTime || '07:00',
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (currentGoal) {
          await updateGoal(currentGoal.id, formData);
          toast({
            title: 'Objectif mis à jour !',
            description: 'Vos nouveaux objectifs de sommeil ont été sauvegardés',
          });
        } else {
          await setGoal(formData);
          toast({
            title: 'Objectif défini !',
            description: 'Votre objectif de sommeil a été créé',
          });
        }

        setIsEditing(false);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: "Impossible de sauvegarder l'objectif",
          variant: 'destructive',
        });
      }
    },
    [currentGoal, formData, setGoal, updateGoal, toast]
  );

  const calculateDuration = useCallback(() => {
    const [bedHour, bedMin] = formData.targetBedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = formData.targetWakeTime.split(':').map(Number);

    let bedTimeMinutes = bedHour * 60 + bedMin;
    let wakeTimeMinutes = wakeHour * 60 + wakeMin;

    if (wakeTimeMinutes < bedTimeMinutes) {
      wakeTimeMinutes += 24 * 60;
    }

    return wakeTimeMinutes - bedTimeMinutes;
  }, [formData.targetBedtime, formData.targetWakeTime]);

  const duration = calculateDuration();

  if (!isEditing && currentGoal) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="mr-2" size={20} />
              Mes objectifs
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit size={16} className="mr-1" />
              Modifier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Objectif principal */}
            <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 mb-1">
                  {formatDuration(currentGoal.targetDuration)}
                </div>
                <div className="text-sm text-blue-600 font-medium">Objectif de sommeil</div>
              </div>
            </div>

            {/* Horaires */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Moon size={24} className="mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-lg">{currentGoal.targetBedtime}</div>
                <div className="text-sm text-gray-600">Coucher</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Sun size={24} className="mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-lg">{currentGoal.targetWakeTime}</div>
                <div className="text-sm text-gray-600">Réveil</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle size={14} className="mr-1" />
                Objectif actif
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2" size={20} />
          {currentGoal ? 'Modifier mes objectifs' : 'Définir mes objectifs'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Durée cible */}
          <div className="space-y-3">
            <Label>Durée de sommeil souhaitée</Label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="360"
                max="720"
                step="15"
                value={formData.targetDuration}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    targetDuration: parseInt(e.target.value),
                  }))
                }
                className="flex-1"
              />
              <div className="w-20 text-center font-bold text-blue-600">
                {formatDuration(formData.targetDuration)}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Horaires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetBedtime" className="flex items-center">
                <Moon size={16} className="mr-1" />
                Heure de coucher
              </Label>
              <Input
                id="targetBedtime"
                type="time"
                value={formData.targetBedtime}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    targetBedtime: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWakeTime" className="flex items-center">
                <Sun size={16} className="mr-1" />
                Heure de réveil
              </Label>
              <Input
                id="targetWakeTime"
                type="time"
                value={formData.targetWakeTime}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    targetWakeTime: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          {/* Durée calculée */}
          <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
            <Clock size={16} className="mr-2 text-blue-600" />
            <span className="font-medium text-blue-800">
              Durée calculée: {formatDuration(duration)}
            </span>
            {Math.abs(duration - formData.targetDuration) > 15 && (
              <Badge variant="secondary" className="ml-2">
                Ajustement automatique suggéré
              </Badge>
            )}
          </div>

          {/* Recommendations */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-800 font-medium mb-1">
              💡 Conseils pour atteindre vos objectifs
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Maintenez des horaires réguliers, même le week-end</li>
              <li>• Créez une routine de coucher relaxante</li>
              <li>• Évitez les écrans 1h avant l'heure de coucher</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sauvegarde...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="mr-2" size={18} />
                  {currentGoal ? 'Mettre à jour' : 'Définir objectif'}
                </div>
              )}
            </Button>

            {currentGoal && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
