import React, { useEffect } from 'react';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import OtherPlayer from './OtherPlayer';

export default function OtherPlayers() {
  const { getAllPlayers, getClientId } = useMultiplayer();
  const players = getAllPlayers();
  const clientId = getClientId();
  
  // Debug output
  useEffect(() => {
    console.log("OtherPlayers component mounted");
    console.log(`Number of other players: ${players.filter(p => p.id !== clientId).length}`);
    return () => console.log("OtherPlayers component unmounted");
  }, [players, clientId]);
  
  // Only render players that aren't the current client
  return (
    <>
      {players
        .filter(player => player.id !== clientId)
        .map(player => (
          <OtherPlayer 
            key={player.id} 
            player={player}
            onInteract={() => {
              console.log(`Interacted with player ${player.username}`);
            }}
          />
        ))
      }
    </>
  );
}