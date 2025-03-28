import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { Button } from './button';
import { PopupContainer } from './popup-container';

export interface TradingTip {
  id: string;
  title: string;
  content: string;
  category: 'basic' | 'technical' | 'fundamental' | 'psychology' | 'risk';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface MicroLearningTipProps {
  tip?: TradingTip;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onLike?: (tipId: string) => void;
  onDislike?: (tipId: string) => void;
  onSaveForLater?: (tipId: string) => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center';
}

export const MicroLearningTip: React.FC<MicroLearningTipProps> = ({
  tip,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onLike,
  onDislike,
  onSaveForLater,
  position = 'bottom-right'
}) => {
  const [animation, setAnimation] = useState('fade-in');
  
  useEffect(() => {
    // Reset animation when tip changes
    setAnimation('fade-in');
  }, [tip?.id]);

  const handleClose = () => {
    setAnimation('fade-out');
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the CSS animation duration
  };

  if (!tip) return null;

  // Set position classes based on the position prop
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-500 text-white';
      case 'technical': return 'bg-purple-500 text-white';
      case 'fundamental': return 'bg-green-500 text-white';
      case 'psychology': return 'bg-yellow-500 text-black';
      case 'risk': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-200 text-green-800';
      case 'intermediate': return 'bg-yellow-200 text-yellow-800';
      case 'advanced': return 'bg-red-200 text-red-800';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full ${animation}`}
      style={{
        animation: animation === 'fade-in' 
          ? 'fadeIn 0.3s ease-in-out' 
          : 'fadeOut 0.3s ease-in-out'
      }}
    >
      <PopupContainer className="overflow-hidden shadow-xl" padding>
        <div className="relative">
          {/* Close button */}
          <button 
            className="absolute top-0 right-0 p-2 text-white bg-red-500 hover:bg-red-600 transition-colors rounded-bl-md"
            onClick={handleClose}
            aria-label="Close tip"
          >
            <X size={18} />
          </button>

          {/* Header with category and difficulty */}
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(tip.category)}`}>
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(tip.difficulty)}`}>
              {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
          
          {/* Content */}
          <div className="text-sm text-slate-300 mb-4">
            {tip.content}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tip.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between items-center mb-2">
              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPrevious && onPrevious()}
                  disabled={!hasPrevious}
                  className="p-1 h-auto"
                  aria-label="Previous tip"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNext && onNext()}
                  disabled={!hasNext}
                  className="p-1 h-auto"
                  aria-label="Next tip"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
              
              {/* Feedback and save */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike && onLike(tip.id)}
                  className="p-1 h-auto text-green-500 hover:text-green-400"
                  aria-label="Like tip"
                >
                  <ThumbsUp size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDislike && onDislike(tip.id)}
                  className="p-1 h-auto text-red-500 hover:text-red-400"
                  aria-label="Dislike tip"
                >
                  <ThumbsDown size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSaveForLater && onSaveForLater(tip.id)}
                  className="p-1 h-auto text-blue-500 hover:text-blue-400"
                  aria-label="Save tip for later"
                >
                  <BookOpen size={16} />
                </Button>
              </div>
            </div>
            
            {/* Bottom close button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClose}
              className="w-full mt-1"
              aria-label="Close tip"
            >
              <X size={14} className="mr-1" /> Close Tip
            </Button>
          </div>
        </div>
      </PopupContainer>
    </div>
  );
};