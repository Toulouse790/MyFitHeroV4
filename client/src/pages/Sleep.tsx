import React, { useState, useMemo } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Bed,
  Phone,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Shield,
  Zap,
  Trophy,
  Users,
  Eye
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import AIIntelligence from '@/components/AIIntelligence';
import { UniformHeader } from '@/components/UniformHeader';

// --- TYPES ---
type SportCategory = 'contact' | 'endurance' | 'precision' | 'team';

interface SportSleepConfig {
  emoji: string;
  sleepGoalHours: number;
  motivationalMessage: string;
  benefits: {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
  }[];
  tips: {
    icon: React.ElementType;
    title: string;
    description: string;
    status: 'done' | 'warning' | 'todo';
  }[];
}

// --- CONFIGURATION DU SOMMEIL PAR SPORT ---
const sportsSleepData: Record<SportCategory, SportSleepConfig> = {
  contact: {
    emoji: '🛡️',
    sleepGoalHours: 9,
    motivationalMessage: 'Optimisez votre récupération physique pour l\'impact.',
    benefits: [
      { icon: Shield, title: 'Récup. Musculaire', value: 'Maximale', color: 'text-green-500' },
      { icon: Heart, title: 'Réduction Inflam.', value: 'Élevée', color: 'text-red-500' },
      { icon: Brain, title: 'Prise de décision', value: '+15%', color: 'text-purple-500' },
      { icon: Zap, title: 'Puissance', value: '+10%', color: 'text-yellow-500' }
    ],
    tips: [
      { icon: Bed, title: 'Priorité à la durée', description: 'Visez 9h+ pour permettre à votre corps de réparer les micro-déchirures musculaires.', status: 'todo' },
      { icon: Moon, title: 'Routine de décompression', description: 'Après un entraînement intense, une routine calme (étirements, lecture) aide à baisser le rythme cardiaque.', status: 'done' },
      { icon: Phone, title: 'Zéro distraction', description: 'Le sommeil est votre meilleur atout de récupération. Protégez-le des interruptions.', status: 'warning' },
    ]
  },
  endurance: {
    emoji: '🏃‍♀️',
    sleepGoalHours: 8.5,
    motivationalMessage: 'Améliorez la qualité de votre sommeil pour une meilleure endurance.',
    benefits: [
      { icon: Heart, title: 'Santé Cardiaque', value: 'Optimale', color: 'text-red-500' },
      { icon: Zap, title: 'Stockage Glycogène', value: 'Amélioré', color: 'text-yellow-500' },
      { icon: Brain, title: 'Endurance Mentale', value: '+20%', color: 'text-purple-500' },
      { icon: Shield, title: 'Système Immunitaire', value: 'Renforcé', color: 'text-green-500' }
    ],
    tips: [
      { icon: Clock, title: 'Consistance des horaires', description: 'Se coucher et se lever à la même heure stabilise votre rythme circadien et améliore la qualité du sommeil.', status: 'done' },
      { icon: Sun, title: 'Exposition à la lumière', description: 'La lumière du jour le matin aide à réguler votre horloge interne. Sortez faire un tour !', status: 'todo' },
      { icon: Bed, title: 'Qualité > Quantité', description: 'Un sommeil profond et ininterrompu est plus réparateur. Créez un environnement frais, sombre et calme.', status: 'done' },
    ]
  },
  precision: {
    emoji: '🎯',
    sleepGoalHours: 8,
    motivationalMessage: 'Aiguisez votre concentration avec un repos mental parfait.',
    benefits: [
      { icon: Brain, title: 'Clarté Mentale', value: 'Maximale', color: 'text-purple-500' },
      { icon: Eye, title: 'Coordination Oeil-main', value: '+18%', color: 'text-blue-500' },
      { icon: Zap, title: 'Temps de réaction', value: 'Amélioré', color: 'text-yellow-500' },
      { icon: Shield, title: 'Gestion du Stress', value: 'Optimale', color: 'text-green-500' }
    ],
    tips: [
      { icon: Brain, title: 'Calme mental pré-sommeil', description: 'Pratiquez la méditation ou la respiration profonde pour calmer votre esprit avant de dormir.', status: 'warning' },
      { icon: Phone, title: 'Déconnexion digitale', description: 'Évitez les informations stressantes ou stimulantes (réseaux sociaux, actualités) avant le coucher.', status: 'done' },
      { icon: Trophy, title: 'Visualisation pré-compétition', description: 'La veille d\'une compétition, utilisez les dernières minutes avant de dormir pour visualiser le succès.', status: 'todo' },
    ]
  },
  team: {
    emoji: '🤝',
    sleepGoalHours: 8,
    motivationalMessage: 'Synchronisez votre repos pour une performance d\'équipe au top.',
    benefits: [
      { icon: Users, title: 'Cohésion d\'équipe', value: 'Améliorée', color: 'text-blue-500' },
      { icon: Zap, title: 'Niveau d\'énergie', value: 'Stable', color: 'text-yellow-500' },
      { icon: Brain, title: 'Tactique & Stratégie', value: 'Mémoire +', color: 'text-purple-500' },
      { icon: Heart, title: 'Endurance de match', value: '+10%', color: 'text-red-500' },
    ],
    tips: [
      { icon: Calendar, title: 'Routine de veille de match', description: 'Adoptez une routine fixe la veille des matchs pour réduire l\'anxiété et conditionner votre corps.', status: 'todo' },
      { icon: Clock, title: 'Consistance du groupe', description: 'Des horaires de sommeil réguliers aident à maintenir un niveau d\'énergie homogène dans l\'équipe.', status: 'done' },
      { icon: Sun, title: 'Réveil sans stress', description: 'Évitez la touche "snooze". Un réveil direct aide à démarrer la journée avec plus d\'énergie.', status: 'warning' },
    ]
  }
};

