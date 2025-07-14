import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, UserCheck, UserX, MessageSquare,
  Trophy, Target, Calendar, Star, Crown, Medal, Activity,
  ChevronRight, Filter, MoreHorizontal, Mail, Phone, MapPin
} from 'lucide-react';
import { socialService, UserConnection, SocialStats } from '@/services/socialService';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';

interface SocialConnectionsProps {
  userId: string;
}

const SocialConnections: React.FC<SocialConnectionsProps> = ({ userId }) => {
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests' | 'suggestions'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [friends, setFriends] = useState<UserConnection[]>([]);
  const [searchResults, setSearchResults] = useState<UserConnection[]>([]);
  const [friendRequests, setFriendRequests] = useState<UserConnection[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);

  useEffect(() => {
    loadFriends();
    loadSocialStats();
  }, [userId]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsData = await socialService.getFriends(userId);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste d\'amis',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSocialStats = async () => {
    try {
      const stats = await socialService.getSocialStats(userId);
      setSocialStats(stats);
    } catch (error) {
      console.error('Error loading social stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const results = await socialService.searchUsers(searchQuery, userId);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la recherche',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      const success = await socialService.sendFriendRequest(userId, friendId);
      if (success) {
        toast({
          title: 'Demande envoyée',
          description: 'Votre demande d\'ami a été envoyée',
        });
        // Mettre à jour l'état local
        setSearchResults(prev => prev.filter(user => user.friend_id !== friendId));
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptFriendRequest = async (connectionId: string) => {
    try {
      const success = await socialService.acceptFriendRequest(connectionId);
      if (success) {
        toast({
          title: 'Ami ajouté',
          description: 'Vous êtes maintenant amis !',
        });
        loadFriends();
        setFriendRequests(prev => prev.filter(req => req.id !== connectionId));
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter la demande',
        variant: 'destructive'
      });
    }
  };

  const SocialStatsHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mes Connexions</h1>
          <p className="text-blue-200">Développez votre réseau fitness</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{socialStats?.friends_count || 0}</div>
          <div className="text-blue-200 text-sm">amis connectés</div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <div className="text-xl font-bold">{socialStats?.followers_count || 0}</div>
          <div className="text-blue-200 text-xs">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{socialStats?.following_count || 0}</div>
          <div className="text-blue-200 text-xs">Following</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{socialStats?.community_rank || 0}</div>
          <div className="text-blue-200 text-xs">Rang</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{socialStats?.influence_score || 0}</div>
          <div className="text-blue-200 text-xs">Influence</div>
        </div>
      </div>
    </div>
  );

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
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs ${
          activeTab === tab ? 'bg-blue-500' : 'bg-red-500 text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const FriendCard = ({ friend, showActions = false }: { 
    friend: UserConnection; 
    showActions?: boolean;
  }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {friend.friend_profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800">{friend.friend_profile.username}</h3>
            {friend.friend_profile.is_online && (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            )}
            {friend.friend_profile.level && (
              <span className="text-xs text-gray-500">Niv. {friend.friend_profile.level}</span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {friend.friend_profile.sport && (
              <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs mr-2">
                {friend.friend_profile.sport}
              </span>
            )}
            {friend.friend_profile.sport_position && (
              <span>{friend.friend_profile.sport_position}</span>
            )}
          </div>
          
          {!friend.friend_profile.is_online && friend.friend_profile.last_seen && (
            <div className="text-xs text-gray-400 mt-1">
              Vu {new Date(friend.friend_profile.last_seen).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showActions ? (
            <>
              <button
                onClick={() => handleAcceptFriendRequest(friend.id)}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              >
                <UserCheck size={16} />
              </button>
              <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                <UserX size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="p-2 text-gray-500 hover:text-blue-600">
                <MessageSquare size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MoreHorizontal size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const SearchCard = ({ user }: { user: UserConnection }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {user.friend_profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800">{user.friend_profile.username}</h3>
            {user.friend_profile.level && (
              <span className="text-xs text-gray-500">Niv. {user.friend_profile.level}</span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {user.friend_profile.sport && (
              <span className="inline-block bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs mr-2">
                {user.friend_profile.sport}
              </span>
            )}
            {user.friend_profile.sport_position && (
              <span>{user.friend_profile.sport_position}</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => handleSendFriendRequest(user.friend_id)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>
    </div>
  );

  const SuggestedFriends = () => {
    // Mock data pour les suggestions
    const suggestions = [
      {
        id: 'sug1',
        user_id: userId,
        friend_id: 'user1',
        status: 'pending' as const,
        created_at: '',
        updated_at: '',
        friend_profile: {
          username: 'Rugby_Pro_31',
          sport: 'rugby',
          sport_position: 'demi de mêlée',
          level: 12,
          is_online: true
        }
      },
      {
        id: 'sug2',
        user_id: userId,
        friend_id: 'user2',
        status: 'pending' as const,
        created_at: '',
        updated_at: '',
        friend_profile: {
          username: 'Pilier_Force',
          sport: 'rugby',
          sport_position: 'pilier',
          level: 15,
          is_online: false
        }
      }
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Suggestions pour vous</h2>
          <span className="text-sm text-gray-500">Basé sur vos intérêts</span>
        </div>
        
        {suggestions.map(user => (
          <SearchCard key={user.id} user={user} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SocialStatsHeader />
      
      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <TabButton tab="friends" icon={Users} label="Amis" count={friends.length} />
        <TabButton tab="search" icon={Search} label="Rechercher" />
        <TabButton tab="requests" icon={Mail} label="Demandes" count={friendRequests.length} />
        <TabButton tab="suggestions" icon={Star} label="Suggestions" />
      </div>

      {/* Barre de recherche pour l'onglet search */}
      {activeTab === 'search' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Rechercher des utilisateurs par nom d'utilisateur..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Rechercher'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenu selon l'onglet */}
      <div className="space-y-4">
        {activeTab === 'friends' && (
          <>
            {friends.length > 0 ? (
              friends.map(friend => (
                <FriendCard key={friend.id} friend={friend} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Vous n'avez pas encore d'amis</p>
                <p className="text-sm">Utilisez la recherche pour trouver des personnes à ajouter</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'search' && (
          <>
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <SearchCard key={user.friend_id} user={user} />
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-12 text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucun utilisateur trouvé pour "{searchQuery}"</p>
                <p className="text-sm">Essayez avec un autre nom d'utilisateur</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Recherchez des utilisateurs par nom</p>
                <p className="text-sm">Tapez un nom d'utilisateur pour commencer</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {friendRequests.length > 0 ? (
              friendRequests.map(request => (
                <FriendCard key={request.id} friend={request} showActions={true} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune demande d'ami en attente</p>
                <p className="text-sm">Les nouvelles demandes apparaîtront ici</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'suggestions' && <SuggestedFriends />}
      </div>
    </div>
  );
};

export default SocialConnections;
