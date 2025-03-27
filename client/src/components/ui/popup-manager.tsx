import React, { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PopupContainer } from './popup-container';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface PopupManagerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function PopupManager({
  title,
  isOpen,
  onClose,
  onMinimize,
  children,
  className,
  icon,
  fullWidth = false
}: PopupManagerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  // Handle ESC key press to close popup
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle portal mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Prevent rendering on server
  if (!isMounted || !isOpen) return null;

  // Create portal
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />
      
      <PopupContainer
        title={title}
        onClose={onClose}
        onMinimize={onMinimize}
        className={className}
        icon={icon}
        fullWidth={fullWidth}
      >
        {children}
      </PopupContainer>
    </div>,
    document.body
  );
}