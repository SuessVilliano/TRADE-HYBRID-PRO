import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { useMarketMood, MarketMood } from '@/lib/stores/useMarketMood';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Slider } from './slider';
import { Badge } from './badge';
import { Switch } from './switch';
import { Label } from './label';
import { Separator } from './separator';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Zap,
  Sunset
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmbientMusicPlayerProps {
  className?: string;
  minimized?: boolean;
}

export function AmbientMusicPlayer({ className, minimized = false }: AmbientMusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Audio store state
  const {
    musicTracks,
    currentTrackIndex,
    musicIsPlaying,
    musicVolume,
    musicMuted,
    setMusicVolume,
    toggleMusicMuted,
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack
  } = useAudio();
  
  // Market mood state
  const {
    currentMood,
    volatility,
    trend,
    ambientMusicEnabled,
    toggleAmbientMusic,
    setMood
  } = useMarketMood();
  
  // Get current track info
  const currentTrack = musicTracks[currentTrackIndex] || {
    title: 'No Track',
    artist: 'Unknown',
    category: 'trading',
    mood: 'neutral'
  };
  
  // Icon mapping for mood indicators
  const moodIcons = {
    bullish: <TrendingUp className="h-4 w-4 text-green-500" />,
    bearish: <TrendingDown className="h-4 w-4 text-red-500" />,
    volatile: <Zap className="h-4 w-4 text-yellow-500" />,
    neutral: <BarChart2 className="h-4 w-4 text-blue-500" />,
    calm: <Sunset className="h-4 w-4 text-purple-500" />
  };
  
  // Color mapping for mood badges
  const moodColors = {
    bullish: 'bg-green-500/10 text-green-500 border-green-500/20',
    bearish: 'bg-red-500/10 text-red-500 border-red-500/20',
    volatile: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    neutral: 'bg-blue-500/10 text-blue-500 border-blue-500/20', 
    calm: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };
  
  // Format descriptions for different moods
  const moodDescriptions = {
    bullish: 'Upward market trend detected',
    bearish: 'Downward market trend detected',
    volatile: 'High market volatility detected',
    neutral: 'Stable market conditions',
    calm: 'Low volatility, stable market'
  };
  
  // Toggle player expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setMusicVolume(value[0]);
  };
  
  // Handle manually changing the market mood (for testing)
  const handleChangeMood = (mood: MarketMood) => {
    setMood(mood);
  };
  
  // Effect to update title when track changes
  useEffect(() => {
    if (musicIsPlaying && currentTrack) {
      document.title = `${currentTrack.title} - ${currentTrack.artist}`;
    } else {
      document.title = 'Trade Hybrid';
    }
    
    return () => {
      document.title = 'Trade Hybrid';
    };
  }, [currentTrackIndex, musicIsPlaying, currentTrack]);
  
  // Minimized player view
  if (minimized) {
    return (
      <div className={cn("fixed bottom-20 right-4 md:bottom-6 z-30", className)}>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm border border-border p-2 shadow-md"
          onClick={toggleExpanded}
        >
          <Music className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="bg-slate-800 border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-5 w-5" />
              Ambient Trading Music
            </CardTitle>
            <CardDescription>Dynamic music that adapts to market conditions</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn("font-medium", moodColors[currentMood])}
          >
            <span className="flex items-center gap-1.5">
              {moodIcons[currentMood]}
              {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Track info */}
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg">{currentTrack.title}</h3>
          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {currentTrack.category}
            </Badge>
            {currentTrack.mood && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", moodColors[currentTrack.mood as MarketMood])}
              >
                {currentTrack.mood}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mood description */}
        <div className={cn("p-3 rounded-md border text-sm", moodColors[currentMood])}>
          {moodDescriptions[currentMood]}
          {currentMood === 'volatile' && (
            <div className="mt-1 text-xs opacity-80">
              Volatility: {volatility.toFixed(2)}%
            </div>
          )}
          {(currentMood === 'bullish' || currentMood === 'bearish') && (
            <div className="mt-1 text-xs opacity-80">
              Trend: {trend.toFixed(2)}%
            </div>
          )}
        </div>
        
        {/* Playback controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousTrack}
            disabled={!ambientMusicEnabled}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant={musicIsPlaying ? "outline" : "default"}
            size="lg"
            className="h-12 w-12 rounded-full"
            onClick={() => musicIsPlaying ? pauseMusic() : playMusic()}
            disabled={!ambientMusicEnabled}
          >
            {musicIsPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTrack}
            disabled={!ambientMusicEnabled}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMusicMuted}
            disabled={!ambientMusicEnabled}
          >
            {musicMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Slider
            value={[musicVolume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            disabled={!ambientMusicEnabled}
            className="flex-1"
          />
        </div>
        
        <Separator />
        
        {/* Ambient music toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="ambient-music" className="font-medium">Ambient Music</Label>
            <p className="text-xs text-muted-foreground">Dynamic music based on market mood</p>
          </div>
          <Switch
            id="ambient-music"
            checked={ambientMusicEnabled}
            onCheckedChange={toggleAmbientMusic}
          />
        </div>
        
        {/* Mood selector (for testing) */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs",
              currentMood === 'bullish' ? "bg-green-500/20" : ""
            )}
            onClick={() => handleChangeMood('bullish')}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Bullish
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs",
              currentMood === 'bearish' ? "bg-red-500/20" : ""
            )}
            onClick={() => handleChangeMood('bearish')}
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Bearish
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs",
              currentMood === 'neutral' ? "bg-blue-500/20" : ""
            )}
            onClick={() => handleChangeMood('neutral')}
          >
            <BarChart2 className="h-3 w-3 mr-1" />
            Neutral
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs",
              currentMood === 'volatile' ? "bg-yellow-500/20" : ""
            )}
            onClick={() => handleChangeMood('volatile')}
          >
            <Zap className="h-3 w-3 mr-1" />
            Volatile
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "text-xs",
              currentMood === 'calm' ? "bg-purple-500/20" : ""
            )}
            onClick={() => handleChangeMood('calm')}
          >
            <Sunset className="h-3 w-3 mr-1" />
            Calm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}