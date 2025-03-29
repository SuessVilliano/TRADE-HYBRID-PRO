import React from 'react';

interface DiscordEmbedProps {
  serverId?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function DiscordEmbed({ 
  serverId = '1097524401769037947', 
  theme = 'dark',
  className = ''
}: DiscordEmbedProps) {
  return (
    <div className={`w-full h-full flex justify-center items-center bg-black ${className}`}>
      <iframe 
        src={`https://discord.com/widget?id=${serverId}&theme=${theme}`}
        className="w-full h-full border-none"
        allowTransparency={true}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      />
    </div>
  );
}