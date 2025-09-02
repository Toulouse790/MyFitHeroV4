// client/src/components/AuthPages.tsx
import React, { useState } from 'react';
import { authClient } from '@/lib/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react';

interface AuthPagesProps {
  onAuthSuccess: (user: any, isNewUser?: boolean) => void;
}

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AuthPages: React.FC<AuthPagesProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [signInForm, setSignInForm] = useState<SignInForm>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation des champs
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (signUpForm.password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    // ✅ Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpForm.email)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une adresse email valide',
        variant: 'destructive',
      });
      return;
    }

    // ✅ Validation du nom d'utilisateur
    if (signUpForm.username.length < 3) {
      toast({
        title: 'Erreur',
        description: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    console.log('🚀 Début inscription pour:', signUpForm.email);

    try {
      const result = await authClient.register(
        signUpForm.email,
        signUpForm.username,
        signUpForm.password
      );
      console.log('📦 Résultat inscription:', result);

      if (result.error) {
        console.error('❌ Erreur lors inscription:', result.error);
        toast({
          title: "Erreur d'inscription",
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.user) {
        console.log('✅ Inscription réussie - Appel onAuthSuccess avec isNewUser=true');
        console.log('👤 Utilisateur créé:', result.user.id);

        // ✅ APPEL CRITIQUE - Marquer comme nouvel utilisateur
        onAuthSuccess(result.user, true);

        // ✅ FALLBACK DE SÉCURITÉ - Redirection directe si le callback échoue
        setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log('🔍 Vérification path après inscription:', currentPath);

          if (currentPath === '/auth') {
            console.log('⚠️ Toujours sur /auth - Force redirection vers /onboarding');
            window.location.href = '/onboarding';
          }
        }, 1500);
      } else {
        console.error('❌ Résultat inscription invalide:', result);
        toast({
          title: 'Erreur',
          description: 'Réponse invalide du serveur',
          variant: 'destructive',
        });
      }
    } catch {
      // Erreur silencieuse
      console.error('🔥 Exception lors inscription:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'inscription",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation des champs
    if (!signInForm.email || !signInForm.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    console.log('🔑 Début connexion pour:', signInForm.email);

    try {
      const result = await authClient.signIn(signInForm.email, signInForm.password);
      console.log('📦 Résultat connexion:', result);

      if (result.error) {
        console.error('❌ Erreur lors connexion:', result.error);
        toast({
          title: 'Erreur de connexion',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.user) {
        console.log('✅ Connexion réussie - Appel onAuthSuccess avec isNewUser=false');
        console.log('👤 Utilisateur connecté:', result.user.id);

        // ✅ Pas de toast ici - App.tsx gérera le message de bienvenue
        onAuthSuccess(result.user, false);
      } else {
        console.error('❌ Résultat connexion invalide:', result);
        toast({
          title: 'Erreur',
          description: 'Réponse invalide du serveur',
          variant: 'destructive',
        });
      }
    } catch {
      // Erreur silencieuse
      console.error('🔥 Exception lors connexion:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la connexion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour basculer entre les modes
  const switchMode = (isSignUpMode: boolean) => {
    setIsSignUp(isSignUpMode);
    // Reset des formulaires lors du changement de mode
    setSignUpForm({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    setSignInForm({
      email: '',
      password: '',
      rememberMe: false,
    });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MyFitHero</h1>
          <p className="text-gray-600">Votre compagnon fitness personnel</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Toggle buttons */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                !isSignUp
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                isSignUp
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    value={signUpForm.email}
                    onChange={e => setSignUpForm({ ...signUpForm, email: e.target.value.trim() })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={signUpForm.username}
                    onChange={e =>
                      setSignUpForm({ ...signUpForm, username: e.target.value.trim() })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="nom_utilisateur"
                    disabled={loading}
                    minLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpForm.password}
                    onChange={e => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Au moins 6 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpForm.confirmPassword}
                    onChange={e =>
                      setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Inscription en cours...
                  </span>
                ) : (
                  'Créer un compte'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    value={signInForm.email}
                    onChange={e => setSignInForm({ ...signInForm, email: e.target.value.trim() })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInForm.password}
                    onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={signInForm.rememberMe}
                    onChange={e => setSignInForm({ ...signInForm, rememberMe: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>En vous connectant, vous acceptez nos</p>
          <p>
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Conditions d'utilisation
            </a>
            {' et '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
