import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp,
  Bed,
  Coffee,
  Phone,
  Volume2,
  Eye,
  BarChart3,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Shield,
  Zap
} from 'lucide-react';

const Sleep = () => {
  const [selectedNight, setSelectedNight] = useState('last-night');

  // Données mockées
  const sleepData = {
    'last-night': {
      date: 'Nuit dernière',
      bedtime: '22:45',
      wakeup: '07:15',
      duration: 8.5,
      quality: 85,
      deepSleep: 2.1,
      lightSleep: 4.8,
      rem: 1.6,
      interruptions: 2,
      heartRate: 58
    },
    'two-nights': {
      date: 'Il y a 2 nuits',
      bedtime: '23:30',
      wakeup: '07:00',
      duration: 7.5,
      quality: 78,
      deepSleep: 1.8,
      lightSleep: 4.2,
      rem: 1.5,
      interruptions: 3,
      heartRate: 62
    }
  };

  const weeklyStats = {
    avgDuration: 7.8,
    avgQuality: 82,
    goalDuration: 8,
    streak: 5
  };

  const sleepTips = [
    {
      icon: Phone,
      title: 'Pas d\'écran 1h avant',
      description: 'Évitez les écrans bleus avant le coucher',
      status: 'done'
    },
    {
      icon: Coffee,
      title: 'Pas de caféine après 16h',
      description: 'La caféine peut perturber votre sommeil',
      status: 'warning'
    },
    {
      icon: Volume2,
      title: 'Environnement silencieux',
      description: 'Réduisez les bruits parasites',
      status: 'done'
    },
    {
      icon: Eye,
      title: 'Chambre sombre',
      description: 'Utilisez des rideaux occultants',
      status: 'todo'
    }
  ];

  const benefits = [
    { icon: Brain, title: 'Mémoire', value: '+15%', color: 'text-purple-500' },
    { icon: Heart, title: 'Cardio', value: '+12%', color: 'text-red-500' },
    { icon: Shield, title: 'Immunité', value: '+20%', color: 'text-green-500' },
    { icon: Zap, title: 'Énergie', value: '+18%', color: 'text-yellow-500' }
  ];

  const currentSleep = sleepData[selectedNight];
  const qualityColor = currentSleep.quality >= 80 ? 'text-green-500' : 
                       currentSleep.quality >= 60 ? 'text-yellow-500' : 'text-red-500';
  
  const qualityBgColor = currentSleep.quality >= 80 ? 'bg-green-500' : 
                         currentSleep.quality >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  const SleepPhaseCard = ({ title, duration, color, percentage }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-lg font-bold text-gray-800">{duration}h</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  const TipCard = ({ tip }) => {
    const TipIcon = tip.icon;
    const getStatusColor = () => {
      switch (tip.status) {
        case 'done': return 'text-green-500 bg-green-100';
        case 'warning': return 'text-yellow-500 bg-yellow-100';
        case 'todo': return 'text-gray-500 bg-gray-100';
        default: return 'text-gray-500 bg-gray-100';
      }
    };

    const getStatusIcon = () => {
      switch (tip.status) {
        case 'done': return '✅';
        case 'warning': return '⚠️';
        case 'todo': return '⭕';
        default: return '⭕';
      }
    };

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            <TipIcon size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-gray-800">{tip.title}</h3>
              <span className="text-lg">{getStatusIcon()}</span>
            </div>
            <p className="text-sm text-gray-600">{tip.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sommeil</h1>
            <p className="text-gray-600">Analysez et améliorez votre repos</p>
          </div>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Résumé de la nuit */}
        <div className="bg-gradient-hydration p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{currentSleep.date}</h3>
            <Moon size={24} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{currentSleep.duration}h</div>
              <div className="text-white/80 text-sm">Durée totale</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{currentSleep.quality}%</div>
              <div className="text-white/80 text-sm">Qualité</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-white/80">
            <div className="flex items-center space-x-1">
              <Bed size={16} />
              <span>Couché: {currentSleep.bedtime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sun size={16} />
              <span>Levé: {currentSleep.wakeup}</span>
            </div>
          </div>
        </div>

        {/* Statistiques hebdomadaires */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            <BarChart3 size={20} className="text-gray-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{weeklyStats.avgDuration}h</div>
              <div className="text-gray-600 text-sm">Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{weeklyStats.avgQuality}%</div>
              <div className="text-gray-600 text-sm">Qualité moy.</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-fitness-recovery" />
              <span className="text-sm text-gray-600">Objectif: {weeklyStats.goalDuration}h</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Série: {weeklyStats.streak} jours</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </div>

        {/* Phases de sommeil */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Phases de sommeil</h2>
          <div className="grid grid-cols-3 gap-3">
            <SleepPhaseCard
              title="Sommeil profond"
              duration={currentSleep.deepSleep}
              color="bg-indigo-500"
              percentage={Math.round((currentSleep.deepSleep / currentSleep.duration) * 100)}
            />
            <SleepPhaseCard
              title="Sommeil léger"
              duration={currentSleep.lightSleep}
              color="bg-blue-400"
              percentage={Math.round((currentSleep.lightSleep / currentSleep.duration) * 100)}
            />
            <SleepPhaseCard
              title="REM"
              duration={currentSleep.rem}
              color="bg-purple-500"
              percentage={Math.round((currentSleep.rem / currentSleep.duration) * 100)}
            />
          </div>
        </div>

        {/* Métriques additionnelles */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Métriques détaillées</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Heart size={20} className="text-red-500" />
              <div>
                <div className="font-medium text-gray-800">{currentSleep.heartRate} bpm</div>
                <div className="text-sm text-gray-600">Fréquence cardiaque</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock size={20} className="text-blue-500" />
              <div>
                <div className="font-medium text-gray-800">{currentSleep.interruptions}</div>
                <div className="text-sm text-gray-600">Réveils nocturnes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bénéfices du bon sommeil */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Bénéfices d'un bon sommeil</h2>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
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

        {/* Conseils pour mieux dormir */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Lightbulb size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Conseils pour mieux dormir</h2>
          </div>
          <div className="space-y-3">
            {sleepTips.map((tip, index) => (
              <TipCard key={index} tip={tip} />
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-fitness-recovery/10 p-4 rounded-xl border border-fitness-recovery/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Actions rapides</h3>
            <Moon size={20} className="text-fitness-recovery" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Bed size={20} className="text-fitness-recovery mx-auto mb-1" />
                <span className="text-sm font-medium text-gray-700">Je vais me coucher</span>
              </div>
            </button>
            <button className="bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Sun size={20} className="text-yellow-500 mx-auto mb-1" />
                <span className="text-sm font-medium text-gray-700">Je me réveille</span>
              </div>
            </button>
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Sleep;
