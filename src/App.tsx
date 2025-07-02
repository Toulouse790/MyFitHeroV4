// Dans App.tsx, mettez à jour handleOnboardingComplete :

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
    
    const updatesToDb: Partial<SupabaseDBUserProfileType> = {
      // Nouveaux champs
      profile_type: profileData.profile_type,
      modules: profileData.modules,
      
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
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updatesToDb)
      .eq('id', session.user.id)
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      console.log('Onboarding completed successfully:', data[0]);
      
      // Mettre à jour le store
      updateAppStoreUserProfile({
        ...data[0],
        name: data[0].full_name || data[0].username || 'Non défini',
        email: session.user.email || '',
        goal: data[0].fitness_goal || 'general',
        level: appStoreUser.level,
        totalPoints: appStoreUser.totalPoints,
        joinDate: new Date(data[0].created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
      
      toast({
        title: "Profil complété !",
        description: "Bienvenue dans MyFitHero ! Votre profil personnalisé est prêt.",
      });

      // Redirection basée sur le type de profil
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
