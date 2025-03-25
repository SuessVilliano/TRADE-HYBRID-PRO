import { Canvas } from "@react-three/fiber";
import { Stats, Sky } from "@react-three/drei";
import { Suspense } from "react";
import Lights from "./Lights";
import Floor from "./Floor";
import Player from "./Player";
import GameControls from "./Controls";
import TradeHouse from "./TradeHouse";
import TradingStation from "./TradingStation";
import SignalBoard from "./SignalBoard";
import WebAppTrigger from "./WebAppTrigger";

interface SceneProps {
  showStats?: boolean;
}

export default function Scene({ showStats = false }: SceneProps) {
  return (
    <GameControls>
      <Canvas
        onContextLost={(event) => {
          event.preventDefault();
          // Force refresh when context is lost
          window.location.reload();
        }}
        onContextRestored={() => {
          console.log("WebGL context restored");
        }}
        shadows
        camera={{
          position: [0, 8, 15],
          fov: 70,
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

          {/* Signals Board */}
          <SignalBoard
            position={[0, 2, -15]}
            rotation={[0, 0, 0]}
          />

          {/* Web App Trigger */}
          <WebAppTrigger
            position={[-5, 0, -12]}
            rotation={[0, 30, 0]}
            scale={[1.2, 1.2, 1.2]}
            url="https://app.tradehybrid.co"
          />
        </Suspense>
      </Canvas>
    </GameControls>
  );
}