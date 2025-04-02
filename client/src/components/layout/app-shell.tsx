import React, { ReactNode } from 'react';
import { BottomNav } from '../ui/bottom-nav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pt-16">{children}</main>
      <BottomNav />
    </div>
  );
}