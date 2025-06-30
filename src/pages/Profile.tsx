import React, { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, Target, TrendingUp, Mail, Ruler, Scale, Heart, Shield, Dumbbell as DumbbellIcon, PlusCircle, PenTool, BarChart3, Clock, Zap } from 'lucide-react';
import { useAppStore, UserProfile as AppStoreUserProfile } from '@/stores/useAppStore'; // Importe le UserProfile unifié du store
import { User as SupabaseAuthUserType } from '@supabase/supabase-js'; // Importe le type User de Supabase
import { supabase, UserProfile as SupabaseDBUserProfileType } from '../lib/supabase'; // Importe le type UserProfile de la DB Supabase

interface ProfileProps {
  userProfile?: SupabaseAuthUserType; // Le user de la session Supabase
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
  const { user: appStoreUser, updateProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: appStoreUser.full_name || '',
    username: appStoreUser.username || '',
    email: appStoreUser.email || '',
    age: appStoreUser.age || 0,
    height_cm: appStoreUser.height_cm || 0,
    weight_kg: appStoreUser.weight_kg || 0,
    gender: appStoreUser.gender || '',
    fitness_goal: appStoreUser.fitness_goal || '',
    activity_level: appStoreUser.activity_level || '',
    lifestyle: appStoreUser.lifestyle || '',
    available_time_per_day: appStoreUser.available_time_per_day || 0,
    fitness_experience: appStoreUser.fitness_experience || '',
    injuries: appStoreUser.injuries?.join(', ') || '',
    primary_goals: appStoreUser.primary_goals?.join(', ') || '',
    motivation: appStoreUser.motivation || '',
    sport: appStoreUser.sport || '',
    sport_position: appStoreUser.sport_position || '',
    sport_level: appStoreUser.sport_level || '',
    training_frequency: appStoreUser.training_frequency || 0,
    season_period: appStoreUser.season_period || '',
  });

  useEffect(() => {
    // Mettre à jour les valeurs du formulaire si le profil du store change
    setFormValues({
      fullName: appStoreUser.full_name || '',
      username: appStoreUser.username || '',
      email: appStoreUser.email || '',
      age: appStoreUser.age || 0,
      height_cm: appStoreUser.height_cm || 0,
      weight_kg: appStoreUser.weight_kg || 0,
      gender: appStoreUser.gender || '',
      fitness_goal: appStoreUser.fitness_goal || '',
      activity_level: appStoreUser.activity_level || '',
      lifestyle: appStoreUser.lifestyle || '',
      available_time_per_day: appStoreUser.available_time_per_day || 0,
      fitness_experience: appStoreUser.fitness_experience || '',
      injuries: appStoreUser.injuries?.join(', ') || '',
      primary_goals: appStoreUser.primary_goals?.join(', ') || '',
      motivation: appStoreUser.motivation || '',
      sport: appStoreUser.sport || '',
      sport_position: appStoreUser.sport_position || '',
      sport_level: appStoreUser.sport_level || '',
      training_frequency: appStoreUser.training_frequency || 0,
      season_period: appStoreUser.season_period || '',
    });
  }, [appStoreUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userProfile?.id) {
      alert('Utilisateur non connecté.');
      return;
    }

    try {
      // Les mises à jour envoyées à Supabase doivent correspondre au SupabaseDBUserProfileType
      const updates: Partial<SupabaseDBUserProfileType> = {
        full_name: formValues.fullName,
        username: formValues.username,
        age: formValues.age,
        height_cm: formValues.height_cm,
        weight_kg: formValues.weight_kg,
        gender: formValues.gender,
        fitness_goal: formValues.fitness_goal,
        activity_level: formValues.activity_level,
        lifestyle: formValues.lifestyle,
        available_time_per_day: formValues.available_time_per_day,
        fitness_experience: formValues.fitness_experience,
        injuries: formValues.injuries.split(',').map(s => s.trim()).filter(Boolean),
        primary_goals: formValues.primary_goals.split(',').map(s => s.trim()).filter(Boolean),
        motivation: formValues.motivation,
        sport: formValues.sport,
        sport_position: formValues.sport_position,
        sport_level: formValues.sport_level,
        training_frequency: formValues.training_frequency,
        season_period: formValues.season_period,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Mettre à jour le store Zustand avec les données fraîchement sauvegardées,
        // en combinant les données de la DB avec les champs locaux du store.
        updateProfile({
          ...data,
          name: data.full_name || data.username || 'Non défini',
          email: userProfile.email || '', // Conserver l'email de l'authentification
          goal: data.fitness_goal || 'Non défini',
          level: appStoreUser.level, // Conserver les valeurs locales
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        } as AppStoreUserProfile); // Cast pour s'assurer que c'est le type complet du store
        setIsEditing(false);
        alert('Profil mis à jour avec succès !');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error.message);
      alert('Erreur lors de la mise à jour du profil: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations et préférences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PenTool size={20} />
            <span className="hidden sm:inline">{isEditing ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        {/* Section Infos Générales */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <UserIcon className="mr-2 text-blue-600" size={20} /> Informations Générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom Complet</label>
              {isEditing ? (
                <input type="text" name="fullName" value={formValues.fullName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.full_name || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pseudo</label>
              {isEditing ? (
                <input type="text" name="username" value={formValues.username} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.username || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Mail size={16} />{appStoreUser.email || 'Non défini'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Âge</label>
              {isEditing ? (
                <input type="number" name="age" value={formValues.age} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.age || 'Non défini'} ans</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
              {isEditing ? (
                <input type="number" name="height_cm" value={formValues.height_cm} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Ruler size={16} />{appStoreUser.height_cm || 'Non défini'} cm</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
              {isEditing ? (
                <input type="number" name="weight_kg" value={formValues.weight_kg} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Scale size={16} />{appStoreUser.weight_kg || 'Non défini'} kg</p>
              )}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Genre</label>
              {isEditing ? (
                <select name="gender" value={formValues.gender} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.gender || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Objectifs & Activité */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2 text-green-600" size={20} /> Objectifs & Activité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Objectif Fitness Principal</label>
              {isEditing ? (
                <input type="text" name="fitness_goal" value={formValues.fitness_goal} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.fitness_goal || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau d'Activité</label>
              {isEditing ? (
                <input type="text" name="activity_level" value={formValues.activity_level} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.activity_level || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Objectifs Primaires (séparés par des virgules)</label>
              {isEditing ? (
                <textarea name="primary_goals" value={formValues.primary_goals} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.primary_goals?.join(', ') || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Motivation</label>
              {isEditing ? (
                <textarea name="motivation" value={formValues.motivation} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.motivation || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Contexte Sportif */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <DumbbellIcon className="mr-2 text-orange-600" size={20} /> Contexte Sportif
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sport</label>
              {isEditing ? (
                <input type="text" name="sport" value={formValues.sport} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poste/Spécialité</label>
              {isEditing ? (
                <input type="text" name="sport_position" value={formValues.sport_position} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport_position || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau Sportif</label>
              {isEditing ? (
                <select name="sport_level" value={formValues.sport_level} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="recreational">Loisir</option>
                  <option value="amateur_competitive">Amateur Compétitif</option>
                  <option value="semi_professional">Semi-Professionnel</option>
                  <option value="professional">Professionnel</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport_level || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fréquence d'entraînement (par semaine)</label>
              {isEditing ? (
                <input type="number" name="training_frequency" value={formValues.training_frequency} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.training_frequency || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Période de la Saison</label>
              {isEditing ? (
                <select name="season_period" value={formValues.season_period} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="off_season">Hors saison</option>
                  <option value="pre_season">Pré-saison</option>
                  <option value="in_season">En saison</option>
                  <option value="recovery">Récupération</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.season_period || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>


        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mt-6"
          >
            <PlusCircle size={20} className="mr-2" />
            Sauvegarder les modifications
          </button>
        )}

        {/* Section Stats Rapides (basées sur le store) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" size={20} /> Mes Statistiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Zap size={20} className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Niveau</p>
                <p className="font-semibold text-gray-800">{appStoreUser.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Clock size={20} className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">XP Total</p>
                <p className="font-semibold text-gray-800">{appStoreUser.totalPoints}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Calendar size={20} className="text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-semibold text-gray-800">{appStoreUser.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Profile;