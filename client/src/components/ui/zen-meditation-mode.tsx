import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars, Cloud, Text } from '@react-three/drei';
import { useAudio } from '@/lib/stores/useAudio';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Slider } from './slider';
import { Switch } from './switch';
import { Label } from './label';
import { Separator } from './separator';
import * as THREE from 'three';
import { 
  Sunrise, 
  Sunset, 
  Moon, 
  Cloud as CloudIcon, 
  Wind, 
  MoveHorizontal,
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation for the breathing circle
const BreathingCircle = () => {
  const [scale, setScale] = useState(1);
  const [direction, setDirection] = useState(1);
  const circleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    // Gentle pulsing effect
    if (circleRef.current) {
      // Smoothly change scale between 1 and 1.5
      if (scale > 1.5) setDirection(-1);
      if (scale < 1) setDirection(1);
      
      const newScale = scale + direction * delta * 0.3;
      setScale(newScale);
      
      circleRef.current.scale.set(newScale, newScale, newScale);
    }
  });
  
  return (
    <mesh ref={circleRef} position={[0, 0, -10]}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial color="#7ec8e3" transparent opacity={0.5} />
    </mesh>
  );
};

// Ripple effect for water visualization
const WaterRipple = () => {
  const { viewport } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta * 0.2;
    
    if (planeRef.current) {
      const position = planeRef.current.geometry.attributes.position;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        
        // Create gentle ripple effect
        const distance = Math.sqrt(x * x + y * y);
        const ripple = Math.sin(distance * 1.5 - timeRef.current) * 0.1;
        
        position.setZ(i, ripple);
      }
      
      position.needsUpdate = true;
    }
  });
  
  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[30, 30, 32, 32]} />
      <meshStandardMaterial 
        color="#0077be" 
        wireframe={false} 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Floating particles like cherry blossoms or dandelion seeds
const FloatingParticles = ({ count = 100 }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Generate random positions
  const [positions, setPositions] = useState(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;      // x
      positions[i * 3 + 1] = Math.random() * 10;          // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;  // z
    }
    return positions;
  });
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05;
      
      // Update positions to create floating effect
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Gentle upward movement with slight random horizontal drift
        positions[i * 3] += Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.01;
        positions[i * 3 + 1] += 0.01;
        positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 0.1 + i) * 0.01;
        
        // Reset position when particle reaches the top
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = -2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffc0cb"
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// Main visualization component
const ZenVisualization = ({ scene = 'ocean', speed = 1 }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableRotate={true}
        autoRotate
        autoRotateSpeed={speed}
        rotateSpeed={0.5}
      />
      
      {scene === 'ocean' && (
        <>
          <WaterRipple />
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
          <FloatingParticles count={200} />
          <Text
            position={[0, 2, 0]}
            color="#ffffff"
            fontSize={0.5}
            font="/fonts/inter.woff"
            anchorX="center"
            anchorY="middle"
          >
            Breathe in... Breathe out...
          </Text>
        </>
      )}
      
      {scene === 'space' && (
        <>
          <Stars radius={100} depth={50} count={10000} factor={4} fade speed={1} />
          <BreathingCircle />
          <Text
            position={[0, 0, -5]}
            color="#ffffff"
            fontSize={0.5}
            font="/fonts/inter.woff"
            anchorX="center"
            anchorY="middle"
          >
            Find your center...
          </Text>
        </>
      )}
      
      {scene === 'clouds' && (
        <>
          <color attach="background" args={['#87ceeb']} />
          <Cloud
            opacity={0.5}
            speed={0.4}
            width={20}
            depth={1.5}
            segments={20}
            position={[0, 2, 0]}
          />
          <Cloud
            opacity={0.25}
            speed={0.3}
            width={10}
            depth={1}
            segments={15}
            position={[-4, 0, 2]}
          />
          <Cloud
            opacity={0.7}
            speed={0.2}
            width={15}
            depth={2}
            segments={20}
            position={[4, -2, -2]}
          />
          <Text
            position={[0, 0, 0]}
            color="#ffffff"
            fontSize={0.5}
            font="/fonts/inter.woff"
            anchorX="center"
            anchorY="middle"
          >
            Trade with clarity...
          </Text>
        </>
      )}
    </>
  );
};

