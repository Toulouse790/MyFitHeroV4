import React, { useState } from 'react';
import { 
  Users, Target, Trophy, MessageCircle,
  Star, Zap, ChevronRight
} from 'lucide-react';
import SocialDashboard from '@/components/SocialDashboard';
import { useAppStore } from '@/stores/useAppStore';
import { socialService } from '@/services/socialService';
import { useToast } from '@/hooks/use-toast';

const Social: React.FC = () => {
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  // États pour la création de contenu
  const [newPost, setNewPost] = useState({
    content: '',
    post_type: 'general' as const,
    achievements: [] as any[]
  });

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    pillar: 'workout' as const,
    challenge_type: 'community' as const,
    target_value: 0,
    target_unit: '',
    duration_days: 7,
    difficulty: 'medium' as const,
    reward_points: 100
  });

  // Gestion de la création de posts
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le contenu du post ne peut pas être vide',
        variant: 'destructive'
      });
      return;
    }

    try {
      const postId = await socialService.createPost(appStoreUser.id, newPost);
      if (postId) {
        toast({
          title: 'Post publié !',
          description: 'Votre post a été partagé avec la communauté',
        });
        setNewPost({ content: '', post_type: 'general', achievements: [] });
        setShowCreatePost(false);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le post',
        variant: 'destructive'
      });
    }
  };

  // Gestion de la création de défis
  const handleCreateChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      toast({
        title: 'Erreur',
        description: 'Titre et description sont requis',
        variant: 'destructive'
      });
      return;
    }

    try {
      const challengeId = await socialService.createChallenge(appStoreUser.id, {
        ...newChallenge,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + newChallenge.duration_days * 24 * 60 * 60 * 1000).toISOString()
      });
      
      if (challengeId) {
        toast({
          title: 'Défi créé !',
          description: 'Votre défi est maintenant disponible pour la communauté',
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
          reward_points: 100
        });
        setShowCreateChallenge(false);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le défi',
        variant: 'destructive'
      });
    }
  };

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Créer un post</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de post</label>
            <select
              value={newPost.post_type}
              onChange={(e) => setNewPost(prev => ({ ...prev, post_type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="general">Général</option>
              <option value="achievement">Achievement</option>
              <option value="workout">Workout</option>
              <option value="progress">Progrès</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Partagez votre expérience, vos achievements, vos conseils..."
              className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreatePost(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleCreatePost}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );

  const CreateChallengeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Créer un défi</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre du défi</label>
            <input
              type="text"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: 30 Push-ups Challenge"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newChallenge.description}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre défi en détail..."
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilier</label>
              <select
                value={newChallenge.pillar}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, pillar: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="workout">Entraînement</option>
                <option value="nutrition">Nutrition</option>
                <option value="hydration">Hydratation</option>
                <option value="sleep">Sommeil</option>
                <option value="general">Général</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
              <select
                value={newChallenge.difficulty}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objectif</label>
              <input
                type="number"
                value={newChallenge.target_value}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, target_value: parseInt(e.target.value) }))}
                placeholder="100"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unité</label>
              <input
                type="text"
                value={newChallenge.target_unit}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, target_unit: e.target.value }))}
                placeholder="push-ups, km, L..."
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (jours)</label>
              <input
                type="number"
                value={newChallenge.duration_days}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                min="1"
                max="365"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points récompense</label>
              <input
                type="number"
                value={newChallenge.reward_points}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, reward_points: parseInt(e.target.value) }))}
                min="10"
                step="10"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de défi</label>
            <select
              value={newChallenge.challenge_type}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, challenge_type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="individual">Individuel</option>
              <option value="team">Équipe</option>
              <option value="community">Communauté</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreateChallenge(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateChallenge}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer le défi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Social */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Social Hub</h1>
                <p className="text-purple-200">
                  Connectez-vous, challengez-vous, progressez ensemble
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <MessageCircle size={16} />
                <span className="hidden md:block">Post</span>
              </button>
              <button
                onClick={() => setShowCreateChallenge(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Target size={16} />
                <span className="hidden md:block">Défi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <div className="text-sm text-gray-600">Amis</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target size={20} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">8</div>
            <div className="text-sm text-gray-600">Défis Actifs</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy size={20} className="text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">47</div>
            <div className="text-sm text-gray-600">Rang Global</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star size={20} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">1,240</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
        </div>

        {/* Suggestions rapides */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Zap className="mr-2 text-blue-600" size={20} />
            Suggestions du jour
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">Défi Rugby</h3>
                  <p className="text-sm text-gray-600">Rejoignez le défi poussée de mêlée</p>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">Nouveaux Amis</h3>
                  <p className="text-sm text-gray-600">3 suggestions d'amis Rugby</p>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Trophy className="text-purple-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">Classement</h3>
                  <p className="text-sm text-gray-600">Vous gagnez 2 places cette semaine!</p>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard social principal */}
        <SocialDashboard userId={appStoreUser.id} />

        {/* Modals */}
        {showCreatePost && <CreatePostModal />}
        {showCreateChallenge && <CreateChallengeModal />}
      </div>
    </div>
  );
};

export default Social;
