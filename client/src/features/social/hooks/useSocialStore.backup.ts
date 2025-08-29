import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { supabase } from '@/lib/supabase';
import type { SocialStore } from '../types';

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      // État initial
      profile: null,
      friends: [],
      posts: [],
      challenges: [],
      notifications: [],
      leaderboard: [],
      searchQuery: '',
      selectedFilters: [],
      activeChallengeId: null,
      isLoading: false,
      error: null,
      realTimeConnected: false,

      // Actions - Profile
      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { data, error } = await supabase
            .from('social_profiles')
            .select('*')
            .eq('userId', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          set({ profile: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Actions - Placeholder implementations
      updateProfile: async (updates: any) => {
        set((state: any) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));

        // TODO: Implement Supabase call when types are ready
        /*
    try {
      const { error } = await supabase
        .from('social_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('userId', get().profile?.userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    */
      },

      updatePrivacySettings: async settings => {
        await get().updateProfile({ privacy: settings });
      },

      // Actions - Friends
      loadFriends: async () => {
        set((state: any) => ({ ...state, loading: { ...state.loading, friends: true } }));

        // TODO: Implement Supabase call when types are ready
        /*
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*, friend:social_profiles(*)')
        .eq('userId', get().profile?.userId)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      set((state: any) => ({
        ...state,
        friends: data || [],
        loading: { ...state.loading, friends: false }
      }));
    } catch (error) {
      console.error('Error loading friends:', error);
      set((state: any) => ({
        ...state,
        loading: { ...state.loading, friends: false },
        errors: { ...state.errors, friends: error.message }
      }));
    }
    */
        set((state: any) => ({ ...state, loading: { ...state.loading, friends: false } }));
      },

      searchUsers: async query => {
        try {
          const { data, error } = await supabase
            .from('social_profiles')
            .select('*')
            .or(`username.ilike.%${query}%,displayName.ilike.%${query}%`)
            .limit(10);

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Erreur recherche utilisateurs:', error);
          return [];
        }
      },

      sendFriendRequest: async userId => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { error } = await supabase.from('friends').insert([
            {
              userId: user.id,
              friendId: userId,
              status: 'pending',
            },
          ]);

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      acceptFriendRequest: async requestId => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('friends')
            .update({ status: 'accepted' })
            .eq('id', requestId);

          if (error) throw error;

          await get().loadFriends();
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      removeFriend: async friendId => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.from('friends').delete().eq('friendId', friendId);

          if (error) throw error;

          set(state => ({
            friends: state.friends.filter(f => f.friendId !== friendId),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Actions - Posts
      loadPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('activity_posts')
            .select(
              `
              *,
              author:social_profiles!activity_posts_userId_fkey(*),
              comments(*)
            `
            )
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          set({ posts: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createPost: async postData => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { data, error } = await supabase
            .from('activity_posts')
            .insert([
              {
                ...postData,
                userId: user.id,
                likes: 0,
                shares: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            posts: [data, ...state.posts],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      likePost: async postId => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          // Incrémenter les likes
          const { error } = await supabase.rpc('increment_post_likes', {
            post_id: postId,
          });

          if (error) throw error;

          // Mettre à jour localement
          set(state => ({
            posts: state.posts.map(post =>
              post.id === postId ? { ...post, likes: post.likes + 1 } : post
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      commentOnPost: async (postId, content) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { data, error } = await supabase
            .from('comments')
            .insert([
              {
                postId,
                userId: user.id,
                content,
                likes: 0,
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) throw error;

          // Mettre à jour le post localement
          set(state => ({
            posts: state.posts.map(post =>
              post.id === postId ? { ...post, comments: [...post.comments, data] } : post
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      sharePost: async postId => {
        try {
          const { error } = await supabase.rpc('increment_post_shares', {
            post_id: postId,
          });

          if (error) throw error;

          set(state => ({
            posts: state.posts.map(post =>
              post.id === postId ? { ...post, shares: post.shares + 1 } : post
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Actions - Challenges
      loadChallenges: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('challenges')
            .select(
              `
              *,
              creator:social_profiles!challenges_creatorId_fkey(*),
              participants:challenge_participants(*)
            `
            )
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ challenges: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createChallenge: async challengeData => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { data, error } = await supabase
            .from('challenges')
            .insert([
              {
                ...challengeData,
                creatorId: user.id,
                status: 'active',
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            challenges: [data, ...state.challenges],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      joinChallenge: async challengeId => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { error } = await supabase.from('challenge_participants').insert([
            {
              challengeId,
              userId: user.id,
              progress: 0,
              rank: 0,
              completed: false,
              joinedAt: new Date().toISOString(),
            },
          ]);

          if (error) throw error;

          await get().loadChallenges();
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updateChallengeProgress: async (challengeId, progress) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { error } = await supabase
            .from('challenge_participants')
            .update({ progress })
            .eq('challengeId', challengeId)
            .eq('userId', user.id);

          if (error) throw error;

          await get().loadChallenges();
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Actions - Notifications
      loadNotifications: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('userId', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          set({ notifications: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      markNotificationRead: async notificationId => {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

          if (error) throw error;

          set(state => ({
            notifications: state.notifications.map(notif =>
              notif.id === notificationId ? { ...notif, read: true } : notif
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      markAllNotificationsRead: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Non authentifié');

          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('userId', user.id)
            .eq('read', false);

          if (error) throw error;

          set(state => ({
            notifications: state.notifications.map(notif => ({ ...notif, read: true })),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Actions - Leaderboard
      loadLeaderboard: async (category, period) => {
        try {
          const { data, error } = await supabase
            .from('leaderboard')
            .select(
              `
              *,
              profile:social_profiles(*)
            `
            )
            .eq('category', category)
            .eq('period', period)
            .order('rank', { ascending: true })
            .limit(100);

          if (error) throw error;

          set({ leaderboard: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Actions - Real-time
      connectRealTime: () => {
        // Implémentation WebSocket/Supabase Realtime
        const {
          data: { user },
        } = supabase.auth.getUser();
        // ... logique de connexion temps réel
        set({ realTimeConnected: true });
      },

      disconnectRealTime: () => {
        set({ realTimeConnected: false });
      },

      handleRealTimeEvent: event => {
        // Gestion des événements temps réel
        console.log('Real-time event:', event);
      },

      // Actions - Utility
      setSearchQuery: query => set({ searchQuery: query }),

      setFilters: filters => set({ selectedFilters: filters }),

      clearError: () => set({ error: null }),

      resetStore: () =>
        set({
          profile: null,
          friends: [],
          posts: [],
          challenges: [],
          notifications: [],
          leaderboard: [],
          searchQuery: '',
          selectedFilters: [],
          activeChallengeId: null,
          isLoading: false,
          error: null,
          realTimeConnected: false,
        }),
    }),
    {
      name: 'social-storage',
      partialize: state => ({
        profile: state.profile,
        friends: state.friends,
        posts: state.posts.slice(0, 10), // Limite pour la persistence
        challenges: state.challenges,
      }),
    }
  )
);
