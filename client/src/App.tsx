
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Canvas } from '@react-three/fiber';
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";
import TradingSpace from "./pages/trading-space";
import NotFound from "./pages/not-found";
import Scene from "./components/game/Scene";
import GamePage from "./pages/game";
import { Suspense } from "react";
import { GuideTourProvider, GuideTourLauncher } from "./components/ui/contextual-tooltip";

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
    path: "*",
    element: <NotFound />,
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GuideTourProvider>
        <div className="app-container">
          <RouterProvider router={router} />
          <Toaster position="top-right" />
          <GuideTourLauncher title="Welcome to Trade Hybrid! Take a tour" />
        </div>
      </GuideTourProvider>
    </QueryClientProvider>
  );
}
