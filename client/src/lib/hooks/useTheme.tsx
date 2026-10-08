import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: 'light' | 'dark'; // The actual theme being applied after system preference resolution
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const CLUB_THEME_VERSION = '3-light-default';
const CLUB_THEME_VERSION_KEY = 'trade-hybrid-theme-version';
const CLUB_THEME_KEY = 'trade-hybrid-club-theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

// Helper function to get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const version = localStorage.getItem(CLUB_THEME_VERSION_KEY);
    const savedTheme = localStorage.getItem(CLUB_THEME_KEY) as ThemeType | null;

    // The legacy app stored its preference under "theme", which could force
    // old dark-mode state back on after the light-default migration. Ignore
    // that legacy key and migrate every member once to the Club-specific key.
    if (version !== CLUB_THEME_VERSION) {
      localStorage.removeItem('theme');
      return defaultTheme;
    }
    return savedTheme || defaultTheme;
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    theme === 'system' ? getSystemTheme() : (theme as 'light' | 'dark')
  );

  // Watch for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme whenever resolvedTheme changes
  useEffect(() => {
    // Apply theme class to document element
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current resolved theme class
    root.classList.add(resolvedTheme);
    
  }, [resolvedTheme]);
  
  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CLUB_THEME_KEY, theme);
    localStorage.setItem(CLUB_THEME_VERSION_KEY, CLUB_THEME_VERSION);
  }, [theme]);

  // Update resolvedTheme when theme changes
  useEffect(() => {
    if (theme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      // Toggle between light and dark only (ignoring system)
      if (prevTheme === 'light' || (prevTheme === 'system' && resolvedTheme === 'light')) {
        return 'dark';
      } else {
        return 'light';
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;