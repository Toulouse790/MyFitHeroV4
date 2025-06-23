import React from 'react';
import { ArrowRight, Dumbbell, Apple, Moon, BarChart3, Medal } from 'lucide-react';

const Index = () => {
  const modules = [
    {
      title: "Musculation",
      description: "Plans personnalisés par niveau et objectif",
      bgClass: "bg-gradient-energy",
      icon: Dumbbell,
    },
    {
      title: "Nutrition", 
      description: "Plans nutritionnels adaptés à vos objectifs",
      bgClass: "bg-gradient-growth",
      icon: Apple,
    },
    {
      title: "Sommeil",
      description: "Suivi et amélioration de la qualité du sommeil", 
      bgClass: "bg-gradient-hydration",
      icon: Moon,
    },
    {
      title: "Tableau de bord",
      description: "Visualisation des progrès sur tous les paramètres",
      bgClass: "bg-gradient-motivation", 
      icon: BarChart3,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            Bienvenue sur{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MyFitHero
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre compagnon personnel pour atteindre vos objectifs de fitness et bien-être
          </p>
          
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl animate-slide-up">
            Commencer maintenant
            <ArrowRight className="inline-block ml-2" size={20} />
          </button>
        </section>

        {/* Section Modules */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <Medal className="mr-3 text-fitness-motivation animate-bounce-soft" size={32} />
              Modules disponibles
            </h2>
            <p className="text-lg text-gray-600">Découvrez tous nos outils pour votre transformation</p>
          </div>

          {/* Grille des modules avec nouvelles classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className={`${module.bgClass} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <div className="bg-white/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-heartbeat">
                    <module.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{module.title}</h3>
                  <p className="text-white/90 mb-4 text-sm">{module.description}</p>
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full">
                    Explorer
                    <ArrowRight className="inline-block ml-1" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Test des animations */}
        <section className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Test des animations fitness</h3>
          <div className="flex justify-center gap-4">
            <div className="w-12 h-12 bg-fitness-energy rounded-full animate-heartbeat"></div>
            <div className="w-12 h-12 bg-fitness-growth rounded-full animate-pulse-ring"></div>
            <div className="w-12 h-12 bg-fitness-hydration rounded-full animate-bounce-soft"></div>
            <div className="w-12 h-12 bg-fitness-motivation rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            🎉 Nouvelles couleurs et animations fitness en action !
          </p>
        </section>
      </div>
    </div>
  );
};

export default Index;
