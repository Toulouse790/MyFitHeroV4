// client/src/components/PersonalInfoFormI18n.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { User, Calendar, Clock, Briefcase, Check, Weight, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIFESTYLE_OPTIONS } from '@/data/onboardingData';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { convertWeight, convertHeight } from '@/lib/unitConversions';

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
  const { t } = useTranslation('onboarding');
  const { preferences } = useUnitPreferences();
  
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

  // Conversion des unités pour l'affichage
  const displayWeight = preferences.weight === 'lbs' ? convertWeight(formData.weight, 'kg', 'lbs') : formData.weight;
  const displayHeight = preferences.height === 'ft/in' ? convertHeight(formData.height, 'cm', 'ft/in') : formData.height;

  const tips = [
    t('steps.age.tip'),
    t('steps.gender.tip'),
    t('steps.morphology.tip'),
    t('steps.lifestyle.tip'),
    t('steps.time.tip')
  ];

  const steps = [
    { id: 'age', title: t('steps.age.title'), icon: Calendar },
    { id: 'gender', title: t('steps.gender.title'), icon: User },
    { id: 'morphology', title: t('steps.morphology.title'), icon: Weight },
    { id: 'lifestyle', title: t('steps.lifestyle.title'), icon: Briefcase },
    { id: 'time', title: t('steps.time.title'), icon: Clock }
  ];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Age
        return formData.age >= 13 && formData.age <= 120;
      case 1: // Gender
        return formData.gender !== null;
      case 2: // Morphology
        return formData.weight > 0 && formData.height > 0;
      case 3: // Lifestyle
        return formData.lifestyle !== null;
      case 4: // Time
        return formData.availableTimePerDay > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Toujours stocker en kg
      const weightInKg = preferences.weight === 'lbs' ? convertWeight(numValue, 'lbs', 'kg') : numValue;
      setFormData({ ...formData, weight: weightInKg });
    }
  };

  const handleHeightChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Toujours stocker en cm
      const heightInCm = preferences.height === 'ft/in' ? convertHeight(numValue, 'ft/in', 'cm') : numValue;
      setFormData({ ...formData, height: heightInCm });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Age
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('steps.age.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('steps.age.subtitle')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formData.age}
                </div>
                <div className="text-sm text-gray-500">
                  years
                </div>
              </div>
              
              <Slider
                value={[formData.age]}
                onValueChange={(value) => setFormData({...formData, age: value[0]})}
                max={100}
                min={13}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>13</span>
                <span>100</span>
              </div>
            </div>
          </div>
        );

      case 1: // Gender
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('steps.gender.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('steps.gender.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.gender === 'male' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, gender: 'male'})}
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <User className="h-6 w-6" />
                <span>{t('steps.gender.options.male')}</span>
              </Button>
              
              <Button
                variant={formData.gender === 'female' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, gender: 'female'})}
                className="h-16 flex flex-col items-center justify-center space-y-2"
              >
                <User className="h-6 w-6" />
                <span>{t('steps.gender.options.female')}</span>
              </Button>
            </div>
          </div>
        );

      case 2: // Morphology
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('steps.morphology.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('steps.morphology.subtitle')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('steps.morphology.weight')} ({preferences.weight === 'lbs' ? 'lbs' : 'kg'})
                </label>
                <Input
                  type="number"
                  value={displayWeight || ''}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder={preferences.weight === 'lbs' ? '155' : '70'}
                  className="text-center text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('steps.morphology.height')} ({preferences.height === 'ft/in' ? 'ft/in' : 'cm'})
                </label>
                <Input
                  type="number"
                  value={displayHeight || ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder={preferences.height === 'ft/in' ? '5.75' : '175'}
                  className="text-center text-lg"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Lifestyle
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('steps.lifestyle.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('steps.lifestyle.subtitle')}
              </p>
            </div>
            
            <div className="space-y-3">
              {LIFESTYLE_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={formData.lifestyle === option.id ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, lifestyle: option.id as "student" | "office_worker" | "physical_job" | "retired"})}
                  className="w-full h-16 flex items-center justify-between p-4"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                  {formData.lifestyle === option.id && <Check className="h-5 w-5" />}
                </Button>
              ))}
            </div>
          </div>
        );

      case 4: // Time
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('steps.time.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('steps.time.subtitle')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formData.availableTimePerDay}
                </div>
                <div className="text-sm text-gray-500">
                  minutes
                </div>
              </div>
              
              <Slider
                value={[formData.availableTimePerDay]}
                onValueChange={(value) => setFormData({...formData, availableTimePerDay: value[0]})}
                max={180}
                min={15}
                step={15}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>15 min</span>
                <span>180 min</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress
            </span>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between items-center mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                index === currentStep
                  ? "bg-blue-600 text-white"
                  : index < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              )}>
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Tip */}
        {showTip && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Tip
                </p>
                <p className="text-sm text-blue-700">
                  {tips[currentStep]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTip(false)}
                className="ml-auto p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <span>Previous</span>
          </Button>

          <Button
            onClick={() => setShowTip(!showTip)}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Star className="h-4 w-4" />
            <span>Tip</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!validateCurrentStep()}
            className="flex items-center space-x-2"
          >
            <span>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
