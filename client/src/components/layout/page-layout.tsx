import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  fullWidth = false,
  className = '',
}: PageLayoutProps) {
  return (
    <>
      <Helmet>
        {title && <title>{title} | TradeHybrid</title>}
        {description && <meta name="description" content={description} />}
      </Helmet>
      <div className={`min-h-screen w-full ${fullWidth ? '' : 'container mx-auto px-4 py-8'} ${className}`}>
        {children}
      </div>
    </>
  );
}

export default PageLayout;