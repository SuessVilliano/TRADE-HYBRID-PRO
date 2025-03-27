import React, { useEffect, useState } from 'react';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import * as THREE from 'three';

interface UserStatusIndicatorProps {
  userId: string;
  position?: [number, number, number];
}

export default function UserStatusIndicator({ userId, position = [0, 2.8, 0] }: UserStatusIndicatorProps) {
  const { getUserStatus } = useMultiplayer();
  const [statusColor, setStatusColor] = useState<string>('#10b981'); // Default to online/green
  
  // Get user status and set appropriate color
  useEffect(() => {
    const status = getUserStatus(userId);
    
    if (!status) {
      console.log(`No status found for user ${userId}, defaulting to online`);
      setStatusColor('#10b981'); // green for online
      return;
    }
    
    console.log(`User ${userId} status: ${status.status}`);
    
    switch (status.status) {
      case 'online':
        setStatusColor('#10b981'); // green
        break;
      case 'away':
        setStatusColor('#f59e0b'); // yellow/amber
        break;
      case 'busy':
        setStatusColor('#ef4444'); // red
        break;
      case 'offline':
        setStatusColor('#6b7280'); // gray
        break;
      default:
        setStatusColor('#10b981'); // default green
    }
  }, [userId, getUserStatus]);
  
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial 
        color={statusColor} 
        emissive={statusColor} 
        emissiveIntensity={0.8} 
      />
    </mesh>
  );
}