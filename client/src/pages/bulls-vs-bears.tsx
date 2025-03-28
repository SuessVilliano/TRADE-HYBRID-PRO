import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BullsVsBearsGame from "@/components/game/BullsVsBearsGame";
import { ArrowLeft, Trophy, Share2, Coins } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { MobileSidebarToggle } from "@/components/ui/mobile-sidebar-toggle";
import { MusicPlayer } from "@/components/ui/music-player";
import { useAudio } from "@/lib/stores/useAudio";
import { CustomizableBottomNav } from "@/components/ui/customizable-bottom-nav";

interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  difficulty: string;
  date: string;
}

export default function BullsVsBears() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const isMobile = useIsMobile();
  const { fetchLeaderboard } = useLeaderboard();
  const audioStore = useAudio();
  const [activePanel, setActivePanel] = useState("game");

  // Set audio context for game
  useEffect(() => {
    audioStore.setInMetaverse(true);
    audioStore.playMusic();
    
    return () => {
      audioStore.setInMetaverse(false);
      audioStore.pauseMusic();
    };
  }, []);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const data = await fetchLeaderboard();
        // Transform and sort the data
        const gameLeaderboard = data ? data.map((entry: any) => ({
          id: entry.id,
          playerName: entry.name,
          score: parseInt(entry.profit),
          difficulty: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
          date: new Date(entry.lastTrade).toLocaleDateString()
        })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score) : [];
        
        setLeaderboard(gameLeaderboard);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [showLeaderboard, fetchLeaderboard]);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Bulls vs Bears Trading Game</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              <Trophy className="h-4 w-4 mr-1" />
              <span className="text-xs">Leaderboard</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => alert("Share functionality coming soon!")}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
            {isMobile && <MobileSidebarToggle />}
          </div>
        </div>
      </div>
      
      {/* Main Content - Game or Leaderboard */}
      <div className="flex-1 overflow-hidden">
        {!showLeaderboard ? (
          // Game panel
          <div className="h-full">
            <BullsVsBearsGame />
          </div>
        ) : (
          // Leaderboard panel
          <div className="h-full bg-gray-100 dark:bg-gray-800 p-4 overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Top Traders
            </h2>
            
            {loadingLeaderboard ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className="bg-white dark:bg-gray-700 rounded-lg shadow p-3 flex items-center"
                  >
                    <div className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-300" :
                      index === 2 ? "bg-amber-700" : "bg-gray-200 dark:bg-gray-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.playerName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span className="capitalize">{entry.difficulty}</span>
                        <span className="mx-1">•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                      <Coins size={16} />
                      {entry.score}
                    </div>
                  </div>
                ))}
                
                {leaderboard.length === 0 && (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No leaderboard data available yet. Be the first to play and set a high score!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Music Player */}
      <div className="absolute right-4 bottom-16 z-30">
        <MusicPlayer />
      </div>
      
      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <CustomizableBottomNav 
          activePanel={activePanel} 
          onChange={(panel) => setActivePanel(panel)}
        />
      )}
    </div>
  );
}