// client/src/components/ConversationalOnboarding.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Star, 
  Check, 
  AlertCircle, 
  User,
  Target,
  Zap,
  Heart,
  Shield,
  Settings,
  BookOpen,
  Award,
  Coffee,
  Moon,
  Droplets,
  Brain,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  ConversationalStep, 
  OnboardingData,
  ValidationRule,
  QuestionOption
} from '@/types/conversationalOnboarding';
import { 
  CONVERSATIONAL_ONBOARDING_FLOW,
  getConditionalNextStep,
  calculateEstimatedTime
} from '@/data/conversationalFlow';
import { 
  AVAILABLE_SPORTS, 
  MAIN_OBJECTIVES, 
  AVAILABLE_MODULES,
  LIFESTYLE_OPTIONS,
  DIETARY_PREFERENCES,
  STRENGTH_OBJECTIVES,
  NUTRITION_OBJECTIVES,
  FITNESS_EXPERIENCE_LEVELS,
  EQUIPMENT_LEVELS,
  SPORT_LEVELS,
  SEASON_PERIODS,
  TRAINING_AVAILABILITY,
  HEALTH_CONDITIONS
} from '@/data/onboardingData';
import { 
  SMART_PACKS, 
  getQuestionsForPack, 
  shouldAskQuestion,
  getRecommendedPacks,
  getEstimatedTimeForPack 
} from '@/data/smartPacks';
import SportSelector from './SportSelector';
import PositionSelector from './PositionSelector';
import PersonalInfoForm from './PersonalInfoForm';
import PackSelector from './PackSelector';
import { useSports } from '@/services/sportsService';
import { SportOption } from '@/types/onboarding';

// Utility function to combine classNames
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface ConversationalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  initialData?: Partial<OnboardingData>;
  debug?: boolean;
}

interface OnboardingState {
  currentStepId: string;
  data: OnboardingData;
  currentResponse: any;
  validationErrors: string[];
  isLoading: boolean;
  showTips: boolean;
  selectedSport: SportOption | null;
  stepHistory: string[];
  completedModuleSteps: Record<string, string[]>;
  skipCount: number;
  startTime: Date;
  availableSteps: string[]; // Étapes disponibles selon le pack
}

