// client/src/components/PersonalInfoForm.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, Briefcase, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIFESTYLE_OPTIONS } from '@/data/onboardingData';

interface PersonalInfo {
  age: number;
  gender: 'male' | 'female';
  lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired';
  availableTimePerDay: number;
}

interface PersonalInfoFormProps {
  onComplete: (data: PersonalInfo) => void;
  initialData?: Partial<PersonalInfo>;
}

export default function PersonalInfoForm({ onComplete, initialData }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    age: initialData?.age || 25,
    gender: initialData?.gender || 'male',
    lifestyle: initialData?.lifestyle || 'office_worker',
    availableTimePerDay: initialData?.availableTimePerDay || 60
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'age', title: 'Âge', icon: Calendar },
    { id: 'gender', title: 'Genre', icon: User },
    { id: 'lifestyle', title: 'Style de vie', icon: Briefcase },
    { id: 'time', title: 'Temps disponible', icon: Clock }
  ];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Age
        return formData.age >= 13 && formData.age <= 100;
      case 1: // Gender
        return ['male', 'female'].includes(formData.gender);
      case 2: // Lifestyle
        return LIFESTYLE_OPTIONS.some(option => option.id === formData.lifestyle);
      case 3: // Time
        return formData.availableTimePerDay >= 15 && formData.availableTimePerDay <= 300;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === steps.length - 1) {
        onComplete(formData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Age
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Quel âge avez-vous ?</h3>
              <p className="text-gray-600">Cela nous aide à personnaliser vos programmes</p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-blue-600">{formData.age} ans</span>
              </div>
              
              <div className="px-4">
                <Slider
                  value={[formData.age]}
                  onValueChange={(value) => setFormData({...formData, age: value[0]})}
                  min={13}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>13 ans</span>
                  <span>100 ans</span>
                </div>
              </div>
              
              <div className="text-center">
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                  className="w-24 mx-auto text-center"
                  min="13"
                  max="100"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Gender
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Quel est votre genre ?</h3>
              <p className="text-gray-600">Pour des recommandations plus précises</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'male', label: 'Homme', emoji: '👨' },
                { id: 'female', label: 'Femme', emoji: '👩' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFormData({...formData, gender: option.id as 'male' | 'female'})}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
                    formData.gender === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{option.label}</div>
                    </div>
                    {formData.gender === option.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Lifestyle
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Quel est votre style de vie ?</h3>
              <p className="text-gray-600">Cela influence vos besoins nutritionnels et d'entraînement</p>
            </div>
            
            <div className="space-y-3">
              {LIFESTYLE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFormData({...formData, lifestyle: option.id as 'student' | 'office_worker' | 'physical_job' | 'retired'})}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
                    formData.lifestyle === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    {formData.lifestyle === option.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Time
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Temps disponible par jour</h3>
              <p className="text-gray-600">Combien de temps pouvez-vous consacrer à votre santé ?</p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-blue-600">
                  {formData.availableTimePerDay} min
                </span>
              </div>
              
              <div className="px-4">
                <Slider
                  value={[formData.availableTimePerDay]}
                  onValueChange={(value) => setFormData({...formData, availableTimePerDay: value[0]})}
                  min={15}
                  max={300}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>15 min</span>
                  <span>5h</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {[30, 45, 60, 90, 120, 180].map((time) => (
                  <button
                    key={time}
                    onClick={() => setFormData({...formData, availableTimePerDay: time})}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all duration-200",
                      formData.availableTimePerDay === time
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-semibold">{time} min</div>
                    <div className="text-xs text-gray-600">
                      {time === 30 && "Rapide"}
                      {time === 45 && "Optimal"}
                      {time === 60 && "Complet"}
                      {time === 90 && "Étendu"}
                      {time === 120 && "Intensif"}
                      {time === 180 && "Dévoué"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                {/* eslint-disable-next-line tailwindcss/no-contradicting-classname */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  {
                    "bg-blue-500 border-blue-500 text-white": index < currentStep,
                    "bg-blue-50 border-blue-500 text-blue-600": index === currentStep,
                    "bg-gray-100 border-gray-300 text-gray-400": index > currentStep
                  }
                )}>
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2 transition-all duration-200",
                    index < currentStep ? "bg-blue-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <Badge variant="outline" className="text-sm">
            Étape {currentStep + 1} sur {steps.length}
          </Badge>
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 0}
          className="flex items-center"
        >
          Précédent
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!validateCurrentStep()}
          className="flex items-center"
        >
          {currentStep === steps.length - 1 ? 'Continuer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
