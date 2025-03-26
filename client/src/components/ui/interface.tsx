import { useEffect, useState } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
//import { Confetti } from "../game/Confetti"; // Uncomment if this component exists
import { VolumeX, Volume2, RotateCw, Trophy, Palette, X, Map } from "lucide-react";
import { PlayerCustomizer } from "./player-customizer";

interface InterfaceProps {
  showMapOverride?: boolean;
  onToggleMap?: () => void;
}

export function Interface({ showMapOverride, onToggleMap }: InterfaceProps) {
  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const { isMuted, toggleMute } = useAudio();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showMapState, setShowMapState] = useState(false);

  // Use either the internal state or the external override prop
  const showMap = showMapOverride !== undefined ? showMapOverride : showMapState;
  
  // Toggle map function that respects both internal and external state
  const toggleMap = () => {
    if (onToggleMap) {
      onToggleMap();
    } else {
      setShowMapState(!showMapState);
    }
  };

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
        toggleMap();
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
          onClick={toggleMap}
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
      
      {/* Map Panel */}
      {showMap && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-background rounded-lg shadow-lg w-[90%] h-[90%] max-w-5xl max-h-[80vh] overflow-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold">Trading Metaverse Map</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMap}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-4 sm:p-6 h-[calc(100%-64px)] overflow-auto">
              <div className="bg-muted/30 rounded-lg p-4 h-full flex flex-col lg:flex-row gap-6">
                {/* Map visualization */}
                <div className="flex-1 bg-black/10 rounded-lg p-4 min-h-[300px] flex items-center justify-center relative">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-4">
                    <div className="col-start-2 col-end-3 row-start-1 row-end-2 bg-blue-500/20 rounded flex items-center justify-center text-center p-2">
                      <span>Signal Towers</span>
                    </div>
                    <div className="col-start-1 col-end-2 row-start-2 row-end-3 bg-green-500/20 rounded flex items-center justify-center text-center p-2">
                      <span>Crypto Trading</span>
                    </div>
                    <div className="col-start-2 col-end-3 row-start-2 row-end-3 bg-purple-500/20 rounded-lg flex items-center justify-center text-center p-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full absolute"></div>
                      <span>You Are Here</span>
                    </div>
                    <div className="col-start-3 col-end-4 row-start-2 row-end-3 bg-red-500/20 rounded flex items-center justify-center text-center p-2">
                      <span>Forex Trading</span>
                    </div>
                    <div className="col-start-2 col-end-3 row-start-3 row-end-4 bg-yellow-500/20 rounded flex items-center justify-center text-center p-2">
                      <span>Trade House</span>
                    </div>
                  </div>
                </div>
                
                {/* Locations list */}
                <div className="lg:w-1/3 bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Trading Locations</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Trade House - Center hub for all traders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Crypto Trading - Bitcoin, Ethereum, Alt coins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Forex Trading - Currency pairs trading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Signal Towers - Trading signals and alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Stock Market - Equities and indices</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
      <div className="fixed bottom-4 left-4 z-10 hidden md:block">
        <Card className="w-auto max-w-xs bg-background/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Controls:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>WASD or Arrow Keys: Move character</li>
              <li>Space: Jump</li>
              <li>Double-tap movement key: Sprint</li>
              <li>Right mouse button: Rotate camera</li>
              <li>E: Interact</li>
              <li>M: Toggle map</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
