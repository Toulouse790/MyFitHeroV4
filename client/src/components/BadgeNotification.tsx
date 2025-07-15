// client/src/components/BadgeNotification.tsx
import React, { useState, useEffect } from 'react';
import { Trophy, X, Share2, Eye, Star, Zap, Target, Award } from 'lucide-react';

interface BadgeNotificationProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xp: number;
    unlockedAt: Date;
  };
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  isVisible,
  onClose,
  onShare,
  onViewDetails
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      // Auto-fermeture après 8 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600',
          border: 'border-yellow-400',
          text: 'text-yellow-100',
          glow: 'shadow-yellow-400/50',
          particles: '✨'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700',
          border: 'border-purple-400',
          text: 'text-purple-100',
          glow: 'shadow-purple-400/50',
          particles: '🌟'
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-700',
          border: 'border-blue-400',
          text: 'text-blue-100',
          glow: 'shadow-blue-400/50',
          particles: '💎'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700',
          border: 'border-green-400',
          text: 'text-green-100',
          glow: 'shadow-green-400/50',
          particles: '🌱'
        };
    }
  };

  const config = getRarityConfig(badge.rarity);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`
        relative max-w-sm w-full mx-4 rounded-2xl border-2 ${config.border} ${config.bg} 
        shadow-2xl ${config.glow} transform transition-all duration-500
        ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Particules d'animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <span className="text-xl opacity-70">{config.particles}</span>
            </div>
          ))}
        </div>

        <div className="relative p-6 text-center">
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Titre */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-1">Nouveau Badge !</h2>
            <p className="text-sm text-white/80 uppercase tracking-wide font-semibold">
              {badge.rarity}
            </p>
          </div>

          {/* Icône du badge */}
          <div className="mb-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl mb-2 mx-auto border-2 border-white/30">
                {badge.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Trophy size={16} className="text-yellow-900" />
              </div>
            </div>
          </div>

          {/* Informations du badge */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
            <p className="text-white/90 text-sm mb-3">{badge.description}</p>
            
            {/* XP gagné */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star size={16} className="text-yellow-300" />
              <span className="text-yellow-300 font-semibold">+{badge.xp} XP</span>
            </div>

            {/* Stats du badge */}
            <div className="flex items-center justify-center space-x-4 text-sm text-white/80">
              <div className="flex items-center space-x-1">
                <Zap size={14} />
                <span>Rare</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target size={14} />
                <span>Objectif</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award size={14} />
                <span>Réussite</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onShare}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Share2 size={16} />
              <span>Partager</span>
            </button>
            
            <button
              onClick={onViewDetails}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye size={16} />
              <span>Détails</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
