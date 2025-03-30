import React from 'react';
import { Button } from '../ui/button';

interface EducationalTooltipProps {
  title: string;
  content: string;
  onClose: () => void;
}

const EducationalTooltip: React.FC<EducationalTooltipProps> = ({ title, content, onClose }) => {
  return (
    <div className="bg-slate-800 border border-blue-500/30 rounded-md p-4 mb-4 relative">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClose}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Button>
      
      <h3 className="text-blue-300 font-semibold mb-1">{title}</h3>
      <p className="text-slate-300 text-sm">{content}</p>
    </div>
  );
};

export default EducationalTooltip;