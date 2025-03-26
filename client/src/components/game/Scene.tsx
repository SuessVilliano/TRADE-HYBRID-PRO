import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sky, 
  Environment, 
  PerspectiveCamera, 
  OrbitControls,
  Grid,
  Text,
  useGLTF,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { Interface } from '../ui/interface';
import { Map, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation } from 'react-router-dom';
import Floor from './Floor';
import Lights from './Lights';
import { GamePhase, useGame } from '@/lib/stores/useGame';
import GameControls from './Controls';
import Player from './Player';

interface SceneProps {
  showStats?: boolean;
}

// Represents a simple building model
function Building({ position, size, color, name }: { 
  position: [number, number, number], 
  size: [number, number, number], 
  color: string,
  name: string
}) {
  return (
    <group position={new THREE.Vector3(...position)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.5}
      >
        {name}
      </Text>
    </group>
  )
}

// Create different trading locations in the 3D space
function TradingEnvironment() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationParam = searchParams.get('location') || 'tradehouse';
  
  return (
    <group>
      {/* Trade House - Central Building */}
      <Building 
        position={[0, 1, 0]} 
        size={[10, 2, 10]} 
        color={locationParam === 'tradehouse' ? '#FFD700' : '#D4AF37'} 
        name="Trade House"
      />
      
      {/* Crypto Trading Center */}
      <Building 
        position={[-15, 1, 0]} 
        size={[8, 2, 6]} 
        color={locationParam === 'crypto' ? '#22c55e' : '#15803d'} 
        name="Crypto Trading"
      />
      
      {/* Forex Trading Floor */}
      <Building 
        position={[15, 1, 0]} 
        size={[8, 2, 6]} 
        color={locationParam === 'forex' ? '#ef4444' : '#b91c1c'} 
        name="Forex Trading"
      />
      
      {/* Stock Market Exchange */}
      <Building 
        position={[0, 1, 15]} 
        size={[8, 2, 6]} 
        color={locationParam === 'stocks' ? '#a855f7' : '#7e22ce'} 
        name="Stock Market"
      />
      
      {/* Signal Towers */}
      <Building 
        position={[0, 1, -15]} 
        size={[6, 4, 6]} 
        color={locationParam === 'signals' ? '#3b82f6' : '#1d4ed8'} 
        name="Signal Towers"
      />
      
      {/* Roads connecting buildings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Path to Crypto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7.5, 0.02, 0]} receiveShadow>
        <planeGeometry args={[15, 2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Path to Forex */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, 0.02, 0]} receiveShadow>
        <planeGeometry args={[15, 2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Path to Stock Market */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 7.5]} receiveShadow>
        <planeGeometry args={[2, 15]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Path to Signal Towers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7.5]} receiveShadow>
        <planeGeometry args={[2, 15]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
}

// Scene Camera
function SceneCamera() {
  const { camera } = useThree();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationParam = searchParams.get('location') || 'tradehouse';
  
  useEffect(() => {
    // Set camera position based on location
    let cameraPos: [number, number, number];
    
    switch(locationParam) {
      case 'crypto':
        cameraPos = [-10, 5, 10];
        break;
      case 'forex':
        cameraPos = [10, 5, 10];
        break;
      case 'stocks':
        cameraPos = [0, 5, 20];
        break;
      case 'signals':
        cameraPos = [0, 5, -10];
        break;
      case 'tradehouse':
      default:
        cameraPos = [10, 5, 10];
    }
    
    camera.position.set(...cameraPos);
    camera.lookAt(0, 0, 0);
  }, [camera, locationParam]);
  
  return null;
}

export default function Scene({ showStats = false }: SceneProps) {
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode is enabled on mount
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { phase } = useGame();

  // Function to toggle map for mobile users
  const toggleMobileMap = () => {
    setShowMobileMap(!showMobileMap);
  };

  // Update isDarkMode when the theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <GameControls>
        <Canvas shadows>
          <Suspense fallback={null}>
            <color attach="background" args={[isDarkMode ? '#0f172a' : '#e0f2fe']} />
            
            {isDarkMode ? (
              <Stars radius={100} depth={50} count={1000} factor={4} />
            ) : (
              <Sky sunPosition={[100, 10, 100]} />
            )}
            
            <ambientLight intensity={0.3} />
            <Lights />
            <SceneCamera />
            <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI/2 - 0.1} />
            
            <TradingEnvironment />
            <Floor />
            
            {/* Add the player character */}
            <Player />
          </Suspense>
        </Canvas>
      </GameControls>
      
      {/* Interface overlay that includes the map toggle functionality */}
      <Interface 
        showMapOverride={showMobileMap} 
        onToggleMap={toggleMobileMap} 
      />
      
      {/* Mobile controls */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white h-12 w-12 rounded-full flex items-center justify-center"
            onClick={toggleMobileMap}
          >
            <Map size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white h-12 w-12 rounded-full flex items-center justify-center"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
        </div>
      </div>
    </div>
  );
}