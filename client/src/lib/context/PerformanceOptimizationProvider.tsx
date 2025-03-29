import React, { createContext, useContext, useState, useEffect } from 'react';
import { debounce } from 'lodash';

// Performance settings interface
export interface PerformanceSettings {
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  antiAliasing: boolean;
  maxFPS: number;
  drawDistance: number;
  particleEffects: 'off' | 'minimal' | 'full';
  postProcessing: boolean;
  reflections: boolean;
  enableSSR: boolean;
  enableSSAO: boolean;
  enableBloom: boolean;
  textureResolution: 'low' | 'medium' | 'high';
  meshDetail: 'low' | 'medium' | 'high';
  dynamicLighting: boolean;
  vsync: boolean;
}

// Device capability detection results
export interface DeviceCapabilities {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  gpuTier: 'low' | 'medium' | 'high' | 'unknown';
  isWebGLSupported: boolean;
  isWebGL2Supported: boolean;
  maxTextureSize: number;
  maxRenderTargets: number;
  screenResolution: { width: number, height: number };
  devicePixelRatio: number;
  isLowPowerMode: boolean;
  isHighEndDevice: boolean;
  hasLimitedMemory: boolean;
  connection: {
    type: string;
    downlinkSpeed: number;
    rtt: number;
  };
}

// Performance metrics
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  cpuTime: number;
  gpuTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangleCount: number;
  lastUpdated: number;
}

// Preset configurations for different device capabilities
const PERFORMANCE_PRESETS: Record<string, Partial<PerformanceSettings>> = {
  ultra: {
    renderQuality: 'ultra',
    shadowQuality: 'high',
    antiAliasing: true,
    maxFPS: 144,
    drawDistance: 1000,
    particleEffects: 'full',
    postProcessing: true,
    reflections: true,
    enableSSR: true,
    enableSSAO: true,
    enableBloom: true,
    textureResolution: 'high',
    meshDetail: 'high',
    dynamicLighting: true,
    vsync: true
  },
  high: {
    renderQuality: 'high',
    shadowQuality: 'medium',
    antiAliasing: true,
    maxFPS: 120,
    drawDistance: 750,
    particleEffects: 'full',
    postProcessing: true,
    reflections: true,
    enableSSR: false,
    enableSSAO: true,
    enableBloom: true,
    textureResolution: 'high',
    meshDetail: 'high',
    dynamicLighting: true,
    vsync: true
  },
  medium: {
    renderQuality: 'medium',
    shadowQuality: 'low',
    antiAliasing: true,
    maxFPS: 60,
    drawDistance: 500,
    particleEffects: 'minimal',
    postProcessing: false,
    reflections: false,
    enableSSR: false,
    enableSSAO: false,
    enableBloom: true,
    textureResolution: 'medium',
    meshDetail: 'medium',
    dynamicLighting: true,
    vsync: true
  },
  low: {
    renderQuality: 'low',
    shadowQuality: 'off',
    antiAliasing: false,
    maxFPS: 30,
    drawDistance: 300,
    particleEffects: 'off',
    postProcessing: false,
    reflections: false,
    enableSSR: false,
    enableSSAO: false,
    enableBloom: false,
    textureResolution: 'low',
    meshDetail: 'low',
    dynamicLighting: false,
    vsync: true
  },
  mobile: {
    renderQuality: 'low',
    shadowQuality: 'off',
    antiAliasing: false,
    maxFPS: 30,
    drawDistance: 200,
    particleEffects: 'off',
    postProcessing: false,
    reflections: false,
    enableSSR: false,
    enableSSAO: false,
    enableBloom: false,
    textureResolution: 'low',
    meshDetail: 'low',
    dynamicLighting: false,
    vsync: false
  }
};

// Default performance settings
const DEFAULT_SETTINGS: PerformanceSettings = {
  renderQuality: 'medium',
  shadowQuality: 'medium',
  antiAliasing: true,
  maxFPS: 60,
  drawDistance: 500,
  particleEffects: 'minimal',
  postProcessing: false,
  reflections: false,
  enableSSR: false,
  enableSSAO: false,
  enableBloom: true,
  textureResolution: 'medium',
  meshDetail: 'medium',
  dynamicLighting: true,
  vsync: true
};

