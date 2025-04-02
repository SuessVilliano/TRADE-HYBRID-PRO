/**
 * Spatial configuration for the Trade Hybrid metaverse
 */

export interface SpatialArea {
  name: string;
  description: string;
  position: [number, number, number]; // x, y, z coordinates
  rotation: [number, number, number]; // rotation in degrees
}

export interface SpatialConfig {
  areas: Record<string, SpatialArea>;
}

export const SPATIAL_CONFIG: SpatialConfig = {
  areas: {
    reception: {
      name: "Reception Lobby",
      description: "Welcome to the Trade Hybrid metaverse. This is the main reception area where you can get information and navigate to other areas.",
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    tradingFloor: {
      name: "Trading Floor",
      description: "The main trading floor with live market data, charts, and indicators. Connect with traders and watch the markets in real-time.",
      position: [10, 0, 10],
      rotation: [0, 0, 0]
    },
    hybridHoldings: {
      name: "Hybrid Holdings",
      description: "View your portfolio, NFT holdings, and THC token balance in an immersive 3D environment.",
      position: [-10, 0, 10],
      rotation: [0, 90, 0]
    },
    streamingStudio: {
      name: "Streaming Studio",
      description: "Join live trading sessions, educational workshops, and community events with Trade Hybrid experts.",
      position: [0, 0, 20],
      rotation: [0, 180, 0]
    },
    merchStore: {
      name: "Merch Store",
      description: "Browse and purchase Trade Hybrid merchandise, educational content, and exclusive digital assets.",
      position: [20, 0, 0],
      rotation: [0, -90, 0]
    },
    eventSpace: {
      name: "Event Space",
      description: "A flexible space for conferences, trading competitions, and special events within the metaverse.",
      position: [0, 10, 0],
      rotation: [0, 0, 0]
    }
  }
};

// Default spatial room URL
export const DEFAULT_SPATIAL_URL = 'https://www.spatial.io/s/tradehybrids-Hi-Fi-Meetup-67ead44037f57e72f6fcaed5?share=93452074553144377';