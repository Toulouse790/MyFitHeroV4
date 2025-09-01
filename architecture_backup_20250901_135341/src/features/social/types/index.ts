export interface SocialProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  sport: string;
  level: number;
  stats: SocialStats;
  badges: Badge[];
  privacy: PrivacySettings;
  created_at: string;
  updated_at: string;
}

export interface SocialStats {
  totalWorkouts: number;
  totalDuration: number; // en minutes
  streakDays: number;
  achievements: number;
  ranking: number;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'social' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  profile: SocialProfile;
  mutualFriends: number;
  sharedActivities: string[];
  created_at: string;
}

export interface ActivityPost {
  id: string;
  userId: string;
  type: 'workout' | 'achievement' | 'challenge' | 'milestone';
  title: string;
  description?: string;
  data: any; // Données spécifiques au type d'activité
  media?: MediaFile[];
  likes: number;
  comments: Comment[];
  shares: number;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  replies: Comment[];
  created_at: string;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  size: number;
  metadata?: any;
}

export interface Challenge {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'distance' | 'duration' | 'frequency' | 'custom';
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  rules: string[];
  prizes: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'friends' | 'invite-only';
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  progress: number;
  rank: number;
  completed: boolean;
  joinedAt: string;
  profile: SocialProfile;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'challenge_invite' | 'like' | 'comment' | 'achievement' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  created_at: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  activityVisibility: 'public' | 'friends' | 'private';
  allowFriendRequests: boolean;
  allowChallengeInvites: boolean;
  showOnlineStatus: boolean;
  showStats: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  profile: SocialProfile;
  score: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'points' | 'workouts' | 'duration' | 'streak';
}

export interface RealTimeEvent {
  type: 'friend_online' | 'friend_offline' | 'new_post' | 'challenge_update' | 'live_workout';
  userId: string;
  data: any;
  timestamp: string;
}

export interface SocialStore {
  // État
  profile: SocialProfile | null;
  friends: Friend[];
  posts: ActivityPost[];
  challenges: Challenge[];
  notifications: Notification[];
  leaderboard: LeaderboardEntry[];

  // Filtres et recherche
  searchQuery: string;
  selectedFilters: string[];
  activeChallengeId: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  realTimeConnected: boolean;

  // Actions - Profile
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<SocialProfile>) => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;

  // Actions - Friends
  loadFriends: () => Promise<void>;
  searchUsers: (query: string) => Promise<SocialProfile[]>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  // Actions - Posts
  loadPosts: () => Promise<void>;
  createPost: (
    postData: Omit<ActivityPost, 'id' | 'userId' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, content: string) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;

  // Actions - Challenges
  loadChallenges: () => Promise<void>;
  createChallenge: (
    challengeData: Omit<Challenge, 'id' | 'creatorId' | 'created_at'>
  ) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;

  // Actions - Notifications
  loadNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Actions - Leaderboard
  loadLeaderboard: (category: string, period: string) => Promise<void>;

  // Actions - Real-time
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  handleRealTimeEvent: (event: RealTimeEvent) => void;

  // Actions - Utility
  setSearchQuery: (query: string) => void;
  setFilters: (filters: string[]) => void;
  clearError: () => void;
  resetStore: () => void;
}
