import React from 'react';
import { EmbeddedWebBrowser } from '@/components/ui/embedded-web-browser';
import { PopupContainer } from '@/components/ui/popup-container';

export default function EmbeddedAppPage() {
  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
      <PopupContainer padding>
        <EmbeddedWebBrowser 
          initialUrl="https://app.tradehybrid.club" 
          title="App"
          height="calc(100vh - 180px)"
        />
      </PopupContainer>
    </div>
  );
}