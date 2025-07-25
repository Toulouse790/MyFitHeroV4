// pages/profile.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { 
  User as UserIcon, 
  Calendar, 
  Target, 
  Dumbbell, 
  Star, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Edit,
  X,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Award,
  Zap,
  Heart,
  Activity,
  Shield,
  Settings,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { UniformHeader } from '@/components/UniformHeader';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { UserDataService } from '@/services/userDataService';
import { UserProfile } from '@/types/user';
import { useAppStore } from '@/stores/useAppStore';
import { AVAILABLE_SPORTS } from '@/data/sports';
import { AVAILABLE_MODULES } from '@/data/modules';

interface UserStats {
  current_streak: number;
  level: number;
  total_workouts: number;
  badges_earned: number;
  experience_points: number;
  total_calories_burned: number;
  total_workout_minutes: number;
  favorite_exercise: string;
  last_workout_date: string;
  weekly_goal_completion: number;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { appStoreUser, setAppStoreUser } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'sport' | 'modules' | 'settings'>('profile');

  // Chargement des données optimisé avec nouveaux champs
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Chargement avec tous les nouveaux champs de l'onboarding conversationnel
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          active_modules,
          training_frequency,
          fitness_experience,
          sport_position,
          sport_level,
          onboarding_completed,
          primary_goals,
          country,
          timezone
        `)
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erreur chargement profil:', profileError);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive"
        });
        return;
      }

      if (profile) {
        setUserProfile(profile);
        setAppStoreUser(profile);
        
        // Initialiser données d'édition avec tous les champs
        setEditData({
          ...profile,
          first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
          last_name: profile.last_name || profile.full_name?.split(' ')[1] || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          city: profile.city || '',
          country: profile.country || ''
        });
      }

      // Charger les statistiques
      try {
        const stats = await UserDataService.getUserStats(user.id);
        setUserStats(stats);
      } catch (statsError) {
        console.error('Erreur stats:', statsError);
        // Stats par défaut si erreur
        setUserStats({
          current_streak: 0,
          level: 1,
          total_workouts: 0,
          badges_earned: 0,
          experience_points: 0,
          total_calories_burned: 0,
          total_workout_minutes: 0,
          favorite_exercise: '',
          last_workout_date: '',
          weekly_goal_completion: 0
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast, setAppStoreUser]);

  // Sauvegarde optimisée avec nouveaux champs
  const handleSave = useCallback(async () => {
    if (!userProfile) return;

    try {
      setSaving(true);
      
      const updateData = {
        first_name: editData.first_name?.trim(),
        last_name: editData.last_name?.trim(),
        full_name: `${editData.first_name} ${editData.last_name}`.trim(),
        bio: editData.bio?.trim(),
        phone: editData.phone?.trim(),
        city: editData.city?.trim(),
        country: editData.country?.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userProfile.id);

      if (error) throw error;

      // Mise à jour locale et store
      const updatedProfile = { ...userProfile, ...updateData };
      setUserProfile(updatedProfile);
      setAppStoreUser(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
        action: {
          label: "Voir les changements",
          onClick: () => setActiveTab('profile')
        }
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'profile_updated', {
          user_id: userProfile.id,
          fields_updated: Object.keys(updateData).filter(key => updateData[key as keyof typeof updateData])
        });
      }

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [userProfile, editData, setAppStoreUser, toast]);

  const handleCancel = useCallback(() => {
    setEditData(userProfile || {});
    setIsEditing(false);
  }, [userProfile]);

  // Calculs dérivés améliorés
  const derivedData = useMemo(() => {
    if (!userStats || !userProfile) return null;

    const getLevel = (experience: number): number => Math.floor(experience / 1000) + 1;
    const getExperienceForNextLevel = (experience: number): number => {
      const currentLevel = getLevel(experience);
      return currentLevel * 1000 - experience;
    };

    // Calcul BMI
    const bmi = userProfile.height_cm && userProfile.weight_kg 
      ? (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2))
      : null;

    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return { category: 'Sous-poids', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      if (bmi < 25) return { category: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50' };
      if (bmi < 30) return { category: 'Surpoids', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      return { category: 'Obésité', color: 'text-red-600', bgColor: 'bg-red-50' };
    };

    // Calcul de complétude amélioré avec nouveaux champs
    const requiredFields = [
      userProfile.sport,
      userProfile.age,
      userProfile.height_cm,
      userProfile.weight_kg,
      userProfile.fitness_experience,
      userProfile.primary_goals?.length,
      userProfile.active_modules?.length,
      userProfile.training_frequency
    ];
    
    const completedFields = requiredFields.filter(field => 
      field !== null && field !== undefined && field !== 0
    ).length;
    
    const completionRate = Math.round((completedFields / requiredFields.length) * 100);

    return {
      level: getLevel(userStats.experience_points),
      nextLevelXP: getExperienceForNextLevel(userStats.experience_points),
      levelProgress: ((userStats.experience_points % 1000) / 1000) * 100,
      bmi: bmi ? {
        value: bmi.toFixed(1),
        ...getBMICategory(bmi)
      } : null,
      completionRate
    };
  }, [userStats, userProfile]);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getPersonalizedMessage = useCallback(() => {
    const userName = userProfile?.first_name || userProfile?.username || 'Champion';
    const sport = userProfile?.sport || 'sport';
    
    if (derivedData?.completionRate === 100) {
      return `🎯 Parfait ${userName} ! Profil optimisé pour ${sport}`;
    } else if (derivedData?.completionRate && derivedData.completionRate > 80) {
      return `💪 Excellent ${userName}, quelques détails à finaliser`;
    } else {
      return `🚀 ${userName}, complétez votre profil pour une expérience optimale`;
    }
  }, [userProfile, derivedData]);

  // Obtenir les informations du sport sélectionné
  const sportInfo = useMemo(() => {
    if (!userProfile?.sport) return null;
    return AVAILABLE_SPORTS.find(s => s.id === userProfile.sport) || null;
  }, [userProfile?.sport]);

  // Obtenir les modules actifs avec leurs informations complètes
  const activeModulesInfo = useMemo(() => {
    if (!userProfile?.active_modules) return [];
    return userProfile.active_modules
      .map(moduleId => AVAILABLE_MODULES.find(m => m.id === moduleId))
      .filter(Boolean);
  }, [userProfile?.active_modules]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Render des états de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Profil"
          subtitle="Chargement..."
          showBackButton={true}
          gradient={true}
        />
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Profil"
          showBackButton={true}
          gradient={true}
        />
        <div className="p-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profil non trouvé</h3>
              <p className="text-gray-600 mb-4">
                Impossible de charger vos informations de profil.
              </p>
              <Button onClick={() => router.push('/onboarding')}>
                Compléter l'onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'sport', label: 'Sport', icon: Dumbbell },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Mon Profil"
        subtitle={getPersonalizedMessage()}
        showBackButton={true}
        gradient={true}
        rightContent={
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Niveau {derivedData?.level || 1}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {derivedData?.completionRate || 0}% complet
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/20"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        
        {/* Navigation par onglets */}
        <Card>
          <CardContent className="p-2">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-shrink-0 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerte complétude si nécessaire */}
        {derivedData && derivedData.completionRate < 100 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900">Profil incomplet</h3>
                  <p className="text-sm text-amber-700">
                    Complétez votre profil pour débloquer toutes les fonctionnalités IA personnalisées
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => router.push('/onboarding')}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Compléter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Carte profil principal avec informations enrichies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informations personnelles</span>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Avatar et nom avec sport */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {sportInfo?.emoji ? (
                        <span className="text-2xl">{sportInfo.emoji}</span>
                      ) : (
                        <UserIcon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="first_name" className="text-sm">Prénom</Label>
                            <Input
                              id="first_name"
                              value={editData.first_name || ''}
                              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                              placeholder="Prénom"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name" className="text-sm">Nom</Label>
                            <Input
                              id="last_name"
                              value={editData.last_name || ''}
                              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                              placeholder="Nom"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {userProfile.first_name || userProfile.full_name?.split(' ')[0] || ''} {' '}
                          {userProfile.last_name || userProfile.full_name?.split(' ')[1] || ''}
                        </h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-600">{userProfile.email}</p>
                        </div>
                        {userProfile.phone && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-600">{userProfile.phone}</p>
                          </div>
                        )}
                        {sportInfo && (
                          <div className="mt-2">
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {sportInfo.emoji} {sportInfo.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  {isEditing ? (
                    <div>
                      <Label htmlFor="bio" className="text-sm">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio || ''}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        placeholder="Parlez-nous de vous, vos objectifs, votre motivation..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    userProfile.bio && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 text-sm leading-relaxed">{userProfile.bio}</p>
                      </div>
                    )
                  )}
                </div>

                {/* Informations complémentaires enrichies */}
                {isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm">Téléphone</Label>
                      <Input
                        id="phone"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        placeholder="Numéro de téléphone"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm">Ville</Label>
                      <Input
                        id="city"
                        value={editData.city || ''}
                        onChange={(e) => setEditData({...editData, city: e.target.value})}
                        placeholder="Votre ville"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm">Pays</Label>
                      <Input
                        id="country"
                        value={editData.country || ''}
                        onChange={(e) => setEditData({...editData, country: e.target.value})}
                        placeholder="Votre pays"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Informations de base étendues */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Calendar className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xs text-gray-500">Inscrit le</p>
                    <p className="text-sm font-semibold">
                      {userProfile.created_at ? formatDate(userProfile.created_at) : 'Inconnu'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xs text-gray-500">Objectif</p>
                    <p className="text-sm font-semibold">
                      {userProfile.primary_goals?.[0] || 'Non défini'}
                    </p>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xs text-gray-500">Localisation</p>
                    <p className="text-sm font-semibold">
                      {userProfile.city || userProfile.country || 'Non spécifié'}
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xs text-gray-500">Onboarding</p>
                    <p className="text-sm font-semibold">
                      {userProfile.onboarding_completed ? '✅ Complété' : '⏳ En cours'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet Modules Actifs */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-5 h-5" />
                  <span>Modules MyFitHero Activés</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeModulesInfo.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeModulesInfo.map((module: any) => (
                      <div key={module.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{module.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{module.name}</h3>
                            <p className="text-sm text-gray-600">{module.description}</p>
                            <Badge variant="outline" className="mt-1">
                              {module.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun module activé</h3>
                    <p className="text-gray-600 mb-4">
                      Activez des modules pendant l'onboarding pour personnaliser votre expérience
                    </p>
                    <Button onClick={() => router.push('/onboarding')}>
                      Configurer les modules
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations de training */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Configuration Entraînement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fréquence d'entraînement</p>
                    <p className="font-semibold">
                      {userProfile.training_frequency ? `${userProfile.training_frequency} fois/semaine` : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Niveau d'expérience</p>
                    <Badge variant="outline" className="capitalize">
                      {userProfile.fitness_experience || 'Non défini'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet Statistiques (conservé tel quel) */}
        {activeTab === 'stats' && userStats && derivedData && (
          <div className="space-y-6">
            
            {/* Niveau et XP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span>Niveau et Expérience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    Niveau {derivedData.level}
                  </div>
                  <p className="text-gray-600">{userStats.experience_points} XP total</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">
                      {derivedData.nextLevelXP} XP pour le niveau {derivedData.level + 1}
                    </span>
                  </div>
                  <Progress value={derivedData.levelProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Statistiques principales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Vos performances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Flame className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Série actuelle</p>
                    <p className="text-2xl font-bold text-blue-600">{userStats.current_streak}</p>
                    <p className="text-xs text-blue-600">jours</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <Dumbbell className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Entraînements</p>
                    <p className="text-2xl font-bold text-green-600">{userStats.total_workouts}</p>
                    <p className="text-xs text-green-600">sessions</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Calories</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {userStats.total_calories_burned?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-orange-600">brûlées</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Trophy className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Badges</p>
                    <p className="text-2xl font-bold text-purple-600">{userStats.badges_earned}</p>
                    <p className="text-xs text-purple-600">obtenus</p>
                  </div>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps total:</span>
                      <span className="font-semibold">
                        {Math.floor((userStats.total_workout_minutes || 0) / 60)}h{(userStats.total_workout_minutes || 0) % 60}min
                      </span>
                    </div>
                    {userStats.favorite_exercise && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exercice favori:</span>
                        <span className="font-semibold">{userStats.favorite_exercise}</span>
                      </div>
                    )}
                    {userStats.weekly_goal_completion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Objectif semaine:</span>
                        <span className="font-semibold">{userStats.weekly_goal_completion}%</span>
                      </div>
                    )}
                    {userStats.last_workout_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernier workout:</span>
                        <span className="font-semibold">
                          {formatDate(userStats.last_workout_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <BadgeDisplay className="w-full" maxDisplay={8} showProgress={true} />
          </div>
        )}

        {/* Onglet Sport avec informations enrichies */}
        {activeTab === 'sport' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5" />
                  <span>Profil sportif</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sport principal</p>
                      {sportInfo ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{sportInfo.emoji}</span>
                          <p className="font-semibold text-lg">{sportInfo.name}</p>
                        </div>
                      ) : (
                        <p className="font-semibold text-lg">Non spécifié</p>
                      )}
                      {sportInfo && (
                        <Badge variant="outline" className="mt-1">
                          {sportInfo.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Niveau d'expérience</p>
                      <Badge variant="outline" className="capitalize">
                        {userProfile.fitness_experience || 'Non défini'}
                      </Badge>
                    </div>
                    
                    {userProfile.sport_position && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Position</p>
                        <p className="font-semibold">{userProfile.sport_position}</p>
                      </div>
                    )}

                    {userProfile.sport_level && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Niveau sport</p>
                        <Badge variant="outline">
                          {userProfile.sport_level}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Âge</p>
                        <p className="font-semibold">
                          {userProfile.age ? `${userProfile.age} ans` : 'Non spécifié'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Genre</p>
                        <p className="font-semibold capitalize">
                          {userProfile.gender === 'male' ? 'Homme' : userProfile.gender === 'female' ? 'Femme' : 'Non spécifié'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Taille</p>
                        <p className="font-semibold">
                          {userProfile.height_cm ? `${userProfile.height_cm} cm` : 'Non spécifié'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Poids</p>
                        <p className="font-semibold">
                          {userProfile.weight_kg ? `${userProfile.weight_kg} kg` : 'Non spécifié'}
                        </p>
                      </div>
                    </div>

                    {derivedData?.bmi && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">IMC</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{derivedData.bmi.value}</span>
                          <Badge variant="outline" className={`${derivedData.bmi.color} ${derivedData.bmi.bgColor}`}>
                            {derivedData.bmi.category}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectifs */}
                {userProfile.primary_goals && userProfile.primary_goals.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-3">Objectifs principaux</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.primary_goals.map((goal, index) => (
                        <Badge key={index} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complétion du profil */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      Complétude du profil
                    </h3>
                    <p className="text-sm text-purple-700">
                      Profil {derivedData?.completionRate || 0}% complet
                    </p>
                  </div>
                  <Badge variant="outline" className="text-purple-700 border-purple-200">
                    {derivedData?.completionRate || 0}%
                  </Badge>
                </div>
                
                <Progress value={derivedData?.completionRate || 0} className="mb-4" />
                
                {(derivedData?.completionRate || 0) < 100 && (
                  <Button 
                    onClick={() => router.push('/onboarding')}
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Compléter le profil
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglet Paramètres (conservé tel quel) */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Paramètres du profil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/onboarding')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Refaire l'onboarding
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres généraux
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/privacy')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Confidentialité
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Dernière mise à jour: {userProfile.updated_at ? formatDate(userProfile.updated_at) : 'Inconnue'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
