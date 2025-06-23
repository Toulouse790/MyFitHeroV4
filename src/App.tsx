import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Import des pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Nutrition from "./pages/Nutrition";
import Sleep from "./pages/Sleep";
import Hydration from "./pages/Hydration";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Import des composants
import BottomNav from "./components/BottomNav";

// Import du store
import { useAppStore } from "./stores/useAppStore";

const queryClient = new QueryClient();

const App = () => {
  // Initialiser le store au démarrage
  const initializeStore = useAppStore(state => state.getTodayHydration);
  
  useEffect(() => {
    console.log('🚀 App démarrée avec store Zustand');
    // Le store se charge automatiquement grâce à persist
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            {/* Contenu principal avec padding bottom pour la nav */}
            <main className="pb-20">
              <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Index />} />
                
                {/* Pages principales avec navigation */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workout" element={<Workout />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/sleep" element={<Sleep />} />
                <Route path="/hydration" element={<Hydration />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Page 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            {/* Navigation bottom fixe */}
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
