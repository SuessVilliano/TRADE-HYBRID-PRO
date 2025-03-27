import React from 'react';
import { Text } from '@react-three/drei';
import { UserStatus } from '@/lib/services/multiplayer-service';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';

interface UserStatusIndicatorProps {
  userId: string;
  position: [number, number, number];
}

export default function UserStatusIndicator({ userId, position }: UserStatusIndicatorProps) {
  const { getUserStatus } = useMultiplayer();
  const status = getUserStatus(userId);
  
  if (!status || status.status === 'online') {
    return null; // Don't show anything if online (default state)
  }
  
  // Position the status indicator above the player model
  const statusPosition: [number, number, number] = [
    position[0],
    position[1] + 2.2, // Adjust based on player model height
    position[2]
  ];
  
  let statusColor = '';
  switch (status.status) {
    case 'away':
      statusColor = '#FFD700'; // Gold
      break;
    case 'busy':
      statusColor = '#FF6347'; // Tomato
      break;
    case 'offline':
      statusColor = '#808080'; // Gray
      break;
    default:
      statusColor = '#4CAF50'; // Green
  }
  
  return (
    <Text
      position={statusPosition}
      fontSize={0.3}
      color={statusColor}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.01}
      outlineColor="#000000"
    >
      {status.status.toUpperCase()}
    </Text>
  );
}