// Default device capabilities
const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  deviceType: 'unknown',
  gpuTier: 'unknown',
  isWebGLSupported: false,
  isWebGL2Supported: false,
  maxTextureSize: 0,
  maxRenderTargets: 0,
  screenResolution: { width: 0, height: 0 },
  devicePixelRatio: 1,
  isLowPowerMode: false,
  isHighEndDevice: false,
  hasLimitedMemory: false,
  connection: {
    type: 'unknown',
    downlinkSpeed: 0,
    rtt: 0
  }
};

// Default performance metrics
const DEFAULT_METRICS: PerformanceMetrics = {
  fps: 0,
  frameTime: 0,
  cpuTime: 0,
  gpuTime: 0,
  memoryUsage: 0,
  drawCalls: 0,
  triangleCount: 0,
  lastUpdated: 0
};

// Context for performance optimization
interface PerformanceOptimizationContextType {
  settings: PerformanceSettings;
  capabilities: DeviceCapabilities;
  metrics: PerformanceMetrics;
  isAutoOptimizeEnabled: boolean;
  isPerformanceMonitoringEnabled: boolean;
  updateSettings: (newSettings: Partial<PerformanceSettings>) => void;
  applyPreset: (preset: 'ultra' | 'high' | 'medium' | 'low' | 'mobile') => void;
  resetToDefaults: () => void;
  toggleAutoOptimize: () => void;
  togglePerformanceMonitoring: () => void;
  updateMetrics: (newMetrics: Partial<PerformanceMetrics>) => void;
}

// Create the context
const PerformanceOptimizationContext = createContext<PerformanceOptimizationContextType | undefined>(undefined);

