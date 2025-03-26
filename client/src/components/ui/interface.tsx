import { useEffect, useState } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
//import { Confetti } from "../game/Confetti"; // Uncomment if this component exists
import { VolumeX, Volume2, RotateCw, Trophy, Palette, X, Map } from "lucide-react";
import { PlayerCustomizer } from "./player-customizer";

export function Interface() {
  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const { isMuted, toggleMute } = useAudio();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Handle clicks on the interface in the ready phase to start the game
  useEffect(() => {
    if (phase === "ready") {
      const handleClick = () => {
        // Remove focus from any button
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        const event = new KeyboardEvent("keydown", { code: "Space" });
        window.dispatchEvent(event);
      };

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [phase]);
  
  // Handle M key press to toggle map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        setShowMap(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      {/* Top-right corner UI controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMap(!showMap)}
          title="Toggle Map"
        >
          <Map size={18} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCustomizer(!showCustomizer)}
          title="Customize Character"
        >
          <Palette size={18} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={restart}
          title="Restart Game"
        >
          <RotateCw size={18} />
        </Button>
      </div>
      
      {/* Player Customizer Panel */}
      {showCustomizer && (
        <div className="fixed top-16 right-4 z-20">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-2 -right-2 z-10 rounded-full bg-background shadow-md"
              onClick={() => setShowCustomizer(false)}
            >
              <X size={16} />
            </Button>
            <PlayerCustomizer />
          </div>
        </div>
      )}
      
      {/* Game completion overlay */}
      {phase === "ended" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/30">
          <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="text-yellow-500" />
                Level Complete!
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-center text-muted-foreground">
                Congratulations! You successfully navigated the course.
              </p>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button onClick={restart} className="w-full">
                Play Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Instructions panel */}
      <div className="fixed bottom-4 left-4 z-10">
        <Card className="w-auto max-w-xs bg-background/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Controls:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>WASD or Arrow Keys: Move character</li>
              <li>Space: Jump</li>
              <li>Double-tap movement key: Sprint</li>
              <li>Right mouse button: Rotate camera</li>
              <li>E: Interact</li>
              <li>M: Toggle sound</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