const Sleep: React.FC = () => {
  // --- DONNÉES RÉELLES DU STORE ---
  const { appStoreUser } = useAppStore();

  // --- MAPPING SPORT VERS CATÉGORIE ---
  const getSportCategory = (sport: string): SportCategory => {
    const mappings: Record<string, SportCategory> = {
      'american_football': 'contact',
      'rugby': 'contact', 
      'hockey': 'contact',
      'boxing': 'contact',
      'basketball': 'team',
      'football': 'team',
      'volleyball': 'team',
      'handball': 'team',
      'tennis': 'precision',
      'golf': 'precision',
      'snooker': 'precision',
      'archery': 'precision',
      'running': 'endurance',
      'cycling': 'endurance',
      'swimming': 'endurance',
      'triathlon': 'endurance'
    };
    return mappings[sport?.toLowerCase()] || 'team';
  };

  const userSportCategory = getSportCategory(appStoreUser.sport || 'none');
  const sportConfig = sportsSleepData[userSportCategory];

  // --- CALCUL OBJECTIF PERSONNALISÉ ---
  const personalizedSleepGoal = useMemo(() => {
    let goalHours = sportConfig.sleepGoalHours;
    
    // Ajustements selon l'âge
    if (appStoreUser.age) {
      if (appStoreUser.age < 25) goalHours += 0.5; // Plus jeune = plus de sommeil
      if (appStoreUser.age > 45) goalHours += 0.5; // Plus âgé = plus de récupération
    }
    
    // Ajustements selon les objectifs
    if (appStoreUser.primary_goals?.includes('muscle_gain')) goalHours += 0.5;
    if (appStoreUser.primary_goals?.includes('performance')) goalHours += 0.5;
    
    // Ajustement selon la fréquence d'entraînement
    if (appStoreUser.training_frequency && appStoreUser.training_frequency > 5) {
      goalHours += 0.5; // Entraînement intensif = plus de récupération
    }
    
    return Math.min(goalHours, 10); // Maximum 10h
  }, [appStoreUser, sportConfig.sleepGoalHours]);

  // --- ÉTATS ---
  const [currentSleepHours] = useState(7.5); // Simulation
  const [sleepQuality] = useState(75); // %
  const [bedTime] = useState('23:30');
  const [wakeTime] = useState('07:00');

  // --- CALCULS ---
  const sleepPercentage = (currentSleepHours / personalizedSleepGoal) * 100;
  const sleepDeficit = Math.max(0, personalizedSleepGoal - currentSleepHours);

  // --- FONCTIONS DE SAUVEGARDE ---
  // Note: handleLogSleep sera implémenté dans une future version

  // --- COMPOSANTS ---
  const TipCard = ({ tip }: { tip: any }) => {
    const TipIcon = tip.icon;
    const statusColors: Record<string, string> = {
      done: 'border-l-green-500 bg-green-50',
      warning: 'border-l-yellow-500 bg-yellow-50', 
      todo: 'border-l-red-500 bg-red-50'
    };
    
    const statusColor = statusColors[tip.status] || statusColors.todo;
    
    return (
      <div className={`p-4 rounded-xl border-l-4 ${statusColor}`}>
        <div className="flex items-start space-x-3">
          <TipIcon size={20} className="text-gray-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800 mb-1">{tip.title}</h3>
            <p className="text-sm text-gray-600">{tip.description}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- MESSAGES PERSONNALISÉS ---
  const getPersonalizedMessage = () => {
    const userName = appStoreUser.name || 'Champion';
    const progress = (currentSleepHours / personalizedSleepGoal) * 100;
    
    if (progress >= 95) {
      return `😴 Parfait ${userName} ! Sommeil optimal pour ${appStoreUser.sport}`;
    } else if (progress >= 80) {
      return `💤 Très bien ${userName}, ta récupération est sur la bonne voie !`;
    } else if (progress >= 60) {
      return `⏰ ${userName}, quelques heures de plus t'aideraient pour ${appStoreUser.sport}`;
    } else {
      return `🚨 ${userName}, ton corps a besoin de plus de récupération !`;
    }
  };

  const getPersonalizedRecommendation = () => {
    const deficit = Math.round(sleepDeficit * 60); // en minutes
    if (deficit > 0) {
      return `Pour optimiser vos performances en ${appStoreUser.sport}, couchez-vous ${deficit} minutes plus tôt.`;
    }
    return `Votre sommeil est parfaitement adapté à vos besoins en ${appStoreUser.sport} !`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header Uniforme */}
        <UniformHeader
          title="Sommeil"
          subtitle={`${sportConfig.emoji} ${getPersonalizedMessage()}`}
          showBackButton={true}
          showSettings={true}
          showNotifications={true}
          showProfile={true}
          gradient={true}
        />

        {/* Résumé de la nuit avec Données Personnalisées */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Dernière Nuit</h3>
            <Moon size={24} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{currentSleepHours}h</div>
              <div className="text-white/80 text-sm">Durée</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{sleepQuality}%</div>
              <div className="text-white/80 text-sm">Qualité</div>
            </div>
          </div>
          <div className="text-center mb-4">
            <div className="text-white/80 text-sm">
              Couché: {bedTime} • Levé: {wakeTime}
            </div>
            <div className="text-white/90 text-sm mt-2">
              Objectif {userSportCategory}: {personalizedSleepGoal}h
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${Math.min(sleepPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Recommandation Personnalisée */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <Target size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Recommandation Personnalisée</h3>
              <p className="text-blue-700 text-sm">{getPersonalizedRecommendation()}</p>
              {sleepDeficit > 0 && (
                <div className="mt-2 p-2 bg-blue-100 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>Déficit:</strong> -{Math.round(sleepDeficit * 60)} minutes pour un sommeil optimal
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bénéfices Personnalisés selon le Sport */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Bénéfices pour {appStoreUser.sport || 'votre sport'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {sportConfig.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <BenefitIcon size={20} className={benefit.color} />
                    <div>
                      <div className="font-medium text-gray-800">{benefit.title}</div>
                      <div className={`text-sm font-bold ${benefit.color}`}>{benefit.value}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analyse du Profil */}
        <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-start space-x-3">
            <Brain size={20} className="text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 mb-1">Analyse de votre Profil</h3>
              <p className="text-purple-700 text-sm mb-2">
                En tant que {appStoreUser.gender === 'male' ? 'pratiquant' : 'pratiquante'} de {appStoreUser.sport} 
                de {appStoreUser.age || '?'} ans, votre objectif de sommeil est ajusté à {personalizedSleepGoal}h.
              </p>
              <div className="text-xs text-purple-600 space-y-1">
                <p>• Sport {userSportCategory}: +{(sportConfig.sleepGoalHours - 8).toFixed(1)}h de base</p>
                {appStoreUser.training_frequency && appStoreUser.training_frequency > 5 && (
                  <p>• Entraînement intensif ({appStoreUser.training_frequency}x/sem): +0.5h</p>
                )}
                {appStoreUser.primary_goals?.includes('muscle_gain') && (
                  <p>• Objectif prise de masse: +0.5h récupération</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conseils Personnalisés */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              Conseils pour {userSportCategory}
            </h2>
          </div>
          <div className="space-y-3">
            {sportConfig.tips.map((tip, index) => (
              <TipCard key={index} tip={tip} />
            ))}
          </div>
        </div>

        {/* Intelligence AI - Analyse Sommeil */}
        <AIIntelligence
          pillar="sleep"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />

        {/* Message de Motivation */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl text-white text-center">
          <h3 className="font-bold mb-2">{sportConfig.motivationalMessage}</h3>
          <p className="text-purple-100 text-sm">
            Le sommeil n'est pas du temps perdu, c'est votre arme secrète pour exceller en {appStoreUser.sport} !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sleep;