// Provider component
export const PerformanceOptimizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for settings, capabilities, and metrics
  const [settings, setSettings] = useState<PerformanceSettings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('performanceSettings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });
  
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(DEFAULT_METRICS);
  const [isAutoOptimizeEnabled, setIsAutoOptimizeEnabled] = useState(true);
  const [isPerformanceMonitoringEnabled, setIsPerformanceMonitoringEnabled] = useState(false);
  
  // Detect device capabilities on mount
  useEffect(() => {
    const detectCapabilities = () => {
      if (typeof window === 'undefined') return;
      
      // Detect device type
      const userAgent = navigator.userAgent.toLowerCase();
      let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
      
      if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        deviceType = /ipad/i.test(userAgent) ? 'tablet' : 'mobile';
      } else {
        deviceType = 'desktop';
      }
      
      // Detect WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const gl2 = canvas.getContext('webgl2');
      
      const isWebGLSupported = !!gl;
      const isWebGL2Supported = !!gl2;
      
      // Get max texture size
      let maxTextureSize = 0;
      if (gl) {
        maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      }
      
      // Get max render targets
      let maxRenderTargets = 0;
      if (gl2) {
        maxRenderTargets = gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
      } else if (gl) {
        const ext = gl.getExtension('WEBGL_draw_buffers');
        if (ext) {
          maxRenderTargets = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
        }
      }
      
      // Get screen resolution and pixel ratio
      const screenResolution = {
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio
      };
      
      // Detect low power mode (heuristic)
      const isLowPowerMode = deviceType === 'mobile' && window.devicePixelRatio < 3;
      
      // Detect high-end device (heuristic)
      const isHighEndDevice = 
        deviceType === 'desktop' && 
        isWebGL2Supported && 
        maxTextureSize >= 16384 && 
        maxRenderTargets >= 8;
      
      // Detect limited memory (heuristic)
      const hasLimitedMemory = deviceType === 'mobile' || navigator.hardwareConcurrency < 4;
      
      // Network information
      let connection = {
        type: 'unknown',
        downlinkSpeed: 0,
        rtt: 0
      };
      
      if ((navigator as any).connection) {
        const conn = (navigator as any).connection;
        connection = {
          type: conn.effectiveType || 'unknown',
          downlinkSpeed: conn.downlink || 0,
          rtt: conn.rtt || 0
        };
      }
      
      // Determine GPU tier based on collected information
      let gpuTier: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
      
      if (!isWebGLSupported) {
        gpuTier = 'low';
      } else if (isWebGL2Supported && maxTextureSize >= 8192) {
        gpuTier = isHighEndDevice ? 'high' : 'medium';
      } else {
        gpuTier = 'low';
      }
      
      setCapabilities({
        deviceType,
        gpuTier,
        isWebGLSupported,
        isWebGL2Supported,
        maxTextureSize,
        maxRenderTargets,
        screenResolution,
        devicePixelRatio: window.devicePixelRatio,
        isLowPowerMode,
        isHighEndDevice,
        hasLimitedMemory,
        connection
      });
    };
    
    detectCapabilities();
    
    // Redetect on resize
    const handleResize = debounce(() => {
      detectCapabilities();
    }, 300);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Auto-optimize based on detected capabilities
  useEffect(() => {
    if (isAutoOptimizeEnabled && capabilities.gpuTier !== 'unknown') {
      let preset: 'ultra' | 'high' | 'medium' | 'low' | 'mobile';
      
      if (capabilities.deviceType === 'mobile') {
        preset = 'mobile';
      } else if (capabilities.gpuTier === 'high' && capabilities.isHighEndDevice) {
        preset = 'high';
      } else if (capabilities.gpuTier === 'medium') {
        preset = 'medium';
      } else {
        preset = 'low';
      }
      
      // Apply the preset
      setSettings(prev => ({
        ...prev,
        ...PERFORMANCE_PRESETS[preset]
      }));
    }
  }, [capabilities, isAutoOptimizeEnabled]);
  
  // Save settings to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('performanceSettings', JSON.stringify(settings));
    }
  }, [settings]);
  
  // Update settings
  const updateSettings = (newSettings: Partial<PerformanceSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  // Apply preset
  const applyPreset = (preset: 'ultra' | 'high' | 'medium' | 'low' | 'mobile') => {
    setSettings(prev => ({
      ...prev,
      ...PERFORMANCE_PRESETS[preset]
    }));
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };
  
  // Toggle auto-optimize
  const toggleAutoOptimize = () => {
    setIsAutoOptimizeEnabled(prev => !prev);
  };
  
  // Toggle performance monitoring
  const togglePerformanceMonitoring = () => {
    setIsPerformanceMonitoringEnabled(prev => !prev);
  };
  
  // Update metrics
  const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics,
      lastUpdated: Date.now()
    }));
  };
  
  // Context value
  const contextValue: PerformanceOptimizationContextType = {
    settings,
    capabilities,
    metrics,
    isAutoOptimizeEnabled,
    isPerformanceMonitoringEnabled,
    updateSettings,
    applyPreset,
    resetToDefaults,
    toggleAutoOptimize,
    togglePerformanceMonitoring,
    updateMetrics
  };
  
  return (
    <PerformanceOptimizationContext.Provider value={contextValue}>
      {children}
    </PerformanceOptimizationContext.Provider>
  );
};

// Custom hook to use the context
export const usePerformanceOptimization = (): PerformanceOptimizationContextType => {
  const context = useContext(PerformanceOptimizationContext);
  if (context === undefined) {
    throw new Error('usePerformanceOptimization must be used within a PerformanceOptimizationProvider');
  }
  return context;
};

