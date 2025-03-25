import { RouterProvider, createBrowserRouter } from "react-router-dom";
import * as React from "react";
// Assuming Game component is defined elsewhere in the project
const Game = () => <div>Game Component Placeholder</div>; // Replace with actual Game component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Game />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default function App() {
  return <RouterProvider router={router} />;
}