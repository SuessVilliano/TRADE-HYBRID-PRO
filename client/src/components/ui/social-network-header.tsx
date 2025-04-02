import React from 'react';
import { DesktopHeader } from './desktop-header';
import { MessageSquare } from 'lucide-react';

interface SocialNetworkHeaderProps {
  className?: string;
}

export function SocialNetworkHeader({ className }: SocialNetworkHeaderProps) {
  return (
    <div className={`${className || ''}`}>
      <DesktopHeader />
      <div className="bg-background border-b px-4 py-3 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
        <h1 className="text-xl font-semibold">Social Network</h1>
      </div>
    </div>
  );
}

export default SocialNetworkHeader;