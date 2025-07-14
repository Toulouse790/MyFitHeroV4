import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Target, Share2, Heart, MessageCircle,
  Bookmark, Filter, Zap, Crown
} from 'lucide-react';
import { socialService, Challenge, SocialPost, LeaderboardEntry } from '@/services/socialService';
import { useToast } from '@/hooks/use-toast';

interface SocialDashboardProps {
  userId: string;
}

const SocialDashboard: React.FC<SocialDashboardProps> = ({ userId }) => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard' | 'friends'>('feed');
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les données sociales
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [socialStats, setSocialStats] = useState<any>(null);

  // États pour les filtres
  const [feedFilter, setFeedFilter] = useState<'friends' | 'global' | 'sport'>('friends');
  const [challengeFilter, setChallengeFilter] = useState({
    pillar: '',
    difficulty: '',
    type: ''
  });

  useEffect(() => {
    loadSocialData();
  }, [userId, activeTab, feedFilter, challengeFilter]);

  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'feed':
          const feed = await socialService.getSocialFeed(userId, feedFilter);
          setSocialFeed(feed);
          break;
        case 'challenges':
          const challengeData = await socialService.getChallenges(
            challengeFilter.pillar || undefined,
            challengeFilter.difficulty || undefined,
            challengeFilter.type || undefined
          );
          setChallenges(challengeData);
          break;
        case 'leaderboard':
          const leaderboardData = await socialService.getLeaderboard('global', undefined, userId);
          setLeaderboard(leaderboardData);
          break;
        case 'friends':
          // Charger les amis et stats
          break;
      }

      // Charger les stats sociales
      if (!socialStats) {
        const stats = await socialService.getSocialStats(userId);
        setSocialStats(stats);
      }
    } catch (error) {
      console.error('Error loading social data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données sociales',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await socialService.likePost(postId, userId);
      setSocialFeed(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_liked: !post.is_liked, likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1 }
          : post
      ));
      
      toast({
        title: 'Post aimé !',
        description: 'Votre réaction a été enregistrée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'aimer ce post',
        variant: 'destructive'
      });
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const success = await socialService.joinChallenge(challengeId, userId);
      if (success) {
        setChallenges(prev => prev.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, participants_count: challenge.participants_count + 1 }
            : challenge
        ));
        
        toast({
          title: 'Défi rejoint !',
          description: 'Bonne chance pour relever ce défi !',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejoindre ce défi',
        variant: 'destructive'
      });
    }
  };

  const TabButton = ({ tab, icon: Icon, label, count }: {
    tab: string;
    icon: any;
    label: string;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-1 rounded-full text-xs ${
          activeTab === tab ? 'bg-blue-500' : 'bg-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const SocialStatsCard = () => (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Crown className="mr-2" size={20} />
        Votre Impact Social
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{socialStats?.friends_count || 0}</div>
          <div className="text-purple-200 text-sm">Amis</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{socialStats?.community_rank || 0}</div>
          <div className="text-purple-200 text-sm">Rang Global</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{socialStats?.total_challenges_completed || 0}</div>
          <div className="text-purple-200 text-sm">Défis</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{socialStats?.influence_score || 0}</div>
          <div className="text-purple-200 text-sm">Influence</div>
        </div>
      </div>
    </div>
  );

  const PostCard = ({ post }: { post: SocialPost }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {post.author_profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-800">{post.author_profile.username}</h4>
            <span className="text-xs text-gray-500">Niveau {post.author_profile.level}</span>
            {post.author_profile.sport && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {post.author_profile.sport}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.content}</p>

      {post.achievements && post.achievements.length > 0 && (
        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2 text-yellow-700">
            <Trophy size={16} />
            <span className="text-sm font-medium">Nouvel Achievement !</span>
          </div>
          {post.achievements.map((achievement, index) => (
            <div key={index} className="text-sm text-yellow-600 mt-1">
              {achievement.value} {achievement.unit} - {achievement.milestone ? '🏆 Milestone!' : 'PR!'}
            </div>
          ))}
        </div>
      )}

      {post.workout_data && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <div className="flex items-center space-x-2 text-blue-700 mb-2">
            <Zap size={16} />
            <span className="text-sm font-medium">Workout Session</span>
          </div>
          <div className="text-sm text-blue-600">
            <div>Durée: {post.workout_data.duration} min</div>
            <div>Exercices: {post.workout_data.exercises.join(', ')}</div>
            {post.workout_data.calories_burned && (
              <div>Calories: {post.workout_data.calories_burned} kcal</div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLikePost(post.id)}
            className={`flex items-center space-x-1 ${
              post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
            <span className="text-sm">{post.likes_count}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <MessageCircle size={16} />
            <span className="text-sm">{post.comments_count}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
            <Share2 size={16} />
            <span className="text-sm">{post.shares_count}</span>
          </button>
        </div>
        <button
          className={`p-2 rounded-full ${
            post.is_bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Bookmark size={16} fill={post.is_bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={16} className="text-blue-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              challenge.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
              challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              challenge.difficulty === 'hard' ? 'bg-orange-100 text-orange-600' :
              'bg-red-100 text-red-600'
            }`}>
              {challenge.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
              {challenge.pillar}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">{challenge.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
          
          <div className="text-sm text-gray-500 space-y-1">
            <div>Objectif: {challenge.target_value} {challenge.target_unit}</div>
            <div>Durée: {challenge.duration_days} jours</div>
            <div>Participants: {challenge.participants_count}</div>
            <div>Récompense: {challenge.reward_points} points</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Par {challenge.creator_profile.username}
        </div>
        <button
          onClick={() => handleJoinChallenge(challenge.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Rejoindre
        </button>
      </div>
    </div>
  );

  const LeaderboardCard = ({ entry }: { entry: LeaderboardEntry }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
        entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
        entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
        'bg-blue-100 text-blue-600'
      }`}>
        #{entry.rank}
      </div>
      
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {entry.username.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-800">{entry.username}</h4>
          <span className="text-xs text-gray-500">Niveau {entry.level}</span>
          {entry.sport && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {entry.sport}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {entry.total_points.toLocaleString()} pts • Série: {entry.current_streak} jours
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium text-gray-800">
          +{entry.weekly_points} pts
        </div>
        <div className={`text-xs ${
          entry.change_from_last_week > 0 ? 'text-green-600' : 
          entry.change_from_last_week < 0 ? 'text-red-600' : 
          'text-gray-500'
        }`}>
          {entry.change_from_last_week > 0 ? '↗' : entry.change_from_last_week < 0 ? '↘' : '→'} 
          {Math.abs(entry.change_from_last_week)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats sociales */}
      {socialStats && <SocialStatsCard />}

      {/* Navigation des onglets */}
      <div className="flex flex-wrap gap-2">
        <TabButton tab="feed" icon={Users} label="Feed Social" />
        <TabButton tab="challenges" icon={Target} label="Défis" count={challenges.length} />
        <TabButton tab="leaderboard" icon={Trophy} label="Classements" />
        <TabButton tab="friends" icon={Heart} label="Amis" count={socialStats?.friends_count} />
      </div>

      {/* Filtres selon l'onglet actif */}
      {activeTab === 'feed' && (
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="friends">Amis</option>
            <option value="global">Global</option>
            <option value="sport">Mon Sport</option>
          </select>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={challengeFilter.pillar}
            onChange={(e) => setChallengeFilter(prev => ({ ...prev, pillar: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tous les piliers</option>
            <option value="workout">Entraînement</option>
            <option value="nutrition">Nutrition</option>
            <option value="hydration">Hydratation</option>
            <option value="sleep">Sommeil</option>
          </select>
          <select
            value={challengeFilter.difficulty}
            onChange={(e) => setChallengeFilter(prev => ({ ...prev, difficulty: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Toutes difficultés</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      )}

      {/* Contenu selon l'onglet */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'feed' && (
            <>
              {socialFeed.length > 0 ? (
                socialFeed.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun post dans votre feed</p>
                  <p className="text-sm">Ajoutez des amis pour voir leurs activités !</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'challenges' && (
            <>
              {challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun défi disponible</p>
                  <p className="text-sm">Créez votre propre défi ou changez les filtres</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'leaderboard' && (
            <>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map(entry => <LeaderboardCard key={entry.user_id} entry={entry} />)}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Classement non disponible</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'friends' && (
            <div className="text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Section amis en développement</p>
              <p className="text-sm">Gérez vos connexions et invitations</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialDashboard;
