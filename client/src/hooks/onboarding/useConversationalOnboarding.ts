// hooks/onboarding/useConversationalOnboarding.ts
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  OnboardingData, 
  ConversationalStep,
  OnboardingProgress 
} from '@/types/conversationalOnboarding';
import { 
  CONVERSATIONAL_ONBOARDING_FLOW,
  getConditionalNextStep,
  calculateEstimatedTime
} from '@/data/conversationalFlow';
import { getQuestionsForPack, SMART_PACKS } from '@/data/smartPacks';

interface UseConversationalOnboardingOptions {
  initialData?: Partial<OnboardingData>;
  autoSave?: boolean;
  debug?: boolean;
}

interface OnboardingState {
  currentStepId: string;
  data: OnboardingData;
  currentResponse: any;
  validationErrors: string[];
  isLoading: boolean;
  stepHistory: string[];
  availableSteps: string[];
  startTime: Date;
}

export const useConversationalOnboarding = ({
  initialData = {},
  autoSave = true,
  debug = false
}: UseConversationalOnboardingOptions = {}) => {
  const { toast } = useToast();

  // État initial
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
      hydrationReminders: initialData.hydrationReminders !== undefined ? initialData.hydrationReminders : true,
      motivation: initialData.motivation || '',
      availableTimePerDay: initialData.availableTimePerDay || 60,
      privacyConsent: initialData.privacyConsent || false,
      marketingConsent: initialData.marketingConsent || false,
      healthConditions: initialData.healthConditions || [],
      fitnessGoals: initialData.fitnessGoals || [],
      currentWeight: initialData.currentWeight || null,
      targetWeight: initialData.targetWeight || null,
      height: initialData.height || null
    } as OnboardingData,
    currentResponse: null,
    validationErrors: [],
    isLoading: false,
    stepHistory: [],
    availableSteps: [],
    startTime: new Date()
  }));

  // Mise à jour des étapes disponibles selon le pack
  useEffect(() => {
    if (state.data.selectedPack) {
      const steps = getQuestionsForPack(state.data.selectedPack, state.data.selectedModules);
      setState(prev => ({ 
        ...prev, 
        availableSteps: steps,
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

  // Étape courante
  const currentStep = CONVERSATIONAL_ONBOARDING_FLOW.steps.find(
    step => step.id === state.currentStepId
  );

  // Calcul du pourcentage de progression
  const progressPercentage = Math.round(
    (state.data.progress.completedSteps.length / state.data.progress.totalSteps) * 100
  );

  // Validation des réponses
  const validateResponse = useCallback((step: ConversationalStep, response: any): string[] => {
    const errors: string[] = [];
    
    if (!step.validation) return errors;
    
    step.validation.forEach(rule => {
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
      }
    });
    
    return errors;
  }, [state.data]);

  // Sauvegarde des données
  const saveProgress = useCallback(async (data: OnboardingData) => {
    if (!autoSave) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const upsertData = {
        id: user.id,
        first_name: data.firstName || null,
        age: data.age || null,
        gender: data.gender || null,
        height: data.height || null,
        current_weight: data.currentWeight || null,
        target_weight: data.targetWeight || null,
        lifestyle: data.lifestyle || null,
        fitness_goal: data.mainObjective || null,
        fitness_goals: data.fitnessGoals || [],
        modules: data.selectedModules || [],
        active_modules: data.selectedModules || [],
        sport: data.sport || null,
        sport_position: data.sportPosition || null,
        sport_level: data.sportLevel || null,
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
      
      await supabase
        .from('user_profiles')
        .upsert(upsertData, { onConflict: 'id' });
        
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      if (debug) {
        toast({
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder automatiquement.",
          variant: "destructive",
        });
      }
    }
  }, [autoSave, debug, toast]);

  // Mise à jour de la réponse courante
  const setCurrentResponse = useCallback((response: any) => {
    setState(prev => ({ 
      ...prev, 
      currentResponse: response,
      validationErrors: [] // Clear errors when user types
    }));
  }, []);

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
      const dataKey = currentStep.dataKey || 'firstName';
      const updatedData = {
        ...state.data,
        [dataKey]: state.currentResponse,
        lastUpdated: new Date(),
        progress: {
          ...state.data.progress,
          completedSteps: [...state.data.progress.completedSteps, currentStep.id],
          currentStep: currentStep.id,
          lastActivity: new Date()
        }
      };

      // Logique spéciale pour certaines étapes
      if (currentStep.id === 'pack_selection') {
        updatedData.selectedPack = state.currentResponse;
        const selectedPack = SMART_PACKS.find(p => p.id === state.currentResponse);
        if (selectedPack && selectedPack.id !== 'custom') {
          updatedData.selectedModules = selectedPack.modules;
        }
      }

      if (currentStep.id === 'module_selection') {
        updatedData.selectedModules = state.currentResponse;
        updatedData.progress.estimatedTimeLeft = calculateEstimatedTime(state.currentResponse);
      }

      if (currentStep.id === 'personal_info' && typeof state.currentResponse === 'object') {
        Object.assign(updatedData, state.currentResponse);
      }
      
      // Détermination de l'étape suivante
      let nextStepId: string;
      
      if (state.data.selectedPack && state.data.selectedPack !== 'custom') {
        const packSteps = state.availableSteps;
        const currentIndex = packSteps.indexOf(currentStep.id);
        
        if (currentIndex !== -1 && currentIndex < packSteps.length - 1) {
          nextStepId = packSteps[currentIndex + 1];
        } else {
          nextStepId = 'completion';
        }
      } else {
        if (typeof currentStep.nextStep === 'function') {
          nextStepId = currentStep.nextStep(state.currentResponse, updatedData);
        } else {
          nextStepId = currentStep.nextStep || 'completion';
        }
        
        nextStepId = getConditionalNextStep(currentStep.id, state.currentResponse, updatedData) || nextStepId;
      }
      
      setState(prev => ({
        ...prev,
        data: updatedData,
        currentStepId: nextStepId,
        currentResponse: null,
        stepHistory: [...prev.stepHistory, currentStep.id]
      }));
      
      // Sauvegarde automatique
      const importantSteps = ['pack_selection', 'module_selection', 'sport_selection', 'personal_info'];
      if (importantSteps.includes(currentStep.id)) {
        await saveProgress(updatedData);
      }
      
    } catch (error) {
      console.error('Erreur navigation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentStep, state, validateResponse, saveProgress, toast]);

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
          completedSteps: prev.data.progress.completedSteps.filter(id => id !== prev.currentStepId),
          backCount: prev.data.progress.backCount + 1
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
      currentResponse: currentStep.defaultValue || null
    }));
    
    goToNextStep();
  }, [currentStep, goToNextStep]);

  // Finalisation de l'onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const finalData = {
        ...state.data,
        completedAt: new Date(),
        progress: {
          ...state.data.progress,
          completedSteps: [...state.data.progress.completedSteps, 'completion']
        }
      };
      
      await saveProgress(finalData);
      
      // Marquer comme terminé
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      }
      
      return finalData;
      
    } catch (error) {
      console.error('Erreur finalisation:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.data, saveProgress]);

  // Reset de l'onboarding
  const resetOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepId: CONVERSATIONAL_ONBOARDING_FLOW.initialStep,
      currentResponse: null,
      validationErrors: [],
      stepHistory: [],
      startTime: new Date(),
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
        lastUpdated: new Date()
      } as OnboardingData
    }));
  }, [initialData]);

  return {
    // État
    currentStep,
    currentStepId: state.currentStepId,
    data: state.data,
    currentResponse: state.currentResponse,
    validationErrors: state.validationErrors,
    isLoading: state.isLoading,
    progressPercentage,
    canGoBack: state.stepHistory.length > 0,
    canSkip: currentStep?.skippable || false,
    
    // Actions
    setCurrentResponse,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    completeOnboarding,
    resetOnboarding,
    saveProgress: () => saveProgress(state.data),
    
    // Utilitaires
    validateResponse: (response: any) => currentStep ? validateResponse(currentStep, response) : [],
    getEstimatedTimeLeft: () => state.data.progress.estimatedTimeLeft,
    getCompletionPercentage: () => progressPercentage
  };
};
