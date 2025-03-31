// Export all SDK components and hooks
export * from './config';
export * from './SpatialSDK';
export * from './useSpatialSDK';
export * from './MetaverseObjects';

// Export default objects where needed
import { SpatialSDK } from './SpatialSDK';
import { SPATIAL_CONFIG } from './config';

export { SpatialSDK, SPATIAL_CONFIG };