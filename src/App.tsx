import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          {/* Contenu principal avec padding bottom pour la nav */}
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/workout" element={<div className="p-4 text-center">🏋️ Module Workout - En cours de développement</div>} />
              <Route path="/nutrition" element={<div className="p-4 text-center">🍎 Module Nutrition - En cours de développement</div>} />
             <Route path="/dashboard" element={
  <div className="p-4 text-center">
    <h2 className="text-2xl font-bold mb-4">📊 Dashboard</h2>
    <p>Fichier Dashboard.tsx en cours de création...</p>
  </div>
} />
              <Route path="/profile" element={<div className="p-4 text-center">👤 Profil - En cours de développement</div>} />
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

export default App;
