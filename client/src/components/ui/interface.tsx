import { useEffect, useState } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
//import { Confetti } from "../game/Confetti"; // Uncomment if this component exists
import { VolumeX, Volume2, RotateCw, Trophy, Palette, X, Map, Mic, MicOff, MessageSquare, Smartphone } from "lucide-react";
import { AugmentedReality } from "./augmented-reality";
import { PlayerCustomizer } from "./player-customizer";
import { GameSidebar } from "./game-sidebar";
import { Chat } from "./chat";
import { toast } from "sonner";

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
  const [micEnabled, setMicEnabled] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAR, setShowAR] = useState(false);

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
  
  // Handle keyboard shortcuts: M for map, T for microphone, C for chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        toggleMap();
      } else if (e.key.toLowerCase() === 't') {
        setMicEnabled(prev => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        setShowChat(prev => !prev);
        if (!showChat) setChatMinimized(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showChat]);
  
  // Set up microphone when enabled
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupMicrophone = async () => {
      try {
        if (micEnabled) {
          console.log("Enabling microphone...");
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Microphone enabled successfully");
          // Here you would connect the stream to your voice chat system
        } else if (stream) {
          // Stop all audio tracks
          stream.getAudioTracks().forEach(track => track.stop());
          stream = null;
          console.log("Microphone disabled");
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setMicEnabled(false);
      }
    };
    
    setupMicrophone();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getAudioTracks().forEach(track => track.stop());
        console.log("Microphone disabled on cleanup");
      }
    };
  }, [micEnabled]);

  return (
    <div>
      {/* Game Sidebar */}
      <GameSidebar />
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
          variant={showChat ? "default" : "outline"}
          size="icon"
          onClick={() => {
            setShowChat(!showChat);
            if (!showChat) setChatMinimized(false);
          }}
          title="Toggle Chat"
          className={showChat ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <MessageSquare size={18} />
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
          variant={micEnabled ? "default" : "outline"}
          size="icon"
          onClick={() => setMicEnabled(!micEnabled)}
          title={micEnabled ? "Disable Microphone" : "Enable Microphone"}
          className={micEnabled ? "bg-green-600 hover:bg-green-700 relative" : ""}
        >
          {micEnabled ? (
            <>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Mic size={18} />
            </>
          ) : (
            <MicOff size={18} />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setShowAR(true);
            toast("Augmented Reality Mode", {
              description: "Entering AR view. Allow camera access to experience the trading world in your space.",
            });
          }}
          title="Augmented Reality View"
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-300 dark:border-purple-700"
        >
          <Smartphone size={18} className="text-purple-600 dark:text-purple-400" />
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
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-[90%] h-[90%] max-w-5xl max-h-[80vh] overflow-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trading Metaverse Map</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                  onClick={() => {
                    // Toggle between light and dark mode
                    if (document.documentElement.classList.contains('dark')) {
                      document.documentElement.classList.remove('dark');
                      localStorage.theme = 'light';
                    } else {
                      document.documentElement.classList.add('dark');
                      localStorage.theme = 'dark';
                    }
                  }}
                >
                  {document.documentElement.classList.contains('dark') ? 
                    '☀️ Light Mode' : 
                    '🌙 Dark Mode'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMap}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6 h-[calc(100%-64px)] overflow-auto">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full flex flex-col lg:flex-row gap-6">
                {/* Map visualization */}
                <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center relative shadow-md">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=signals'}
                      className="col-start-2 col-end-3 row-start-1 row-end-2 bg-blue-500/20 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="text-blue-900 dark:text-blue-100 font-semibold">Signal Towers</div>
                    </div>
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=crypto'}
                      className="col-start-1 col-end-2 row-start-2 row-end-3 bg-green-500/20 dark:bg-green-900/50 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-green-200 dark:border-green-800"
                    >
                      <div className="text-green-900 dark:text-green-100 font-semibold">Crypto Trading</div>
                    </div>
                    <div className="col-start-2 col-end-3 row-start-2 row-end-3 bg-purple-500/20 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-center p-2 relative border border-purple-200 dark:border-purple-800">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full absolute"></div>
                      <div className="text-purple-900 dark:text-purple-100 font-semibold z-10">You Are Here</div>
                    </div>
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=forex'}
                      className="col-start-3 col-end-4 row-start-2 row-end-3 bg-red-500/20 dark:bg-red-900/50 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-red-200 dark:border-red-800"
                    >
                      <div className="text-red-900 dark:text-red-100 font-semibold">Forex Trading</div>
                    </div>
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=tradehouse'}
                      className="col-start-2 col-end-3 row-start-3 row-end-4 bg-yellow-500/20 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="text-yellow-900 dark:text-yellow-100 font-semibold">Trade House</div>
                    </div>
                  </div>
                </div>
                
                {/* Locations list */}
                <div className="lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-md">
                  <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Trading Locations</h3>
                  <div className="space-y-4">
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=tradehouse'}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="font-semibold text-gray-900 dark:text-white">Trade House</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-5">Center hub for all traders with meeting areas and social spaces</p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded-full">Enter Location</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=crypto'}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-semibold text-gray-900 dark:text-white">Crypto Trading</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-5">Bitcoin, Ethereum, Alt coins trading with real-time charts</p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">Enter Location</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=forex'}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="font-semibold text-gray-900 dark:text-white">Forex Trading</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-5">Currency pairs trading with advanced order types</p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-2 py-0.5 rounded-full">Enter Location</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=signals'}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-semibold text-gray-900 dark:text-white">Signal Towers</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-5">Trading signals and alerts from AI and other traders</p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">Enter Location</span>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => window.location.href = '/trading-space?location=stocks'}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="font-semibold text-gray-900 dark:text-white">Stock Market</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-5">Equities and indices trading with portfolio management</p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-0.5 rounded-full">Enter Location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AR Mode */}
      {showAR && (
        <AugmentedReality 
          isOpen={showAR} 
          onClose={() => setShowAR(false)} 
          modelPath="/models/trading_floor.glb" 
        />
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
      
      {/* Chat Panel */}
      {showChat && (
        <div className="fixed bottom-4 right-4 z-10">
          <Chat 
            minimized={chatMinimized} 
            onToggleMinimize={() => setChatMinimized(!chatMinimized)} 
          />
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
              <li>T: Toggle microphone</li>
              <li>C: Toggle chat</li>
              <li>AR Button: View in augmented reality</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
