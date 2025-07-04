import React, { useState, useMemo } from 'react';
import { 
  User as UserIcon, Calendar, Target, PenTool, BarChart3, Clock, Zap, 
  Ruler, Scale, Mail, PlusCircle, Dumbbell, Star, Shield, Wind, 
  Maximize, Brain, Heart, Trophy, Award, TrendingUp, Flame 
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';

// --- TYPES ---
type Sport = 'basketball' | 'american_football' | 'strength_sports' | 'endurance_sports' | 'tennis' | 'football';

interface SportProfileConfig {
  name: string;
  emoji: string;
  positions: string[];
  specificStats: {
    key: string;
    label: string;
    unit: string;
    icon: React.ElementType;
  }[];
  profileTip: string;
}

// --- CONFIGURATION PROFILS SPORTIFS ---
const sportsDetailData: Record<Sport, SportProfileConfig> = {
  basketball: {
    name: 'Basketball', emoji: '🏀',
    positions: ['Meneur (PG)', 'Arrière (SG)', 'Ailier (SF)', 'Ailier Fort (PF)', 'Pivot (C)'],
    specificStats: [
      { key: 'vertical_jump', label: 'Détente Verticale', unit: 'cm', icon: Maximize },
      { key: 'agility_time', label: 'Test d\'agilité', unit: 's', icon: Wind },
      { key: 'free_throw_pct', label: 'Lancers Francs', unit: '%', icon: Target },
    ],
    profileTip: 'Une bonne détente verticale commence par un renforcement des jambes et du tronc. Intégrez des squats et des box jumps dans votre routine.'
  },
  american_football: {
    name: 'Football Américain', emoji: '🏈',
    positions: ['Quarterback (QB)', 'Running Back (RB)', 'Wide Receiver (WR)', 'Linebacker (LB)', 'Cornerback (CB)'],
    specificStats: [
      { key: 'bench_press_max', label: 'Développé Couché Max', unit: 'kg', icon: Dumbbell },
      { key: 'sprint_40y', label: 'Sprint 40 Yards', unit: 's', icon: Wind },
      { key: 'squat_max', label: 'Squat Max', unit: 'kg', icon: Dumbbell },
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
      { key: 'marathon_time', label: 'Temps Marathon', unit: 'h:min', icon: Clock },
    ],
    profileTip: 'La récupération est une partie intégrante de l\'entraînement. Intégrez des jours de repos actif pour progresser sur le long terme.'
  },
  tennis: {
    name: 'Tennis', emoji: '🎾',
    positions: ['Baseliner', 'Serve-and-Volleyer', 'All-Court'],
    specificStats: [
      { key: 'serve_speed', label: 'Vitesse Service', unit: 'km/h', icon: Zap },
      { key: 'agility_time', label: 'Test Agilité', unit: 's', icon: Wind },
      { key: 'match_endurance', label: 'Endurance Match', unit: 'min', icon: Clock },
    ],
    profileTip: 'L\'agilité et la vitesse de déplacement sont cruciales. Travaillez vos changements de direction et votre explosivité latérale.'
  },
  football: {
    name: 'Football', emoji: '⚽',
    positions: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
    specificStats: [
      { key: 'sprint_speed', label: 'Vitesse Sprint', unit: 'km/h', icon: Wind },
      { key: 'vo2_max', label: 'VO2 Max', unit: 'ml/kg/min', icon: Heart },
      { key: 'shooting_accuracy', label: 'Précision Tir', unit: '%', icon: Target },
    ],
    profileTip: 'L\'endurance est la base, mais ne négligez pas la vitesse et l\'agilité. Alternez travail aérobie et anaérobie pour un développement complet.'
  }
};

const Profile: React.FC = () => {
  // --- DONNÉES DU STORE ---
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // --- MAPPING SPORT ---
  const getSportCategory = (sport: string): Sport => {
    const mappings: Record<string, Sport> = {
      'basketball': 'basketball',
      'american_football': 'american_football',
      'musculation': 'strength_sports',
      'powerlifting': 'strength_sports', 
      'weightlifting': 'strength_sports',
      'running': 'endurance_sports',
      'cycling': 'endurance_sports',
      'swimming': 'endurance_sports',
      'tennis': 'tennis',
      'football': 'football'
    };
    return mappings[sport?.toLowerCase()] || 'strength_sports';
  };

  const userSportCategory = getSportCategory(appStoreUser.sport || 'none');
  const sportConfig = sportsDetailData[userSportCategory];

  // --- CALCULS PERSONNALISÉS ---
  const personalizedInsights = useMemo(() => {
    const insights = [];
    
    // Analyse des objectifs
    if (appStoreUser.primary_goals?.includes('weight_loss')) {
      insights.push({
        icon: TrendingUp,
        title: 'Perte de Poids',
        value: `${appStoreUser.daily_calories || '?'} kcal/jour`,
        color: 'text-red-500',
        tip: 'Déficit calorique optimal calculé pour votre profil'
      });
    }
    
    if (appStoreUser.primary_goals?.includes('muscle_gain')) {
      insights.push({
        icon: Dumbbell,
        title: 'Prise de Masse',
        value: `${Math.round((appStoreUser.daily_calories || 2000) * 0.2 / 4)}g protéines`,
        color: 'text-blue-500',
        tip: 'Apport protéique optimisé pour la croissance musculaire'
      });
    }
    
    // Analyse du sport
    if (appStoreUser.sport) {
      insights.push({
        icon: Trophy,
        title: 'Performance Sport',
        value: `Niveau ${appStoreUser.sport_level || 'Amateur'}`,
        color: 'text-purple-500',
        tip: `Programmes adaptés pour ${sportConfig.name}`
      });
    }
    
    // Analyse de la fréquence d'entraînement
    if (appStoreUser.training_frequency) {
      const frequency = appStoreUser.training_frequency;
      let assessment = 'Optimal';
      if (frequency < 2) assessment = 'Augmentez';
      if (frequency > 6) assessment = 'Attention surmenage';
      
      insights.push({
        icon: Calendar,
        title: 'Fréquence',
        value: `${frequency}x/semaine`,
        color: frequency >= 3 && frequency <= 5 ? 'text-green-500' : 'text-orange-500',
        tip: `${assessment} pour vos objectifs`
      });
    }
    
    return insights;
  }, [appStoreUser, sportConfig]);

  // --- FORM STATE ---
  const [formValues, setFormValues] = useState({
    sport: appStoreUser.sport || 'basketball',
    sport_position: appStoreUser.sport_position || '',
    sport_level: appStoreUser.sport_level || 'recreational',
    training_frequency: appStoreUser.training_frequency || 3,
    primary_goals: appStoreUser.primary_goals || [],
    sport_specific_stats: appStoreUser.sport_specific_stats || {},
  });

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
    try {
      // Ici tu appellerais ton API Supabase
      // const { error } = await supabase.from('user_profiles').update(formValues).eq('id', userId);
      
      // Mise à jour du store
      updateAppStoreUserProfile({
        ...formValues,
        sport_specific_stats: formValues.sport_specific_stats
      });
      
      setIsEditing(false);
      toast({
        title: "Profil mis à jour !",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive"
      });
    }
  };

  // --- COMPOSANTS ---
  const SportBadge = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center shadow-lg">
      <div className="text-5xl mb-3">{sportConfig.emoji}</div>
      <h3 className="text-xl font-bold mb-1">{sportConfig.name}</h3>
      <p className="text-blue-200 text-sm">{appStoreUser.sport_level || 'Niveau non défini'}</p>
      <p className="font-semibold mt-2 text-blue-100">{appStoreUser.sport_position || 'Position non définie'}</p>
      <div className="mt-3 text-xs text-blue-200">
        {appStoreUser.training_frequency || 0}x/semaine • {appStoreUser.season_period || 'Saison'}
      </div>
    </div>
  );

  const StatCard = ({ stat }: { stat: any }) => {
    const StatIcon = stat.icon;
    const value = appStoreUser.sport_specific_stats?.[stat.key] || 0;
    return (
      <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4 hover:bg-gray-100 transition-colors">
        <div className="p-2 bg-blue-100 rounded-lg">
          <StatIcon className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="font-bold text-gray-800 text-lg">
            {value > 0 ? `${value} ${stat.unit}` : 'Non défini'}
          </p>
        </div>
      </div>
    );
  };

  const InsightCard = ({ insight }: { insight: any }) => {
    const InsightIcon = insight.icon;
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-2">
          <InsightIcon className={`${insight.color}`} size={20} />
          <span className="font-semibold text-gray-800">{insight.title}</span>
        </div>
        <p className={`font-bold text-lg ${insight.color} mb-1`}>{insight.value}</p>
        <p className="text-xs text-gray-500">{insight.tip}</p>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
    
        {/* Header Personnalisé */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3 text-3xl">{sportConfig.emoji}</span>
              Mon Profil
            </h1>
            <p className="text-gray-600">
              {appStoreUser.name || 'Utilisateur'} • {appStoreUser.sport || 'Sport'} • Membre depuis {appStoreUser.joinDate || 'récemment'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PenTool size={16} />
            <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        {/* Insights Personnalisés */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Vos Insights Personnalisés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizedInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        {/* Section Profil Sportif */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport Principal</label>
                <select 
                  name="sport" 
                  value={formValues.sport} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(sportsDetailData).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position/Spécialité</label>
                <select 
                  name="sport_position" 
                  value={formValues.sport_position} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une position</option>
                  {sportConfig.positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select 
                  name="sport_level" 
                  value={formValues.sport_level} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recreational">Loisir</option>
                  <option value="amateur_competitive">Amateur compétitif</option>
                  <option value="semi_professional">Semi-professionnel</option>
                  <option value="professional">Professionnel</option>
                </select>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-800 mt-4 mb-2">Statistiques de Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sportConfig.specificStats.map(stat => (
                    <div key={stat.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {stat.label} ({stat.unit})
                      </label>
                      <input
                        type="number"
                        name={stat.key}
                        value={formValues.sport_specific_stats?.[stat.key] || ''}
                        onChange={handleStatChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Sauvegarder les modifications
              </button>
            </div>
          ) : (
            // --- MODE AFFICHAGE ---
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SportBadge />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Statistiques de Performance</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {sportConfig.specificStats.map(stat => (
                      <StatCard key={stat.key} stat={stat} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Conseil du Coach</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-800">{sportConfig.profileTip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations Générales */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="font-semibold text-gray-800">{appStoreUser.age || 'Non défini'} ans</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserIcon className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="font-semibold text-gray-800">
                    {appStoreUser.gender === 'male' ? 'Homme' : appStoreUser.gender === 'female' ? 'Femme' : 'Non défini'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Temps disponible</p>
                  <p className="font-semibold text-gray-800">{appStoreUser.available_time_per_day || 'Non défini'} min/jour</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Objectifs principaux</p>
                  <p className="font-semibold text-gray-800">
                    {appStoreUser.primary_goals?.join(', ') || 'Non définis'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Flame className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Calories quotidiennes</p>
                  <p className="font-semibold text-gray-800">{appStoreUser.daily_calories || 'Non calculées'} kcal</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Expérience fitness</p>
                  <p className="font-semibold text-gray-800">
                    {appStoreUser.fitness_experience || 'Non définie'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progression et Réalisations */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Award className="mr-2 text-purple-600" />
            Votre Progression
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{appStoreUser.level || 1}</div>
              <div className="text-sm text-gray-600">Niveau</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{appStoreUser.totalPoints || 0}</div>
              <div className="text-sm text-gray-600">Points XP</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {appStoreUser.active_modules?.length || 0}/4
              </div>
              <div className="text-sm text-gray-600">Modules Actifs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
