import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({ 
  children, 
  className = '', 
  fullWidth = false 
}: PageContainerProps) {
  return (
    <main className={`px-4 sm:px-6 py-6 ${className}`}>
      <div className={fullWidth ? 'w-full' : 'container mx-auto'}>
        {children}
      </div>
    </main>
  );
}

export default PageContainer;