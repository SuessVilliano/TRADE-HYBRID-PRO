import React, { useState } from 'react';
import { MainSidebar, MobileSidebar, MobileSidebarToggle } from './main-sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function MainLayout({ children, hideNav = false }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {!hideNav && (
          <>
            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden lg:block h-full">
              <MainSidebar />
            </div>
          
            {/* Mobile sidebar */}
            <MobileSidebar 
              isOpen={mobileSidebarOpen} 
              onClose={() => setMobileSidebarOpen(false)} 
            />
          </>
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hideNav && (
            <header className="bg-background border-b border-border p-4 flex justify-between items-center lg:hidden">
              <div className="flex items-center">
                <MobileSidebarToggle onClick={() => setMobileSidebarOpen(true)} />
                <span className="ml-2 font-semibold">TradeHybrid</span>
              </div>
            </header>
          )}
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}