import React from 'react';
import SpatialMetaverse from '../components/spatial/SpatialMetaverse';

/**
 * Metaverse trading environment page
 * This page now implements both options for metaverse viewing:
 * 1. Spatial.io embedded environment (primary)
 * 2. Local React Three Fiber environment (fallback)
 */
const MetaversePage: React.FC = () => {
  // The default URL for the Spatial metaverse
  const SPATIAL_URL = 'https://www.spatial.io/s/tradehybrids-Hi-Fi-Meetup-67ead44037f57e72f6fcaed5?share=93452074553144377';
  
  return (
    <div className="metaverse-page w-full h-screen">
      <div className="w-full h-full">
        <SpatialMetaverse 
          spatialUrl={SPATIAL_URL}
          fullWidth={true}
          autoEnterVR={false}
        />
      </div>
    </div>
  );
};

export default MetaversePage;