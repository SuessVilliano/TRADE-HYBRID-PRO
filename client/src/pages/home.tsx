import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightCircle, BarChart2, Bot, Building, CandlestickChart, Globe, Trophy, Wallet, Gamepad2 } from "lucide-react";
import { TRADING_SYMBOLS } from "@/lib/constants";
import { AudioPermissionDialog } from "@/components/ui/audio-initializer";
import { GuidedFeatures } from "@/components/ui/guided-features";
import { useGuideTour } from "@/components/ui/contextual-tooltip";

// Create placeholders for audio functions until the store is properly initialized
const dummyAudio = {
  isMuted: true,
  toggleMute: () => console.log("Toggle mute called"),
  setBackgroundMusic: () => console.log("Set background music called"),
  setHitSound: () => console.log("Set hit sound called"),
  setSuccessSound: () => console.log("Set success sound called"),
  playSuccess: () => console.log("Play success called"),
};

// Import existing providers from proper locations
import { TradingTipsProvider } from "@/components/ui/trading-tips-provider";
import { GuideTourProvider } from "@/components/ui/contextual-tooltip";

export default function Home() {
  return (
    <GuideTourProvider>
      <TradingTipsProvider currentPath="/home">
        <HomeContent />
      </TradingTipsProvider>
    </GuideTourProvider>
  );
}

