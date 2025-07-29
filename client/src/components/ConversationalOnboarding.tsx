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
        const sliderStep = currentStep.step || 0.5;
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {sliderValue}
                {currentStep.unit && <span className="text-lg ml-1">{currentStep.unit}</span>}
              </div>
              {currentStep.scaleLabels && (
                <div className="text-sm text-gray-600">
                  {currentStep.scaleLabels[Math.round(sliderValue)] || ''}
                </div>
              )}
            </div>
            <div className="px-4">
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => setState(prev => ({ ...prev, currentResponse: value[0] }))}
                max={sliderMax}
                min={sliderMin}
                step={sliderStep}
                className="w-full"
                disabled={state.isLoading}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{sliderMin}{currentStep.unit}</span>
                <span>{sliderMax}{currentStep.unit}</span>
              </div>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center justify-center space-x-4 py-4">
            <span className={cn(
              "text-lg font-medium transition-colors",
              state.currentResponse === false ? "text-gray-900" : "text-gray-500"
            )}>
              Non
            </span>
            <Switch
              checked={state.currentResponse || false}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, currentResponse: checked }))}
              disabled={state.isLoading}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={cn(
              "text-lg font-medium transition-colors",
              state.currentResponse === true ? "text-gray-900" : "text-gray-500"
            )}>
              Oui
            </span>
          </div>
        );

      case 'single-select':
        // Gestion spéciale pour les composants personnalisés
        if (currentStep.id === 'personal_info') {
          return (
            <PersonalInfoForm
              onComplete={(data) => {
                setState(prev => ({
                  ...prev,
                  currentResponse: data,
                  data: {
                    ...prev.data,
                    age: data.age,
                    gender: data.gender,
                    lifestyle: data.lifestyle,
                    availableTimePerDay: data.availableTimePerDay,
                    height: data.height,
                    currentWeight: data.currentWeight
                  }
                }));
                
                // Auto-continuer après la saisie
                setTimeout(() => {
                  goToNextStep();
                }, 500);
              }}
              initialData={{
                age: state.data.age,
                gender: state.data.gender,
                lifestyle: state.data.lifestyle,
                availableTimePerDay: state.data.availableTimePerDay,
                height: state.data.height,
                currentWeight: state.data.currentWeight
              }}
            />
          );
        }
        
        if (currentStep.id === 'sport_selection') {
          return (
            <SportSelector
              onSelect={(sport) => setState(prev => ({ ...prev, currentResponse: sport.id }))}
              selectedSport={state.selectedSport}
              placeholder="Recherchez votre sport..."
            />
          );
        }
        
        if (currentStep.id === 'sport_position' && state.selectedSport) {
          return (
            <PositionSelector
              sport={state.selectedSport}
              onSelect={(position) => setState(prev => ({ ...prev, currentResponse: position }))}
              selectedPosition={typeof state.currentResponse === 'string' ? state.currentResponse : undefined}
            />
          );
        }
        
        // Options standard
        return (
          <div className="grid gap-3 max-w-2xl mx-auto">
            {currentStep.options?.map((option: QuestionOption) => (
              <button
                key={option.id}
                onClick={() => setState(prev => ({ ...prev, currentResponse: option.value }))}
                disabled={state.isLoading}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                  state.currentResponse === option.value
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className="text-2xl flex-shrink-0">
                      {option.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {state.currentResponse === option.value && (
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multi-select':
        const currentSelections = Array.isArray(state.currentResponse) ? state.currentResponse : [];
        
        return (
          <div className="space-y-4">
            <div className="grid gap-3 max-w-2xl mx-auto">
              {currentStep.options?.map((option: QuestionOption) => {
                const isSelected = currentSelections.includes(option.value);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newSelections = isSelected
                        ? currentSelections.filter(v => v !== option.value)
                        : [...currentSelections, option.value];
                      setState(prev => ({ ...prev, currentResponse: newSelections }));
                    }}
                    disabled={state.isLoading}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md disabled:opacity-50",
                      isSelected
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {option.icon && (
                        <div className="text-2xl flex-shrink-0">
                          {option.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        isSelected 
                          ? "border-blue-500 bg-blue-500" 
                          : "border-gray-300"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {currentStep.maxSelections && (
              <div className="text-sm text-gray-500 text-center">
                {currentSelections.length}/{currentStep.maxSelections} sélection(s)
              </div>
            )}
          </div>
        );

      case 'custom':
        // Gestion du PackSelector
        if (currentStep.customComponent === 'PackSelector') {
          return (
            <PackSelector
              onSelect={(packId) => {
                setState(prev => ({
                  ...prev,
                  currentResponse: packId,
                  data: {
                    ...prev.data,
                    selectedPack: packId
                  }
                }));
              }}
              recommendedPacks={getRecommendedPacks(state.data.mainObjective || '')}
            />
          );
        }
        return null;

      default:
        return (
          <div className="text-center text-gray-500 p-8">
            Type de question non supporté: {currentStep.inputType}
          </div>
        );
    }
  }, [currentStep, state, goToNextStep]);

  // Rendu du résumé
  const renderSummaryContent = useCallback(() => {
    const sections = [
      {
        title: "Informations personnelles",
        icon: <User className="h-5 w-5" />,
        items: [
          { label: "Prénom", value: state.data.firstName },
          { label: "Âge", value: state.data.age ? `${state.data.age} ans` : null },
          { label: "Genre", value: state.data.gender },
          { label: "Style de vie", value: LIFESTYLE_OPTIONS.find(l => l.id === state.data.lifestyle)?.name }
        ].filter(item => item.value)
      },
      {
        title: "Programme choisi",
        icon: <Package className="h-5 w-5" />,
        items: [
          { 
            label: "Pack", 
            value: SMART_PACKS.find(p => p.id === state.data.selectedPack)?.name 
          },
          {
            label: "Durée estimée",
            value: `${getEstimatedTimeForPack(state.data.selectedPack || '')} minutes`
          }
        ].filter(item => item.value)
      },
      {
        title: "Objectif principal",
        icon: <Target className="h-5 w-5" />,
        items: [
          { 
            label: "Objectif", 
            value: MAIN_OBJECTIVES.find(o => o.id === state.data.mainObjective)?.name 
          }
        ].filter(item => item.value)
      },
      {
        title: "Modules sélectionnés",
        icon: <Settings className="h-5 w-5" />,
        items: state.data.selectedModules?.map(moduleId => ({
          label: AVAILABLE_MODULES.find(m => m.id === moduleId)?.name || moduleId,
          value: "✓"
        })) || []
      }
    ];

    if (state.data.sport) {
      sections.push({
        title: "Sport et niveau",
        icon: <Award className="h-5 w-5" />,
        items: [
          { 
            label: "Sport", 
            value: AVAILABLE_SPORTS.find(s => s.id === state.data.sport)?.name 
          },
          { 
            label: "Position", 
            value: state.data.sportPosition 
          },
          { 
            label: "Niveau", 
            value: SPORT_LEVELS.find(l => l.id === state.data.sportLevel)?.name 
          }
        ].filter(item => item.value)
      });
    }

    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          section.items.length > 0 && (
            <Card key={index} className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  {section.icon}
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ))}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Temps de configuration</span>
          </div>
          <p className="text-blue-800 text-sm">
            Terminé en {Math.round((new Date().getTime() - state.startTime.getTime()) / 1000 / 60)} minutes
          </p>
        </div>
      </div>
    );
  }, [state.data, state.startTime]);

  // Rendu principal du contenu de l'étape
  const renderStepContent = useCallback(() => {
    if (!currentStep) return null;

    const stepIcons = {
      'welcome': '🎉',
      'get_name': '👋',
      'main_objective': '🎯',
      'pack_selection': '📦',
      'module_selection': '🧩',
      'personal_info': '👤',
      'sport_selection': '🏃‍♂️',
      'sport_position': '⚽',
      'strength_setup': '💪',
      'nutrition_setup': '🥗',
      'sleep_setup': '😴',
      'hydration_setup': '💧',
      'wellness_assessment': '🧘‍♂️',
      'final_questions': '📝',
      'summary': '📋',
      'completion': '🎊'
    };

    const defaultIcon = stepIcons[currentStep.id as keyof typeof stepIcons] || currentStep.illustration || '❓';

    switch (currentStep.type) {
      case 'info':
        return (
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="text-6xl mb-6">{defaultIcon}</div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {currentStep.title}
              </h1>
              {currentStep.subtitle && (
                <p className="text-xl text-gray-600 font-medium">
                  {currentStep.subtitle}
                </p>
              )}
              {currentStep.description && (
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  {currentStep.description}
                </p>
              )}
            </div>
            
            {currentStep.tips && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  💡 Ce qui vous attend
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={goToNextStep} 
              size="lg" 
              className="w-full max-w-md h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Chargement...
                </div>
              ) : (
                <>
                  Commencer la configuration
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        );

      case 'question':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">{defaultIcon}</div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {currentStep.title?.replace('{firstName}', state.data.firstName || 'vous')}
              </h1>
              {currentStep.question && (
                <p className="text-xl text-gray-700 font-medium">
                  {currentStep.question}
                </p>
              )}
              {currentStep.description && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {currentStep.description}
                </p>
              )}
            </div>

            <div className="max-w-3xl mx-auto">
              {renderQuestionInput()}
            </div>

            {state.validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Correction nécessaire</span>
                </div>
                {state.validationErrors.map((error, index) => (
                  <div key={index} className="text-red-700 text-sm ml-7">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center max-w-2xl mx-auto pt-4">
              <div className="flex items-center space-x-3">
                {state.stepHistory.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep}
                    disabled={state.isLoading}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                )}
                
                {currentStep.skippable && (
                  <Button 
                    variant="ghost" 
                    onClick={skipCurrentStep}
                    disabled={state.isLoading}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Passer
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {currentStep.tips && (
                  <Button 
                    variant="outline" 
                    onClick={() => setState(prev => ({ ...prev, showTips: !prev.showTips }))}
                    className="flex items-center"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Conseils
                  </Button>
                )}
                
                <Button 
                  onClick={goToNextStep}
                  disabled={state.isLoading || (currentStep.inputType !== 'info' && !state.currentResponse && state.currentResponse !== false)}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {state.isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Chargement...
                    </div>
                  ) : (
                    <>
                      Continuer
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">{defaultIcon}</div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentStep.title}
              </h1>
              <p className="text-xl text-gray-600">
                {currentStep.description}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {renderSummaryContent()}
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={completeOnboarding}
                disabled={state.isLoading}
                size="lg"
                className="w-full max-w-md h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {state.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finalisation...
                  </div>
                ) : (
                  <>
                    Créer mon profil MyFitHero
                    <Check className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="text-6xl mb-6">{defaultIcon}</div>
            <h1 className="text-4xl font-bold text-gray-900">
              {currentStep.title}
            </h1>
            <p className="text-xl text-gray-600">
              {currentStep.description}
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-3">
                🎉 Félicitations !
              </h3>
              <p className="text-green-800 text-lg leading-relaxed">
                Votre profil MyFitHero est maintenant configuré et personnalisé selon vos besoins. 
                Vous allez être redirigé vers votre tableau de bord personnalisé dans quelques instants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900">Programmes personnalisés</div>
                <div className="text-sm text-blue-700">Adaptés à vos objectifs</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-purple-900">IA intuitive</div>
                <div className="text-sm text-purple-700">Qui apprend de vos progrès</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900">Suivi en temps réel</div>
                <div className="text-sm text-green-700">De tous vos progrès</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4 py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              Type d'étape non reconnu
            </h2>
            <p className="text-gray-600">
              Type: {currentStep.type} pour l'étape {currentStep.id}
            </p>
          </div>
        );
    }
  }, [currentStep, state, renderQuestionInput, renderSummaryContent, goToNextStep, goToPreviousStep, skipCurrentStep, completeOnboarding]);

  // Gestion des erreurs de chargement
  if (sportsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-semibold">Chargement...</h3>
            <p className="text-gray-600">Préparation de votre expérience personnalisée</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Erreur de configuration</h3>
            <p className="text-gray-600">
              Impossible de charger l'étape d'onboarding. Veuillez rafraîchir la page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Rafraîchir
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="hero-container">
      {/* En-tête avec progression */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MF</span>
                </div>
                <div className="font-bold text-xl text-gray-900">MyFitHero</div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Configuration
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>~{state.data.progress.estimatedTimeLeft} min restantes</span>
              </div>
              {onSkip && currentStep.skippable && (
                <Button variant="ghost" onClick={onSkip} className="text-gray-500 hover:text-gray-700">
                  Ignorer tout
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Progression: {progressPercentage}%
                </span>
                <span className="text-sm text-gray-500">
                  ({state.data.progress.completedSteps.length}/{state.data.progress.totalSteps})
                </span>
              </div>
              {state.data.selectedPack && (
                <div className="text-sm text-gray-500">
                  Pack: {SMART_PACKS.find(p => p.id === state.data.selectedPack)?.name}
                </div>
              )}
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-gray-100" 
            />
