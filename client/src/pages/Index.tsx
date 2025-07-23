// pages/index.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WorkoutDashboard from '@/components/WorkoutDashboard';
import Nutrition from '@/components/Nutrition';
import Hydration from '@/components/Hydration';
import Sleep from '@/components/Sleep';
import DailyCheckIn from '@/components/DailyCheckIn';
import BadgeSystem from '@/components/BadgeSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
};

const IndexPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { appStoreUser } = useAppStore();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>();

  // Redirection si onboarding non complété
  useEffect(() => {
    if (appStoreUser?.id && !appStoreUser.onboarding_completed) {
      router.push('/onboarding');
    }
  }, [appStoreUser, router]);

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
          
          {/* Header avec informations utilisateur */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    Bonjour {appStoreUser.first_name || appStoreUser.username} ! 👋
                  </h1>
                  <p className="text-blue-100">
                    Prêt pour une nouvelle journée de {appStoreUser.sport} ?
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {appStoreUser.sport} • Niveau {appStoreUser.fitness_experience}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Check-in quotidien */}
          <DailyCheckIn />
          
          {/* Navigation principale par onglets */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Entraînement</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="hydration">Hydratation</TabsTrigger>
              <TabsTrigger value="sleep">Sommeil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <WorkoutDashboard />
            </TabsContent>
            
            <TabsContent value="nutrition">
              <Nutrition />
            </TabsContent>
            
            <TabsContent value="hydration">
              <Hydration />
            </TabsContent>
            
            <TabsContent value="sleep">
              <Sleep />
            </TabsContent>
          </Tabs>
          
          {/* Système de badges */}
          <BadgeSystem showProgress={true} compact={false} />
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
