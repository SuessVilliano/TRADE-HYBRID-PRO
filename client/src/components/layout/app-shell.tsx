import React from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  className?: string;
  children: React.ReactNode;
}

export function AppShell({ className, children }: AppShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {children}
    </div>
  );
}

interface AppShellHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function AppShellHeader({ className, children }: AppShellHeaderProps) {
  return (
    <header className={cn("bg-background border-b sticky top-0 z-10", className)}>
      {children}
    </header>
  );
}

interface AppShellMainProps {
  className?: string;
  children: React.ReactNode;
}

export function AppShellMain({ className, children }: AppShellMainProps) {
  return (
    <main className={cn("flex-grow p-4", className)}>
      {children}
    </main>
  );
}

interface AppShellFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function AppShellFooter({ className, children }: AppShellFooterProps) {
  return (
    <footer className={cn("bg-background border-t", className)}>
      {children}
    </footer>
  );
}