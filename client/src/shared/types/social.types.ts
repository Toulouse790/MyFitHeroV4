/**
 * Types pour les fonctionnalités sociales
 */

// Types de base pour le profil social
export interface SocialProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  birthDate?: Date;
  fitnessLevel?: FitnessLevel;
  interests?: string[];
  achievements?: Achievement[];
  stats: ProfileStats;
  privacy: PrivacySettings;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface ProfileStats {
  totalWorkouts: number;
  totalDuration: number; // en minutes
  averageRating: number;
  streakDays: number;
  friends: number;
  following: number;
  followers: number;
  posts: number;
  likes: number;
}

export interface PrivacySettings {
  profileVisibility: Visibility;
  workoutVisibility: Visibility;
  statsVisibility: Visibility;
  friendsVisibility: Visibility;
  allowMessages: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
}

export enum Visibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

// Types pour les amis
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friend: SocialProfile;
  status: FriendshipStatus;
  connectedAt: Date;
  createdAt: Date;
}

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: SocialProfile;
  toUser: SocialProfile;
  message?: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

// Types pour les publications
export interface ActivityPost {
  id: string;
  userId: string;
  user: SocialProfile;
  type: PostType;
  content: PostContent;
  caption?: string;
  tags?: string[];
  location?: Location;
  privacy: Visibility;
  likes: PostLike[];
  comments: PostComment[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostType {
  WORKOUT = 'workout',
  ACHIEVEMENT = 'achievement',
  PROGRESS = 'progress',
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  NUTRITION = 'nutrition',
  SLEEP = 'sleep',
}

export interface PostContent {
  text?: string;
  images?: string[];
  video?: string;
  workout?: {
    id: string;
    name: string;
    duration: number;
    exercises: number;
  };
  achievement?: {
    id: string;
    title: string;
    description: string;
    badge: string;
  };
  progress?: {
    metric: string;
    value: number;
    unit: string;
    comparison?: {
      previousValue: number;
      period: string;
    };
  };
}

export interface Location {
  name: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

export interface PostLike {
  id: string;
  userId: string;
  user: SocialProfile;
  createdAt: Date;
}

export interface PostComment {
  id: string;
  userId: string;
  user: SocialProfile;
  content: string;
  parentId?: string; // pour les réponses
  replies?: PostComment[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les défis
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: number; // en jours
  startDate: Date;
  endDate: Date;
  rules: ChallengeRule[];
  rewards: ChallengeReward[];
  participants: ChallengeParticipant[];
  maxParticipants?: number;
  privacy: Visibility;
  createdBy: string;
  creator: SocialProfile;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ChallengeType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  VERSUS = 'versus',
  TEAM = 'team',
}

export enum ChallengeCategory {
  WORKOUT = 'workout',
  STEP_COUNT = 'step_count',
  DURATION = 'duration',
  FREQUENCY = 'frequency',
  WEIGHT_LOSS = 'weight_loss',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  CUSTOM = 'custom',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXTREME = 'extreme',
}

export interface ChallengeRule {
  id: string;
  description: string;
  metric: string;
  target: number;
  unit: string;
  frequency?: 'daily' | 'weekly' | 'total';
}

export interface ChallengeReward {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  value?: number;
  badge?: string;
  condition: string; // ex: "1st place", "completion", "top 10%"
}

export enum RewardType {
  BADGE = 'badge',
  POINTS = 'points',
  TITLE = 'title',
  VIRTUAL_CURRENCY = 'virtual_currency',
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  user: SocialProfile;
  progress: ChallengeProgress;
  joinedAt: Date;
  status: ParticipantStatus;
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED_OUT = 'dropped_out',
  DISQUALIFIED = 'disqualified',
}

export interface ChallengeProgress {
  currentValue: number;
  targetValue: number;
  percentage: number;
  rank?: number;
  lastUpdate: Date;
  dailyProgress?: DailyProgress[];
}

export interface DailyProgress {
  date: Date;
  value: number;
  completed: boolean;
}

// Types pour les réalisations
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  badge: string;
  rarity: AchievementRarity;
  criteria: AchievementCriteria;
  points: number;
  createdAt: Date;
}

export enum AchievementCategory {
  WORKOUT = 'workout',
  SOCIAL = 'social',
  CONSISTENCY = 'consistency',
  PROGRESS = 'progress',
  CHALLENGE = 'challenge',
  MILESTONE = 'milestone',
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface AchievementCriteria {
  metric: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal';
  value: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress?: number; // pour les achievements progressifs
}

// Types pour les notifications
export interface SocialNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPTED = 'friend_accepted',
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  CHALLENGE_INVITE = 'challenge_invite',
  CHALLENGE_COMPLETED = 'challenge_completed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  WORKOUT_REMINDER = 'workout_reminder',
  MILESTONE_REACHED = 'milestone_reached',
}

// Types pour les classements
export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  metric: string;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export enum LeaderboardType {
  GLOBAL = 'global',
  FRIENDS = 'friends',
  LOCAL = 'local',
  CHALLENGE = 'challenge',
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ALL_TIME = 'all_time',
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: SocialProfile;
  value: number;
  unit?: string;
  change?: number; // changement de rang depuis la dernière période
}

// Types pour les groupes/communautés
export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  privacy: Visibility;
  imageUrl?: string;
  coverImage?: string;
  members: CommunityMember[];
  memberCount: number;
  posts: ActivityPost[];
  rules?: string[];
  tags?: string[];
  createdBy: string;
  creator: SocialProfile;
  createdAt: Date;
  updatedAt: Date;
}

export enum CommunityCategory {
  GENERAL = 'general',
  SPORT_SPECIFIC = 'sport_specific',
  FITNESS_GOAL = 'fitness_goal',
  LOCAL = 'local',
  SUPPORT = 'support',
  CHALLENGES = 'challenges',
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  user: SocialProfile;
  role: CommunityRole;
  joinedAt: Date;
  lastActive?: Date;
}

export enum CommunityRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner',
}
