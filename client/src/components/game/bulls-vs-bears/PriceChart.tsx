import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePriceStore } from './priceStore';

// Props for the PriceChart component
interface PriceChartProps {
  position: [number, number, number];
  scale?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}

// 3D visualization of price chart
export function PriceChart({ 
  position, 
  scale = [1, 1, 1],
  width = 10, 
  height = 5, 
  depth = 0.2 
}: PriceChartProps) {
  // References to meshes for animation
  const chartRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  
  // Get price data from the store
  const { prices, marketTrend } = usePriceStore();
  
  // Create the price line geometry
  useEffect(() => {
    if (!lineRef.current || prices.length < 2) return;
    
    // Create points for the line based on prices
    const points: THREE.Vector3[] = [];
    const maxPrice = Math.max(...prices.map(p => p.price));
    const minPrice = Math.min(...prices.map(p => p.price));
    const priceRange = maxPrice - minPrice || 1;
    
    // Normalize the price data to fit the chart
    prices.forEach((price, index) => {
      const x = (index / (prices.length - 1)) * width - width / 2;
      const y = ((price.price - minPrice) / priceRange) * height - height / 2;
      points.push(new THREE.Vector3(x, y, 0));
    });
    
    // Create and update the line geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    lineRef.current.geometry.dispose();
    lineRef.current.geometry = geometry;
    
  }, [prices, width, height]);
  
  // Animate the chart
  useFrame(({ clock }) => {
    if (chartRef.current) {
      // Subtle floating animation
      chartRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // Determine the chart color based on market trend
  const chartColor = marketTrend === 'bullish' ? '#4caf50' : 
                     marketTrend === 'bearish' ? '#f44336' : 
                     '#9e9e9e';
  
  return (
    <group ref={chartRef} position={position} scale={scale}>
      {/* Chart background panel */}
      <mesh position={[0, 0, -depth/2]} receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#1e1e1e" transparent opacity={0.8} />
      </mesh>
      
      {/* Price line */}
      <line ref={lineRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color={chartColor} linewidth={2} />
      </line>
      
      {/* Chart border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#555555" />
      </lineSegments>
      
      {/* X axis */}
      <mesh position={[0, -height/2 + 0.1, 0.01]}>
        <boxGeometry args={[width, 0.05, 0.01]} />
        <meshBasicMaterial color="#555555" />
      </mesh>
      
      {/* Y axis */}
      <mesh position={[-width/2 + 0.1, 0, 0.01]}>
        <boxGeometry args={[0.05, height, 0.01]} />
        <meshBasicMaterial color="#555555" />
      </mesh>
    </group>
  );
}