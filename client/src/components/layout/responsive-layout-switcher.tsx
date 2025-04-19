import React from 'react';
import { AppShell } from './app-shell';
import { MobileAppShell } from './mobile-app-shell';
import { useViewport } from '@/lib/services/responsive-layout-service';

interface ResponsiveLayoutSwitcherProps {
  children: React.ReactNode;
  showNav?: boolean;
  hideHeader?: boolean;
}

/**
 * Responsive Layout Switcher
 * 
 * This component automatically switches between desktop and mobile layouts
 * based on the current viewport size.
 * 
 * For mobile devices, it uses the MobileAppShell with a bottom navigation bar.
 * For tablets and desktops, it uses the regular AppShell with a sidebar.
 */
export function ResponsiveLayoutSwitcher({
  children,
  showNav = true,
  hideHeader = false
}: ResponsiveLayoutSwitcherProps) {
  const { isMobile } = useViewport();
  
  if (isMobile) {
    return (
      <MobileAppShell showNav={showNav} hideHeader={hideHeader}>
        {children}
      </MobileAppShell>
    );
  }
  
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

export default ResponsiveLayoutSwitcher;