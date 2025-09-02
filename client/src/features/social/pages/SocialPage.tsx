// pages/Social.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Target,
  Trophy,
  MessageCircle,
  Star,
  Plus,
  Heart,
  Share2,
  Send,
  Image,
  MapPin,
  Award,
  Filter,
  Crown,
  Medal,
  Bookmark,
  Trash2,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { appStore } from '@/store/appStore';
import { useToast } from '@/shared/hooks/use-toast';
import { UniformHeader } from '@/features/profile/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AIIntelligence from '@/features/ai-coach/components/AIIntelligence';

// Types
interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'general' | 'achievement' | 'workout' | 'progress' | 'challenge';
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    sport: string;
    level: number;
  };
  achievements?: any[];
  workout_data?: any;
  comments?: Comment[];
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    username: string;
    avatar_url?: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  pillar: 'workout' | 'nutrition' | 'hydration' | 'sleep' | 'general';
  challenge_type: 'individual' | 'team' | 'community';
  target_value: number;
  target_unit: string;
  duration_days: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reward_points: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  is_participating: boolean;
  progress_percentage: number;
  creator: {
    name: string;
    username: string;
    avatar_url?: string;
  };
}

interface UserStats {
  friends_count: number;
  active_challenges: number;
  global_rank: number;
  total_points: number;
  streak_days: number;
  achievements_count: number;
}

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  sport: string;
  level: number;
  is_online: boolean;
  mutual_friends: number;
  last_activity: string;
}

interface CreatePostData {
  content: string;
  post_type: 'general' | 'achievement' | 'workout' | 'progress';
  media_files: File[];
  achievements: any[];
  location?: string;
}

interface CreateChallengeData {
  title: string;
  description: string;
  pillar: 'workout' | 'nutrition' | 'hydration' | 'sleep' | 'general';
  challenge_type: 'individual' | 'team' | 'community';
  target_value: number;
  target_unit: string;
  duration_days: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reward_points: number;
}

