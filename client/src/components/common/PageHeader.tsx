import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgImageClass?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  bgImageClass = 'bg-gradient-to-r from-blue-600 to-indigo-700'
}) => {
  return (
    <div className={`w-full py-12 ${bgImageClass}`}>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-lg text-white opacity-90">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;