function HomeContent() {
  const [username, setUsername] = useState("Trader1");
  const [isMuted, setIsMuted] = useState(true);
  const [showAudioPermission, setShowAudioPermission] = useState(false);
  const [showGuidedFeatures, setShowGuidedFeatures] = useState(false);
  const guideTour = useGuideTour();
  
  // Use our dummy audio functions
  const { 
    toggleMute,
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound,
    playSuccess 
  } = dummyAudio;
  
  // Create a local toggle function since we're not using the zustand store
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toggleMute();
  };
  
  // Initialize audio assets and check for first-time users
  useEffect(() => {
    // Initialize audio assets on component mount
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = 0.4;
    
    const successSound = new Audio('/sounds/success.mp3');
    successSound.volume = 0.5;
    
    // Store audio elements in global state
    // Use our dummy functions safely
    setBackgroundMusic();
    setHitSound();
    setSuccessSound();
    
    // Check if it's the first visit and show audio permission dialog
    const audioPermissionSeen = localStorage.getItem('audio_permission_seen');
    if (!audioPermissionSeen) {
      // Show permission dialog after a short delay
      setTimeout(() => {
        setShowAudioPermission(true);
      }, 1000);
    }
    
    // Always show guided features, but only trigger the auto tour if not seen before
    setTimeout(() => {
      setShowGuidedFeatures(true);
      
      // Only auto-start the tour for first-time users
      const guidedFeaturesSeen = localStorage.getItem('guided_features_seen');
      if (!guidedFeaturesSeen) {
        // Start the guided tour automatically
        guideTour.startTour();
      }
    }, 1500);
  }, [setBackgroundMusic, setHitSound, setSuccessSound, guideTour]);
  
  const handleEnterMetaverse = () => {
    // Play success sound when entering the metaverse
    if (!isMuted) {
      playSuccess();
    }
  };
  
  const handleAudioPermission = async () => {
    try {
      // Request audio context to trigger browser permission dialog
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.resume().then(() => {
        console.log('Audio context started successfully');
        
        // Enable sound
        if (isMuted) {
          toggleMute();
        }
        
        // Play a test sound to confirm permissions
        playSuccess();
      });
      
      // Mark that user has seen the permission dialog
      localStorage.setItem('audio_permission_seen', 'true');
    } catch (error) {
      console.error('Error requesting audio permission:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Hero Section */}
      <div className="relative overflow-hidden pb-20">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 px-3 py-1 text-sm" variant="outline">
              Beta Version 0.1
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">Trade Hybrid</span>
              <span className="block text-primary">AI-Driven Trading Metaverse</span>
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg md:text-xl">
              An immersive 3D trading environment where real-time market data meets gamified trading experiences.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/trading-space" onClick={handleEnterMetaverse}>
                <Button size="lg" className="gap-2">
                  Enter Metaverse <ArrowRightCircle className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/game">
                <Button variant="secondary" size="lg" className="gap-2">
                  Play Trade Runner <Gamepad2 className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={toggleMute}>
                {isMuted ? "Enable Audio" : "Disable Audio"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background/80 to-background rounded-lg shadow-inner">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Key Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience the future of trading with our innovative platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature: Real-Time Trading */}
          <Card>
            <CardHeader>
              <CandlestickChart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-Time Trading</CardTitle>
              <CardDescription>
                Trade with live market data from major platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Experience market moves in real-time with direct API integrations to major trading platforms. React to price movements and news as they happen.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {TRADING_SYMBOLS.CRYPTO.slice(0, 3).join(" • ")} and more
            </CardFooter>
          </Card>
          
          {/* Feature: AI Market Insights */}
          <Card>
            <CardHeader>
              <Bot className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Get intelligent market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI interprets market news and events, providing real-time insights and trading suggestions based on sophisticated market analysis.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Risk management • Trade suggestions • Market sentiment
            </CardFooter>
          </Card>
          
          {/* Feature: Trading Bots */}
          <Card>
            <CardHeader>
              <BarChart2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Custom Trading Bots</CardTitle>
              <CardDescription>
                Build and deploy automated strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, test, and deploy your own trading bots. Build strategies, backtest with historical data, and let your bots trade for you.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Strategy builder • Automated trading • Performance tracking
            </CardFooter>
          </Card>
          
          {/* Feature: Leaderboards */}
          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Global Leaderboards</CardTitle>
              <CardDescription>
                Compete with traders worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rise through the ranks on our global leaderboards. Compete based on profitability, win rate, strategy efficiency, and more.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Monthly tournaments • Prizes • Trader recognition
            </CardFooter>
          </Card>
          
          {/* Feature: Market News */}
          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-Time News Feed</CardTitle>
              <CardDescription>
                Stay updated with financial news
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access real-time news from top financial sources. Our AI categorizes and highlights important events that could impact your trades.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Bloomberg • Reuters • Financial Times • Investing.com
            </CardFooter>
          </Card>
          
          {/* Feature: Trade House */}
          <Card>
            <CardHeader>
              <Building className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Custom Trade House</CardTitle>
              <CardDescription>
                Create your personal trading space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customize your Trade House with trading tools, screens, and resources. Invite others to visit or collaborate in your personalized trading space.
              </p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Customizable space • Trading tools • Collaboration
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Interactive Guided Features Section */}
      {showGuidedFeatures && (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-primary/5 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Explore Our Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Take a guided tour through Trade Hybrid's innovative features
            </p>
          </div>
          
          <GuidedFeatures />
          
          <div className="mt-8 text-center">
            <Button 
              onClick={() => {
                setShowGuidedFeatures(false);
                localStorage.setItem('guided_features_seen', 'true');
                guideTour.completeTour();
              }}
              variant="outline"
            >
              Close Tour
            </Button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Trade in the Metaverse?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join traders from around the world in our immersive 3D trading environment
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/trading-space" onClick={handleEnterMetaverse}>
              <Button size="lg">
                Enter Trade Hybrid
              </Button>
            </Link>
            <Link to="/game">
              <Button size="lg" variant="secondary">
                Play Trade Runner Game
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => {
                setShowGuidedFeatures(true);
                guideTour.startTour();
              }}>
              Take Feature Tour
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2023 Trade Hybrid. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Trading involves significant risk. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>
      
      {/* Audio Permission Dialog */}
      <AudioPermissionDialog 
        isOpen={showAudioPermission}
        onRequestPermission={handleAudioPermission}
        onClose={() => {
          setShowAudioPermission(false);
          localStorage.setItem('audio_permission_seen', 'true');
        }}
      />
    </div>
  );
}
