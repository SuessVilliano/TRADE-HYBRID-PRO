import React from 'react';
import { MicroLearningTip } from './micro-learning-tip';
import { useMicroLearning } from '../../lib/context/MicroLearningProvider';

/**
 * This component renders the micro-learning tips
 * It should be added once at the top level of the application
 */
export const MicroLearningTipRenderer: React.FC = () => {
  const { 
    currentTip, 
    isVisible, 
    position,
    hideTip, 
    nextTip, 
    previousTip,
    likeTip,
    dislikeTip,
    saveForLater,
    likedTips,
    dislikedTips
  } = useMicroLearning();

  if (!isVisible || !currentTip) return null;

  const hasNext = true; // Since we're cycling through tips, there's always a next
  const hasPrevious = true; // Same for previous

  return (
    <MicroLearningTip
      tip={currentTip}
      onClose={hideTip}
      onNext={nextTip}
      onPrevious={previousTip}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onLike={likeTip}
      onDislike={dislikeTip}
      onSaveForLater={saveForLater}
      position={position}
    />
  );
};