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
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
      
      // Make additional styling changes for dark mode
      document.body.style.backgroundColor = '#0f172a'; // Match bg-slate-900
      document.body.style.color = '#f8fafc'; // Match text-white
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
      
      // Make additional styling changes for light mode
      document.body.style.backgroundColor = '#f8fafc'; // Light background
      document.body.style.color = '#1e293b'; // Dark text
    }
    
    // Also update app container styles for more complete theme switching
    const appContainer = document.getElementById('root');
    if (appContainer) {
      if (theme === 'dark') {
        appContainer.classList.add('bg-slate-900', 'text-white');
        appContainer.classList.remove('bg-white', 'text-slate-900');
      } else {
        appContainer.classList.remove('bg-slate-900', 'text-white');
        appContainer.classList.add('bg-white', 'text-slate-900');
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