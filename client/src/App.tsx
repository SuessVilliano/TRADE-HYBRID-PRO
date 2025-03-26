
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Canvas } from '@react-three/fiber';
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";
import TradingSpace from "./pages/trading-space";
import NotFound from "./pages/not-found";
import Scene from "./components/game/Scene";
import { Suspense } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/trading-space",
    element: (
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
