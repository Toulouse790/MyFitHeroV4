const conversationalFlow = [
  {
    description: 'This helps me create sport-specific programs',
    illustration: '🏃‍♂️',
    inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('sport') || false,
     options: AVAILABLE_SPORTS.map(sport => ({
       id: sport.id,
       label: sport.name,
       value: sport.id,
       icon: sport.emoji
     }),
     validation: [
       { type: 'required', message: 'Please select your sport' }
     ],
     nextStep: 'sport_position',
     estimatedTime: 2
   },

   {
     id: 'sport_position',
     type: 'question',
     title: 'Your position/specialty',
     question: 'What\'s your position or specialty?',
     description: 'For even more targeted programs',
     illustration: '🎯',
     inputType: 'single-select',
     condition: (data) => !!(data.selectedModules?.includes('sport') && data.sport !== 'other'),
     options: [], // Will be filled dynamically based on sport
     nextStep: 'sport_level',
     estimatedTime: 1
   },

   {
     id: 'sport_level',
     type: 'question',
     title: 'Your sport level',
     question: 'How would you describe your level?',
     description: 'Be honest, this determines your program intensity',
     illustration: '📊',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('sport') || false,
     options: SPORT_LEVELS.map(level => ({
       id: level.id,
       label: level.name,
       value: level.id,
       description: level.description
     })),
     validation: [
       { type: 'required', message: 'Please select your level' }
     ],
     nextStep: 'sport_equipment',
     estimatedTime: 1
   },

   {
     id: 'sport_equipment',
     type: 'question',
     title: 'Your equipment',
     question: 'What equipment do you have access to?',
     description: 'I\'ll adapt programs to your available equipment',
     illustration: '🏋️‍♂️',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('sport') || false,
     options: EQUIPMENT_LEVELS.map(level => ({
       id: level.id,
       label: level.name,
       value: level.id,
       description: level.description
     })),
     validation: [
       { type: 'required', message: 'Please select your equipment level' }
     ],
     nextStep: (_, data) => {
       if (data.selectedModules?.includes('strength')) {
         return 'strength_setup';
       } else if (data.selectedModules?.includes('nutrition')) {
         return 'nutrition_setup';
       } else if (data.selectedModules?.includes('sleep')) {
         return 'sleep_setup';
       } else if (data.selectedModules?.includes('hydration')) {
         return 'hydration_setup';
       } else {
         return 'final_questions';
       }
     },
     estimatedTime: 1
   },

   // 💪 STRENGTH MODULE
   {
     id: 'strength_setup',
     type: 'question',
     title: 'Strength training goal',
     question: 'What\'s your main strength objective?',
     description: 'This determines your training style',
     illustration: '💪',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('strength') || false,
     options: STRENGTH_OBJECTIVES.map(obj => ({
       id: obj.id,
       label: obj.name,
       value: obj.id,
       description: obj.description
     })),
     validation: [
       { type: 'required', message: 'Please select your objective' }
     ],
     nextStep: 'strength_experience',
     estimatedTime: 2
   },

   {
     id: 'strength_experience',
     type: 'question',
     title: 'Your experience',
     question: 'How long have you been strength training?',
     description: 'This helps adjust exercise complexity',
     illustration: '📈',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('strength') || false,
     options: FITNESS_EXPERIENCE_LEVELS.map(level => ({
       id: level.id,
       label: level.name,
       value: level.id,
       description: level.description
     })),
     validation: [
       { type: 'required', message: 'Please select your experience level' }
     ],
     nextStep: (_, data) => {
       if (data.selectedModules?.includes('nutrition')) {
         return 'nutrition_setup';
       } else if (data.selectedModules?.includes('sleep')) {
         return 'sleep_setup';
       } else if (data.selectedModules?.includes('hydration')) {
         return 'hydration_setup';
       } else {
         return 'final_questions';
       }
     },
     estimatedTime: 1
   },

   // 🥗 NUTRITION MODULE
   {
     id: 'nutrition_setup',
     type: 'question',
     title: 'Your dietary preferences',
     question: 'What type of diet suits you?',
     description: 'I\'ll personalize meal plans to your preferences',
     illustration: '🥗',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('nutrition') || false,
     options: DIETARY_PREFERENCES.map(pref => ({
       id: pref.id,
       label: pref.name,
       value: pref.id,
       description: pref.description
     })),
     validation: [
       { type: 'required', message: 'Please select your dietary preference' }
     ],
     nextStep: 'nutrition_objective',
     estimatedTime: 2
   },

   {
     id: 'nutrition_objective',
     type: 'question',
     title: 'Nutrition goal',
     question: 'What do you want to achieve with nutrition?',
     description: 'This determines your caloric and macro approach',
     illustration: '🎯',
     inputType: 'single-select',
     condition: (data) => data.selectedModules?.includes('nutrition') || false,
     options: NUTRITION_OBJECTIVES.map(obj => ({
       id: obj.id,
       label: obj.name,
       value: obj.id,
       description: obj.description
     })),
     validation: [
       { type: 'required', message: 'Please select your nutrition goal' }
     ],
     nextStep: (_, data) => {
       if (data.selectedModules?.includes('sleep')) {
         return 'sleep_setup';
       } else if (data.selectedModules?.includes('hydration')) {
         return 'hydration_setup';
       } else {
         return 'final_questions';
       }
     },
     estimatedTime: 1
   },

   // 😴 SLEEP MODULE
   {
     id: 'sleep_setup',
     type: 'question',
     title: 'Your sleep habits',
     question: 'How many hours do you sleep on average?',
     description: 'Sleep is crucial for recovery and performance',
     illustration: '😴',
     inputType: 'slider',
     condition: (data) => data.selectedModules?.includes('sleep') || false,
     validation: [
       { type: 'required', message: 'Please indicate your sleep duration' },
       { type: 'min', value: 4, message: 'Minimum: 4 hours' },
       { type: 'max', value: 12, message: 'Maximum: 12 hours' }
     ],
     nextStep: 'sleep_difficulties',
     estimatedTime: 1
   },

   {
     id: 'sleep_difficulties',
     type: 'question',
     title: 'Sleep quality',
     question: 'Do you have trouble sleeping?',
     description: 'I can provide tips to improve your sleep',
     illustration: '🌙',
     inputType: 'toggle',
     condition: (data) => data.selectedModules?.includes('sleep') || false,
     nextStep: (_, data) => {
       if (data.selectedModules?.includes('hydration')) {
         return 'hydration_setup';
       } else {
         return 'final_questions';
       }
     },
     estimatedTime: 1
   },

   // 💧 HYDRATION MODULE
   {
     id: 'hydration_setup',
     type: 'question',
     title: 'Your hydration',
     question: 'What\'s your daily hydration goal?',
     description: 'Good hydration improves performance and recovery',
     illustration: '💧',
     inputType: 'slider',
     condition: (data) => data.selectedModules?.includes('hydration') || false,
     validation: [
       { type: 'required', message: 'Please set your hydration goal' },
       { type: 'min', value: 1, message: 'Minimum: 1 liter per day' },
       { type: 'max', value: 5, message: 'Maximum: 5 liters per day' }
     ],
     nextStep: 'hydration_reminders',
     estimatedTime: 1
   },

   {
     id: 'hydration_reminders',
     type: 'question',
     title: 'Hydration reminders',
     question: 'Would you like smart hydration reminders?',
     description: 'I can send notifications based on your activity',
     illustration: '🔔',
     inputType: 'toggle',
     condition: (data) => data.selectedModules?.includes('hydration') || false,
     nextStep: 'final_questions',
     estimatedTime: 1
   },

   // 📝 FINAL QUESTIONS
   {
     id: 'final_questions',
     type: 'question',
     title: 'Last questions',
     question: 'Share your main motivation',
     description: 'What drives you most in this journey?',
     illustration: '🔥',
     inputType: 'text',
     validation: [
       { type: 'required', message: 'Please share your motivation' }
     ],
     nextStep: 'privacy_consent',
     estimatedTime: 2
   },

   // 🔒 CONSENT
   {
     id: 'privacy_consent',
     type: 'question',
     title: 'Privacy & Terms',
     question: 'Accept our terms of service?',
     description: 'Your data is secure and never sold',
     illustration: '🔒',
     inputType: 'toggle',
     validation: [
       { type: 'required', message: 'You must accept the terms to continue' }
     ],
     nextStep: 'summary',
     estimatedTime: 1
   },

   // 📋 FINAL SUMMARY
   {
     id: 'summary',
     type: 'summary',
     title: 'Your profile is ready! 🎉',
     description: 'Here\'s your configuration summary',
     illustration: '✨',
     nextStep: 'completion',
     estimatedTime: 2
   },

   // ✅ COMPLETION
   {
     id: 'completion',
     type: 'confirmation',
     title: 'Welcome to MyFitHero!',
     description: 'Your personalized journey awaits',
     illustration: '🚀',
     estimatedTime: 1
   }
 ]
};

