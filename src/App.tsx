
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { initializeAds } from "@/services/adService";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Likes from "./pages/Likes";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Credits from "./pages/Credits";
import VideoView from "./pages/VideoView";
import Shorts from "./pages/Shorts";

const queryClient = new QueryClient();

const App = () => {
  // Initialize AdMob when the app starts
  useEffect(() => {
    const initializeCapacitorPlugins = async () => {
      try {
        console.log("Initializing Capacitor plugins...");
        await initializeAds();
        console.log("Capacitor plugins initialized successfully");
      } catch (error) {
        console.error("Error initializing Capacitor plugins:", error);
      }
    };

    initializeCapacitorPlugins();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/likes" element={<Likes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/video/:videoId" element={<VideoView />} />
              <Route path="/shorts" element={<Shorts />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
