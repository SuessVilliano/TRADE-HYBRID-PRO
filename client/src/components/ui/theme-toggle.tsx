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
    
    // Update all container elements with the theme
    // Find all elements with the class min-h-screen (which are typically main app containers)
    const containers = document.querySelectorAll('.min-h-screen');
    containers.forEach(container => {
      if (theme === 'dark') {
        // Apply dark theme to each container
        container.classList.remove('bg-white', 'bg-slate-50', 'bg-slate-100', 'text-slate-900');
        container.classList.add('bg-slate-900', 'text-white');
        
        // Set dark background color directly on the element
        (container as HTMLElement).style.backgroundColor = '#13111C'; // Dark purple background
        
        // Add gradient
        (container as HTMLElement).style.backgroundImage = 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 65%)';
      } else {
        // Apply light theme to each container
        container.classList.remove('bg-slate-900', 'bg-slate-800', 'text-white');
        container.classList.add('bg-white', 'text-slate-900');
        
        // Set light background color directly on the element
        (container as HTMLElement).style.backgroundColor = '#F5F3FF'; // Light purple background
        
        // Add gradient
        (container as HTMLElement).style.backgroundImage = 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 65%)';
      }
    });
    
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
    
    // Update all text colors for headers, paragraphs and other text elements
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      if (theme === 'light') {
        heading.classList.remove('text-white', 'text-slate-100', 'text-slate-200');
        heading.classList.add('text-slate-900');
      } else {
        heading.classList.remove('text-slate-900', 'text-slate-800');
        heading.classList.add('text-white');
      }
    });
    
    const paragraphs = document.querySelectorAll('p, span, div:not([class*="bg-"])');
    paragraphs.forEach(p => {
      // Only update if the element doesn't have specific text color classes
      if (!p.className.includes('text-') && !p.className.includes('bg-')) {
        if (theme === 'light') {
          p.classList.add('text-slate-800');
        } else {
          p.classList.add('text-slate-200');
        }
      }
    });
    
    // Update all background classes throughout the application
    // First, handle explicit bg-slate classes
    const bgSlateElements = document.querySelectorAll('[class*="bg-slate-"]');
    bgSlateElements.forEach(element => {
      if (theme === 'light') {
        // Replace all dark slate backgrounds with light ones
        element.classList.remove('bg-slate-900', 'bg-slate-800', 'bg-slate-700', 'bg-slate-600');
        
        // Look for specific dark classes and replace with appropriate light equivalents
        if (element.classList.contains('bg-slate-900')) {
          element.classList.add('bg-white');
        } else if (element.classList.contains('bg-slate-800')) {
          element.classList.add('bg-slate-100');
        } else if (element.classList.contains('bg-slate-700')) {
          element.classList.add('bg-slate-200');
        } else if (element.classList.contains('bg-slate-600')) {
          element.classList.add('bg-slate-300');
        }
        
        // Also set the background color directly to ensure it takes effect
        (element as HTMLElement).style.backgroundColor = '';
      } else {
        // Restore dark theme backgrounds
        element.classList.remove('bg-white', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300');
        
        // Map light classes back to dark equivalents
        if (element.classList.contains('bg-white')) {
          element.classList.add('bg-slate-900');
        } else if (element.classList.contains('bg-slate-100')) {
          element.classList.add('bg-slate-800');
        } else if (element.classList.contains('bg-slate-200')) {
          element.classList.add('bg-slate-700');
        } else if (element.classList.contains('bg-slate-300')) {
          element.classList.add('bg-slate-600');
        }
        
        // Also set the background color directly for dark theme
        (element as HTMLElement).style.backgroundColor = '';
      }
    });
    
    // Handle other explicit background colors
    const bgElements = document.querySelectorAll('[class*="bg-"]');
    bgElements.forEach(element => {
      // Skip elements we've already processed
      if (element.classList.contains('bg-slate-900') || element.classList.contains('bg-white')) {
        return;
      }
      
      // For cards and panels that might have their own backgrounds
      if (element.classList.contains('card') || 
          element.classList.contains('panel') || 
          element.classList.contains('sidebar') ||
          element.classList.contains('popup') ||
          element.classList.contains('dialog')) {
        if (theme === 'light') {
          element.classList.remove('bg-slate-800', 'bg-slate-900', 'bg-gray-800', 'bg-gray-900');
          element.classList.add('bg-white');
          (element as HTMLElement).style.color = '#1e293b'; // Dark text
        } else {
          element.classList.remove('bg-white');
          element.classList.add('bg-slate-800');
          (element as HTMLElement).style.color = '#f8fafc'; // Light text
        }
      }
    });
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