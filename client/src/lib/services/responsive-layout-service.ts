import { useState, useEffect } from 'react';

// Breakpoint definitions for responsive design
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Device type definitions
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Layout orientation
export type Orientation = 'portrait' | 'landscape';

// ViewportInfo interface
export interface ViewportInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: keyof typeof BREAKPOINTS | null;
}

// Default viewport info
const defaultViewportInfo: ViewportInfo = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
  deviceType: 'desktop',
  orientation: 'landscape',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  breakpoint: 'lg'
};

/**
 * Get the current device type based on viewport width
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.sm) {
    return 'mobile';
  } else if (width < BREAKPOINTS.lg) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Get the current orientation based on width and height
 */
export function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Get the current breakpoint based on viewport width
 */
export function getBreakpoint(width: number): keyof typeof BREAKPOINTS | null {
  const breakpointEntries = Object.entries(BREAKPOINTS);
  
  // Sort breakpoints from largest to smallest
  const sortedBreakpoints = breakpointEntries.sort((a, b) => b[1] - a[1]);
  
  // Find the first breakpoint that the width is greater than or equal to
  for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
    const [name, size] = sortedBreakpoints[i];
    if (width >= size) {
      return name as keyof typeof BREAKPOINTS;
    }
  }
  
  return null;
}

/**
 * Get the current viewport information
 */
export function getViewportInfo(): ViewportInfo {
  if (typeof window === 'undefined') {
    return defaultViewportInfo;
  }
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceType = getDeviceType(width);
  const orientation = getOrientation(width, height);
  const breakpoint = getBreakpoint(width);
  
  return {
    width,
    height,
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    breakpoint
  };
}

/**
 * Custom hook for using viewport information in components
 * Re-renders when viewport changes
 */
export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(
    typeof window !== 'undefined' ? getViewportInfo() : defaultViewportInfo
  );
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleResize = () => {
      setViewport(getViewportInfo());
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call once to set the initial value
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return viewport;
}

/**
 * Service for managing responsive layouts and mobile optimizations
 */
class ResponsiveLayoutService {
  private mobileNavOpen: boolean = false;
  private listeners: Array<(isOpen: boolean) => void> = [];
  
  // Toggle mobile navigation
  public toggleMobileNav(force?: boolean): boolean {
    this.mobileNavOpen = force !== undefined ? force : !this.mobileNavOpen;
    this.notifyListeners();
    return this.mobileNavOpen;
  }
  
  // Get the current mobile navigation state
  public isMobileNavOpen(): boolean {
    return this.mobileNavOpen;
  }
  
  // Add a listener for mobile navigation changes
  public addListener(listener: (isOpen: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners of a change
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.mobileNavOpen));
  }
  
  // Get layout config based on device type
  public getLayoutConfig(deviceType: DeviceType): {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    showMobileNav: boolean;
    dashboardColumns: number;
    chartHeight: number;
    maxWidgets: number;
  } {
    switch (deviceType) {
      case 'mobile':
        return {
          sidebarCollapsed: true,
          compactMode: true,
          showMobileNav: true,
          dashboardColumns: 1,
          chartHeight: 300,
          maxWidgets: 4
        };
      case 'tablet':
        return {
          sidebarCollapsed: true,
          compactMode: false,
          showMobileNav: false,
          dashboardColumns: 2,
          chartHeight: 400,
          maxWidgets: 6
        };
      case 'desktop':
      default:
        return {
          sidebarCollapsed: false,
          compactMode: false,
          showMobileNav: false,
          dashboardColumns: 3,
          chartHeight: 500,
          maxWidgets: 12
        };
    }
  }
  
  // Get mobile-optimized URL for TradingView charts
  public getTradingViewMobileUrl(symbol: string, interval: string = '1D'): string {
    return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}&interval=${interval}&mobile=1`;
  }
  
  // Generate mobile-friendly card styling
  public getMobileCardStyle(): React.CSSProperties {
    return {
      padding: '12px',
      margin: '8px 0',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
  }
  
  // Generate mobile-friendly font sizes
  public getMobileFontSizes(): {
    title: string;
    subtitle: string;
    body: string;
    small: string;
  } {
    return {
      title: '1.25rem',
      subtitle: '1rem',
      body: '0.875rem',
      small: '0.75rem'
    };
  }
  
  // Check if the device supports touch events
  public isTouchDevice(): boolean {
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }
  
  // Get appropriate layout padding for different device types
  public getLayoutPadding(deviceType: DeviceType): string {
    switch (deviceType) {
      case 'mobile':
        return '8px';
      case 'tablet':
        return '16px';
      case 'desktop':
      default:
        return '24px';
    }
  }
  
  // Optimize a data table for mobile viewing by limiting columns
  public getOptimizedTableColumns(allColumns: string[], deviceType: DeviceType): string[] {
    switch (deviceType) {
      case 'mobile':
        // Show only the most important 2-3 columns on mobile
        return allColumns.slice(0, 3);
      case 'tablet':
        // Show more columns on tablet
        return allColumns.slice(0, 5);
      case 'desktop':
      default:
        // Show all columns on desktop
        return allColumns;
    }
  }
}

export const responsiveLayoutService = new ResponsiveLayoutService();
export default responsiveLayoutService;