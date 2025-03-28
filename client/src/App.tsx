
import { RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Canvas } from '@react-three/fiber';
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";
import TradingSpace from "./pages/trading-space";
import NotFound from "./pages/not-found";
import Scene from "./components/game/Scene";
import GamePage from "./pages/game";
import APIDemoPage from "./pages/api-demo-page";
import NftMarketplacePage from "./pages/nft-marketplace";
import { Suspense } from "react";
import { GuideTourProvider, GuideTourLauncher } from "./components/ui/contextual-tooltip";
import { TradingTipsProvider } from "./components/ui/trading-tips-provider";
import { MicroTradingTipProvider } from "./components/ui/micro-trading-tip-provider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/trading-space",
    element: <TradingSpace />,
  },
  {
    path: "/game",
    element: <GamePage />
  },
  {
    path: "/api-demo",
    element: <APIDemoPage />
  },
  {
    path: "/nft-marketplace",
    element: <NftMarketplacePage />
  },
  {
    path: "*",
    element: <NotFound />,
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

// Root app wrapper with all providers
function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* TradingTipsProvider at the root application level */}
      <TradingTipsProvider autoShowInterval={300000}> {/* Show a tip every 5 minutes */}
        <MicroTradingTipProvider>
          <GuideTourProvider>
            <RouterProvider 
              router={router} 
              future={{
                v7_startTransition: true
              }}
            />
            <Toaster 
              position="top-right" 
              toastOptions={{
                // Adding global toast styling
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)'
                }
              }}
            />
          </GuideTourProvider>
        </MicroTradingTipProvider>
      </TradingTipsProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return <AppWithProviders />;
}
