// pages/profile-complete.tsx
import React, { useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UniformHeader } from '@/components/UniformHeader';
import { 
  User, 
  Trophy, 
  Target, 
  Dumbbell, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Edit,
  CheckCircle2,
  AlertCircle,
  Zap,
  Heart
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';

const ProfileComplete: React.FC = () => {
  const router = useRouter();
  const { appStoreUser } = useAppStore();

  // Calcul de complétude du profil optimisé
  const profileCompletion = useMemo(() => {
    if (!appStoreUser) return { percentage: 0, completedFields: 0, totalFields: 0 };

    const fields = [
      { key: 'full_name', value: appStoreUser.full_name, required: true },
      { key: 'email', value: appStoreUser.email, required: true },
      { key: 'age', value: appStoreUser.age, required: true },
      { key: 'gender', value: appStoreUser.gender, required: true },
      { key: 'sport', value: appStoreUser.sport, required: true },
      { key: 'height_cm', value: appStoreUser.height_cm, required: true },
      { key: 'weight_kg', value: appStoreUser.weight_kg, required: true },
      { key: 'phone', value: appStoreUser.phone, required: false },
      { key: 'city', value: appStoreUser.city, required: false },
      { key: 'bio', value: appStoreUser.bio, required: false },
      { key: 'fitness_experience', value: appStoreUser.fitness_experience, required: true },
      { key: 'primary_goals', value: appStoreUser.primary_goals, required: true },
      { key: 'training_frequency', value: appStoreUser.training_frequency, required: false }
    ];
    
    const completedFields = fields.filter(field => 
      field.value !== null && 
      field.value !== undefined && 
      field.value !== '' &&
      (Array.isArray(field.value) ? field.value.length > 0 : true)
    ).length;
    
    const percentage = Math.round((completedFields / fields.length) * 100);
    
    return { 
      percentage, 
      completedFields, 
      totalFields: fields.length,
      isComplete: percentage >= 85 // 85% pour considérer comme complet
    };
  }, [appStoreUser]);

  // Calcul BMI optimisé
  const bmiData = useMemo(() => {
    if (!appStoreUser?.height_cm || !appStoreUser?.weight_kg) return null;
    
    const bmi = appStoreUser.weight_kg / Math.pow(appStoreUser.height_cm / 100, 2);
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Sous-poids';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Surpoids';
      color = 'text-yellow-600';
    } else {
      category = 'Obésité';
      color = 'text-red-600';
    }
    
    return { value: bmi.toFixed(1), category, color };
  }, [appStoreUser]);

  const profileSections = [
    {
      title: 'Informations personnelles',
      icon: User,
      color: 'bg-blue-50 border-blue-200',
      fields: [
        { 
          label: 'Nom complet', 
          value: appStoreUser?.full_name || appStoreUser?.first_name && appStoreUser?.last_name 
            ? `${appStoreUser.first_name} ${appStoreUser.last_name}` 
            : '-', 
          key: 'full_name',
          required: true 
        },
        { label: 'Email', value: appStoreUser?.email || '-', key: 'email', required: true },
        { label: 'Téléphone', value: appStoreUser?.phone || '-', key: 'phone', required: false },
        { label: 'Âge', value: appStoreUser?.age ? `${appStoreUser.age} ans` : '-', key: 'age', required: true },
        { label: 'Genre', value: appStoreUser?.gender === 'male' ? 'Homme' : appStoreUser?.gender === 'female' ? 'Femme' : '-', key: 'gender', required: true }
      ]
    },
    {
      title: 'Profil physique',
      icon: Dumbbell,
      color: 'bg-green-50 border-green-200',
      fields: [
        { label: 'Taille', value: appStoreUser?.height_cm ? `${appStoreUser.height_cm} cm` : '-', key: 'height_cm', required: true },
        { label: 'Poids', value: appStoreUser?.weight_kg ? `${appStoreUser.weight_kg} kg` : '-', key: 'weight_kg', required: true },
        { 
          label: 'IMC', 
          value: bmiData ? `${bmiData.value} (${bmiData.category})` : '-', 
          key: 'bmi',
          required: false,
          color: bmiData?.color
        },
        { label: 'Ville', value: appStoreUser?.city || '-', key: 'city', required: false }
      ]
    },
    {
      title: 'Profil sportif',
      icon: Trophy,
      color: 'bg-purple-50 border-purple-200',
      fields: [
        { label: 'Sport principal', value: appStoreUser?.sport || '-', key: 'sport', required: true },
        { label: 'Position', value: appStoreUser?.sport_position || '-', key: 'sport_position', required: false },
        { label: 'Niveau', value: appStoreUser?.sport_level || '-', key: 'sport_level', required: false },
        { 
          label: 'Expérience fitness', 
          value: appStoreUser?.fitness_experience ? 
            appStoreUser.fitness_experience.charAt(0).toUpperCase() + appStoreUser.fitness_experience.slice(1) : '-', 
          key: 'fitness_experience', 
          required: true 
        }
      ]
    },
    {
      title: 'Objectifs et préférences',
      icon: Target,
      color: 'bg-orange-50 border-orange-200',
      fields: [
        { 
          label: 'Objectifs principaux', 
          value: appStoreUser?.primary_goals?.join(', ') || '-', 
          key: 'primary_goals', 
          required: true 
        },
        { 
          label: 'Fréquence d\'entraînement', 
          value: appStoreUser?.training_frequency ? `${appStoreUser.training_frequency} jours/semaine` : '-', 
          key: 'training_frequency', 
          required: false 
        },
        { 
          label: 'Modules actifs', 
          value: appStoreUser?.active_modules?.join(', ') || '-', 
          key: 'active_modules', 
          required: false 
        },
        { label: 'Bio', value: appStoreUser?.bio || '-', key: 'bio', required: false }
      ]
    }
  ];

  const getPersonalizedMessage = () => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    const { percentage, isComplete } = profileCompletion;
    
    if (isComplete) {
      return `🎉 Parfait ${userName} ! Votre profil est complet et optimisé pour ${appStoreUser?.sport}`;
    } else if (percentage >= 70) {
      return `💪 Excellent ${userName}, encore quelques détails pour finaliser`;
    } else if (percentage >= 50) {
      return `⚡ Bien joué ${userName}, vous êtes sur la bonne voie`;
    } else {
      return `🚀 ${userName}, complétez votre profil pour une expérience optimale`;
    }
  };

  if (!appStoreUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Profil" 
          showBackButton={true}
          gradient={true}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Compléter le profil"
        subtitle={getPersonalizedMessage()}
        showBackButton={true}
        gradient={true}
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/profile')}
            className="text-white hover:bg-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Statut de complétude */}
        <Card className={`${profileCompletion.isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {profileCompletion.isComplete ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-green-900">Profil complet !</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                    <span className="font-semibold text-amber-900">
                      Profil {profileCompletion.percentage}% complet
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={profileCompletion.isComplete ? "default" : "secondary"}>
                  {profileCompletion.completedFields}/{profileCompletion.totalFields} champs
                </Badge>
                <Badge variant="outline">
                  {profileCompletion.percentage}%
                </Badge>
              </div>
            </div>
            
            <Progress value={profileCompletion.percentage} className="h-3 mb-4" />
            
            {!profileCompletion.isComplete && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Pourquoi compléter votre profil ?</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>Recommandations IA personnalisées</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span>Calculs nutritionnels précis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-3 w-3 text-purple-500" />
                    <span>Objectifs adaptés à votre sport</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span>Coaching intelligent</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections du profil */}
        <div className="space-y-6">
          {profileSections.map((section, index) => {
            const SectionIcon = section.icon;
            const incompletedFields = section.fields.filter(field => 
              field.required && (field.value === '-' || !field.value)
            );
            const sectionComplete = incompletedFields.length === 0;
            
            return (
              <Card key={index} className={sectionComplete ? 'border-green-200' : section.color}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <SectionIcon className="h-5 w-5 text-gray-600" />
                      <span>{section.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionComplete ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complet
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {incompletedFields.length} manquant{incompletedFields.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field, fieldIndex) => {
                      const isEmpty = field.value === '-' || !field.value;
                      const isRequired = field.required;
                      
                      return (
                        <div 
                          key={fieldIndex} 
                          className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                            isEmpty && isRequired 
                              ? 'bg-red-50 border border-red-100' 
                              : isEmpty 
                                ? 'bg-gray-50' 
                                : 'bg-green-50 border border-green-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">
                              {field.label}
                            </span>
                            {isRequired && (
                              <span className="text-red-500 text-xs">*</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            isEmpty 
                              ? isRequired 
                                ? 'text-red-500 font-medium' 
                                : 'text-gray-400'
                              : field.color || 'text-gray-900 font-medium'
                          }`}>
                            {field.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-100">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {profileCompletion.isComplete ? 'Profil optimisé !' : 'Finaliser votre profil'}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {profileCompletion.isComplete 
                  ? 'Votre profil est maintenant complet et optimisé pour une expérience MyFitHero personnalisée.'
                  : 'Complétez les champs manquants pour débloquer toutes les fonctionnalités de coaching IA personnalisé.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/profile')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {profileCompletion.isComplete ? 'Modifier le profil' : 'Compléter le profil'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  Retour au dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileComplete;
