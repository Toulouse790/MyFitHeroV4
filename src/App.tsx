const handleOnboardingComplete = async (profileData: UserProfileOnboarding) => {
  if (!session?.user) {
    console.error('Aucune session utilisateur trouvée');
    toast({
      title: "Erreur",
      description: "Session utilisateur introuvable. Veuillez vous reconnecter.",
      variant: "destructive"
    });
    return;
  }

  try {
    console.log('Completing onboarding with data:', profileData);
    
    // MAPPING profile_type → active_modules
    const getActiveModules = (profileType: string): string[] => {
      switch (profileType) {
        case 'complete':
          return ['sport', 'nutrition', 'sleep', 'hydration'];
        case 'wellness':
          return ['nutrition', 'sleep', 'hydration'];
        case 'sport_only':
          return ['sport'];
        case 'sleep_focus':
          return ['sleep', 'hydration'];
        default:
          return ['sport']; // fallback
      }
    };

    // CALCUL AUTOMATIQUE CALORIES
    const calculateDailyCalories = (age: number, gender: string, lifestyle: string, fitnessGoal: string) => {
      const weight = 70; // Poids moyen par défaut
      
      // BMR (Métabolisme de base)
      const bmr = gender === 'male' 
        ? 88.362 + (13.397 * weight) + (4.799 * 175) - (5.677 * age)
        : 447.593 + (9.247 * weight) + (3.098 * 160) - (4.330 * age);
      
      // Facteur d'activité selon lifestyle
      const activityFactors = {
        'student': 1.4,
        'office_worker': 1.3,
        'physical_job': 1.6,
        'retired': 1.2
      };
      
      const activityFactor = activityFactors[lifestyle as keyof typeof activityFactors] || 1.4;
      
      // Ajustement selon l'objectif
      const goalAdjustment = {
        'weight_loss': -300,
        'muscle_gain': +400,
        'performance': +200,
        'general': 0
      };
      
      const adjustment = goalAdjustment[fitnessGoal as keyof typeof goalAdjustment] || 0;
      
      return Math.round(bmr * activityFactor + adjustment);
    };

    const activeModules = getActiveModules(profileData.profile_type);
    const dailyCalories = calculateDailyCalories(
      profileData.age || 25, 
      profileData.gender || 'male', 
      profileData.lifestyle || 'office_worker', 
      profileData.fitness_goal || 'general'
    );
    
    const updatesToDb: Partial<SupabaseDBUserProfileType> = {
      // NOUVEAUX champs critiques
      profile_type: profileData.profile_type,
      modules: ['sport', 'nutrition', 'sleep', 'hydration'], // Toujours les 4 disponibles
      active_modules: activeModules, // Modules activés selon le profil
      
      // CALCUL AUTOMATIQUE CALORIES
      daily_calories: dailyCalories,
      
      // Champs existants
      age: profileData.age,
      gender: profileData.gender,
      lifestyle: profileData.lifestyle,
      available_time_per_day: profileData.available_time_per_day,
      fitness_experience: profileData.fitness_experience,
      injuries: profileData.injuries,
      primary_goals: profileData.primary_goals,
      motivation: profileData.motivation,
      fitness_goal: profileData.fitness_goal || 'general',
      sport: profileData.sport || 'none',
      sport_position: profileData.sport_position,
      sport_level: profileData.sport_level || 'none',
      training_frequency: profileData.training_frequency || 0,
      season_period: profileData.season_period || 'off_season',
      updated_at: new Date().toISOString()
    };
    
    console.log('Saving to DB with active_modules:', activeModules);
    console.log('Daily calories calculated:', dailyCalories);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updatesToDb)
      .eq('id', session.user.id)
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      console.log('Onboarding completed successfully:', data[0]);
      
      // Mettre à jour le store avec les modules activés
      updateAppStoreUserProfile({
        ...data[0],
        name: data[0].full_name || data[0].username || 'Non défini',
        email: session.user.email || '',
        goal: data[0].fitness_goal || 'general',
        level: appStoreUser.level,
        totalPoints: appStoreUser.totalPoints,
        joinDate: new Date(data[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        // S'assurer que les modules sont dans le store
        active_modules: data[0].active_modules || activeModules,
        modules: data[0].modules || ['sport', 'nutrition', 'sleep', 'hydration']
      });
      
      toast({
        title: "Profil complété !",
        description: `Bienvenue dans MyFitHero ! ${activeModules.length} module(s) activé(s).`,
      });

      // Redirection vers dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }

  } catch (error: any) {
    console.error('Error saving onboarding data:', error);
    toast({
      title: "Erreur de sauvegarde",
      description: error.message || "Une erreur s'est produite. Veuillez réessayer.",
      variant: "destructive"
    });
  }
};