const Social: React.FC = () => {
  const { appStoreUser } = appStore();
  const { toast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard' | 'friends'>(
    'feed'
  );
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(false);

  // Modals
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);

  // Filters & Search
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends' | 'sport'>('all');
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'active' | 'available'>('active');
  const [friendsSearch, setFriendsSearch] = useState('');
  const [newComment, setNewComment] = useState('');

  // Forms
  const [newPost, setNewPost] = useState<CreatePostData>({
    content: '',
    post_type: 'general',
    media_files: [],
    achievements: [],
    location: '',
  });

  const [newChallenge, setNewChallenge] = useState<CreateChallengeData>({
    title: '',
    description: '',
    pillar: 'workout',
    challenge_type: 'community',
    target_value: 0,
    target_unit: '',
    duration_days: 7,
    difficulty: 'medium',
    reward_points: 100,
  });

  // Chargement des données
  const loadUserStats = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      const mockStats: UserStats = {
        friends_count: 24,
        active_challenges: 8,
        global_rank: 47,
        total_points: 1240,
        streak_days: 12,
        achievements_count: 15,
      };
      setUserStats(mockStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, [appStoreUser?.id]);

  const loadPosts = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setPostsLoading(true);
    try {
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          user_id: 'user1',
          content: `Nouveau record personnel ! 🔥 J'ai terminé mon entraînement ${appStoreUser.sport} en 45min aujourd'hui. Les conseils de l'IA MyFitHero ont vraiment payé !`,
          post_type: 'achievement',
          media_urls: [],
          likes_count: 23,
          comments_count: 7,
          shares_count: 3,
          is_liked: false,
          is_bookmarked: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'user1',
            name: 'Marie Dupont',
            username: 'marie_fit',
            avatar_url: '',
            sport: appStoreUser.sport || 'fitness',
            level: 8,
          },
          achievements: [
            {
              type: 'personal_record',
              value: '45min',
              description: `Record ${appStoreUser.sport}`,
            },
          ],
          comments: [
            {
              id: 'c1',
              post_id: '1',
              user_id: 'user2',
              content: 'Bravo Marie ! Quel est ton secret ?',
              created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              user: {
                name: 'Thomas Martin',
                username: 'tom_athlete',
                avatar_url: '',
              },
            },
          ],
        },
        {
          id: '2',
          user_id: 'user2',
          content: `Défi ${appStoreUser.sport} de la semaine : qui peut tenir la position la plus longtemps ? 💪 J'ai tenu 2min30s ! #MyFitHeroChallenge`,
          post_type: 'challenge',
          media_urls: [],
          likes_count: 41,
          comments_count: 12,
          shares_count: 8,
          is_liked: true,
          is_bookmarked: true,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'user2',
            name: 'Thomas Martin',
            username: 'tom_athlete',
            sport: appStoreUser.sport || 'fitness',
            level: 12,
          },
          comments: [],
        },
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    } finally {
      setPostsLoading(false);
    }
  }, [appStoreUser?.id, appStoreUser?.sport, feedFilter]);

  const loadChallenges = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setChallengesLoading(true);
    try {
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: `Défi ${appStoreUser.sport} 30 jours`,
          description: `Entraînement quotidien de ${appStoreUser.sport} pendant 30 jours`,
          creator_id: 'creator1',
          pillar: 'workout',
          challenge_type: 'community',
          target_value: 30,
          target_unit: 'jours',
          duration_days: 30,
          difficulty: 'medium',
          reward_points: 500,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          participants_count: 127,
          is_participating: true,
          progress_percentage: 40,
          creator: {
            name: 'Coach Sophie',
            username: 'coach_sophie',
            avatar_url: '',
          },
        },
        {
          id: '2',
          title: 'Hydratation Parfaite',
          // Utilisation de guillemets doubles pour éviter les conflits avec l'apostrophe
          description: "Boire 2.5L d'eau par jour pendant 14 jours",
          creator_id: 'creator2',
          pillar: 'hydration',
          challenge_type: 'individual',
          target_value: 2.5,
          target_unit: 'litres/jour',
          duration_days: 14,
          difficulty: 'easy',
          reward_points: 200,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          participants_count: 89,
          is_participating: false,
          progress_percentage: 0,
          creator: {
            name: 'Dr. Martin',
            username: 'dr_nutrition',
            avatar_url: '',
          },
        },
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Erreur chargement challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  }, [appStoreUser?.id, appStoreUser?.sport, challengeFilter]);

  const loadFriends = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      const mockFriends: Friend[] = [
        {
          id: 'friend1',
          name: 'Marie Dupont',
          username: 'marie_fit',
          avatar_url: '',
          sport: appStoreUser.sport || 'fitness',
          level: 8,
          is_online: true,
          mutual_friends: 5,
          last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'friend2',
          name: 'Thomas Martin',
          username: 'tom_athlete',
          avatar_url: '',
          sport: 'crossfit',
          level: 12,
          is_online: false,
          mutual_friends: 3,
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'friend3',
          name: 'Sophie Laurent',
          username: 'sophie_coach',
          avatar_url: '',
          sport: appStoreUser.sport || 'fitness',
          level: 15,
          is_online: true,
          mutual_friends: 8,
          last_activity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ];

      setFriends(mockFriends);
    } catch (error) {
      console.error('Erreur chargement amis:', error);
    }
  }, [appStoreUser?.id, appStoreUser?.sport]);

  // Handlers
  const handleCreatePost = useCallback(async () => {
    if (!newPost.content.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le contenu du post ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPostData: SocialPost = {
        id: Date.now().toString(),
        user_id: appStoreUser?.id || '',
        content: newPost.content,
        post_type: newPost.post_type,
        media_urls: [],
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_liked: false,
        is_bookmarked: false,
        created_at: new Date().toISOString(),
        user: {
          id: appStoreUser?.id || '',
          name: appStoreUser?.first_name || appStoreUser?.username || 'Utilisateur',
          username: appStoreUser?.username || 'user',
          sport: appStoreUser?.sport || 'fitness',
          level: 5,
        },
        achievements: newPost.achievements,
        comments: [],
      };

      setPosts(prev => [newPostData, ...prev]);

      toast({
        title: 'Post publié !',
        description: 'Votre post a été partagé avec la communauté',
        action: {
          label: 'Voir',
          onClick: () => setActiveTab('feed'),
        },
      });

      setNewPost({
        content: '',
        post_type: 'general',
        media_files: [],
        achievements: [],
        location: '',
      });
      setShowCreatePost(false);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'social_post_created', {
          post_type: newPost.post_type,
          content_length: newPost.content.length,
          user_sport: appStoreUser?.sport,
          user_id: appStoreUser?.id,
        });
      }
    } catch (error) {
      console.error('Erreur création post:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le post',
        variant: 'destructive',
      });
    }
  }, [newPost, appStoreUser, toast]);

  const handleCreateChallenge = useCallback(async () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      toast({
        title: 'Erreur',
        description: 'Titre et description sont requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const challengeData: Challenge = {
        id: Date.now().toString(),
        ...newChallenge,
        creator_id: appStoreUser?.id || '',
        start_date: new Date().toISOString(),
        end_date: new Date(
          Date.now() + newChallenge.duration_days * 24 * 60 * 60 * 1000
        ).toISOString(),
        participants_count: 1,
        is_participating: true,
        progress_percentage: 0,
        creator: {
          name: appStoreUser?.first_name || appStoreUser?.username || 'Utilisateur',
          username: appStoreUser?.username || 'user',
          avatar_url: '',
        },
      };

      setChallenges(prev => [challengeData, ...prev]);

      toast({
        title: 'Défi créé !',
        description: 'Votre défi est maintenant disponible pour la communauté',
        action: {
          label: 'Voir les défis',
          onClick: () => setActiveTab('challenges'),
        },
      });

      setNewChallenge({
        title: '',
        description: '',
        pillar: 'workout',
        challenge_type: 'community',
        target_value: 0,
        target_unit: '',
        duration_days: 7,
        difficulty: 'medium',
        reward_points: 100,
      });
      setShowCreateChallenge(false);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'social_challenge_created', {
          pillar: newChallenge.pillar,
          difficulty: newChallenge.difficulty,
          duration_days: newChallenge.duration_days,
          user_sport: appStoreUser?.sport,
          user_id: appStoreUser?.id,
        });
      }
    } catch (error) {
      console.error('Erreur création challenge:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le défi',
        variant: 'destructive',
      });
    }
  }, [newChallenge, appStoreUser, toast]);

  const handleLikePost = useCallback(
    async (postId: string) => {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
              }
            : post
        )
      );

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'social_post_liked', {
          post_id: postId,
          user_id: appStoreUser?.id,
        });
      }
    },
    [appStoreUser?.id]
  );

  const handleBookmarkPost = useCallback(
    async (postId: string) => {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, is_bookmarked: !post.is_bookmarked } : post
        )
      );

      const post = posts.find(p => p.id === postId);
      toast({
        title: post?.is_bookmarked ? 'Retiré des favoris' : 'Ajouté aux favoris',
        description: post?.is_bookmarked
          ? 'Post retiré de vos favoris'
          : 'Post ajouté à vos favoris',
      });
    },
    [posts, toast]
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
        return;
      }

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: 'Post supprimé',
        description: 'Votre post a bien été supprimé.',
      });
    },
    [toast]
  );

  const handleAddComment = useCallback(
    async (postId: string) => {
      if (!newComment.trim()) return;

      const comment: Comment = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: appStoreUser?.id || '',
        content: newComment,
        created_at: new Date().toISOString(),
        user: {
          name: appStoreUser?.first_name || appStoreUser?.username || 'Utilisateur',
          username: appStoreUser?.username || 'user',
          avatar_url: '',
        },
      };

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), comment],
                comments_count: post.comments_count + 1,
              }
            : post
        )
      );

      setNewComment('');
      toast({ title: 'Commentaire ajouté !' });
    },
    [newComment, appStoreUser, toast]
  );

  const handleJoinChallenge = useCallback(
    async (challengeId: string) => {
      const challenge = challenges.find(c => c.id === challengeId);

      if (challenge?.is_participating) {
        if (!window.confirm('Voulez-vous vraiment quitter ce défi ?')) {
          return;
        }
      }

      setChallenges(prev =>
        prev.map(challenge =>
          challenge.id === challengeId
            ? {
                ...challenge,
                is_participating: !challenge.is_participating,
                participants_count: challenge.is_participating
                  ? challenge.participants_count - 1
                  : challenge.participants_count + 1,
              }
            : challenge
        )
      );

      const updatedChallenge = challenges.find(c => c.id === challengeId);
      toast({
        title: updatedChallenge?.is_participating ? 'Défi quitté' : 'Défi rejoint !',
        description: updatedChallenge?.is_participating
          ? 'Vous avez quitté ce défi'
          : `Vous participez maintenant au défi "${updatedChallenge?.title}"`,
      });
    },
    [challenges, toast]
  );

  const handleAddFriend = useCallback(
    async (_friendId: string) => {
      toast({
        title: "Demande d'ami envoyée",
        description: "Votre demande d'ami a été envoyée.",
      });
    },
    [toast]
  );

  // Messages personnalisés
  const getPersonalizedMessage = useMemo(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    const sport = appStoreUser?.sport || 'sport';

    return `🌟 Connectez-vous avec la communauté ${sport}, ${userName} !`;
  }, [appStoreUser]);

  // Filtrage des amis
  const filteredFriends = useMemo(() => {
    return friends.filter(
      friend =>
        friend.name.toLowerCase().includes(friendsSearch.toLowerCase()) ||
        friend.username.toLowerCase().includes(friendsSearch.toLowerCase())
    );
  }, [friends, friendsSearch]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadUserStats(), loadPosts(), loadChallenges(), loadFriends()]);
      setLoading(false);
    };

    loadData();
  }, [loadUserStats, loadPosts, loadChallenges, loadFriends]);

  // Composants
  const CreatePostModal = () => (
    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {(
                  appStoreUser?.first_name?.[0] ||
                  appStoreUser?.username?.[0] ||
                  'U'
                ).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{appStoreUser?.first_name || appStoreUser?.username}</p>
              <p className="text-sm text-gray-500">{appStoreUser?.sport}</p>
            </div>
          </div>

          <Select
            value={newPost.post_type}
            onValueChange={(value: any) => setNewPost(prev => ({ ...prev, post_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type de post" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">📝 Général</SelectItem>
              <SelectItem value="achievement">🏆 Achievement</SelectItem>
              <SelectItem value="workout">💪 Workout</SelectItem>
              <SelectItem value="progress">📈 Progrès</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={newPost.content}
            onChange={e => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            placeholder={`Partagez votre expérience ${appStoreUser?.sport}, vos achievements, vos conseils...`}
            className="min-h-32 resize-none"
            maxLength={500}
          />

          <div className="text-xs text-gray-500 text-right">
            {newPost.content.length}/500 caractères
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Lieu
            </Button>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowCreatePost(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.content.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const CreateChallengeModal = () => (
    <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un défi</DialogTitle>
          <p className="text-sm text-gray-600">
            Créez un défi motivant pour la communauté {appStoreUser?.sport}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={newChallenge.title}
            onChange={e => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
            placeholder={`ex: Défi ${appStoreUser?.sport} 30 jours`}
            maxLength={100}
          />

          <Textarea
            value={newChallenge.description}
            onChange={e => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez votre défi en détail..."
            className="min-h-24 resize-none"
            maxLength={300}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newChallenge.pillar}
              onValueChange={(value: any) => setNewChallenge(prev => ({ ...prev, pillar: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout">💪 Entraînement</SelectItem>
                <SelectItem value="nutrition">🍎 Nutrition</SelectItem>
                <SelectItem value="hydration">💧 Hydratation</SelectItem>
                <SelectItem value="sleep">😴 Sommeil</SelectItem>
                <SelectItem value="general">⭐ Général</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newChallenge.difficulty}
              onValueChange={(value: any) =>
                setNewChallenge(prev => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🟢 Facile</SelectItem>
                <SelectItem value="medium">🟡 Moyen</SelectItem>
                <SelectItem value="hard">🟠 Difficile</SelectItem>
                <SelectItem value="expert">🔴 Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={newChallenge.target_value || ''}
              onChange={e =>
                setNewChallenge(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))
              }
              placeholder="Objectif"
            />

            <Input
              value={newChallenge.target_unit}
              onChange={e => setNewChallenge(prev => ({ ...prev, target_unit: e.target.value }))}
              placeholder="Unité (km, reps...)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Durée (jours)</label>
              <Input
                type="number"
                value={newChallenge.duration_days || ''}
                onChange={e =>
                  setNewChallenge(prev => ({
                    ...prev,
                    duration_days: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Points récompense</label>
              <Input
                type="number"
                value={newChallenge.reward_points || ''}
                onChange={e =>
                  setNewChallenge(prev => ({
                    ...prev,
                    reward_points: parseInt(e.target.value) || 10,
                  }))
                }
                min="10"
                step="10"
              />
            </div>
          </div>

          <Select
            value={newChallenge.challenge_type}
            onValueChange={(value: any) =>
              setNewChallenge(prev => ({ ...prev, challenge_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">👤 Individuel</SelectItem>
              <SelectItem value="team">👥 Équipe</SelectItem>
              <SelectItem value="community">🌍 Communauté</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateChallenge(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateChallenge}
              disabled={!newChallenge.title.trim() || !newChallenge.description.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Target className="h-4 w-4 mr-2" />
              Créer le défi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const PostCard = ({ post }: { post: SocialPost }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src={post.user.avatar_url} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{post.user.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {post.user.sport} • Niveau {post.user.level}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {post.post_type}
                </Badge>
              </div>

              {post.user_id === appStoreUser?.id && (
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => handleDeletePost(post.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{post.content}</p>

            {post.achievements && post.achievements.length > 0 && (
              <div className="mb-3">
                {post.achievements.map((achievement, index) => (
                  <Badge key={index} className="mr-2 bg-yellow-100 text-yellow-800">
                    🏆 {achievement.description}: {achievement.value}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>
                {new Date(post.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                    post.is_liked ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span>{post.likes_count}</span>
                </button>

                <button
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                  className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares_count}</span>
                </button>

                <button
                  onClick={() => handleBookmarkPost(post.id)}
                  className={`hover:text-yellow-500 transition-colors ${
                    post.is_bookmarked ? 'text-yellow-500' : ''
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Section commentaires */}
            {showComments === post.id && (
              <div className="border-t pt-3 space-y-3">
                {post.comments?.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback className="text-xs">{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium">{comment.user.name}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {(
                        appStoreUser?.first_name?.[0] ||
                        appStoreUser?.username?.[0] ||
                        'U'
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1"
                    onKeyPress={e => {
                      if (e.key === 'Enter' && newComment.trim()) {
                        handleAddComment(post.id);
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAddComment(post.id)}
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'easy':
          return 'bg-green-100 text-green-800';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800';
        case 'hard':
          return 'bg-orange-100 text-orange-800';
        case 'expert':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getPillarIcon = (pillar: string) => {
      switch (pillar) {
        case 'workout':
          return '💪';
        case 'nutrition':
          return '🍎';
        case 'hydration':
          return '💧';
        case 'sleep':
          return '😴';
        default:
          return '⭐';
      }
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{challenge.description}</p>
            </div>
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span>
              {getPillarIcon(challenge.pillar)} {challenge.pillar}
            </span>
            <span>
              🎯 {challenge.target_value} {challenge.target_unit}
            </span>
            <span>⏱️ {challenge.duration_days} jours</span>
            <span>🏆 {challenge.reward_points} pts</span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{challenge.progress_percentage}%</span>
            </div>
            <Progress value={challenge.progress_percentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={challenge.creator.avatar_url} />
                <AvatarFallback className="text-xs">{challenge.creator.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">par {challenge.creator.name}</span>
              <Badge variant="outline" className="text-xs">
                {challenge.participants_count} participants
              </Badge>
            </div>

            <Button
              onClick={() => handleJoinChallenge(challenge.id)}
              variant={challenge.is_participating ? 'outline' : 'default'}
              size="sm"
            >
              {challenge.is_participating ? 'Quitter' : 'Rejoindre'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FriendCard = ({ friend }: { friend: Friend }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={friend.avatar_url} />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
              {friend.is_online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h4 className="font-semibold">{friend.name}</h4>
              <p className="text-sm text-gray-600">@{friend.username}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>
                  {friend.sport} • Niveau {friend.level}
                </span>
                <span>•</span>
                <span>{friend.mutual_friends} amis communs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={() => handleAddFriend(friend.id)} variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader
          title="Social"
          subtitle="Chargement..."
          showBackButton={true}
          gradient={true}
        />
        <div className="p-4 space-y-6 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'challenges', label: 'Défis', icon: Target },
    { id: 'leaderboard', label: 'Classement', icon: Trophy },
    { id: 'friends', label: 'Amis', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader
        title="Social Hub"
        subtitle={getPersonalizedMessage}
        showBackButton={true}
        gradient={true}
        rightContent={
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreatePost(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post
            </Button>
            <Button
              onClick={() => setShowCreateChallenge(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Target className="h-4 w-4 mr-2" />
              Défi
            </Button>
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        {/* Stats rapides */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{userStats.friends_count}</div>
                <div className="text-sm text-gray-600">Amis</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target size={20} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {userStats.active_challenges}
                </div>
                <div className="text-sm text-gray-600">Défis Actifs</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy size={20} className="text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">#{userStats.global_rank}</div>
                <div className="text-sm text-gray-600">Rang Global</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star size={20} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {userStats.total_points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation par onglets */}
        <Card>
          <CardContent className="p-2">
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value)}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                {tabs.map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center space-x-2"
                    >
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Feed Tab */}
              <TabsContent value="feed" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Feed Communauté</h2>
                  <Select value={feedFilter} onValueChange={(value: any) => setFeedFilter(value)}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tout</SelectItem>
                      <SelectItem value="friends">Amis</SelectItem>
                      <SelectItem value="sport">{appStoreUser?.sport}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {postsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Défis Communauté</h2>
                  <Select
                    value={challengeFilter}
                    onValueChange={(value: any) => setChallengeFilter(value)}
                  >
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="available">Disponibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {challengesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.map(challenge => (
                      <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5" />
                      <span>Classement {appStoreUser?.sport}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Top 3 Podium */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Crown className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                          <div className="font-bold">Marie D.</div>
                          <div className="text-sm text-gray-600">3,450 pts</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Medal className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                          <div className="font-bold">Thomas M.</div>
                          <div className="text-sm text-gray-600">3,120 pts</div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                          <div className="font-bold">Sophie L.</div>
                          <div className="text-sm text-gray-600">2,890 pts</div>
                        </div>
                      </div>

                      {/* Votre position */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {userStats?.global_rank}
                            </div>
                            <div>
                              <div className="font-semibold">Votre position</div>
                              <div className="text-sm text-gray-600">
                                {userStats?.total_points} points
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">{appStoreUser?.sport}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Friends Tab */}
              <TabsContent value="friends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Mes Amis ({userStats?.friends_count})</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={friendsSearch}
                          onChange={e => setFriendsSearch(e.target.value)}
                          placeholder="Rechercher un ami..."
                          className="w-48"
                        />
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Inviter
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                          <FriendCard key={friend.id} friend={friend} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>
                            {friendsSearch
                              ? 'Aucun ami trouvé'
                              : "Connectez-vous avec d'autres athlètes"}
                          </p>
                          <p className="text-sm">
                            {friendsSearch
                              ? 'Essayez un autre terme de recherche'
                              : `Trouvez des partenaires d'entraînement ${appStoreUser?.sport}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* IA Intelligence */}
        <AIIntelligence
          pillar="social"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
        />
      </div>

      {/* Modals */}
      <CreatePostModal />
      <CreateChallengeModal />
    </div>
  );
};

export default Social;
