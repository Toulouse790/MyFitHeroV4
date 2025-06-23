import React from 'react';
import { ArrowRight, Dumbbell, Apple, Moon, BarChart3, Medal, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // 4 PILIERS PRINCIPAUX
  const mainModules = [
    {
      title: "Musculation",
      description: "Plans personnalisés par niveau et objectif",
      bgClass: "bg-gradient-energy",
      icon: Dumbbell,
      path: "/workout"
    },
    {
      title: "Nutrition", 
      description: "Plans nutritionnels adaptés à vos objectifs",
      bgClass: "bg-gradient-growth",
      icon: Apple,
      path: "/nutrition"
    },
    {
      title: "Sommeil",
      description: "Suivi et amélioration de la qualité du sommeil", 
      bgClass: "bg-gradient-hydration",
      icon: Moon,
      path: "/sleep"
    },
    {
      title: "Hydratation",
      description: "Suivi de votre consommation d'eau quotidienne",
      bgClass: "bg-gradient-motivation", 
      icon: BarChart3,
      path: "/hydration"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-16">
        
        {/* Header avec accès rapide Stats + Profile */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">MyFitHero</h1>
            <p className="text-gray-600">Votre compagnon fitness personnel</p>
          </div>
          
          {/* Boutons d'accès rapide */}
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <BarChart3 size={18} />
              <span>Stats</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              <User size={18} />
              <span>Profil</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Les{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              4 Piliers
            </span>
            {' '}du Fitness
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Maîtrisez l'entraînement, la nutrition, le sommeil et l'hydratation pour une transformation complète
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/workout')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-slide-up"
            >
              Commencer un workout
              <ArrowRight className="inline-block ml-2" size={20} />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
            >
              Voir mes statistiques
            </button>
          </div>
        </section>

        {/* Les 4 Piliers */}
        <section>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <Medal className="mr-3 text-fitness-motivation animate-bounce-soft" size={32} />
              Les 4 Piliers Essentiels
            </h3>
            <p className="text-lg text-gray-600">Chaque pilier est crucial pour votre réussite</p>
          </div>

          {/* Grille des 4 piliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainModules.map((module, index) => (
              <div
                key={module.title}
                className={`${module.bgClass} text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up group`}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => navigate(module.path)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <module.icon size={32} className="animate-pulse-soft" />
                  </div>
                  <ArrowRight size={24} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h4 className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
                  {module.title}
                </h4>
                <p className="text-white/90 leading-relaxed mb-6">
                  {module.description}
                </p>
                
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 group-hover:scale-105">
                  Explorer ce pilier
                  <ArrowRight className="inline-block ml-2" size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section motivation */}
        <section className="mt-16 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🚀 Votre transformation commence aujourd'hui</h3>
            <p className="text-gray-600 mb-6">
              Chaque petit pas compte. Commencez par un pilier et construisez progressivement vos habitudes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/workout')}
                className="bg-fitness-energy text-white px-6 py-3 rounded-xl font-medium hover:bg-fitness-energy/90 transition-colors"
              >
                🏋️ Premier workout
              </button>
              <button 
                onClick={() => navigate('/hydration')}
                className="bg-fitness-hydration text-white px-6 py-3 rounded-xl font-medium hover:bg-fitness-hydration/90 transition-colors"
              >
                💧 Boire de l'eau
              </button>
              <button 
                onClick={() => navigate('/nutrition')}
                className="bg-fitness-growth text-white px-6 py-3 rounded-xl font-medium hover:bg-fitness-growth/90 transition-colors"
              >
                🍎 Logger un repas
              </button>
            </div>
          </div>
        </section>

        {/* Footer avec accès settings */}
        <footer className="mt-16 text-center">
          <button 
            onClick={() => navigate('/profile')}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center mx-auto"
          >
            <Settings size={16} className="mr-2" />
            Paramètres et profil
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Index;
