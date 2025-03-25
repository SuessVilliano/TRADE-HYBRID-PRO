import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";
import TradingSpace from "./pages/trading-space";
import NotFound from "./pages/not-found";
import { useAudio } from "./lib/stores/useAudio";
import { WebApp } from "./components/ui/web-app";
import "@fontsource/inter";

// Main App component
function App() {
  // Setup audio for the application
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Create audio elements
        const backgroundMusic = new Audio("/sounds/background.mp3");
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        
        const hitSound = new Audio("/sounds/hit.mp3");
        const successSound = new Audio("/sounds/success.mp3");
        
        // Store in Zustand
        useAudio.getState().setBackgroundMusic(backgroundMusic);
        useAudio.getState().setHitSound(hitSound);
        useAudio.getState().setSuccessSound(successSound);
        
        console.log("Audio setup complete");
      } catch (error) {
        console.error("Failed to setup audio:", error);
      }
    };
    
    setupAudio();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trading-space" element={<TradingSpace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
      <WebApp />
    </QueryClientProvider>
  );
}

export default App;
