// pages/index.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ✅ Imports corrects - utilisation des composants Lazy existants
import {
  LazyNutrition,
  LazyHydration,
  LazySleep,
  LazyWorkout
} from '@/components/LazyComponents';

import { useWearableSync } from '@/hooks/useWearableSync';
import { 
  Dumbbell,
  Apple,
  Droplets,
  Moon,
  Watch,
  User,
  Bell,
  Settings,
  TrendingUp,
  Target,
  Heart,
  Activity,
  Zap,
  ChevronRight,
  Award,
  BarChart3
} from 'lucide-react';

// ✅ Composants temporaires pour les éléments manquants
const WorkoutDashboard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Dumbbell className="mr-2 h-5 w-5 text-blue-600" />
        Dashboard Entraînement
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Dernière session</p>
              <p className="text-2xl font-bold text-blue-900">45min</p>
            </div>
            <Dumbbell className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Cette semaine</p>
              <p className="text-2xl font-bold text-green-900">3/4</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Prochain</p>
              <p className="text-2xl font-bold text-purple-900">Demain</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
importer WorkoutDashboard depuis '@/components/WorkoutDashboard' ;
const DailyCheckIn = () => (
  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-green-900">Check-in quotidien</h3>
          <p className="text-green-700 text-sm">Comment vous sentez-vous aujourd'hui ?</p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
            😊 Bien
          </Button>
          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
            💪 Motivé
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BadgeSystem = ({ showProgress, compact }: { showProgress?: boolean; compact?: boolean }) => (
  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Award className="mr-2 h-5 w-5 text-yellow-600" />
        🏆 Système de récompenses
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="font-semibold">Objectif Atteint</p>
            <p className="text-sm text-gray-600">10,000 pas aujourd'hui</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">🔥</div>
            <p className="font-semibold">Série Active</p>
            <p className="text-sm text-gray-600">7 jours consécutifs</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-3xl mb-2">💪</div>
            <p className="font-semibold">Force</p>
            <p className="text-sm text-gray-600">Niveau débloqué</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
};

const IndexPage = () => {
  const [location, setLocation] = useLocation(); // ✅ Corrigé useLocation
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { appStoreUser } = useAppStore();
  const { getCachedData, isLoading: wearableLoading } = useWearableSync();
  const wearableData = getCachedData();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>();

  // Configuration des cartes de navigation
  const navigationCards = [
    {
      title: 'Entraînement',
      description: 'Sessions et programmes d\'entraînement',
      icon: Dumbbell,
      color: 'bg-blue-500',
      href: '/workout'
    },
    {
      title: 'Nutrition',
      description: 'Suivi alimentaire et macronutriments',
      icon: Apple,
      color: 'bg-green-500',
      href: '/nutrition'
    },
    {
      title: 'Hydratation',
      description: 'Suivi de consommation d\'eau quotidienne',
      icon: Droplets,
      color: 'bg-cyan-500',
      href: '/hydration'
    },
    {
      title: 'Sommeil',
      description: 'Analyse et optimisation du repos',
      icon: Moon,
      color: 'bg-purple-500',
      href: '/sleep'
    },
    {
      title: 'Wearables',
      description: 'Appareils connectés et synchronisation',
      icon: Watch,
      color: 'bg-orange-500',
      href: '/wearables'
    },
    {
      title: 'Profil',
      description: 'Informations personnelles et objectifs',
      icon: User,
      color: 'bg-indigo-500',
      href: '/profile'
    },
    {
      title: 'Notifications',
      description: 'Centre de notifications et rappels',
      icon: Bell,
      color: 'bg-yellow-500',
      href: '/notifications'
    },
    {
      title: 'Paramètres',
      description: 'Configuration et préférences',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/settings'
    }
  ];

  // Statistiques rapides
  const quickStats = [
    {
      title: 'Pas aujourd\'hui',
      value: wearableData?.steps?.toLocaleString() || '0',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Calories brûlées',
      value: wearableData?.caloriesBurned?.toString() || '0',
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'FC moyenne',
      value: wearableData?.heartRate ? 
        `${Math.round(wearableData.heartRate.reduce((a, b) => a + b, 0) / wearableData.heartRate.length)} BPM` : 
        '0 BPM',
      icon: Heart,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Minutes actives',
      value: wearableData?.activeMinutes?.toString() || '0',
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  // ✅ Redirection corrigée avec setLocation
  useEffect(() => {
    if (appStoreUser?.id && !appStoreUser.onboarding_completed) {
      setLocation('/onboarding');
    }
  }, [appStoreUser, setLocation]);

  const onSubmit = async (data: AuthFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (data.password !== data.confirmPassword) {
          setError("Les mots de passe ne correspondent pas.");
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { username: data.username },
          },
        });

        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dashboard pour utilisateur connecté avec onboarding complété
  if (appStoreUser?.id && appStoreUser.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 space-y-6">
          
          {/* Header avec informations utilisateur et status wearables */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    Bonjour {appStoreUser.first_name || appStoreUser.username} ! 👋
                  </h1>
                  <p className="text-blue-100">
                    Prêt pour une nouvelle journée de {appStoreUser.sport} ?
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {appStoreUser.sport} • Niveau {appStoreUser.fitness_experience}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    {wearableLoading ? 'Sync...' : 'Wearables'}
                  </Badge>
                </div>
              </div>
              
              {/* Stats rapides intégrées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <stat.icon className="text-white" size={16} />
                      <div>
                        <p className="text-xs text-white/80">{stat.title}</p>
                        <p className="text-sm font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Check-in quotidien */}
          <DailyCheckIn />
          
          {/* Navigation principale avec deux modes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Section principale avec onglets */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                    <Dumbbell className="h-4 w-4" />
                    <span className="hidden sm:inline">Entraînement</span>
                  </TabsTrigger>
                  <TabsTrigger value="nutrition" className="flex items-center space-x-2">
                    <Apple className="h-4 w-4" />
                    <span className="hidden sm:inline">Nutrition</span>
                  </TabsTrigger>
                  <TabsTrigger value="hydration" className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4" />
                    <span className="hidden sm:inline">Hydratation</span>
                  </TabsTrigger>
                  <TabsTrigger value="sleep" className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span className="hidden sm:inline">Sommeil</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                  <WorkoutDashboard />
                </TabsContent>
                
                {/* ✅ Utilisation des composants Lazy avec Suspense */}
                <TabsContent value="nutrition">
                  <Suspense fallback={<div className="p-4 text-center">Chargement nutrition...</div>}>
                    <LazyNutrition />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="hydration">
                  <Suspense fallback={<div className="p-4 text-center">Chargement hydratation...</div>}>
                    <LazyHydration />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="sleep">
                  <Suspense fallback={<div className="p-4 text-center">Chargement sommeil...</div>}>
                    <LazySleep />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar avec navigation et réalisations */}
            <div className="space-y-6">
              
              {/* Navigation rapide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Navigation rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {navigationCards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => setLocation(card.href)} // ✅ Corrigé setLocation
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="text-white" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{card.title}</h4>
                        <p className="text-xs text-gray-600 truncate">{card.description}</p>
                      </div>
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={16} />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Réalisations récentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2" size={20} />
                    Réalisations récentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Target className="text-yellow-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Objectif 10K pas</p>
                      <p className="text-xs text-gray-500">Atteint aujourd'hui</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Série active</p>
                      <p className="text-xs text-gray-500">7 jours consécutifs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Zone cardio</p>
                      <p className="text-xs text-gray-500">30 min aujourd'hui</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2" size={20} />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setLocation('/workout')} // ✅ Corrigé setLocation
                  >
                    <Activity className="mr-2" size={16} />
                    Démarrer entraînement
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/wearables')} // ✅ Corrigé setLocation
                  >
                    <Watch className="mr-2" size={16} />
                    Synchroniser wearables
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/analytics')} // ✅ Corrigé setLocation
                  >
                    <TrendingUp className="mr-2" size={16} />
                    Voir les tendances
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Système de badges */}
          <BadgeSystem showProgress={true} compact={false} />

          {/* Footer avec informations MyFitHero V4 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-100">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎉 MyFitHero V4 - Intégration Complète !
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  Profitez d'un suivi complet de votre santé et de performances optimisées grâce à 
                  l'intelligence artificielle et aux appareils connectés.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="outline" className="bg-white">
                    ✅ Sessions d'entraînement améliorées
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    ⌚ Synchronisation Apple Health & Google Fit
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    📊 Analytics temps réel
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    🎯 Objectifs personnalisés
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    🔔 Notifications intelligentes
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    🤖 IA de coaching avancée
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Page d'authentification modernisée
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🏋️‍♂️</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MyFitHero V4
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Votre compagnon intelligent pour la santé et la forme
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Onglets de mode */}
          <div className="flex justify-center border-b">
            <button
              onClick={() => setMode("signin")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                mode === "signin" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                mode === "signup" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                {...register("email", { 
                  required: "L'email est requis",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Format d'email invalide"
                  }
                })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            {mode === "signup" && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  {...register("username", { 
                    required: mode === "signup" ? "Le nom d'utilisateur est requis" : false,
                    minLength: {
                      value: 3,
                      message: "Minimum 3 caractères"
                    }
                  })}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                {...register("password", { 
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 caractères"
                  }
                })}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            {mode === "signup" && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  {...register("confirmPassword", { 
                    required: mode === "signup" ? "Confirmation requise" : false
                  })}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : mode === "signup" ? "Créer un compte" : "Se connecter"}
            </Button>
          </form>

          {/* Fonctionnalités mises en avant */}
          <div className="pt-4 border-t">
            <p className="text-center text-sm text-gray-600 mb-3">
              Découvrez toutes les fonctionnalités :
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Badge variant="outline" className="p-2">
                🏋️ Workout IA
              </Badge>
              <Badge variant="outline" className="p-2">
                📊 Analytics
              </Badge>
              <Badge variant="outline" className="p-2">
                ⌚ Wearables
              </Badge>
              <Badge variant="outline" className="p-2">
                🎯 Coaching
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndexPage;
