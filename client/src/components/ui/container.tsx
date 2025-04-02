import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container component that provides consistent padding and max-width constraints
 */
export const Container: React.FC<ContainerProps> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn("container mx-auto px-4 md:px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;