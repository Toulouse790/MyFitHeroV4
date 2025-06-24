import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPagesProps {
  onAuthSuccess: (user: any) => void;
}

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface SignInForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

const AuthPages: React.FC<AuthPagesProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // États des formulaires
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [signInForm, setSignInForm] = useState<SignInForm>({
    username: '',
    password: '',
    rememberMe: false
  });

  // Validation email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validation mot de passe
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Validation pseudo
  const isValidUsername = (username: string) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  // Gestion inscription
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validations côté client
      if (!isValidEmail(signUpForm.email)) {
        throw new Error('Adresse email invalide');
      }

      if (!isValidUsername(signUpForm.username)) {
        throw new Error('Le pseudo doit contenir au moins 3 caractères (lettres, chiffres, underscore uniquement)');
      }

      if (!isValidPassword(signUpForm.password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      if (signUpForm.password !== signUpForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      // Vérifier si le pseudo est disponible
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', signUpForm.username)
        .single();

      if (existingUser) {
        throw new Error('Ce pseudo est déjà utilisé');
      }

      // Créer le compte Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpForm.email,
        password: signUpForm.password,
        options: {
          data: {
            username: signUpForm.username,
            full_name: signUpForm.username // Temporaire, sera mis à jour dans le questionnaire
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username: signUpForm.username,
            full_name: signUpForm.username,
            notifications_enabled: true
          });

        if (profileError) throw profileError;

        setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre inscription.');
        
        // Auto-connexion après inscription (si email confirmé)
        if (authData.session) {
          onAuthSuccess(authData.user);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion connexion SIMPLIFIÉE
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // MÉTHODE SIMPLIFIÉE : connexion directe avec email/mot de passe
      // Pour l'instant, on demande l'email au lieu du pseudo
      
      // Connexion avec email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: signInForm.username, // Temporairement, on utilise l'email ici
        password: signInForm.password
      });

      if (authError) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Gestion "Se souvenir de moi"
      if (signInForm.rememberMe) {
        localStorage.setItem('myfitheroe_remember_me', 'true');
        localStorage.setItem('myfitheroe_username', signInForm.username);
      } else {
        localStorage.removeItem('myfitheroe_remember_me');
        localStorage.removeItem('myfitheroe_username');
      }

      onAuthSuccess(authData.user);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données "Se souvenir de moi" au chargement
  React.useEffect(() => {
    const rememberMe = localStorage.getItem('myfitheroe_remember_me');
    const savedUsername = localStorage.getItem('myfitheroe_username');
    
    if (rememberMe === 'true' && savedUsername) {
      setSignInForm(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">MyFitHero</h1>
          <p className="text-blue-100">Votre compagnon fitness intelligent</p>
        </div>

        <div className="p-8">
          {/* Onglets */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setCurrentView('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                currentView === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                currentView === 'signup'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* FORMULAIRE DE CONNEXION */}
          {currentView === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email pour connexion (temporaire) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (temporaire - sera pseudo plus tard)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={signInForm.username}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Se souvenir de moi */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signInForm.rememberMe}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Se souvenir de moi</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORMULAIRE D'INSCRIPTION */}
          {currentView === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Pseudo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pseudo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={signUpForm.username}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Choisissez un pseudo"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 3 caractères, lettres et chiffres uniquement
                </p>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Choisissez un mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>

              {/* Confirmation mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>
              </div>

              {/* Bouton inscription */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              En vous inscrivant, vous acceptez nos{' '}
              <button className="text-blue-600 hover:text-blue-800">
                conditions d'utilisation
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
