import { Canvas } from "@react-three/fiber";
import { Stats, Sky } from "@react-three/drei";
import { Suspense } from "react";
import Lights from "./Lights";
import Floor from "./Floor";
import Player from "./Player";
import GameControls from "./Controls";
import TradeHouse from "./TradeHouse";
import TradingStation from "./TradingStation";

interface SceneProps {
  showStats?: boolean;
}

export default function Scene({ showStats = false }: SceneProps) {
  return (
    <GameControls>
      <Canvas
        shadows
        camera={{
          position: [0, 5, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "default"
        }}
      >
        {showStats && <Stats />}
        
        {/* Sky provides a nice background */}
        <Sky sunPosition={[100, 20, 100]} />
        
        {/* Environment lighting */}
        <Lights />
        
        <Suspense fallback={null}>
          {/* Ground plane */}
          <Floor />
          
          {/* Player character */}
          <Player />
          
          {/* Trading House */}
          <TradeHouse position={[8, 0, -10]} rotation={[0, -Math.PI / 4, 0]} />
          
          {/* Trading Stations */}
          <TradingStation 
            position={[-6, 0, -8]} 
            rotation={[0, Math.PI / 6, 0]} 
            type="crypto" 
          />
          <TradingStation 
            position={[3, 0, -5]} 
            rotation={[0, -Math.PI / 8, 0]} 
            type="stocks" 
          />
          <TradingStation 
            position={[-3, 0, 2]} 
            rotation={[0, Math.PI / 3, 0]} 
            type="forex" 
          />
        </Suspense>
      </Canvas>
    </GameControls>
  );
}
