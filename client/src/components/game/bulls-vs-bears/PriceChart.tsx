import React, { useMemo, useRef } from 'react';
import { usePriceStore } from './priceStore';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface PriceChartProps {
  position: [number, number, number];
  scale?: [number, number, number];
}

// 3D price chart visualization
export function PriceChart({ position, scale = [10, 5, 1] }: PriceChartProps) {
  const { prices, currentPrice, marketTrend } = usePriceStore();
  const chartRef = useRef<THREE.Group>(null);
  
  // Get chart color based on market trend
  const chartColor = useMemo(() => {
    switch (marketTrend) {
      case 'bullish':
        return new THREE.Color('#4caf50'); // Green
      case 'bearish':
        return new THREE.Color('#f44336'); // Red
      default:
        return new THREE.Color('#2196f3'); // Blue
    }
  }, [marketTrend]);
  
  // Generate points for price line
  const points = useMemo(() => {
    if (prices.length < 2) return [];
    
    // Get min and max for scaling
    const allPrices = prices.map(p => p.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    
    // Create normalized points along width
    return prices.map((point, index) => {
      // X position is normalized between -1 and 1 for the chart width
      const x = (index / (prices.length - 1)) * 2 - 1;
      
      // Y position is normalized between -1 and 1 for the chart height
      // Add small buffer (0.1) at top and bottom for visual spacing
      const normalizedPrice = priceRange > 0 
        ? (point.price - minPrice) / priceRange
        : 0.5;
      const y = (normalizedPrice * 0.8) + 0.1;
      
      return new THREE.Vector3(x, y * 2 - 1, 0);
    });
  }, [prices]);
  
  // Create the price line
  const priceLine = useMemo(() => {
    if (points.length < 2) return null;
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    return (
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: chartColor, linewidth: 2 })
      )} />
    );
  }, [points, chartColor]);
  
  // Calculate percentage change for price display
  const percentChange = useMemo(() => {
    if (prices.length < 2) return 0;
    
    const firstPrice = prices[0].price;
    const lastPrice = prices[prices.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }, [prices]);
  
  const changeColor = percentChange >= 0 ? '#4caf50' : '#f44336';
  
  return (
    <group position={position} scale={scale} ref={chartRef}>
      {/* Chart background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#0a1929" transparent opacity={0.7} />
      </mesh>
      
      {/* Price line */}
      {priceLine}
      
      {/* Current price text */}
      <group position={[0, 1.1, 0]}>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          THC: ${currentPrice.toFixed(2)}
        </Text>
        
        <Text
          position={[0, -0.2, 0.1]}
          fontSize={0.1}
          color={changeColor}
          anchorX="center"
          anchorY="middle"
        >
          {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
        </Text>
      </group>
      
      {/* Chart grid lines */}
      <group position={[0, 0, 0.05]}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((y) => {
          const points = [
            new THREE.Vector3(-1, y * 2 - 1, 0),
            new THREE.Vector3(1, y * 2 - 1, 0)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: "#2a3f5f", 
            transparent: true, 
            opacity: 0.3 
          });
          
          return (
            <primitive 
              key={`h-line-${y}`} 
              object={new THREE.Line(geometry, material)} 
            />
          );
        })}
        
        {/* Vertical grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((x) => {
          const points = [
            new THREE.Vector3(x * 2 - 1, -1, 0),
            new THREE.Vector3(x * 2 - 1, 1, 0)
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: "#2a3f5f", 
            transparent: true, 
            opacity: 0.3 
          });
          
          return (
            <primitive 
              key={`v-line-${x}`} 
              object={new THREE.Line(geometry, material)} 
            />
          );
        })}
      </group>
    </group>
  );
}