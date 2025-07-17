import React, { useState } from 'react';
import { 
  User as UserIcon, Calendar, 
  Dumbbell, Star, MapPin, Mail, Phone,
  Trophy, TrendingUp, Flame, Edit, Save,
  X, Camera, Settings, Shield, Heart,
  Activity, Weight, Ruler
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UniformHeader } from '@/components/UniformHeader';

const ProfilePageComplete: React.FC = () => {
  const { toast } = useToast();
  const { appStoreUser, setUser } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: appStoreUser?.name || '',
    username: appStoreUser?.username || '',
    email: appStoreUser?.email || '',
    phone: appStoreUser?.phone || '',
    age: appStoreUser?.age || '',
    height_cm: appStoreUser?.height_cm || '',
    weight_kg: appStoreUser?.weight_kg || '',
    sport: appStoreUser?.sport || '',
    sport_position: appStoreUser?.sport_position || '',
    fitness_experience: appStoreUser?.fitness_experience || '',
    primary_goals: appStoreUser?.primary_goals || [],
    bio: appStoreUser?.bio || '',
    city: appStoreUser?.city || '',
    country: appStoreUser?.country || ''
  });

  // États pour les statistiques simulées
  const [userStats] = useState({
    totalWorkouts: 127,
    totalHours: 89,
    caloriesBurned: 23650,
    currentStreak: 12,
    longestStreak: 28,
    achievements: 15,
    level: 18
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: appStoreUser?.name || '',
      username: appStoreUser?.username || '',
      email: appStoreUser?.email || '',
      phone: appStoreUser?.phone || '',
      age: appStoreUser?.age || '',
      height_cm: appStoreUser?.height_cm || '',
      weight_kg: appStoreUser?.weight_kg || '',
      sport: appStoreUser?.sport || '',
      sport_position: appStoreUser?.sport_position || '',
      fitness_experience: appStoreUser?.fitness_experience || '',
      primary_goals: appStoreUser?.primary_goals || [],
      bio: appStoreUser?.bio || '',
      city: appStoreUser?.city || '',
      country: appStoreUser?.country || ''
    });
  };

  const handleSave = async () => {
    if (!appStoreUser?.id) return;

    try {
      setSaving(true);

      // Mettre à jour le profil dans Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editData.name,
          username: editData.username,
          phone: editData.phone,
          age: parseInt(editData.age.toString()) || null,
          height_cm: parseInt(editData.height_cm.toString()) || null,
          weight_kg: parseFloat(editData.weight_kg.toString()) || null,
          sport: editData.sport,
          sport_position: editData.sport_position,
          fitness_experience: editData.fitness_experience,
          primary_goals: editData.primary_goals,
          bio: editData.bio,
          city: editData.city,
          country: editData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', appStoreUser.id);

      if (error) throw error;

      // Mettre à jour le store local
      setUser({
        ...appStoreUser,
        ...editData,
        age: parseInt(editData.age.toString()) || null,
        height_cm: parseInt(editData.height_cm.toString()) || null,
        weight_kg: parseFloat(editData.weight_kg.toString()) || null,
        fitness_experience: editData.fitness_experience as 'beginner' | 'intermediate' | 'advanced' | 'expert' | null,
      });

      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: appStoreUser?.name || '',
      username: appStoreUser?.username || '',
      email: appStoreUser?.email || '',
      phone: appStoreUser?.phone || '',
      age: appStoreUser?.age || '',
      height_cm: appStoreUser?.height_cm || '',
      weight_kg: appStoreUser?.weight_kg || '',
      sport: appStoreUser?.sport || '',
      sport_position: appStoreUser?.sport_position || '',
      fitness_experience: appStoreUser?.fitness_experience || '',
      primary_goals: appStoreUser?.primary_goals || [],
      bio: appStoreUser?.bio || '',
      city: appStoreUser?.city || '',
      country: appStoreUser?.country || ''
    });
  };

  const calculateBMI = () => {
    if (appStoreUser?.height_cm && appStoreUser?.weight_kg) {
      const heightM = appStoreUser.height_cm / 100;
      return (appStoreUser.weight_kg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Poids normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Surpoids', color: 'text-yellow-600' };
    return { label: 'Obésité', color: 'text-red-600' };
  };

  const getLevelInfo = (level: number) => {
    const nextLevel = level + 1;
    const currentXP = (level - 1) * 100 + 78; // XP simulé
    const nextLevelXP = level * 100;
    const progress = (78 / 100) * 100; // 78% vers le niveau suivant
    
    return { nextLevel, currentXP, nextLevelXP, progress };
  };

  const levelInfo = getLevelInfo(userStats.level);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <UniformHeader
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles"
        showBackButton={true}
        gradient={true}
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Carte Profil Principal */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            {/* Photo de profil */}
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon size={32} className="text-white" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Camera size={12} className="text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold">
                      {appStoreUser?.name || 'Utilisateur'}
                    </h1>
                    <p className="text-white/80">
                      @{appStoreUser?.username || 'username'}
                    </p>
                    <div className="flex items-center mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span className="text-sm text-white/80">
                        {appStoreUser?.city || 'Ville'}, {appStoreUser?.country || 'Pays'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={isEditing ? handleCancel : handleEdit}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {isEditing ? <X size={16} /> : <Edit size={16} />}
                  </Button>
                </div>
                
                {/* Niveau et XP */}
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">Niveau {userStats.level}</span>
                    <span className="text-xs text-white/60">
                      {levelInfo.currentXP}/{levelInfo.nextLevelXP} XP
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${levelInfo.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={editData.username}
                      onChange={(e) => setEditData({...editData, username: e.target.value})}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      placeholder="email@example.com"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Âge</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData({...editData, age: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Taille (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={editData.height_cm}
                      onChange={(e) => setEditData({...editData, height_cm: e.target.value})}
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={editData.weight_kg}
                      onChange={(e) => setEditData({...editData, weight_kg: e.target.value})}
                      placeholder="70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sport">Sport principal</Label>
                    <select 
                      value={editData.sport} 
                      onChange={(e) => setEditData({...editData, sport: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir un sport</option>
                      <option value="basketball">Basketball</option>
                      <option value="football">Football</option>
                      <option value="tennis">Tennis</option>
                      <option value="musculation">Musculation</option>
                      <option value="running">Course à pied</option>
                      <option value="swimming">Natation</option>
                      <option value="cycling">Cyclisme</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Niveau d'expérience</Label>
                    <select 
                      value={editData.fitness_experience} 
                      onChange={(e) => setEditData({...editData, fitness_experience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Niveau</option>
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={editData.city}
                      onChange={(e) => setEditData({...editData, city: e.target.value})}
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={editData.country}
                      onChange={(e) => setEditData({...editData, country: e.target.value})}
                      placeholder="France"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Parlez-nous de vous..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={16} className="mr-2" />}
                    Sauvegarder
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <X size={16} className="mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {appStoreUser?.bio && (
                  <p className="text-gray-600 italic">"{appStoreUser.bio}"</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm">{appStoreUser?.email}</span>
                  </div>
                  {appStoreUser?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm">{appStoreUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations Physiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              Informations Physiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-blue-600" size={16} />
                  <span className="text-sm font-medium">Âge</span>
                </div>
                <span className="font-bold text-blue-600">
                  {appStoreUser?.age || '--'} ans
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Ruler className="text-green-600" size={16} />
                  <span className="text-sm font-medium">Taille</span>
                </div>
                <span className="font-bold text-green-600">
                  {appStoreUser?.height_cm || '--'} cm
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Weight className="text-orange-600" size={16} />
                  <span className="text-sm font-medium">Poids</span>
                </div>
                <span className="font-bold text-orange-600">
                  {appStoreUser?.weight_kg || '--'} kg
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="text-purple-600" size={16} />
                  <span className="text-sm font-medium">IMC</span>
                </div>
                <div className="text-right">
                  {calculateBMI() ? (
                    <>
                      <div className="font-bold text-purple-600">{calculateBMI()}</div>
                      <div className={`text-xs ${getBMICategory(parseFloat(calculateBMI()!)).color}`}>
                        {getBMICategory(parseFloat(calculateBMI()!)).label}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sport et Expérience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Dumbbell className="mr-2" size={20} />
              Sport et Expérience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl mb-2">🏀</div>
                <div className="font-medium text-blue-800">
                  {appStoreUser?.sport?.replace('_', ' ').toUpperCase() || 'SPORT'}
                </div>
                <div className="text-sm text-blue-600">Sport principal</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-medium text-green-800">
                  {appStoreUser?.fitness_experience?.toUpperCase() || 'NIVEAU'}
                </div>
                <div className="text-sm text-green-600">Expérience</div>
              </div>
            </div>
            
            {appStoreUser?.sport_position && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
                <div className="font-medium text-yellow-800">
                  Position: {appStoreUser.sport_position}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Mes Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{userStats.totalWorkouts}</div>
                <div className="text-sm text-red-600">Entraînements</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalHours}h</div>
                <div className="text-sm text-blue-600">Temps total</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.caloriesBurned.toLocaleString()}</div>
                <div className="text-sm text-orange-600">Calories brûlées</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
                <div className="text-sm text-green-600">Série actuelle</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Trophy className="text-purple-600" size={16} />
                  <span className="text-sm font-medium">Achievements</span>
                </div>
                <span className="font-bold text-purple-600">{userStats.achievements}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Flame className="text-yellow-600" size={16} />
                  <span className="text-sm font-medium">Record Série</span>
                </div>
                <span className="font-bold text-yellow-600">{userStats.longestStreak} jours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" size={20} />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Shield size={20} />
                <span className="text-sm">Confidentialité</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Settings size={20} />
                <span className="text-sm">Paramètres</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Trophy size={20} />
                <span className="text-sm">Achievements</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Star size={20} />
                <span className="text-sm">Favoris</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePageComplete;
