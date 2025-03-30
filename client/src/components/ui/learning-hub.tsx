
import React, { useState } from 'react';
import AudioPlaylistModal from './audio-playlist-modal';
import { Button } from './button';
import { Music, Podcast } from 'lucide-react';

export default function LearningHub() {
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={() => setIsPodcastOpen(true)}
          className="flex items-center gap-2"
        >
          <Podcast size={18} />
          Trading Podcast
        </Button>
        
        <Button 
          onClick={() => setIsMusicOpen(true)}
          className="flex items-center gap-2"
        >
          <Music size={18} />
          Trading Music
        </Button>
      </div>

      <AudioPlaylistModal
        isOpen={isPodcastOpen}
        onClose={() => setIsPodcastOpen(false)}
        title="Trading for Freedom Podcast"
        playlistUrl="https://wattbaa.profit-vibe.com/playlist/5/trading-for-freedom-podcast-series/embed"
      />

      <AudioPlaylistModal
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        title="Trading Music"
        playlistUrl="https://wattbaa.profit-vibe.com/playlist/4/trade-music/embed"
      />
      
      {/* Rest of learning hub content */}
    </div>
  );
}
