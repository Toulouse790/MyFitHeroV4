import React, { useState, useRef } from 'react';
import { Camera, User, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'md',
  editable = true
}) => {
  const { toast } = useToast();
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive'
      });
      return;
    }

    // Taille max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5MB.',
        variant: 'destructive'
      });
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload du fichier
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    if (!appStoreUser?.id) return;

    setIsUploading(true);
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${appStoreUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', appStoreUser.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour le store local
      updateAppStoreUserProfile({
        ...appStoreUser,
        avatar_url: avatarUrl
      });

      // Callback pour le parent
      onAvatarChange?.(avatarUrl);

      setPreviewUrl(null);
      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès.',
      });

    } catch (error) {
      console.error('Erreur upload avatar:', error);
      setPreviewUrl(null);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour votre photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!appStoreUser?.id) return;

    setIsUploading(true);
    try {
      // Supprimer du profil
      const { error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', appStoreUser.id);

      if (error) {
        throw error;
      }

      // Mettre à jour le store local
      updateAppStoreUserProfile({
        ...appStoreUser,
        avatar_url: null
      });

      onAvatarChange?.('');
      setPreviewUrl(null);

      toast({
        title: 'Photo supprimée',
        description: 'Votre photo de profil a été supprimée.',
      });

    } catch (error) {
      console.error('Erreur suppression avatar:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer votre photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = previewUrl || currentAvatar || appStoreUser?.avatar_url || undefined;

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative`}>
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="text-white" size={iconSizes[size]} />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={iconSizes[size]} />
          </div>
        )}
      </div>

      {editable && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button
              onClick={openFileDialog}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="Changer la photo"
              disabled={isUploading}
            >
              <Camera size={16} />
            </button>
            
            {displayAvatar && (
              <button
                onClick={removeAvatar}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Supprimer la photo"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {editable && !displayAvatar && (
        <button
          onClick={openFileDialog}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          title="Ajouter une photo"
          disabled={isUploading}
        >
          <Camera size={16} />
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;
