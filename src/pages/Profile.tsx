import React, { useState, useEffect, useMemo } from 'react';
import { 
  User as UserIcon, Calendar, Target, PenTool, BarChart3, Clock, Zap, Ruler, Scale, Mail, 
  PlusCircle, Dumbbell, Star, Shield, Wind, Maximize, Brain
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import type { UserProfile as SupabaseDBUserProfileType } from '../integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

// --- CONFIGURATION DÉTAILLÉE DES PROFILS SPORTIFS ---

type Sport = 'basketball' | 'american_football' | 'strength_sports' | 'endurance_sports';

interface SportProfileConfig {
  name: string;
  emoji: string;
  positions: string[];
  specificStats: {
    key: keyof SupabaseDBUserProfileType['sport_specific_stats']; // Clé dans la DB (ex: vertical_jump)
    label: string; // Nom affiché (ex: 'Détente Verticale (cm)')
    unit: string; // Unité (ex: 'cm', 'kg', 's')
    icon: React.ElementType;
  }[];
  profileTip: string;
}

const sportsDetailData: Record<Sport, SportProfileConfig> = {
  basketball: {
    name: 'Basketball', emoji: '🏀',
    positions: ['Meneur (PG)', 'Arrière (SG)', 'Ailier (SF)', 'Ailier Fort (PF)', 'Pivot (C)'],
    specificStats: [
      { key: 'vertical_jump', label: 'Détente Verticale', unit: 'cm', icon: Maximize },
      { key: 'agility_time', label: 'Test d\'agilité', unit: 's', icon: Wind },
    ],
    profileTip: 'Une bonne détente verticale commence par un renforcement des jambes et du tronc. Intégrez des squats et des box jumps dans votre routine.'
  },
  american_football: {
    name: 'Football Américain', emoji: '🏈',
    positions: ['Quarterback (QB)', 'Running Back (RB)', 'Wide Receiver (WR)', 'Linebacker (LB)', 'Cornerback (CB)'],
    specificStats: [
      { key: 'bench_press_max', label: 'Développé Couché Max', unit: 'kg', icon: Dumbbell },
      { key: 'sprint_40y', label: 'Sprint 40 Yards', unit: 's', icon: Wind },
    ],
    profileTip: 'La puissance explosive est reine. Travaillez vos sprints et vos exercices de force comme le Power Clean pour dominer sur le terrain.'
  },
  strength_sports: {
    name: 'Force Athlétique', emoji: '🏋️‍♂️',
    positions: ['Powerlifting', 'Haltérophilie', 'Strongman'],
    specificStats: [
      { key: 'squat_max', label: 'Squat Max', unit: 'kg', icon: Dumbbell },
      { key: 'bench_press_max', label: 'Développé Couché Max', unit: 'kg', icon: Dumbbell },
      { key: 'deadlift_max', label: 'Soulevé de Terre Max', unit: 'kg', icon: Dumbbell },
    ],
    profileTip: 'La technique est aussi importante que la force. Filmez vos levers lourds pour analyser votre forme et éviter les blessures.'
  },
  endurance_sports: {
    name: 'Sports d\'Endurance', emoji: '🏃‍♀️',
    positions: ['Marathon', 'Cyclisme sur route', 'Triathlon'],
    specificStats: [
      { key: 'vo2_max', label: 'VO2 Max', unit: 'ml/kg/min', icon: Heart },
      { key: 'ftp', label: 'Puissance (FTP)', unit: 'watts', icon: Zap },
    ],
    profileTip: 'La récupération est une partie intégrante de l\'entraînement. Intégrez des jours de repos actif pour progresser sur le long terme.'
  }
};

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
  const { user: appStoreUser, updateProfile } = useAppStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formValues, setFormValues] = useState({
    // ... autres champs du formulaire
    sport: appStoreUser.sport || 'basketball',
    sport_position: appStoreUser.sport_position || '',
    sport_level: appStoreUser.sport_level || '',
    sport_specific_stats: appStoreUser.sport_specific_stats || {},
  });

  // Le profil sportif est dérivé du sport sélectionné dans le formulaire
  const sportConfig = useMemo(() => {
    const selectedSport = formValues.sport as Sport;
    return sportsDetailData[selectedSport] || sportsDetailData.basketball; // fallback
  }, [formValues.sport]);

  useEffect(() => {
    // Si l'utilisateur change de sport en mode édition, on réinitialise la position
    if (isEditing) {
      setFormValues(prev => ({ ...prev, sport_position: '' }));
    }
  }, [formValues.sport, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      sport_specific_stats: {
        ...prev.sport_specific_stats,
        [name]: Number(value)
      }
    }));
  };

  const handleSave = async () => {
    // ... (logique de sauvegarde, en incluant sport_specific_stats)
  };
  
  // --- Sous-composants pour une UI plus propre ---

  const SportBadge = () => (
    <div className="bg-blue-600 text-white p-4 rounded-xl text-center shadow-lg">
      <div className="text-4xl">{sportConfig.emoji}</div>
      <h3 className="text-xl font-bold mt-2">{appStoreUser.sport ? sportsDetailData[appStoreUser.sport as Sport]?.name : 'Non défini'}</h3>
      <p className="text-blue-200">{appStoreUser.sport_level || 'Niveau non défini'}</p>
      <p className="font-semibold mt-1">{appStoreUser.sport_position || 'Position non définie'}</p>
    </div>
  );

  const StatCard = ({ stat }: { stat: { key: string; label: string; unit: string; icon: React.ElementType; }}) => {
    const StatIcon = stat.icon;
    const value = appStoreUser.sport_specific_stats?.[stat.key] || 0;
    return (
      <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
        <StatIcon className="text-blue-600" size={24} />
        <div>
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="font-bold text-gray-800 text-lg">{value} <span className="text-sm font-normal">{stat.unit}</span></p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        {/* ... (Header et Infos Générales inchangés) ... */}

        {/* --- NOUVELLE SECTION PROFIL SPORTIF --- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-3 text-2xl">{sportConfig.emoji}</span> Profil Sportif
              </h2>
          </div>

          {isEditing ? (
            // --- MODE ÉDITION ---
            <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Votre Sport Principal</label>
                  <select name="sport" value={formValues.sport} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    {Object.keys(sportsDetailData).map(key => (
                      <option key={key} value={key}>{sportsDetailData[key as Sport].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Votre Position/Spécialité</label>
                  <select name="sport_position" value={formValues.sport_position} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Sélectionner une position</option>
                    {sportConfig.positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mt-4 mb-2">Vos Statistiques Clés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sportConfig.specificStats.map(stat => (
                      <div key={stat.key}>
                        <label className="block text-sm font-medium text-gray-700">{stat.label} ({stat.unit})</label>
                        <input
                          type="number"
                          name={stat.key}
                          value={formValues.sport_specific_stats?.[stat.key] || ''}
                          onChange={handleStatChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          ) : (
            // --- MODE VUE ---
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SportBadge />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Statistiques de Performance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sportConfig.specificStats.map(stat => (
                       <StatCard key={stat.key} stat={stat} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Conseil du Profil</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-800">{sportConfig.profileTip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ... (autres sections et bouton de sauvegarde) ... */}
      </div>
    </div>
  );
};

export default Profile;
