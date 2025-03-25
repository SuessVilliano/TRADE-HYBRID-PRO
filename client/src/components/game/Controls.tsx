import React, { useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import MobileControls from "./MobileControls";

// Define our control keys for the game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
}

function KeyboardControlsImplementation() {
  const gamePhase = useGame(state => state.phase);
  const toggleMute = useAudio(state => state.toggleMute);
  
  // Set up key listeners for controls not handled by drei
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle mute with 'M' key
      if (e.code === "KeyM") {
        toggleMute();
      }
      
      // Toggle game state with 'P' key (Pause/Play)
      if (e.code === "KeyP") {
        if (gamePhase === "playing") {
          useGame.getState().end();
        } else {
          useGame.getState().start();
        }
      }
      
      // Log key presses for debugging
      console.log(`Key pressed: ${e.code}, Game phase: ${gamePhase}`);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gamePhase, toggleMute]);
  
  return null;
}

// Define key mappings
const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.interact, keys: ['KeyE', 'Space'] },
];

export default function GameControls({ children }: { children?: React.ReactNode }) {
  return (
    <KeyboardControls map={keyMap}>
      <KeyboardControlsImplementation />
      {children}
      {/* Add MobileControls component for touch devices */}
      <MobileControls />
    </KeyboardControls>
  );
}
