import { LucideIcon, Trophy, Medal, Award, Crown, Sparkles } from 'lucide-react';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface RarityConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  label: string;
  textColor: string;
  glowColor?: string;
  animationClass?: string;
}

export const RARITY_CONFIGS: Record<BadgeRarity, RarityConfig> = {
  common: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Trophy,
    label: 'Commun',
    textColor: 'text-gray-700',
    glowColor: 'shadow-gray-300',
    animationClass: '',
  },
  rare: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: Medal,
    label: 'Rare',
    textColor: 'text-blue-700',
    glowColor: 'shadow-blue-300',
    animationClass: 'animate-pulse',
  },
  epic: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: Award,
    label: 'Épique',
    textColor: 'text-purple-700',
    glowColor: 'shadow-purple-400',
    animationClass: 'animate-pulse',
  },
  legendary: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: Crown,
    label: 'Légendaire',
    textColor: 'text-yellow-700',
    glowColor: 'shadow-yellow-400',
    animationClass: 'animate-bounce',
  },
  mythic: {
    color: 'text-red-600',
    bgColor: 'bg-gradient-to-r from-red-100 to-pink-100',
    borderColor: 'border-red-300',
    icon: Sparkles,
    label: 'Mythique',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600',
    glowColor: 'shadow-red-500',
    animationClass: 'animate-pulse',
  },
};

export const getRarityConfig = (rarity: BadgeRarity): RarityConfig => {
  return RARITY_CONFIGS[rarity] || RARITY_CONFIGS.common;
};

export const getRarityColor = (rarity: BadgeRarity): string => {
  return getRarityConfig(rarity).color;
};

export const getRarityBgColor = (rarity: BadgeRarity): string => {
  return getRarityConfig(rarity).bgColor;
};

export const getRarityIcon = (rarity: BadgeRarity): LucideIcon => {
  return getRarityConfig(rarity).icon;
};

export const getRarityLabel = (rarity: BadgeRarity): string => {
  return getRarityConfig(rarity).label;
};

export const NOTIFICATION_ANIMATIONS = {
  common: 'animate-slide-in',
  rare: 'animate-slide-in-bounce',
  epic: 'animate-slide-in-bounce',
  legendary: 'animate-slide-in-bounce animate-glow',
  mythic: 'animate-slide-in-bounce animate-rainbow-glow',
};

export const getNotificationAnimation = (rarity: BadgeRarity): string => {
  return NOTIFICATION_ANIMATIONS[rarity] || NOTIFICATION_ANIMATIONS.common;
};
