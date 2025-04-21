import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            {icon && (
              <div className="mr-3 text-slate-700 dark:text-slate-300">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {children && (
            <div className="flex items-center space-x-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;