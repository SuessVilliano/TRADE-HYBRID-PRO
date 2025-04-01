import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

/**
 * Trading Environment component - places trading-related objects in the scene
 */
const TradingEnvironment: React.FC = () => {
  // Load models
  const { scene: tradingDeskModel } = useGLTF('/models/trading_desk.glb');
  const { scene: tradingFloorModel } = useGLTF('/models/trading_floor.glb');
  const { scene: marketDisplayModel } = useGLTF('/models/market_display.glb');
  const { scene: tradingBoardModel } = useGLTF('/models/trading_board.glb');
  const { scene: bullModel } = useGLTF('/models/bull_mascot.glb');
  const { scene: bearModel } = useGLTF('/models/bear_mascot.glb');
  
  // Function to create a physics-enabled model instance
  const createModelInstance = (
    model: THREE.Group, 
    position: [number, number, number], 
    rotation: [number, number, number] = [0, 0, 0],
    scale: number = 1,
    isStatic: boolean = true,
    withPhysics: boolean = true
  ) => {
    // Clone the model to avoid issues with multiple uses
    const clonedModel = model.clone();
    
    // Apply shadows for all meshes in the model
    clonedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Use physics for static objects
    if (withPhysics) {
      const [ref] = useBox(() => ({
        type: isStatic ? 'Static' : 'Dynamic',
        position,
        rotation,
        args: [2 * scale, 2 * scale, 2 * scale], // Simple box collision
      }));
      
      return (
        <group ref={ref} key={`model-${position.join('-')}`}>
          <primitive 
            object={clonedModel} 
            scale={[scale, scale, scale]} 
          />
        </group>
      );
    }
    
    // No physics version
    return (
      <group position={position} rotation={rotation as any} key={`model-${position.join('-')}`}>
        <primitive 
          object={clonedModel} 
          scale={[scale, scale, scale]} 
        />
      </group>
    );
  };
  
  // Trading desks - position them around the area
  const tradingDesks = [
    { position: [10, 0, 10], rotation: [0, Math.PI / 4, 0], scale: 1.2 },
    { position: [15, 0, 5], rotation: [0, -Math.PI / 3, 0], scale: 1.2 },
    { position: [5, 0, 15], rotation: [0, Math.PI / 6, 0], scale: 1.2 },
    { position: [-10, 0, 10], rotation: [0, -Math.PI / 2, 0], scale: 1.2 },
    { position: [-15, 0, -5], rotation: [0, Math.PI / 4, 0], scale: 1.2 },
  ];
  
  // Market displays - place them on walls/elevated positions
  const marketDisplays = [
    { position: [0, 5, -20], rotation: [0, 0, 0], scale: 2 },
    { position: [20, 5, 0], rotation: [0, -Math.PI / 2, 0], scale: 2 },
    { position: [-20, 5, 0], rotation: [0, Math.PI / 2, 0], scale: 2 },
  ];
  
  // Trading floor central area
  const tradingFloor = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 3 };
  
  // Bull and Bear mascots - symbolic of market sentiment
  const mascots = [
    { model: bullModel, position: [15, 0, 15], rotation: [0, -Math.PI / 4, 0], scale: 1.5 },
    { model: bearModel, position: [-15, 0, 15], rotation: [0, Math.PI / 4, 0], scale: 1.5 },
  ];
  
  // Main trading board - central feature with market data
  const tradingBoard = { position: [0, 7, -15], rotation: [0, 0, 0], scale: 2.5 };
  
  return (
    <group>
      {/* Central trading floor */}
      {createModelInstance(
        tradingFloorModel,
        tradingFloor.position as [number, number, number],
        tradingFloor.rotation as [number, number, number],
        tradingFloor.scale,
        true,
        false // No physics for the floor as we already have a terrain
      )}
      
      {/* Trading desks */}
      {tradingDesks.map((desk, index) => 
        createModelInstance(
          tradingDeskModel,
          desk.position as [number, number, number],
          desk.rotation as [number, number, number],
          desk.scale,
          true
        )
      )}
      
      {/* Market displays */}
      {marketDisplays.map((display, index) => 
        createModelInstance(
          marketDisplayModel,
          display.position as [number, number, number],
          display.rotation as [number, number, number],
          display.scale,
          true
        )
      )}
      
      {/* Main trading board */}
      {createModelInstance(
        tradingBoardModel,
        tradingBoard.position as [number, number, number],
        tradingBoard.rotation as [number, number, number],
        tradingBoard.scale,
        true
      )}
      
      {/* Bull and Bear mascots */}
      {mascots.map((mascot, index) => 
        createModelInstance(
          mascot.model,
          mascot.position as [number, number, number],
          mascot.rotation as [number, number, number],
          mascot.scale,
          false // Make them dynamic
        )
      )}
    </group>
  );
};

// Preload all models
useGLTF.preload('/models/trading_desk.glb');
useGLTF.preload('/models/trading_floor.glb');
useGLTF.preload('/models/market_display.glb');
useGLTF.preload('/models/trading_board.glb');
useGLTF.preload('/models/bull_mascot.glb');
useGLTF.preload('/models/bear_mascot.glb');

export default TradingEnvironment;