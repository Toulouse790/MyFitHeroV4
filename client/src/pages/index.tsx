import React, { useState } from 'react';

const IndexPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            MyFitHero V4
          </h1>
          <p className="text-blue-100 text-lg">
            Votre compagnon fitness intelligent
          </p>
        </div>

        {/* Card d'authentification */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Toggle Login/Register */}
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire */}
          <form className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            )}
            
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          {/* Liens supplémentaires */}
          <div className="mt-6 text-center space-y-2">
            {isLogin && (
              <a href="#" className="block text-white/80 hover:text-white text-sm">
                Mot de passe oublié ?
              </a>
            )}
            
            <div className="text-white/60 text-xs">
              Version 4.0 - Alimenté par l'IA
            </div>
          </div>
        </div>

        {/* Features teaser */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/80">
            <div className="text-2xl mb-1">💪</div>
            <div className="text-xs">Workouts</div>
          </div>
          <div className="text-white/80">
            <div className="text-2xl mb-1">🥗</div>
            <div className="text-xs">Nutrition</div>
          </div>
          <div className="text-white/80">
            <div className="text-2xl mb-1">😴</div>
            <div className="text-xs">Sommeil</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
