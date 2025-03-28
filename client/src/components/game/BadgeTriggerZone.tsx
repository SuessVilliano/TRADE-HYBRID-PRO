import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { badgeService } from '@/lib/services/badge-service';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';

interface BadgeTriggerZoneProps {
  locationId: string;
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  pulseEffect?: boolean;
  visible?: boolean;
  onLocationVisited?: (locationId: string) => void;
}

export default function BadgeTriggerZone({
  locationId,
  position,
  size = [5, 3, 5],
  color = '#44EEFF',
  pulseEffect = true,
  visible = true,
  onLocationVisited
}: BadgeTriggerZoneProps) {
  const [playerInZone, setPlayerInZone] = useState(false);
  const [visited, setVisited] = useState(false);
  const [opacity, setOpacity] = useState(0.15);
  const { getClientId, getPlayer } = useMultiplayer();
  
  // Reference to track last position check to avoid checking every frame
  const lastCheck = React.useRef(0);
  
  // Create a box to represent the zone
  const zoneBox = React.useMemo(() => {
    return new THREE.Box3(
      new THREE.Vector3(
        position[0] - size[0] / 2,
        position[1] - size[1] / 2,
        position[2] - size[2] / 2
      ),
      new THREE.Vector3(
        position[0] + size[0] / 2,
        position[1] + size[1] / 2,
        position[2] + size[2] / 2
      )
    );
  }, [position, size]);
  
  // Check if the player is in the zone
  useFrame(({ clock }) => {
    // Only check every 500ms to avoid performance issues
    if (clock.getElapsedTime() - lastCheck.current < 0.5) return;
    
    // Update the last check time
    lastCheck.current = clock.getElapsedTime();
    
    // If already visited, no need to check
    if (visited) return;
    
    // Get the player's position
    const clientId = getClientId();
    if (!clientId) return;
    
    const player = getPlayer(clientId);
    if (!player) return;
    
    // Create a point for the player's position
    const playerPoint = new THREE.Vector3(...player.position);
    
    // Check if the player is in the zone
    const isInZone = zoneBox.containsPoint(playerPoint);
    
    // Only update if the state has changed
    if (isInZone !== playerInZone) {
      setPlayerInZone(isInZone);
    }
    
    // If player is in the zone and hasn't visited yet, mark as visited
    if (isInZone && !visited) {
      setVisited(true);
      badgeService.recordLocationVisit(locationId);
      onLocationVisited && onLocationVisited(locationId);
    }
    
    // Pulse effect
    if (pulseEffect) {
      const pulseValue = Math.sin(clock.getElapsedTime() * 2) * 0.05 + 0.15;
      setOpacity(pulseValue);
    }
  });
  
  // No need to render if not visible
  if (!visible) return null;
  
  return (
    <mesh position={position} visible={!visited || visible}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}