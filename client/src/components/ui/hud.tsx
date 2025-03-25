import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { cn } from "@/lib/utils";
import { VolumeX, Volume2, Gamepad2 } from "lucide-react";

interface HUDProps {
  className?: string;
}

export function HUD({ className }: HUDProps) {
  const gamePhase = useGame(state => state.phase);
  const restart = useGame(state => state.restart);
  const start = useGame(state => state.start);
  const isMuted = useAudio(state => state.isMuted);
  const toggleMute = useAudio(state => state.toggleMute);
  
  const handleToggleMute = () => {
    toggleMute();
  };
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50",
        className
      )}
    >
      <Card className="p-2 flex items-center justify-center gap-4 shadow-lg bg-background/90 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="icon"
          title="Game Controls"
        >
          <Gamepad2 className="h-5 w-5" />
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        {gamePhase === "ready" && (
          <Button size="sm" onClick={start}>
            Start
          </Button>
        )}
        
        {gamePhase === "ended" && (
          <Button size="sm" onClick={restart}>
            Restart
          </Button>
        )}
        
        {gamePhase === "playing" && (
          <Button size="sm" variant="outline" onClick={restart}>
            Reset
          </Button>
        )}
      </Card>
    </div>
  );
}
