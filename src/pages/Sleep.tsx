import React, { useState, useEffect, useCallback } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Bed,
  Phone,
  BarChart3,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Shield,
  Zap,
  Loader2,
  Trophy,
  Users
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { SleepSession, DailyStats, Json } from '@/lib/supabase';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// --- TYPES & INTERFACES DE PERSONNALISATION ---

type SportCategory = 'contact' | 'endurance' | 'precision' | 'team';

interface User {
  name: string;
  sportCategory: SportCategory;
}

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


const Sleep: React.FC<SleepProps> = ({ userProfile }) => {
  // --- SIMULATION UTILISATEUR & CONFIG ---
  const currentUser: User = {
    name: 'Alex',
    sportCategory: 'precision', // Changez ici: 'contact', 'endurance', 'team'
  };

  const sportConfig = sportsSleepData[currentUser.sportCategory];

  // --- STATES & STORE (inchangés) ---
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  // ... autres états
  
  // --- LOGIQUE (avec adaptation pour l'objectif) ---
  
  // L'objectif vient maintenant de notre config personnalisée
  const weeklyStats = {
    // ... autres stats
    goalDuration: sportConfig.sleepGoalHours,
    // ...
  };
  
  // ... (fonctions de chargement et d'enregistrement du sommeil existantes) ...

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header Personnalisé */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
               <span className="mr-3 text-3xl">{sportConfig.emoji}</span>
               Sommeil
            </h1>
            <p className="text-gray-600">{sportConfig.motivationalMessage}</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Résumé de la nuit (inchangé) */}
        {/* ... */}
        
        {/* Statistiques hebdomadaires avec Objectif Personnalisé */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            <BarChart3 size={20} className="text-gray-500" />
          </div>
          {/* ... (affichage des moyennes) ... */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-fitness-recovery" />
              <span className="text-sm text-gray-600">Objectif: {sportConfig.sleepGoalHours}h</span>
            </div>
            {/* ... */}
          </div>
        </div>

        {/* Formulaire d'enregistrement (inchangé) */}
        {/* ... */}

        {/* Bénéfices Personnalisés */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Bénéfices pour votre sport</h2>
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

        {/* Conseils Personnalisés */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Vos Conseils Personnalisés</h2>
          </div>
          <div className="space-y-3">
            {sportConfig.tips.map((tip, index) => (
              // Le composant TipCard est réutilisé tel quel
              <TipCard key={index} tip={tip} />
            ))}
          ediv>
        </div>
        
      </div>
    </div>
  );
};

// Le TipCard reste inchangé car il est déjà générique
const TipCard = ({ tip }: { tip: { icon: React.ElementType; title: string; description: string; status: string; } }) => {
    // ... (code du composant TipCard existant)
};

export default Sleep;
