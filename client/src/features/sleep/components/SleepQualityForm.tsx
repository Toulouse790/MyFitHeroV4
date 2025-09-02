import React, { useState, useCallback } from 'react';
import { Plus, Clock, Moon, Sun, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { useSleepStore } from '../hooks/useSleepStore';
import { defaultSleepFactors, calculateSleepDuration } from '../utils/sleepConfig';

interface SleepQualityFormProps {
  onComplete?: () => void;
  className?: string;
}

export const SleepQualityForm: React.FC<SleepQualityFormProps> = ({
  onComplete,
  className = '',
}) => {
  const { toast } = useToast();
  const { addEntry, isLoading } = useSleepStore();

  const [formData, setFormData] = useState({
    bedtime: '',
    wakeTime: '',
    quality: 5,
    notes: '',
  });

  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.bedtime) {
      newErrors.bedtime = 'Heure de coucher requise';
    }

    if (!formData.wakeTime) {
      newErrors.wakeTime = 'Heure de réveil requise';
    }

    if (formData.bedtime && formData.wakeTime) {
      const duration = calculateSleepDuration(formData.bedtime, formData.wakeTime);
      if (duration < 60) {
        newErrors.duration = 'Durée de sommeil trop courte (minimum 1h)';
      }
      if (duration > 720) {
        newErrors.duration = 'Durée de sommeil trop longue (maximum 12h)';
      }
    }

    if (formData.quality < 1 || formData.quality > 10) {
      newErrors.quality = 'Qualité doit être entre 1 et 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez corriger les erreurs dans le formulaire',
          variant: 'destructive',
        });
        return;
      }

      try {
        const duration = calculateSleepDuration(formData.bedtime, formData.wakeTime);
        const factors = selectedFactors.map(
          factorId => defaultSleepFactors.find(f => f.id === factorId)!
        );

        await addEntry({
          bedtime: formData.bedtime,
          wakeTime: formData.wakeTime,
          duration,
          quality: formData.quality,
          factors,
          notes: formData.notes || undefined,
        });

        toast({
          title: 'Sommeil enregistré !',
          description: `${Math.floor(duration / 60)}h${duration % 60}min de sommeil ajouté`,
        });

        // Reset form
        setFormData({
          bedtime: '',
          wakeTime: '',
          quality: 5,
          notes: '',
        });
        setSelectedFactors([]);
        setErrors({});

        onComplete?.();
      } catch {
        toast({
          title: 'Erreur',
          description: "Impossible d'enregistrer le sommeil",
          variant: 'destructive',
        });
      }
    },
    [formData, selectedFactors, validateForm, addEntry, toast, onComplete]
  );

  const toggleFactor = useCallback((factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId) ? prev.filter(id => id !== factorId) : [...prev, factorId]
    );
  }, []);

  const duration =
    formData.bedtime && formData.wakeTime
      ? calculateSleepDuration(formData.bedtime, formData.wakeTime)
      : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2" size={20} />
          Enregistrer une nuit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horaires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime" className="flex items-center">
                <Moon size={16} className="mr-1" />
                Coucher
              </Label>
              <Input
                id="bedtime"
                type="time"
                value={formData.bedtime}
                onChange={e => setFormData(prev => ({ ...prev, bedtime: e.target.value }))}
                className={errors.bedtime ? 'border-red-500' : ''}
                required
              />
              {errors.bedtime && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.bedtime}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wakeTime" className="flex items-center">
                <Sun size={16} className="mr-1" />
                Réveil
              </Label>
              <Input
                id="wakeTime"
                type="time"
                value={formData.wakeTime}
                onChange={e => setFormData(prev => ({ ...prev, wakeTime: e.target.value }))}
                className={errors.wakeTime ? 'border-red-500' : ''}
                required
              />
              {errors.wakeTime && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.wakeTime}
                </p>
              )}
            </div>
          </div>

          {/* Durée calculée */}
          {duration > 0 && (
            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
              <Clock size={16} className="mr-2 text-blue-600" />
              <span className="font-medium text-blue-800">
                Durée: {Math.floor(duration / 60)}h{duration % 60}min
              </span>
              {duration < 360 && (
                <Badge variant="destructive" className="ml-2">
                  Trop court
                </Badge>
              )}
              {duration > 600 && (
                <Badge variant="secondary" className="ml-2">
                  Très long
                </Badge>
              )}
            </div>
          )}

          {errors.duration && (
            <p className="text-red-500 text-sm flex items-center justify-center">
              <AlertTriangle size={14} className="mr-1" />
              {errors.duration}
            </p>
          )}

          {/* Qualité */}
          <div className="space-y-3">
            <Label>Qualité du sommeil (1-10)</Label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.quality}
                onChange={e =>
                  setFormData(prev => ({ ...prev, quality: parseInt(e.target.value) }))
                }
                className="flex-1"
              />
              <div
                className={`w-12 text-center font-bold ${
                  formData.quality >= 8
                    ? 'text-green-600'
                    : formData.quality >= 6
                      ? 'text-blue-600'
                      : formData.quality >= 4
                        ? 'text-yellow-600'
                        : 'text-red-600'
                }`}
              >
                {formData.quality}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Très mauvais</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Facteurs */}
          <div className="space-y-3">
            <Label>Facteurs ayant influencé votre sommeil</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {defaultSleepFactors.map(factor => (
                <button
                  key={factor.id}
                  type="button"
                  onClick={() => toggleFactor(factor.id)}
                  className={`text-left p-2 rounded-lg border transition-colors ${
                    selectedFactors.includes(factor.id)
                      ? factor.type === 'positive'
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant={factor.type === 'positive' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {factor.type === 'positive' ? '+' : '-'}
                      </Badge>
                      {selectedFactors.includes(factor.id) && (
                        <CheckCircle size={16} className="text-blue-600" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes personnelles (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails sur votre nuit, rêves, ressenti..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enregistrement...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={18} />
                Enregistrer cette nuit
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
