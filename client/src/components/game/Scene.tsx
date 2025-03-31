import React, { Suspense } from 'react';
import * as THREE from 'three';

// Import our new Spatial Metaverse component
import SpatialMetaverse from '../spatial/SpatialMetaverse';
import { Interface } from '../ui/interface';

interface SceneProps {
  showStats?: boolean;
  spatialUrl?: string;
}

export default function Scene({ 
  showStats = true,
  spatialUrl = 'https://www.spatial.io/s/tradehybrids-Hi-Fi-Meetup-67ead44037f57e72f6fcaed5?share=93452074553144377'
}: SceneProps) {
  return (
    <div className="relative w-full h-screen">
      {/* Spatial Metaverse integration replaces the custom THREE.js implementation */}
      <div className="w-full h-full">
        <SpatialMetaverse 
          spatialUrl={spatialUrl}
          fullWidth={true}
          autoEnterVR={false}
        />
      </div>
      
      {/* UI Overlay */}
      <Interface />
      
      {/* Debug Info - initially shown but fades out after 10 seconds */}
      <div className="absolute bottom-0 left-0 m-2 p-2 bg-black/80 text-white text-xs rounded animate-fade-in-out">
        <div>Trading Metaverse v0.3 - Spatial Edition</div>
        <div>Powered by Spatial.io</div>
        <div className="font-bold">Navigate using the Spatial controls</div>
        <div className="text-gray-300 mt-1 text-[10px]">This help box will disappear shortly</div>
      </div>
    </div>
  );
}