import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './button';
import { useUserStore } from '@/lib/stores/useUserStore';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { preferences, updatePreferences } = useUserStore();
  const [theme, setTheme] = useState<'light' | 'dark'>(preferences.theme || 'dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('th-theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      // Ensure UserStore is updated with current theme
      if (savedTheme !== preferences.theme) {
        updatePreferences({ theme: savedTheme });
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = prefersDark ? 'dark' : 'light';
      setTheme(newTheme);
      updatePreferences({ theme: newTheme });
    }
  }, []);

  // Update theme in localStorage and apply it to document
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('th-theme', theme);
    updatePreferences({ theme });
    
    // Apply theme to document with cyberpunk colors
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
      
      // Cyberpunk dark theme - dark purple background with neon accents
      document.body.style.backgroundColor = '#13111C'; // Dark purple background
      document.body.style.color = '#f8fafc'; // Light text
      
      // Add cyberpunk CSS variables
      document.documentElement.style.setProperty('--primary-color', '#9333EA'); // Purple
      document.documentElement.style.setProperty('--secondary-color', '#06B6D4'); // Aqua blue
      document.documentElement.style.setProperty('--accent-color', '#f43f5e'); // Neon pink
      document.documentElement.style.setProperty('--background-color', '#13111C'); // Dark purple
      document.documentElement.style.setProperty('--text-color', '#f8fafc'); // Light text
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      
      // Cyberpunk light theme - light purplish background with vivid accents
      document.body.style.backgroundColor = '#F5F3FF'; // Light purple background
      document.body.style.color = '#1e293b'; // Dark text
      
      // Add cyberpunk CSS variables for light mode
      document.documentElement.style.setProperty('--primary-color', '#7C3AED'); // Lighter purple
      document.documentElement.style.setProperty('--secondary-color', '#0891B2'); // Aqua blue (slightly darker)
      document.documentElement.style.setProperty('--accent-color', '#e11d48'); // Bright pink
      document.documentElement.style.setProperty('--background-color', '#F5F3FF'); // Light purple
      document.documentElement.style.setProperty('--text-color', '#1e293b'); // Dark text
    }
    
    // Update app container and other key elements with cyberpunk theme
    const appContainer = document.getElementById('root');
    if (appContainer) {
      if (theme === 'dark') {
        // Remove light mode classes
        appContainer.classList.remove('bg-white', 'text-slate-900');
        
        // Add dark cyberpunk classes
        appContainer.classList.add('text-white');
        appContainer.style.backgroundColor = '#13111C'; // Dark purple
        
        // Add subtle gradient background
        appContainer.style.backgroundImage = 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 65%)';
      } else {
        // Remove dark mode classes
        appContainer.classList.remove('text-white');
        
        // Add light cyberpunk classes
        appContainer.classList.add('text-slate-900');
        appContainer.style.backgroundColor = '#F5F3FF'; // Light purple
        
        // Add subtle gradient background
        appContainer.style.backgroundImage = 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 65%)';
      }
    }
  }, [theme, mounted, updatePreferences]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      return newTheme;
    });
  };

  if (!mounted) {
    // Prevent flash of incorrect theme
    return <div className={className} />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};