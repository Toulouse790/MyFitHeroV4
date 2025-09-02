import { supabase } from '@/lib/supabase';
import { subDays } from 'date-fns';

// Types pour les fonctionnalités sociales
export interface UserConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  friend_profile: {
    username: string;
    avatar_url?: string;
    sport?: string;
    sport_position?: string;
    level?: number;
    is_online?: boolean;
    last_seen?: string;
  };
}

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  pillar: 'workout' | 'nutrition' | 'hydration' | 'sleep' | 'general';
  challenge_type: 'individual' | 'team' | 'community';
  target_value: number;
  target_unit: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  max_participants?: number;
  reward_points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  is_active: boolean;
  created_at: string;
  creator_profile: {
    username: string;
    avatar_url?: string;
    sport?: string;
  };
}

export interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  completion_percentage: number;
  completed_at?: string;
  position?: number;
  points_earned: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  sport?: string;
  sport_position?: string;
  level: number;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  challenges_completed: number;
  current_streak: number;
  rank: number;
  change_from_last_week: number;
}

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'achievement' | 'workout' | 'progress' | 'challenge' | 'general';
  media_urls?: string[];
  achievements?: {
    type: string;
    value: number;
    unit: string;
    milestone: boolean;
  }[];
  workout_data?: {
    duration: number;
    exercises: string[];
    calories_burned?: number;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author_profile: {
    username: string;
    avatar_url?: string;
    sport?: string;
    level?: number;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface SocialStats {
  friends_count: number;
  followers_count: number;
  following_count: number;
  total_posts: number;
  total_likes_received: number;
  total_challenges_created: number;
  total_challenges_completed: number;
  community_rank: number;
  sport_rank?: number;
  influence_score: number;
}

class SocialService {
  // Gestion des amis et connexions
  async getFriends(userId: string): Promise<UserConnection[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_connections')
        .select(
          `
          *,
          friend_profile:user_profiles!friend_id(
            username,
            avatar_url,
            sport,
            sport_position,
            level,
            is_online,
            last_seen
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  async searchUsers(query: string, userId: string): Promise<UserConnection[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_profiles')
        .select(
          `
          id,
          username,
          avatar_url,
          sport,
          sport_position,
          level,
          is_online
        `
        )
        .ilike('username', `%${query}%`)
        .neq('id', userId)
        .limit(20);

      if (error) throw error;

      // Formatage des résultats pour correspondre à UserConnection
      return (data || []).map(user => ({
        id: '',
        user_id: userId,
        friend_id: user.id,
        status: 'pending' as const,
        created_at: '',
        updated_at: '',
        friend_profile: {
          username: user.username,
          avatar_url: user.avatar_url,
          sport: user.sport,
          sport_position: user.sport_position,
          level: user.level,
          is_online: user.is_online,
        },
      }));
    } catch {
      // Erreur silencieuse
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_connections').insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;
      return true;
    } catch {
      // Erreur silencieuse
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  async acceptFriendRequest(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;
      return true;
    } catch {
      // Erreur silencieuse
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  // Gestion des défis
  async getChallenges(
    pillar?: string,
    difficulty?: string,
    type?: string,
    limit = 20
  ): Promise<Challenge[]> {
    try {
      let query = supabase
        .from('challenges')
        .select(
          `
          *,
          creator_profile:user_profiles!creator_id(
            username,
            avatar_url,
            sport
          )
        `
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (pillar) query = query.eq('pillar', pillar);
      if (difficulty) query = query.eq('difficulty', difficulty);
      if (type) query = query.eq('challenge_type', type);

      const { data: _data, error: _error } = await query;
      if (error) throw error;
      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('challenge_participations').insert({
        challenge_id: challengeId,
        user_id: userId,
        current_progress: 0,
        completion_percentage: 0,
        points_earned: 0,
      });

      if (error) throw error;
      return true;
    } catch {
      // Erreur silencieuse
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  async createChallenge(userId: string, challengeData: Partial<Challenge>): Promise<string | null> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('challenges')
        .insert({
          creator_id: userId,
          ...challengeData,
          is_active: true,
          participants_count: 1,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Auto-joindre le créateur au défi
      await this.joinChallenge(data.id, userId);

      return data.id;
    } catch {
      // Erreur silencieuse
      console.error('Error creating challenge:', error);
      return null;
    }
  }

  async getUserChallenges(userId: string): Promise<{
    active: (Challenge & ChallengeParticipation)[];
    completed: (Challenge & ChallengeParticipation)[];
  }> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('challenge_participations')
        .select(
          `
          *,
          challenge:challenges(
            *,
            creator_profile:user_profiles!creator_id(
              username,
              avatar_url,
              sport
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const participations = data || [];
      const active: (Challenge & ChallengeParticipation)[] = [];
      const completed: (Challenge & ChallengeParticipation)[] = [];

      participations.forEach(participation => {
        const challenge = participation.challenge;
        const combined = { ...challenge, ...participation };

        if (participation.completed_at) {
          completed.push(combined);
        } else {
          active.push(combined);
        }
      });

      return { active, completed };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching user challenges:', error);
      return { active: [], completed: [] };
    }
  }

  // Classements et leaderboards
  async getLeaderboard(
    type: 'global' | 'sport' | 'friends' = 'global',
    sport?: string,
    userId?: string,
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    try {
      // Pour cet exemple, on utilise des données mockées
      // En production, cela serait calculé à partir de vraies statistiques
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          user_id: '1',
          username: 'Rugby_Beast_33',
          avatar_url: '/avatars/user1.jpg',
          sport: 'rugby',
          sport_position: 'pilier',
          level: 15,
          total_points: 24500,
          weekly_points: 1200,
          monthly_points: 4800,
          challenges_completed: 47,
          current_streak: 12,
          rank: 1,
          change_from_last_week: 2,
        },
        {
          user_id: '2',
          username: 'FitNinja_Pro',
          avatar_url: '/avatars/user2.jpg',
          sport: 'basketball',
          sport_position: 'meneur',
          level: 13,
          total_points: 22100,
          weekly_points: 980,
          monthly_points: 4200,
          challenges_completed: 39,
          current_streak: 8,
          rank: 2,
          change_from_last_week: -1,
        },
        {
          user_id: '3',
          username: 'Marathon_Queen',
          avatar_url: '/avatars/user3.jpg',
          sport: 'running',
          level: 14,
          total_points: 21800,
          weekly_points: 1100,
          monthly_points: 4500,
          challenges_completed: 52,
          current_streak: 15,
          rank: 3,
          change_from_last_week: 1,
        },
      ];

      // Simulation du filtrage par sport
      if (type === 'sport' && sport) {
        return mockLeaderboard.filter(entry => entry.sport === sport);
      }

      return mockLeaderboard.slice(0, limit);
    } catch {
      // Erreur silencieuse
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Feed social et posts
  async getSocialFeed(
    userId: string,
    feedType: 'friends' | 'global' | 'sport' = 'friends',
    limit = 20
  ): Promise<SocialPost[]> {
    try {
      // Données mockées pour demonstration
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          user_id: '2',
          content:
            'Nouveau PR au développé couché ! 120kg x5 reps 💪 Les entraînements payent enfin !',
          post_type: 'achievement',
          achievements: [
            {
              type: 'bench_press_pr',
              value: 120,
              unit: 'kg',
              milestone: true,
            },
          ],
          likes_count: 23,
          comments_count: 8,
          shares_count: 3,
          created_at: new Date().toISOString(),
          author_profile: {
            username: 'FitNinja_Pro',
            avatar_url: '/avatars/user2.jpg',
            sport: 'basketball',
            level: 13,
          },
          is_liked: false,
          is_bookmarked: false,
        },
        {
          id: '2',
          user_id: '1',
          content: "Session mêlée ce matin avec l'équipe. Ready pour le match de samedi ! 🏉",
          post_type: 'workout',
          workout_data: {
            duration: 90,
            exercises: ['Mêlée', 'Scrum', 'Poussée traîneau'],
            calories_burned: 650,
          },
          likes_count: 18,
          comments_count: 5,
          shares_count: 1,
          created_at: subDays(new Date(), 1).toISOString(),
          author_profile: {
            username: 'Rugby_Beast_33',
            avatar_url: '/avatars/user1.jpg',
            sport: 'rugby',
            level: 15,
          },
          is_liked: true,
          is_bookmarked: false,
        },
      ];

      return mockPosts.slice(0, limit);
    } catch {
      // Erreur silencieuse
      console.error('Error fetching social feed:', error);
      return [];
    }
  }

  async createPost(userId: string, postData: Partial<SocialPost>): Promise<string | null> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          ...postData,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch {
      // Erreur silencieuse
      console.error('Error creating post:', error);
      return null;
    }
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) throw error;
      return true;
    } catch {
      // Erreur silencieuse
      console.error('Error liking post:', error);
      return false;
    }
  }

  // Statistiques sociales
  async getSocialStats(userId: string): Promise<SocialStats> {
    try {
      // En production, ces données seraient calculées depuis la base
      const mockStats: SocialStats = {
        friends_count: 24,
        followers_count: 156,
        following_count: 89,
        total_posts: 45,
        total_likes_received: 892,
        total_challenges_created: 8,
        total_challenges_completed: 23,
        community_rank: 47,
        sport_rank: 12,
        influence_score: 78,
      };

      return mockStats;
    } catch {
      // Erreur silencieuse
      console.error('Error fetching social stats:', error);
      throw error;
    }
  }

  // Comparaisons avec amis
  async getFriendsComparison(
    userId: string,
    period: 'week' | 'month' = 'week'
  ): Promise<{
    user_stats: any;
    friends_stats: unknown[];
    user_rank: number;
  }> {
    try {
      // Données mockées pour la comparaison
      const userStats = {
        workouts_completed: 5,
        total_calories_burned: 2800,
        water_intake_liters: 14.5,
        sleep_hours_avg: 7.2,
        challenges_completed: 2,
      };

      const friendsStats = [
        {
          user_id: '1',
          username: 'Rugby_Beast_33',
          workouts_completed: 6,
          total_calories_burned: 3200,
          water_intake_liters: 16.8,
          sleep_hours_avg: 8.1,
          challenges_completed: 3,
        },
        {
          user_id: '2',
          username: 'FitNinja_Pro',
          workouts_completed: 4,
          total_calories_burned: 2400,
          water_intake_liters: 12.3,
          sleep_hours_avg: 6.8,
          challenges_completed: 1,
        },
      ];

      return {
        user_stats: userStats,
        friends_stats: friendsStats,
        user_rank: 2,
      };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching friends comparison:', error);
      throw error;
    }
  }

  // Notifications sociales
  async getSocialNotifications(userId: string): Promise<{
    friend_requests: UserConnection[];
    challenge_invites: Challenge[];
    mentions: SocialPost[];
    achievements: unknown[];
  }> {
    try {
      // Données mockées pour les notifications
      return {
        friend_requests: [],
        challenge_invites: [],
        mentions: [],
        achievements: [],
      };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching social notifications:', error);
      return {
        friend_requests: [],
        challenge_invites: [],
        mentions: [],
        achievements: [],
      };
    }
  }
}

export const socialService = new SocialService();
