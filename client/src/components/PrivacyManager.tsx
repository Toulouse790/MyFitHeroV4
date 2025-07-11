import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Bell, 
  BellOff, 
  Trash2, 
  Download,
  AlertTriangle,
  Lock,
  Globe,
  Users,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';

interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  show_activity: boolean;
  show_progress: boolean;
  show_badges: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  data_analytics: boolean;
}

const PrivacyManager: React.FC = () => {
  const { toast } = useToast();
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_activity: true,
    show_progress: true,
    show_badges: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    data_analytics: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    loadPrivacySettings();
  }, [appStoreUser]);

  const loadPrivacySettings = async () => {
    if (!appStoreUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const savePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!appStoreUser?.id) return;

    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: appStoreUser.id,
          ...updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setSettings(updatedSettings);
      toast({
        title: 'Paramètres mis à jour',
        description: 'Vos préférences de confidentialité ont été sauvegardées.',
      });

    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos paramètres.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!appStoreUser?.id) return;

    setIsLoading(true);
    try {
      // Récupérer toutes les données utilisateur
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .single();

      const { data: checkins } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', appStoreUser.id);

      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', appStoreUser.id);

      const { data: aiRequests } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('user_id', appStoreUser.id);

      const userData = {
        profile,
        daily_check_ins: checkins,
        badges,
        ai_requests: aiRequests,
        privacy_settings: settings,
        export_date: new Date().toISOString()
      };

      // Créer et télécharger le fichier
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myfit-hero-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export terminé',
        description: 'Vos données ont été exportées avec succès.',
      });

    } catch (error) {
      console.error('Erreur export données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter vos données.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!appStoreUser?.id || deleteConfirmText !== 'SUPPRIMER') return;

    setIsLoading(true);
    try {
      // Supprimer toutes les données utilisateur
      await supabase.from('user_badges').delete().eq('user_id', appStoreUser.id);
      await supabase.from('daily_check_ins').delete().eq('user_id', appStoreUser.id);
      await supabase.from('ai_requests').delete().eq('user_id', appStoreUser.id);
      await supabase.from('user_privacy_settings').delete().eq('user_id', appStoreUser.id);
      await supabase.from('user_profiles').delete().eq('user_id', appStoreUser.id);

      // Supprimer l'utilisateur auth
      const { error } = await supabase.auth.admin.deleteUser(appStoreUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé définitivement.',
      });

      // Déconnexion
      await supabase.auth.signOut();

    } catch (error) {
      console.error('Erreur suppression compte:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer votre compte.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return Globe;
      case 'friends': return Users;
      case 'private': return Lock;
      default: return Globe;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'friends': return 'Amis uniquement';
      case 'private': return 'Privé';
      default: return 'Public';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-blue-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Confidentialité & Sécurité</h2>
          <p className="text-gray-600">Gérez vos paramètres de confidentialité et vos données</p>
        </div>
      </div>

      {/* Visibilité du profil */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Visibilité du profil</h3>
        <div className="space-y-3">
          {(['public', 'friends', 'private'] as const).map((visibility) => {
            const Icon = getVisibilityIcon(visibility);
            return (
              <div
                key={visibility}
                onClick={() => savePrivacySettings({ profile_visibility: visibility })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.profile_visibility === visibility
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">{getVisibilityLabel(visibility)}</h4>
                      <p className="text-sm text-gray-600">
                        {visibility === 'public' && 'Visible par tous les utilisateurs'}
                        {visibility === 'friends' && 'Visible par vos amis uniquement'}
                        {visibility === 'private' && 'Visible par vous uniquement'}
                      </p>
                    </div>
                  </div>
                  {settings.profile_visibility === visibility && (
                    <CheckCircle className="text-blue-600" size={20} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paramètres de partage */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Partage des données</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Eye size={20} className="text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-800">Afficher mon activité</h4>
                <p className="text-sm text-gray-600">Vos séances et progrès</p>
              </div>
            </div>
            <button
              onClick={() => savePrivacySettings({ show_activity: !settings.show_activity })}
              className={`p-2 rounded-full transition-colors ${
                settings.show_activity ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {settings.show_activity ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-800">Afficher mes badges</h4>
                <p className="text-sm text-gray-600">Vos accomplissements</p>
              </div>
            </div>
            <button
              onClick={() => savePrivacySettings({ show_badges: !settings.show_badges })}
              className={`p-2 rounded-full transition-colors ${
                settings.show_badges ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {settings.show_badges ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-800">Notifications email</h4>
                <p className="text-sm text-gray-600">Rappels et mises à jour</p>
              </div>
            </div>
            <button
              onClick={() => savePrivacySettings({ email_notifications: !settings.email_notifications })}
              className={`p-2 rounded-full transition-colors ${
                settings.email_notifications ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {settings.email_notifications ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-800">Emails marketing</h4>
                <p className="text-sm text-gray-600">Nouveautés et promotions</p>
              </div>
            </div>
            <button
              onClick={() => savePrivacySettings({ marketing_emails: !settings.marketing_emails })}
              className={`p-2 rounded-full transition-colors ${
                settings.marketing_emails ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {settings.marketing_emails ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Gestion des données */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestion des données</h3>
        <div className="space-y-4">
          <button
            onClick={exportUserData}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Download size={20} className="text-blue-600" />
            <span className="font-medium text-blue-800">Exporter mes données</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} className="text-red-600" />
            <span className="font-medium text-red-800">Supprimer mon compte</span>
          </button>
        </div>
      </div>

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Supprimer le compte</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tapez "SUPPRIMER" pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                placeholder="SUPPRIMER"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || isLoading}
                className="flex-1 p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyManager;