export default function ConversationalOnboarding({ 
  onComplete, 
  onSkip, 
  initialData = {},
  debug = false 
}: ConversationalOnboardingProps) {
  const { toast } = useToast();
  const { sports: dynamicSports, isLoading: sportsLoading } = useSports();

  // État principal consolidé
  const [state, setState] = useState<OnboardingState>(() => ({
    currentStepId: CONVERSATIONAL_ONBOARDING_FLOW.initialStep,
    data: {
      ...initialData,
      progress: {
        currentStep: CONVERSATIONAL_ONBOARDING_FLOW.initialStep,
        completedSteps: [],
        skippedSteps: [],
        totalSteps: CONVERSATIONAL_ONBOARDING_FLOW.steps.length,
        estimatedTimeLeft: 15,
        timeSpent: 0,
        startedAt: new Date(),
        lastActivity: new Date(),
        averageTimePerStep: 0,
        skipCount: 0,
        backCount: 0,
        errorCount: 0,
        helpViewCount: 0,
        moduleSpecificSteps: {},
        userPreferences: {
          preferredInputTypes: [],
          skipsTendency: 0,
          detailLevel: 'standard',
          pace: 'normal'
        },
        completionQuality: 0,
        validationScore: 100,
        consistencyScore: 100
      },
      version: '1.0',
      startedAt: new Date(),
      lastUpdated: new Date(),
      // Valeurs par défaut
      selectedPack: initialData.selectedPack || null,
      selectedModules: initialData.selectedModules || [],
      firstName: initialData.firstName || '',
      age: initialData.age || null,
      gender: initialData.gender || undefined,
      lifestyle: initialData.lifestyle || undefined,
      mainObjective: initialData.mainObjective || undefined,
      sport: initialData.sport || '',
      sportPosition: initialData.sportPosition || '',
      sportLevel: initialData.sportLevel || undefined,
      seasonPeriod: initialData.seasonPeriod || undefined,
      trainingFrequency: initialData.trainingFrequency || '',
      equipmentLevel: initialData.equipmentLevel || undefined,
      strengthObjective: initialData.strengthObjective || undefined,
      strengthExperience: initialData.strengthExperience || undefined,
      dietaryPreference: initialData.dietaryPreference || undefined,
      foodAllergies: initialData.foodAllergies || [],
      nutritionObjective: initialData.nutritionObjective || undefined,
      dietaryRestrictions: initialData.dietaryRestrictions || [],
      averageSleepHours: initialData.averageSleepHours || 8,
      sleepDifficulties: initialData.sleepDifficulties || [],
      hydrationGoal: initialData.hydrationGoal || 2.5,
      hydrationReminders: initialData.hydrationReminders || true,
      motivation: initialData.motivation || '',
      availableTimePerDay: initialData.availableTimePerDay || 60,
      privacyConsent: initialData.privacyConsent || false,
      marketingConsent: initialData.marketingConsent || false,
      healthConditions: initialData.healthConditions || [],
      fitnessGoals: initialData.fitnessGoals || [],
      currentWeight: initialData.currentWeight || null,
      targetWeight: initialData.targetWeight || null,
      height: initialData.height || null
    },
    currentResponse: null,
    validationErrors: [],
    isLoading: false,
    showTips: false,
    selectedSport: null,
    stepHistory: [],
    completedModuleSteps: {},
    skipCount: 0,
    startTime: new Date(),
    availableSteps: [] // Sera mis à jour selon le pack
  }));

  // Mise à jour des étapes disponibles selon le pack
  useEffect(() => {
    if (state.data.selectedPack) {
      const steps = getQuestionsForPack(state.data.selectedPack, state.data.selectedModules);
      setState(prev => ({ ...prev, availableSteps: steps }));
      
      // Mettre à jour le nombre total d'étapes
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          progress: {
            ...prev.data.progress,
            totalSteps: steps.length
          }
        }
      }));
    }
  }, [state.data.selectedPack, state.data.selectedModules]);

  // Récupération de l'étape courante
  const currentStep = useMemo(() => {
    // Si pack sélectionné, vérifier si l'étape est dans le flow du pack
    if (state.data.selectedPack && !state.availableSteps.includes(state.currentStepId)) {
      // Trouver la prochaine étape valide
      const validSteps = state.availableSteps;
      const nextValidStep = validSteps.find(stepId => 
        !state.data.progress.completedSteps.includes(stepId)
      );
      
      if (nextValidStep && nextValidStep !== state.currentStepId) {
        setState(prev => ({ ...prev, currentStepId: nextValidStep }));
        return CONVERSATIONAL_ONBOARDING_FLOW.steps.find(step => step.id === nextValidStep);
      }
    }
    
    return CONVERSATIONAL_ONBOARDING_FLOW.steps.find(step => step.id === state.currentStepId);
  }, [state.currentStepId, state.data.selectedPack, state.availableSteps, state.data.progress.completedSteps]);

  // Calcul du pourcentage de progression
  const progressPercentage = useMemo(() => {
    const completed = state.data.progress.completedSteps.length;
    const total = state.data.progress.totalSteps;
    return Math.round((completed / total) * 100);
  }, [state.data.progress.completedSteps.length, state.data.progress.totalSteps]);

  // Mise à jour du temps estimé
  useEffect(() => {
    const updateEstimatedTime = () => {
      const elapsed = (new Date().getTime() - state.startTime.getTime()) / 1000 / 60;
      const completed = state.data.progress.completedSteps.length;
      const remaining = state.data.progress.totalSteps - completed;
      const avgTimePerStep = completed > 0 ? elapsed / completed : 1.5;
      const estimatedRemaining = Math.max(2, Math.round(remaining * avgTimePerStep));
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          progress: {
            ...prev.data.progress,
            estimatedTimeLeft: estimatedRemaining
          }
        }
      }));
    };

    const interval = setInterval(updateEstimatedTime, 30000);
    return () => clearInterval(interval);
  }, [state.startTime, state.data.progress.completedSteps.length, state.data.progress.totalSteps]);

  // Validation des réponses
  const validateResponse = useCallback((step: ConversationalStep, response: any): string[] => {
    const errors: string[] = [];
    
    if (!step.validation) return errors;
    
    step.validation.forEach((rule: ValidationRule) => {
      switch (rule.type) {
        case 'required':
          if (!response || 
              (Array.isArray(response) && response.length === 0) ||
              (typeof response === 'string' && response.trim() === '')) {
            errors.push(rule.message);
          }
          break;
          
        case 'min':
          if (typeof response === 'string' && response.length < rule.value) {
            errors.push(rule.message);
          } else if (typeof response === 'number' && response < rule.value) {
            errors.push(rule.message);
          } else if (Array.isArray(response) && response.length < rule.value) {
            errors.push(rule.message);
          }
          break;
          
        case 'max':
          if (typeof response === 'string' && response.length > rule.value) {
            errors.push(rule.message);
          } else if (typeof response === 'number' && response > rule.value) {
            errors.push(rule.message);
          } else if (Array.isArray(response) && response.length > rule.value) {
            errors.push(rule.message);
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof response === 'string' && !emailRegex.test(response)) {
            errors.push(rule.message);
          }
          break;
          
        case 'range':
          if (typeof response === 'number' && 
              (response < rule.min || response > rule.max)) {
            errors.push(rule.message);
          }
          break;
          
        case 'custom':
          if (rule.validator && !rule.validator(response, state.data)) {
            errors.push(rule.message);
          }
          break;
          
        default:
          console.warn(`Type de validation non reconnu: ${rule.type}`);
      }
    });
    
    return errors;
  }, [state.data]);

  // Fonction utilitaire pour obtenir la clé de données
  const getDataKeyForStep = useCallback((stepId: string): keyof OnboardingData => {
    const keyMap: Record<string, keyof OnboardingData> = {
      'welcome': 'firstName',
      'get_name': 'firstName',
      'main_objective': 'mainObjective',
      'pack_selection': 'selectedPack',
      'module_selection': 'selectedModules',
      'personal_info': 'age',
      'sport_selection': 'sport',
      'sport_position': 'sportPosition',
      'sport_level': 'sportLevel',
      'sport_equipment': 'equipmentLevel',
      'season_period': 'seasonPeriod',
      'training_frequency': 'trainingFrequency',
      'strength_setup': 'strengthObjective',
      'strength_experience': 'strengthExperience',
      'nutrition_setup': 'dietaryPreference',
      'nutrition_objective': 'nutritionObjective',
      'nutrition_allergies': 'foodAllergies',
      'sleep_setup': 'averageSleepHours',
      'sleep_difficulties': 'sleepDifficulties',
      'hydration_setup': 'hydrationGoal',
      'hydration_reminders': 'hydrationReminders',
      'wellness_assessment': 'healthConditions',
      'final_questions': 'motivation',
      'privacy_consent': 'privacyConsent',
      'marketing_consent': 'marketingConsent',
      'body_composition': 'currentWeight',
      'fitness_goals': 'fitnessGoals'
    };
    
    return keyMap[stepId] || 'firstName';
  }, []);

  // Sauvegarde des données en base
  const saveProgress = useCallback(async (data: OnboardingData) => {
    if (debug) {
      console.log('🟡 [DEBUG] Début de saveProgress avec data:', data);
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        if (debug) {
          console.error('🔴 [DEBUG] Aucun utilisateur connecté');
        }
        return;
      }

      // Mapping des valeurs pour la base de données
      const mapFitnessGoal = (mainObjective: string): string => {
        const mapping: Record<string, string> = {
          'performance': 'performance',
          'health_wellness': 'general_health',
          'body_composition': 'muscle_gain',
          'energy_sleep': 'energy',
          'strength_building': 'strength',
          'endurance_cardio': 'endurance',
          'recovery_focus': 'recovery',
          'weight_management': 'maintenance',
          'weight_loss': 'weight_loss',
          'muscle_gain': 'muscle_gain',
          'holistic': 'general'
        };
        return mapping[mainObjective] || 'general';
      };

      const mapSportLevel = (sportLevel: string): string => {
        const mapping: Record<string, string> = {
          'recreational': 'recreational',
          'amateur_competitive': 'amateur_competitive',
          'club_competitive': 'amateur_competitive',
          'semi_professional': 'semi_professional',
          'professional': 'professional',
          'beginner': 'recreational',
          'intermediate': 'amateur_competitive',
          'advanced': 'semi_professional',
          'expert': 'professional'
        };
        return mapping[sportLevel] || 'recreational';
      };

      const upsertData = {
        id: user.id,
        first_name: data.firstName || null,
        age: data.age || null,
        gender: data.gender || null,
        height: data.height || null,
        current_weight: data.currentWeight || null,
        target_weight: data.targetWeight || null,
        lifestyle: data.lifestyle || null,
        fitness_goal: mapFitnessGoal(data.mainObjective || ''),
        fitness_goals: data.fitnessGoals || [],
        modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
        active_modules: data.selectedModules || ['sport', 'nutrition', 'sleep', 'hydration'],
        sport: data.sport || null,
        sport_position: data.sportPosition || null,
        sport_level: mapSportLevel(data.sportLevel || ''),
        season_period: data.seasonPeriod || null,
        training_frequency: data.trainingFrequency || null,
        available_time_per_day: data.availableTimePerDay || 60,
        equipment_level: data.equipmentLevel || null,
        strength_objective: data.strengthObjective || null,
        strength_experience: data.strengthExperience || null,
        dietary_preference: data.dietaryPreference || null,
        food_allergies: data.foodAllergies || [],
        nutrition_objective: data.nutritionObjective || null,
        dietary_restrictions: data.dietaryRestrictions || [],
        sleep_hours_average: data.averageSleepHours || 8,
        sleep_difficulties: data.sleepDifficulties || [],
        water_intake_goal: data.hydrationGoal || 2.5,
        hydration_reminders: data.hydrationReminders !== undefined ? data.hydrationReminders : true,
        health_conditions: data.healthConditions || [],
        motivation: data.motivation || null,
        privacy_consent: data.privacyConsent || false,
        marketing_consent: data.marketingConsent || false,
        onboarding_completed: false,
        updated_at: new Date().toISOString()
      };
      
      if (debug) {
        console.log('🟡 [DEBUG] Données préparées pour upsert:', upsertData);
      }
      
      const { data: insertedData, error } = await supabase
        .from('user_profiles')
        .upsert(upsertData, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error('🔴 Erreur sauvegarde Supabase:', error);
        throw error;
      } else {
        if (debug) {
          console.log('🟢 [DEBUG] Sauvegarde Supabase réussie:', insertedData);
        }
      }
    } catch (error) {
      console.error('🔴 Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder vos données. Vos réponses sont conservées temporairement.",
        variant: "destructive",
      });
    }
  }, [debug, toast]);

  // Navigation vers l'étape suivante
  const goToNextStep = useCallback(async () => {
    if (!currentStep) return;
    
    // Validation
    const errors = validateResponse(currentStep, state.currentResponse);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      return;
    }
    
    setState(prev => ({ ...prev, validationErrors: [], isLoading: true }));
    
    try {
      // Mise à jour des données
      const dataKey = getDataKeyForStep(currentStep.id);
      const updatedData = {
        ...state.data,
        [dataKey]: state.currentResponse,
        lastUpdated: new Date(),
        progress: {
          ...state.data.progress,
          completedSteps: [...state.data.progress.completedSteps, currentStep.id],
          currentStep: currentStep.id
        }
      };

      // Logique spéciale selon le type d'étape
      if (currentStep.id === 'pack_selection') {
        updatedData.selectedPack = state.currentResponse;
        
        // Si pack différent de custom, définir les modules automatiquement
        const selectedPack = SMART_PACKS.find(p => p.id === state.currentResponse);
        if (selectedPack && selectedPack.id !== 'custom') {
          updatedData.selectedModules = selectedPack.modules;
        }
      }

      if (currentStep.id === 'module_selection') {
        updatedData.selectedModules = state.currentResponse;
        updatedData.progress.estimatedTimeLeft = calculateEstimatedTime(state.currentResponse);
      }

      // Gestion des informations personnelles
      if (currentStep.id === 'personal_info' && typeof state.currentResponse === 'object') {
        Object.assign(updatedData, state.currentResponse);
      }

      // Gestion de la sélection de sport
      if (currentStep.id === 'sport_selection') {
        const selectedSportData = dynamicSports.find(sport => sport.id === state.currentResponse) || 
                                 AVAILABLE_SPORTS.find(sport => sport.id === state.currentResponse);
        
        if (selectedSportData) {
          setState(prev => ({ ...prev, selectedSport: selectedSportData }));
          
          // Mise à jour des options pour l'étape position si nécessaire
          const positionStep = CONVERSATIONAL_ONBOARDING_FLOW.steps.find(s => s.id === 'sport_position');
          if (positionStep && selectedSportData.positions && selectedSportData.positions.length > 0) {
            positionStep.options = selectedSportData.positions.map(pos => ({
              id: pos.toLowerCase().replace(/\s+/g, '_'),
              label: pos,
              value: pos,
              description: undefined,
              icon: undefined
            }));
          }
        }
      }
      
      // Détermination de l'étape suivante selon le pack
      let nextStepId: string;
      
      if (state.data.selectedPack && state.data.selectedPack !== 'custom') {
        // Si un pack est sélectionné, suivre son flow
        const packSteps = state.availableSteps;
        const currentIndex = packSteps.indexOf(currentStep.id);
        
        if (currentIndex !== -1 && currentIndex < packSteps.length - 1) {
          nextStepId = packSteps[currentIndex + 1];
        } else {
          nextStepId = 'completion';
        }
      } else {
        // Logique standard
        if (typeof currentStep.nextStep === 'function') {
          nextStepId = currentStep.nextStep(state.currentResponse, updatedData);
        } else {
          nextStepId = currentStep.nextStep || 'completion';
        }
        
        // Utilisation de la logique conditionnelle
        nextStepId = getConditionalNextStep(currentStep.id, state.currentResponse, updatedData) || nextStepId;
      }
      
      setState(prev => ({
        ...prev,
        data: updatedData,
        currentStepId: nextStepId,
        currentResponse: null,
        stepHistory: [...prev.stepHistory, currentStep.id]
      }));
      
      // Sauvegarde automatique à certaines étapes importantes
      const importantSteps = ['pack_selection', 'module_selection', 'sport_selection', 'personal_info', 'nutrition_setup'];
      if (importantSteps.includes(currentStep.id)) {
        await saveProgress(updatedData);
      }
      
    } catch (error) {
      console.error('🔴 Erreur lors de la navigation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentStep, state, validateResponse, getDataKeyForStep, dynamicSports, saveProgress, toast]);

  // Navigation vers l'étape précédente
  const goToPreviousStep = useCallback(() => {
    if (state.stepHistory.length === 0) return;
    
    const previousStepId = state.stepHistory[state.stepHistory.length - 1];
    const newHistory = state.stepHistory.slice(0, -1);
    
    setState(prev => ({
      ...prev,
      currentStepId: previousStepId,
      stepHistory: newHistory,
      currentResponse: null,
      validationErrors: [],
      data: {
        ...prev.data,
        progress: {
          ...prev.data.progress,
          completedSteps: prev.data.progress.completedSteps.filter(id => id !== prev.currentStepId)
        }
      }
    }));
  }, [state.stepHistory]);

  // Ignorer l'étape courante
  const skipCurrentStep = useCallback(() => {
    if (!currentStep || !currentStep.skippable) return;
    
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        progress: {
          ...prev.data.progress,
          skipCount: prev.data.progress.skipCount + 1,
          skippedSteps: [...prev.data.progress.skippedSteps, currentStep.id]
        }
      },
      skipCount: prev.skipCount + 1
    }));
    
    // Continuer avec une réponse vide ou par défaut
    setState(prev => ({ ...prev, currentResponse: currentStep.defaultValue || null }));
    goToNextStep();
  }, [currentStep, goToNextStep]);

  // Finalisation de l'onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (debug) {
        console.log('🟡 [DEBUG] Début de completeOnboarding');
      }
      
      const finalData = {
        ...state.data,
        completedAt: new Date(),
        progress: {
          ...state.data.progress,
          completedSteps: [...state.data.progress.completedSteps, 'completion']
        }
      };
      
      // Sauvegarde finale
      await saveProgress(finalData);
      
      // Marquer l'onboarding comme terminé
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      }
      
      if (debug) {
        console.log('🟢 [DEBUG] Onboarding terminé avec succès');
      }
      
      toast({
        title: "Configuration terminée !",
        description: "Votre profil MyFitHero est maintenant configuré.",
      });
      
      onComplete(finalData);
      
    } catch (error) {
      console.error('🔴 Erreur lors de la finalisation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.data, saveProgress, onComplete, debug, toast]);

  // Rendu des types de questions
  const renderQuestionInput = useCallback(() => {
    if (!currentStep) return null;

    const commonInputProps = {
      value: state.currentResponse || '',
      onChange: (value: any) => setState(prev => ({ ...prev, currentResponse: value })),
      disabled: state.isLoading
    };

    switch (currentStep.inputType) {
      case 'text':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              value={state.currentResponse || ''}
              onChange={(e) => setState(prev => ({ ...prev, currentResponse: e.target.value }))}
              placeholder={currentStep.placeholder || "Votre réponse..."}
              className="text-lg p-4 h-12"
              disabled={state.isLoading}
              maxLength={currentStep.maxLength || 100}
            />
            {currentStep.maxLength && (
              <div className="text-sm text-gray-500 text-right">
                {(state.currentResponse || '').length}/{currentStep.maxLength}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-4">
            <Textarea
              value={state.currentResponse || ''}
              onChange={(e) => setState(prev => ({ ...prev, currentResponse: e.target.value }))}
              placeholder={currentStep.placeholder || "Décrivez votre réponse..."}
              className="min-h-[120px] text-base"
              disabled={state.isLoading}
              maxLength={currentStep.maxLength || 500}
            />
            {currentStep.maxLength && (
              <div className="text-sm text-gray-500 text-right">
                {(state.currentResponse || '').length}/{currentStep.maxLength}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={state.currentResponse || ''}
              onChange={(e) => setState(prev => ({ 
                ...prev, 
                currentResponse: e.target.value ? Number(e.target.value) : null 
              }))}
              placeholder={currentStep.placeholder || "Votre réponse..."}
              className="text-lg p-4 h-12"
              disabled={state.isLoading}
              min={currentStep.min}
              max={currentStep.max}
              step={currentStep.step || 1}
            />
            {(currentStep.min !== undefined || currentStep.max !== undefined) && (
              <div className="text-sm text-gray-500">
                {currentStep.min !== undefined && `Min: ${currentStep.min}`}
                {currentStep.min !== undefined && currentStep.max !== undefined && ' • '}
                {currentStep.max !== undefined && `Max: ${currentStep.max}`}
              </div>
            )}
          </div>
        );

     case 'slider':
        const sliderValue = state.currentResponse || currentStep.defaultValue || 7;
        const sliderMin = currentStep.min || 1;
        const sliderMax = currentStep.max || 10;
        
        return (
          <div className="space-y-6">
            <div className="px-4">
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => setState(prev => ({ 
                  ...prev, 
                  currentResponse: value[0] 
                }))}
                min={sliderMin}
                max={sliderMax}
                step={currentStep.step || 1}
                className="w-full"
                disabled={state.isLoading}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 px-4">
              <span>{currentStep.minLabel || sliderMin}</span>
              <span className="font-semibold text-lg text-gray-900">{sliderValue}</span>
              <span>{currentStep.maxLabel || sliderMax}</span>
            </div>
            {currentStep.scaleLabels && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>{currentStep.scaleLabels.low}</div>
                <div className="text-right">{currentStep.scaleLabels.high}</div>
              </div>
            )}
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {currentStep.options?.map((option: QuestionOption) => (
              <button
                key={option.id}
                onClick={() => setState(prev => ({ ...prev, currentResponse: option.value }))}
                disabled={state.isLoading}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                  "hover:border-blue-300 hover:bg-blue-50",
                  state.currentResponse === option.value
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className="flex-shrink-0">
                      {React.createElement(option.icon, { 
                        className: "w-5 h-5 text-gray-600" 
                      })}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                    )}
                  </div>
                  {state.currentResponse === option.value && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiple_choice':
        const selectedValues = Array.isArray(state.currentResponse) ? state.currentResponse : [];
        
        return (
          <div className="space-y-3">
            {currentStep.options?.map((option: QuestionOption) => {
              const isSelected = selectedValues.includes(option.value);
              
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    const newSelection = isSelected
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value];
                    setState(prev => ({ ...prev, currentResponse: newSelection }));
                  }}
                  disabled={state.isLoading}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                    "hover:border-blue-300 hover:bg-blue-50",
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {option.icon && (
                      <div className="flex-shrink-0">
                        {React.createElement(option.icon, { 
                          className: "w-5 h-5 text-gray-600" 
                        })}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
            {currentStep.maxSelections && (
              <div className="text-sm text-gray-500 text-center">
                {selectedValues.length}/{currentStep.maxSelections} sélection(s)
              </div>
            )}
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{currentStep.switchLabel || currentStep.title}</div>
              {currentStep.switchDescription && (
                <div className="text-sm text-gray-500 mt-1">{currentStep.switchDescription}</div>
              )}
            </div>
            <Switch
              checked={state.currentResponse || false}
              onCheckedChange={(checked) => setState(prev => ({ 
                ...prev, 
                currentResponse: checked 
              }))}
              disabled={state.isLoading}
            />
          </div>
        );

      case 'sport_selector':
        return (
          <SportSelector
            sports={[...AVAILABLE_SPORTS, ...dynamicSports]}
            selectedSport={state.currentResponse}
            onSportSelect={(sportId) => setState(prev => ({ 
              ...prev, 
              currentResponse: sportId 
            }))}
            isLoading={sportsLoading || state.isLoading}
          />
        );

      case 'position_selector':
        return (
          <PositionSelector
            sport={state.selectedSport}
            selectedPosition={state.currentResponse}
            onPositionSelect={(position) => setState(prev => ({ 
              ...prev, 
              currentResponse: position 
            }))}
            isLoading={state.isLoading}
          />
        );

      case 'personal_info':
        return (
          <PersonalInfoForm
            data={state.currentResponse || {}}
            onChange={(data) => setState(prev => ({ 
              ...prev, 
              currentResponse: data 
            }))}
            isLoading={state.isLoading}
          />
        );

      case 'pack_selector':
        return (
          <PackSelector
            packs={SMART_PACKS}
            selectedPack={state.currentResponse}
            onPackSelect={(packId) => setState(prev => ({ 
              ...prev, 
              currentResponse: packId 
            }))}
            isLoading={state.isLoading}
          />
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Type de question non supporté: {currentStep.inputType}
          </div>
        );
    }
  }, [currentStep, state, dynamicSports, sportsLoading]);

  // Gestion de la completion
  useEffect(() => {
    if (state.currentStepId === 'completion') {
      completeOnboarding();
    }
  }, [state.currentStepId, completeOnboarding]);

  // Affichage du loading
  if (sportsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre configuration...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur si pas d'étape courante
  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erreur de configuration
            </h3>
            <p className="text-gray-600 mb-4">
              Impossible de charger l'étape de configuration.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header avec progression */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuration MyFitHero</h1>
                <p className="text-sm text-gray-500">
                  Étape {state.data.progress.completedSteps.length + 1} sur {state.data.progress.totalSteps}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>~{state.data.progress.estimatedTimeLeft} min</span>
              </div>
              {onSkip && (
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  Passer
                </Button>
              )}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader className="pb-6">
            <div className="flex items-start space-x-4">
              {currentStep.icon && (
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {React.createElement(currentStep.icon, { 
                    className: "w-6 h-6 text-blue-600" 
                  })}
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStep.title}
                </CardTitle>
                {currentStep.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {currentStep.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Affichage des erreurs de validation */}
            {state.validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-medium text-red-800">Correction nécessaire</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {state.validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conseils et astuces */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, showTips: !prev.showTips }))}
                  className="flex items-center space-x-2 text-blue-800 font-medium mb-2"
                >
                  <Star className="w-4 h-4" />
                  <span>Conseils</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    state.showTips && "rotate-90"
                  )} />
                </button>
                {state.showTips && (
                  <ul className="space-y-2 text-sm text-blue-700">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Rendu de la question */}
            <div className="space-y-4">
              {renderQuestionInput()}
            </div>

            {/* Boutons de navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-3">
                {state.stepHistory.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={state.isLoading}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </Button>
                )}
                
                {currentStep.skippable && (
                  <Button
                    variant="ghost"
                    onClick={skipCurrentStep}
                    disabled={state.isLoading}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Passer cette étape
                  </Button>
                )}
              </div>

              <Button
                onClick={goToNextStep}
                disabled={state.isLoading || (
                  currentStep.validation?.some(rule => rule.type === 'required') && 
                  !state.currentResponse
                )}
                className="flex items-center space-x-2 min-w-[120px]"
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <span>Continuer</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug panel */}
        {debug && (
          <Card className="mt-6 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm font-mono">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono">
                <div><strong>Current Step:</strong> {state.currentStepId}</div>
                <div><strong>Response:</strong> {JSON.stringify(state.currentResponse)}</div>
                <div><strong>Selected Pack:</strong> {state.data.selectedPack}</div>
                <div><strong>Available Steps:</strong> {state.availableSteps.join(', ')}</div>
                <div><strong>Completed:</strong> {state.data.progress.completedSteps.join(', ')}</div>
                <div><strong>History:</strong> {state.stepHistory.join(' → ')}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
