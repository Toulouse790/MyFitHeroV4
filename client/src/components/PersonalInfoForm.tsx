// client/src/components/PersonalInfoForm.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, Briefcase, Check, Weight, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIFESTYLE_OPTIONS } from '@/data/onboardingData';

interface PersonalInfo {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
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
    weight: initialData?.weight || 0,
    height: initialData?.height || 0,
    lifestyle: initialData?.lifestyle || 'office_worker',
    availableTimePerDay: initialData?.availableTimePerDay || 60
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const tips = [
    "Métabolisme change avec l'âge",
    "Différences hormonales importantes",
    "Mesures précises = calculs justes",
    "Influence besoins énergétiques quotidiens",
    "Optimise programme selon disponibilité"
  ];

  const steps = [
    { id: 'age', title: 'Âge', icon: Calendar },
    { id: 'gender', title: 'Genre', icon: User },
    { id: 'morphology', title: 'Morphologie', icon: Weight },
    { id: 'lifestyle', title: 'Style de vie', icon: Briefcase },
    { id: 'time', title: 'Temps disponible', icon: Clock }
  ];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Age
        return formData.age >= 13 && formData.age <= 100;
      case 1: // Gender
        return ['male', 'female'].includes(formData.gender);
      case 2: // Morphology
        return formData.weight >= 45 && formData.weight <= 200 && 
               formData.height >= 120 && formData.height <= 230 &&
               formData.weight > 0 && formData.height > 0;
      case 3: // Lifestyle
        return LIFESTYLE_OPTIONS.some(option => option.id === formData.lifestyle);
      case 4: // Time
        return formData.availableTimePerDay >= 15 && formData.availableTimePerDay <= 300;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setShowTip(false); // Fermer le conseil quand on passe à l'étape suivante
      if (currentStep === steps.length - 1) {
        onComplete(formData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setShowTip(false); // Fermer le conseil quand on revient en arrière
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">Quel âge avez-vous ?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="h-8 w-8 p-0"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Cela nous aide à personnaliser vos programmes</p>
              {showTip && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(false)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {tips[0]}
                </div>
              )}
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">Quel est votre genre ?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="h-8 w-8 p-0"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Pour des recommandations plus précises</p>
              {showTip && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(false)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {tips[1]}
                </div>
              )}
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

      case 2: // Morphology
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Weight className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">Votre morphologie</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="h-8 w-8 p-0"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Nous avons besoin de ces informations pour des calculs précis</p>
              {showTip && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(false)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {tips[2]}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Poids */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Poids (kg) : {formData.weight || 70}
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="45"
                    max="200"
                    value={formData.weight || 70}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>45 kg</span>
                    <span>200 kg</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="45"
                    max="200"
                    value={formData.weight || ''}
                    placeholder="70"
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">kg</span>
                </div>
              </div>

              {/* Taille */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Taille (cm) : {formData.height || 175}
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="120"
                    max="230"
                    value={formData.height || 175}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>120 cm</span>
                    <span>230 cm</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={formData.height || ''}
                    placeholder="175"
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">cm</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Lifestyle
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">Quel est votre style de vie ?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="h-8 w-8 p-0"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Cela influence vos besoins nutritionnels et d'entraînement</p>
              {showTip && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(false)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {tips[3]}
                </div>
              )}
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

      case 4: // Time
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">Temps disponible par jour</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="h-8 w-8 p-0"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">Combien de temps pouvez-vous consacrer à votre santé ?</p>
              {showTip && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(false)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {tips[4]}
                </div>
              )}
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
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  index < currentStep 
                    ? "bg-blue-500 border-blue-500 text-white"
                    : index === currentStep 
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-gray-100 border-gray-300 text-gray-400"
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
          {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
