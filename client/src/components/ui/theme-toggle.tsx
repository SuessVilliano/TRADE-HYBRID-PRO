import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../lib/hooks/useTheme';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  showDropdown?: boolean;
}

export function ThemeToggle({ 
  className = '', 
  variant = 'outline',
  size = 'icon',
  showLabel = false,
  showDropdown = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only show the toggle component after mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  // Enhanced toggle with dropdown menu
  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`${className} focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
            title="Change theme"
            aria-label="Change theme"
          >
            {resolvedTheme === 'light' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            {showLabel && (
              <span className="ml-2">
                {theme === 'system' ? 'System' : (theme === 'light' ? 'Light' : 'Dark')}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" forceMount>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Simple toggle button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      title={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {showLabel && (
        <span className="ml-2">
          {resolvedTheme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
      {!showLabel && <span className="sr-only">Toggle theme</span>}
    </Button>
  );
}

export default ThemeToggle;