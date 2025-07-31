// pages/index.tsx - VERSION DE DEBUG MINIMALISTE
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
};

const IndexPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    console.log('Form submitted:', data);
    setError(null);
    setIsLoading(true);

    try {
      // Simulation d'une requête
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Formulaire soumis avec succès !');
    } catch (err: any) {
      setError('Erreur de test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🏋️‍♂️</div>
          <h1 className="text-3xl font-bold text-blue-600">
            MyFitHero V4
          </h1>
          <p className="text-gray-600 mt-2">
            Test de connexion
          </p>
        </div>
        
        {/* Onglets */}
        <div className="flex justify-center border-b border-gray-200 mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
              mode === "signin" 
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
              mode === "signup" 
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", { 
                required: "L'email est requis",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Format d'email invalide"
                }
              })}
              className={`w-full px-3 py-2 border rounded-md transition-all ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ {errors.email.message}
              </p>
            )}
          </div>
          
          {mode === "signup" && (
            <div>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                {...register("username", { 
                  required: mode === "signup" ? "Le nom d'utilisateur est requis" : false,
                  minLength: {
                    value: 3,
                    message: "Minimum 3 caractères"
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md transition-all ${
                  errors.username ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  ⚠️ {errors.username.message}
                </p>
              )}
            </div>
          )}
          
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              {...register("password", { 
                required: "Le mot de passe est requis",
                minLength: {
                  value: 6,
                  message: "Minimum 6 caractères"
                }
              })}
              className={`w-full px-3 py-2 border rounded-md transition-all ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                ⚠️ {errors.password.message}
              </p>
            )}
          </div>
          
          {mode === "signup" && (
            <div>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                {...register("confirmPassword", { 
                  required: mode === "signup" ? "Confirmation requise" : false
                })}
                className={`w-full px-3 py-2 border rounded-md transition-all ${
                  errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  ⚠️ {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                ❌ {error}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-md font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Chargement...
              </div>
            ) : (
              mode === "signup" ? "Créer un compte" : "Se connecter"
            )}
          </button>
        </form>

        {/* Debug info */}
        <div className="mt-6 p-3 bg-gray-100 rounded-md text-sm">
          <p><strong>Mode actuel :</strong> {mode}</p>
          <p><strong>État de chargement :</strong> {isLoading ? 'Oui' : 'Non'}</p>
          <p><strong>Erreur :</strong> {error || 'Aucune'}</p>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
