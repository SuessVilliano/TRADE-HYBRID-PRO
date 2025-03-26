import React, { useState, useEffect } from 'react';
import { Interface } from '../ui/interface';
import { Map, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

interface SceneProps {
  showStats?: boolean;
}

export default function Scene({ showStats = false }: SceneProps) {
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode is enabled on mount
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Function to toggle map for mobile users
  const toggleMobileMap = () => {
    setShowMobileMap(!showMobileMap);
  };

  // Update isDarkMode when the theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white p-4 transition-colors duration-300">
        <div className="text-center max-w-lg mx-auto">
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Welcome to Trade Hybrid</h1>
          <p className="mb-6">
            The 3D environment is currently being updated. In the meantime, you can explore the map by pressing the M key or using the map button below.
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Controls:</h2>
            <ul className="text-left list-disc pl-6 space-y-1">
              <li>WASD or Arrow Keys: Move character</li>
              <li>Space: Jump</li>
              <li>Double-tap movement key: Sprint</li>
              <li>Right mouse button: Rotate camera</li>
              <li>E: Interact</li>
              <li>M: Toggle map</li>
            </ul>
          </div>
          
          {/* Mobile map button */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={toggleMobileMap}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Map size={18} />
              {showMobileMap ? "Close Map" : "Open Trading Map"}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            On mobile? Use the map button above to view all trading locations.
          </div>
        </div>
      </div>
      
      {/* Interface overlay that includes the map toggle functionality */}
      <Interface 
        showMapOverride={showMobileMap} 
        onToggleMap={toggleMobileMap} 
      />
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white h-12 w-12 rounded-full"
            onClick={toggleMobileMap}
          >
            <Map size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}