// Meditation timer component
const MeditationTimer = ({ duration = 300, onComplete }: { duration: number, onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            clearInterval(interval);
            setIsActive(false);
            onComplete();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
      <div className="flex space-x-2">
        <Button 
          onClick={toggleTimer} 
          variant="outline"
          size="sm"
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          onClick={resetTimer} 
          variant="outline" 
          size="sm"
          disabled={timeLeft === duration && !isActive}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

// Meditation instruction component
const MeditationInstructions = ({ type = 'mindfulness' }: { type: string }) => {
  const getInstructions = () => {
    switch (type) {
      case 'mindfulness':
        return [
          "Find a comfortable position",
          "Close your eyes or soften your gaze",
          "Take deep breaths, in through your nose, out through your mouth",
          "Focus on your breathing, noticing the sensations",
          "When your mind wanders, gently bring your attention back",
          "Observe your thoughts without judgment",
          "Continue this practice for the duration of your session"
        ];
      case 'market':
        return [
          "Sit comfortably and take deep breaths",
          "Visualize the market as a flowing river",
          "Trading opportunities come and go like waves",
          "Release attachment to outcomes",
          "Observe market emotions without being controlled by them",
          "Trust your analysis, not your emotions",
          "Remember: patience leads to better trading decisions"
        ];
      case 'focus':
        return [
          "Sit in an upright, alert position",
          "Take three deep cleansing breaths",
          "Focus your attention on a single point",
          "This could be your trading strategy or goal",
          "When distractions arise, acknowledge them",
          "Then return to your focal point",
          "Practice maintaining single-pointed concentration"
        ];
      default:
        return [
          "Find a comfortable position",
          "Close your eyes or soften your gaze",
          "Breathe naturally and focus on your breath",
          "When your mind wanders, gently return to your breathing",
          "Be kind to yourself during this practice"
        ];
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Meditation Instructions</h3>
      <ol className="space-y-2 list-decimal pl-5">
        {getInstructions().map((instruction, index) => (
          <li key={index} className="text-sm text-muted-foreground">{instruction}</li>
        ))}
      </ol>
    </div>
  );
};

// Props for the main component
interface ZenMeditationModeProps {
  className?: string;
}

// Main component
export function ZenMeditationMode({ className }: ZenMeditationModeProps) {
  // State
  const [activeScene, setActiveScene] = useState<'ocean' | 'space' | 'clouds'>('ocean');
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [meditationType, setMeditationType] = useState<'mindfulness' | 'market' | 'focus'>('mindfulness');
  const [showInstructions, setShowInstructions] = useState(true);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes default
  
  // Audio hook
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
    previousTrack,
    addMusicTrack
  } = useAudio();
  
  // Add meditation tracks if they don't exist
  useEffect(() => {
    // Check if we already have meditation tracks
    const meditationTracks = musicTracks.filter(track => track.category === 'meditation');
    
    if (meditationTracks.length === 0) {
      // Add meditation tracks
      const newTracks = [
        {
          id: 'meditation-calm-ocean',
          title: 'Ocean Calm',
          artist: 'Zen Sounds',
          url: '/sounds/background.mp3', // Using existing sound for now
          category: 'meditation',
          mood: 'calm'
        },
        {
          id: 'meditation-space-ambient',
          title: 'Cosmic Meditation',
          artist: 'Zen Sounds',
          url: '/sounds/background.mp3', // Using existing sound for now
          category: 'meditation',
          mood: 'calm'
        },
        {
          id: 'meditation-clouds-ambient',
          title: 'Sky Meditation',
          artist: 'Zen Sounds',
          url: '/sounds/background.mp3', // Using existing sound for now
          category: 'meditation',
          mood: 'calm'
        }
      ];
      
      // Add each track to the store
      newTracks.forEach(track => addMusicTrack(track));
    }
  }, [musicTracks, addMusicTrack]);
  
  // Handle meditation completion
  const handleMeditationComplete = () => {
    // You could add analytics here or show a notification
    console.log('Meditation session completed');
  };
  
  // Scene selection buttons
  const sceneButtons = [
    {
      name: 'ocean',
      icon: <Waves className="h-4 w-4" />,
      label: 'Ocean Calm',
      color: 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
    },
    {
      name: 'space',
      icon: <Moon className="h-4 w-4" />,
      label: 'Space Float',
      color: 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30'
    },
    {
      name: 'clouds',
      icon: <CloudIcon className="h-4 w-4" />,
      label: 'Cloud Mind',
      color: 'bg-sky-500/20 text-sky-500 hover:bg-sky-500/30'
    }
  ];
  
  // Meditation type buttons
  const meditationTypes = [
    {
      name: 'mindfulness',
      icon: <MoveHorizontal className="h-4 w-4" />,
      label: 'Mindfulness',
      description: 'Present moment awareness'
    },
    {
      name: 'market',
      icon: <Sunrise className="h-4 w-4" />,
      label: 'Market Zen',
      description: 'Trading without emotions'
    },
    {
      name: 'focus',
      icon: <Sunset className="h-4 w-4" />,
      label: 'Focus',
      description: 'Concentration and clarity'
    }
  ];
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Visualization canvas */}
      <div className="relative h-3/5 rounded-lg overflow-hidden">
        <Canvas>
          <ZenVisualization scene={activeScene} speed={rotationSpeed} />
        </Canvas>
        
        {/* Scene selectors overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {sceneButtons.map((scene) => (
            <Button
              key={scene.name}
              variant="outline"
              size="sm"
              className={cn(
                "bg-background/80 backdrop-blur-sm border-none",
                activeScene === scene.name && scene.color
              )}
              onClick={() => setActiveScene(scene.name as 'ocean' | 'space' | 'clouds')}
            >
              <span className="flex items-center gap-1.5">
                {scene.icon}
                {scene.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Controls section */}
      <div className="h-2/5 p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Zen Trading Meditation</h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleMusicMuted}
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
              onValueChange={(value) => setMusicVolume(value[0])}
              className="w-24"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Meditation Types */}
        <div>
          <Label className="mb-2 block">Meditation Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {meditationTypes.map((type) => (
              <Button
                key={type.name}
                variant="outline"
                size="sm"
                className={cn(
                  "h-auto py-2 justify-start text-left flex-col items-start",
                  meditationType === type.name && "bg-primary/10 border-primary/50"
                )}
                onClick={() => setMeditationType(type.name as 'mindfulness' | 'market' | 'focus')}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {type.icon}
                  {type.label}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Rotation Speed</Label>
            <Slider
              value={[rotationSpeed]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(value) => setRotationSpeed(value[0])}
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Timer</Label>
            <MeditationTimer 
              duration={timerDuration} 
              onComplete={handleMeditationComplete} 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-instructions">Show Instructions</Label>
          <Switch
            id="show-instructions"
            checked={showInstructions}
            onCheckedChange={setShowInstructions}
          />
        </div>
        
        {showInstructions && (
          <div className="bg-muted/50 rounded-lg p-3">
            <MeditationInstructions type={meditationType} />
          </div>
        )}
      </div>
    </div>
  );
}

// Add default export for the component
export default ZenMeditationMode;