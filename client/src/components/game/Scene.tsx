import { Canvas } from "@react-three/fiber";
import { Stats, Sky, PerspectiveCamera, OrbitControls, Stars, PointerLockControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import Lights from "./Lights";
import Floor from "./Floor";
import Player from "./Player";
import GameControls from "./Controls";
import TradeHouse from "./TradeHouse";
import TradingStation from "./TradingStation";
import SignalBoard from "./SignalBoard";
import WebAppTrigger from "./WebAppTrigger";
import { Vector3 } from 'three';

interface SceneProps {
  showStats?: boolean;
}

const MOVEMENT_SPEED = 0.15;
const direction = new Vector3();
const frontVector = new Vector3();
const sideVector = new Vector3();

export default function Scene({ showStats = false }: SceneProps) {
  const controls = useRef<any>(null);
  const movement = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') movement.current.forward = true;
      if (e.code === 'KeyS') movement.current.backward = true;
      if (e.code === 'KeyA') movement.current.left = true;
      if (e.code === 'KeyD') movement.current.right = true;
      if (e.shiftKey) movement.current.sprint = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') movement.current.forward = false;
      if (e.code === 'KeyS') movement.current.backward = false;
      if (e.code === 'KeyA') movement.current.left = false;
      if (e.code === 'KeyD') movement.current.right = false;
      if (!e.shiftKey) movement.current.sprint = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state) => {
    if (controls.current) {
      const speedMultiplier = movement.current.sprint ? 2 : 1;

      frontVector.set(0, 0, Number(movement.current.backward) - Number(movement.current.forward));
      sideVector.set(Number(movement.current.left) - Number(movement.current.right), 0, 0);

      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(MOVEMENT_SPEED * speedMultiplier);

      controls.current.moveRight(-direction.x);
      controls.current.moveForward(-direction.z);
    }
  });

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        onContextLost={(event) => {
          event.preventDefault();
          window.location.reload();
        }}
        onContextRestored={() => {
          console.log("WebGL context restored");
        }}
        shadows
        camera={{
          position: [0, 5, 15],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "default"
        }}
      >
        {showStats && <Stats />}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <OrbitControls />
        <Stars />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Lights />
          <Floor />
          <Player />
          <PerspectiveCamera makeDefault position={[0, 2, 5]} />
          <PointerLockControls ref={controls} />

          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>

          <TradeHouse position={[8, 0, -10]} rotation={[0, -Math.PI / 4, 0]} />
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
          <SignalBoard
            position={[0, 2, -15]}
            rotation={[0, 0, 0]}
          />
          <WebAppTrigger
            position={[-5, 0, -12]}
            rotation={[0, 30, 0]}
            scale={[1.2, 1.2, 1.2]}
            url="https://app.tradehybrid.co"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}