// Utility function for module colors
function getModuleColor(moduleId: string): string {
 const colors: Record<string, string> = {
   sport: '#3B82F6',
   strength: '#EF4444',
   nutrition: '#10B981',
   sleep: '#8B5CF6',
   hydration: '#06B6D4',
   wellness: '#F59E0B'
 };
 return colors[moduleId] || '#6B7280';
}

// Function to get next steps based on selected modules
export function getNextStepForModules(selectedModules: string[], currentModule?: string): string {
 const moduleOrder = ['sport', 'strength', 'nutrition', 'sleep', 'hydration', 'wellness'];
 
 if (!currentModule) {
   // Find first selected module
   for (const module of moduleOrder) {
     if (selectedModules.includes(module)) {
       return `${module}_setup`;
     }
   }
   return 'final_questions';
 }
 
 // Find next selected module
 const currentIndex = moduleOrder.indexOf(currentModule);
 for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
   if (selectedModules.includes(moduleOrder[i])) {
     return `${moduleOrder[i]}_setup`;
   }
 }
 
 return 'final_questions';
}

// Function to calculate estimated time based on selected modules
export function calculateEstimatedTime(selectedModules: string[]): number {
 const baseTime = 5; // Minutes for base steps
 const moduleTime: Record<string, number> = {
   sport: 4,
   strength: 2,
   nutrition: 3,
   sleep: 2,
   hydration: 2,
   wellness: 2
 };
 
 let totalTime = baseTime;
 selectedModules.forEach(module => {
   totalTime += moduleTime[module] || 0;
 });
 
 return totalTime;
}
