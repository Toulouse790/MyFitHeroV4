import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, AppleIcon, Moon, MessageSquare, BarChart3, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  console.log('🏠 Index page rendered');
  const navigate = useNavigate();
  
  // Modules avec les nouvelles classes fitness
  const modules = [
    { 
      title: "Musculation", 
      description: "Plans personnalisés par niveau et objectif", 
      bgClass: "bg-fit-energy-gradient",
      textClass: "text-white",
      buttonClass: "bg-white text-fit-energy-600 hover:bg-gray-100",
      icon: Dumbbell,
      path: "/workout",
      actionLabel: "Voir les programmes"
    },
    { 
      title: "Nutrition", 
      description: "Plans nutritionnels adaptés à vos objectifs", 
      bgClass: "bg-fit-growth-gradient",
      textClass: "text-white",
      buttonClass: "bg-white text-fit-growth-600 hover:bg-gray-100",
      icon: AppleIcon,
      path: "/nutrition",
      actionLabel: "Voir les plans alimentaires"
    },
    { 
      title: "Sommeil", 
      description: "Suivi et amélioration de la qualité du sommeil", 
      bgClass: "bg-fit-recovery-gradient",
      textClass: "text-white",
      buttonClass: "bg-white text-fit-recovery-600 hover:bg-gray-100",
      icon: Moon,
      path: "/sleep",
      actionLabel: "Analyser mon sommeil" 
    },
    { 
      title: "Coach IA", 
      description: "Conseils personnalisés par intelligence artificielle", 
      bgClass: "bg-gradient-primary",
      textClass: "text-white",
      buttonClass: "bg-white text-blue-600 hover:bg-gray-100",
      icon: MessageSquare,
      path: "/coach",
      actionLabel: "Discuter avec le coach" 
    },
    { 
      title: "Tableau de bord", 
      description: "Visualisation des progrès sur tous les paramètres", 
      bgClass: "bg-fit-hydration-gradient",
      textClass: "text-white",
      buttonClass: "bg-white text-fit-hydration-600 hover:bg-gray-100",
      icon: BarChart3,
      path: "/dashboard",
      actionLabel: "Voir mes statistiques" 
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="space-y-12 pb-16">
          
          {/* Hero Section avec nouvelles classes */}
          <section className="relative pt-16 pb-20">
            <div className="text-center space-y-6 max-w-4xl mx-auto px-6">
              
              {/* Titre principal avec gradient */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight animate-fit-fade-in-scale">
                Bienvenue sur{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  MyFitHero
                </span>
              </h1>
              
              {/* Sous-titre */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Votre compagnon personnel pour atteindre vos objectifs de fitness et bien-être
              </p>
              
              {/* Boutons d'action avec nouvelles classes */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg font-medium rounded-xl shadow-fit-button hover:shadow-fit-card-hover transition-all duration-300 animate-fit-slide-up" 
                  asChild
                >
                  <Link to="/onboarding" className="flex items-center justify-center">
                    <span>Créer mon profil</span>
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-border hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg font-medium rounded-xl transition-all duration-300" 
                  asChild
                >
                  <Link to="/dashboard" className="flex items-center justify-center">
                    Accéder à mon espace
                  </Link>
                </Button>
              </div>
            </div>

            {/* Élément décoratif avec animation */}
            <div className="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-3xl">
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-primary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-flow"></div>
            </div>
          </section>

          {/* Section modules */}
          <section className="px-6">
            <div className="max-w-7xl mx-auto">
              
              {/* Titre section avec animation */}
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
                  <Medal className="mr-3 text-fit-motivation-500 animate-float" size={32} />
                  Modules disponibles
                </h2>
                <p className="text-lg text-muted-foreground">Découvrez tous nos outils pour votre transformation</p>
              </div>
              
              {/* Grille des modules avec nouvelles classes fitness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => (
                  <Card 
                    key={module.title}
                    className={cn(
                      "fit-stat-card group cursor-pointer transition-all duration-300 hover:scale-105 border-0 overflow-hidden",
                      module.bgClass,
                      module.textClass,
                      "animate-fit-fade-in-scale"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(module.path)}
                  >
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                          <module.icon size={24} className="animate-pulse-soft" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-current group-hover:scale-105 transition-transform">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-0">
                      <CardDescription className={cn("mb-6 leading-relaxed", module.textClass, "opacity-90")}>
                        {module.description}
                      </CardDescription>
                      
                      <Button 
                        className={cn(
                          "w-full font-medium rounded-xl transition-all duration-300 shadow-fit-button hover:shadow-fit-card-hover",
                          module.buttonClass
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(module.path);
                        }}
                      >
                        <span>{module.actionLabel}</span>
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Section test des nouvelles animations */}
          <section className="px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-6">Test des animations fitness</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="w-16 h-16 bg-fit-energy-500 rounded-full animate-fit-heartbeat"></div>
                <div className="w-16 h-16 bg-fit-growth-500 rounded-full animate-fit-pulse-strong"></div>
                <div className="w-16 h-16 bg-fit-hydration-500 rounded-full animate-float"></div>
                <div className="w-16 h-16 bg-fit-recovery-500 rounded-full animate-fit-achievement-glow"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Nouvelles couleurs et animations fitness en action !
              </p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
