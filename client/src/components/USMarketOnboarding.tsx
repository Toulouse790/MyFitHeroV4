// client/src/components/USMarketOnboarding.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { UnitDisplay } from './UnitDisplay';
import { Flag, Target, Dumbbell, Calendar } from 'lucide-react';

interface USUserProfile {
  name: string;
  age: number;
  weight: number; // Always stored in kg
  height: number; // Always stored in cm
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  timezone: string;
}

interface USMarketOnboardingProps {
  onComplete: (profile: USUserProfile) => void;
}

export const USMarketOnboarding: React.FC<USMarketOnboardingProps> = ({ onComplete }) => {
  const { preferences } = useUnitPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<USUserProfile>({
    name: '',
    age: 25,
    weight: 70, // kg
    height: 175, // cm
    fitnessLevel: 'beginner',
    goals: [],
    timezone: 'America/New_York'
  });

  const steps = [
    { title: 'Welcome to MyFitHero', icon: Flag },
    { title: 'Personal Information', icon: Calendar },
    { title: 'Fitness Goals', icon: Target },
    { title: 'Experience Level', icon: Dumbbell }
  ];

  const fitnessGoals = [
    { id: 'weight_loss', label: 'Lose Weight', popular: true },
    { id: 'muscle_gain', label: 'Build Muscle', popular: true },
    { id: 'endurance', label: 'Improve Endurance', popular: false },
    { id: 'strength', label: 'Get Stronger', popular: true },
    { id: 'flexibility', label: 'Increase Flexibility', popular: false },
    { id: 'general_fitness', label: 'General Fitness', popular: true }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profile);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Convert to kg if user entered lbs
      const weightInKg = preferences.weight === 'lbs' 
        ? numValue * 0.453592 
        : numValue;
      setProfile(prev => ({ ...prev, weight: weightInKg }));
    }
  };

  const handleHeightChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Convert to cm if user entered ft
      const heightInCm = preferences.height === 'ft/in' 
        ? numValue * 30.48 
        : numValue;
      setProfile(prev => ({ ...prev, height: heightInCm }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🇺🇸</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to MyFitHero!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your personal fitness journey starts here. We'll customize everything 
              to your preferences, including units and terminology you're familiar with.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>🎯 Designed for American users:</strong> We use pounds, feet/inches, 
                and Fahrenheit by default - just like you're used to!
              </p>
            </div>
          </div>
        );

      case 1: // Personal Info
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tell us about yourself
              </h3>
              <p className="text-gray-600 text-sm">
                This helps us create a personalized experience for you
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  placeholder="Your age"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">
                    Weight ({preferences.weight === 'lbs' ? 'lbs' : 'kg'})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={preferences.weight === 'lbs' ? (profile.weight * 2.20462).toFixed(1) : profile.weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    placeholder={preferences.weight === 'lbs' ? '155' : '70'}
                  />
                </div>

                <div>
                  <Label htmlFor="height">
                    Height ({preferences.height === 'ft/in' ? 'feet' : 'cm'})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={preferences.height === 'ft/in' ? (profile.height / 30.48).toFixed(1) : profile.height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder={preferences.height === 'ft/in' ? '5.75' : '175'}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Your measurements: <UnitDisplay value={profile.weight} type="weight" className="font-medium" /> 
                  {' • '}
                  <UnitDisplay value={profile.height} type="height" className="font-medium" />
                </p>
              </div>
            </div>
          </div>
        );

      case 2: // Goals
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                What are your fitness goals?
              </h3>
              <p className="text-gray-600 text-sm">
                Select all that apply - we'll customize your experience
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {fitnessGoals.map((goal) => (
                <Button
                  key={goal.id}
                  variant={profile.goals.includes(goal.id) ? 'default' : 'outline'}
                  onClick={() => handleGoalToggle(goal.id)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <span className="font-medium">{goal.label}</span>
                  {goal.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {profile.goals.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Great choice!</strong> You've selected {profile.goals.length} goal{profile.goals.length > 1 ? 's' : ''}. 
                  We'll create a personalized plan for you.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Experience Level
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                What's your fitness experience?
              </h3>
              <p className="text-gray-600 text-sm">
                This helps us adjust workout intensity and recommendations
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'New to fitness or getting back into it' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Regular exercise routine, some experience' },
                { id: 'advanced', label: 'Advanced', desc: 'Experienced with consistent training' }
              ].map((level) => (
                <Button
                  key={level.id}
                  variant={profile.fitnessLevel === level.id ? 'default' : 'outline'}
                  onClick={() => setProfile(prev => ({ ...prev, fitnessLevel: level.id as any }))}
                  className="w-full h-auto p-4 flex flex-col items-start text-left"
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-gray-500">{level.desc}</div>
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <Badge variant="outline">
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={(currentStep + 1) / steps.length * 100} className="mt-2" />
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!profile.name || !profile.age)) ||
              (currentStep === 2 && profile.goals.length === 0)
            }
          >
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
