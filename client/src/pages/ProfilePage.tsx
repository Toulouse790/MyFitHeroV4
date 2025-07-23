import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Calendar, Target, 
  Dumbbell, Star, 
  Trophy, TrendingUp, Flame, Edit,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UniformHeader } from '@/components/UniformHeader';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { UserDataService } from '@/services/userDataService';
import { UserProfile } from '@/types/user';
import { I18nDemo } from '@/components/I18nDemo';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors du chargement du profil:', profileError);
        return;
      }

      setUserProfile(profile);
      
      // Initialiser les données d'édition avec les valeurs du profil
      setEditData({
        ...profile,
        first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
        last_name: profile.last_name || profile.full_name?.split(' ')[1] || '',
        bio: profile.bio || ''
      });

      // Charger les statistiques
      const stats = await UserDataService.getUserStats(user.id);
      setUserStats(stats);

      // Note: badgeStats supprimé car non utilisé dans l'interface

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
  };

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: `${editData.first_name} ${editData.last_name}`.trim(),
          bio: editData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) {
        throw error;
      }

      setUserProfile({ ...userProfile, ...editData });
      setIsEditing(false);
      
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
        variant: "default"
      });

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(userProfile || {});
    setIsEditing(false);
  };

  const getLevel = (experience: number): number => {
    return Math.floor(experience / 1000) + 1;
  };

  const getExperienceForNextLevel = (experience: number): number => {
    const currentLevel = getLevel(experience);
    return currentLevel * 1000 - experience;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Profil"
          showBackButton={true}
          gradient={true}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="p-4">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">
                Profil non trouvé
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Profil"
        showBackButton={true}
        gradient={true}
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white hover:bg-white/20"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Carte profil principal */}
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
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          id="first_name"
                          value={editData.first_name || ''}
                          onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                          placeholder="Prénom"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          id="last_name"
                          value={editData.last_name || ''}
                          onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                          placeholder="Nom"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">
                      {userProfile.first_name || userProfile.full_name?.split(' ')[0] || ''} {userProfile.last_name || userProfile.full_name?.split(' ')[1] || ''}
                    </h2>
                    <p className="text-gray-600">{userProfile.email}</p>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                />
              </div>
            ) : (
              userProfile.bio && (
                <p className="text-gray-700">{userProfile.bio}</p>
              )
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <Calendar className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                <p className="text-sm text-gray-600">Inscrit le</p>
                <p className="font-semibold">{userProfile.created_at ? formatDate(userProfile.created_at) : 'Date inconnue'}</p>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 mx-auto text-gray-600 mb-1" />
                <p className="text-sm text-gray-600">Objectif</p>
                <p className="font-semibold">{userProfile.fitness_goal || 'Non spécifié'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        {userStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Statistiques</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Flame className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Streak actuelle</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats.current_streak}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Niveau</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.level}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Dumbbell className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Workouts</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.total_workouts}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600">Badges</p>
                  <p className="text-2xl font-bold text-yellow-600">{userStats.badges_earned}</p>
                </div>
              </div>
              
              {/* Barre de progression d'expérience */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Expérience</span>
                  <span className="text-sm text-gray-600">
                    {userStats.experience_points} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ 
                      width: `${((userStats.experience_points % 1000) / 1000) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getExperienceForNextLevel(userStats.experience_points)} XP pour le niveau {getLevel(userStats.experience_points) + 1}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        <BadgeDisplay className="w-full" maxDisplay={5} />

        {/* Informations du profil sportif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="w-5 h-5" />
              <span>Profil sportif</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sport principal</p>
                  <p className="font-semibold">{userProfile.sport_name || userProfile.sport || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Niveau</p>
                  <p className="font-semibold">{userProfile.sport_level || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-semibold">{userProfile.sport_position || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="font-semibold">{userProfile.age ? `${userProfile.age} ans` : 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Démo i18n et conversion d'unités */}
        <I18nDemo />
      </div>
    </div>
  );
};

export default ProfilePage;