// Hook for monitoring performance metrics in three.js/react-three-fiber
export const usePerformanceMonitoring = () => {
  const { updateMetrics, isPerformanceMonitoringEnabled } = usePerformanceOptimization();
  
  // Use this hook in 3D scenes to monitor performance
  const startMonitoring = (threeStats: any, r3fStats: any) => {
    if (!isPerformanceMonitoringEnabled) return;
    
    // Update metrics every second
    const intervalId = setInterval(() => {
      if (threeStats && r3fStats) {
        updateMetrics({
          fps: threeStats.fps.value,
          frameTime: threeStats.render.value,
          drawCalls: r3fStats.render?.calls || 0,
          triangleCount: r3fStats.render?.triangles || 0,
          memoryUsage: r3fStats.memory?.geometries || 0
        });
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  };
  
  return { startMonitoring };
};

// Performance settings component for UI
export const PerformanceSettingsPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { 
    settings, 
    capabilities, 
    metrics, 
    isAutoOptimizeEnabled, 
    isPerformanceMonitoringEnabled,
    updateSettings,
    applyPreset,
    resetToDefaults,
    toggleAutoOptimize,
    togglePerformanceMonitoring
  } = usePerformanceOptimization();
  
  return (
    <div className={`bg-slate-900 rounded-lg p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Performance Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Device Information</h3>
          <div className="bg-slate-800 rounded-md p-3 text-xs space-y-1">
            <div>Device Type: <span className="text-purple-400">{capabilities.deviceType}</span></div>
            <div>GPU Tier: <span className="text-purple-400">{capabilities.gpuTier}</span></div>
            <div>WebGL2 Support: <span className="text-purple-400">{capabilities.isWebGL2Supported ? 'Yes' : 'No'}</span></div>
            <div>Screen Resolution: <span className="text-purple-400">{capabilities.screenResolution.width}x{capabilities.screenResolution.height}</span></div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
          <div className="bg-slate-800 rounded-md p-3 text-xs space-y-1">
            <div>FPS: <span className="text-purple-400">{metrics.fps.toFixed(1)}</span></div>
            <div>Frame Time: <span className="text-purple-400">{metrics.frameTime.toFixed(2)} ms</span></div>
            <div>Draw Calls: <span className="text-purple-400">{metrics.drawCalls}</span></div>
            <div>Triangle Count: <span className="text-purple-400">{metrics.triangleCount}</span></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Quality Preset</label>
          <div className="flex space-x-2">
            {(['ultra', 'high', 'medium', 'low', 'mobile'] as const).map((preset) => (
              <button
                key={preset}
                className={`px-3 py-1 text-xs rounded-md ${
                  JSON.stringify(settings) === JSON.stringify({...DEFAULT_SETTINGS, ...PERFORMANCE_PRESETS[preset]})
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
                onClick={() => applyPreset(preset)}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Render Quality</label>
            <select
              value={settings.renderQuality}
              onChange={(e) => updateSettings({ renderQuality: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Shadow Quality</label>
            <select
              value={settings.shadowQuality}
              onChange={(e) => updateSettings({ shadowQuality: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
            >
              <option value="off">Off</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Anti-Aliasing</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.antiAliasing}
                onChange={(e) => updateSettings({ antiAliasing: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Max FPS</label>
            <input
              type="range"
              min="15"
              max="144"
              step="15"
              value={settings.maxFPS}
              onChange={(e) => updateSettings({ maxFPS: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-right">{settings.maxFPS} FPS</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Draw Distance</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={settings.drawDistance}
              onChange={(e) => updateSettings({ drawDistance: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-right">{settings.drawDistance} units</div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Particle Effects</label>
            <select
              value={settings.particleEffects}
              onChange={(e) => updateSettings({ particleEffects: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
            >
              <option value="off">Off</option>
              <option value="minimal">Minimal</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Post Processing</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.postProcessing}
                onChange={(e) => updateSettings({ postProcessing: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Reflections</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.reflections}
                onChange={(e) => updateSettings({ reflections: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Dynamic Lighting</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.dynamicLighting}
                onChange={(e) => updateSettings({ dynamicLighting: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-800 pt-4">
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAutoOptimizeEnabled}
              onChange={toggleAutoOptimize}
              className="mr-2"
            />
            <span className="text-sm">Auto-Optimize</span>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isPerformanceMonitoringEnabled}
              onChange={togglePerformanceMonitoring}
              className="mr-2"
            />
            <span className="text-sm">Performance Monitoring</span>
          </div>
          
          <button
            onClick={resetToDefaults}
            className="px-3 py-1 text-xs bg-slate-800 rounded-md hover:bg-slate-700"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};