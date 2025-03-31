import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/hooks/useTheme';

export interface MatrixNode {
  id: string;
  level: number;
  position: number;
  parentId: string | null;
  userId: string;
  username: string;
  joinedAt: Date;
  coinType: 'bitcoin' | 'ethereum' | 'solana' | 'tether' | 'binance';
  isActive: boolean;
  referrals: number;
  earnings: number;
  status: 'active' | 'pending' | 'inactive';
}

export interface MatrixVisualizationProps {
  nodes: MatrixNode[];
  maxLevel: number;
  onNodeClick?: (node: MatrixNode) => void;
  selectedNodeId?: string;
  animate?: boolean;
}

const coinImages = {
  bitcoin: '/assets/coins/bitcoin.svg',
  ethereum: '/assets/coins/ethereum.svg',
  solana: '/assets/coins/solana.svg',
  tether: '/assets/coins/tether.svg',
  binance: '/assets/coins/binance.svg',
};

const MatrixVisualization: React.FC<MatrixVisualizationProps> = ({
  nodes,
  maxLevel = 3,
  onNodeClick,
  selectedNodeId,
  animate = true,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeLines, setActiveLines] = useState<string[]>([]);
  const [explodingCoin, setExplodingCoin] = useState<{
    id: string;
    coinType: 'bitcoin' | 'ethereum' | 'solana' | 'tether' | 'binance';
    x: number;
    y: number;
  } | null>(null);
  
  // Colors based on theme
  const colors = useMemo(() => ({
    background: isDarkTheme ? '#1a1b26' : '#f4f6f8',
    nodeBackground: isDarkTheme ? '#24283b' : '#ffffff',
    nodeBorder: isDarkTheme ? '#414868' : '#e2e8f0',
    activeBorder: isDarkTheme ? '#7aa2f7' : '#3b82f6',
    nodeText: isDarkTheme ? '#c0caf5' : '#1e293b',
    lineDefault: isDarkTheme ? '#414868' : '#cbd5e1',
    lineActive: isDarkTheme ? '#7aa2f7' : '#3b82f6',
    statusActive: '#10b981',
    statusPending: '#f59e0b',
    statusInactive: isDarkTheme ? '#414868' : '#94a3b8',
  }), [isDarkTheme]);

  // Group nodes by level
  const nodesByLevel = useMemo(() => {
    const grouped: Record<number, MatrixNode[]> = {};
    
    for (let i = 1; i <= maxLevel; i++) {
      grouped[i] = nodes.filter(node => node.level === i);
    }
    
    return grouped;
  }, [nodes, maxLevel]);
  
  // Calculate node positions and connections
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const levelWidths: Record<number, number> = {
      1: 400,
      2: 600,
      3: 800,
    };
    
    Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
      const numLevel = parseInt(level);
      const width = levelWidths[numLevel] || 800;
      const nodeCount = Math.max(levelNodes.length, 1);
      const spacing = width / nodeCount;
      
      levelNodes.forEach((node, index) => {
        const x = spacing * (index + 0.5);
        const y = 120 * numLevel;
        positions[node.id] = { x, y };
      });
    });
    
    return positions;
  }, [nodesByLevel]);
  
  // Calculate connections between nodes
  const connections = useMemo(() => {
    const lines: Array<{
      id: string;
      from: string;
      to: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];
    
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId);
        if (parent && nodePositions[parent.id] && nodePositions[node.id]) {
          lines.push({
            id: `${parent.id}-${node.id}`,
            from: parent.id,
            to: node.id,
            x1: nodePositions[parent.id].x,
            y1: nodePositions[parent.id].y + 25, // bottom of parent node
            x2: nodePositions[node.id].x,
            y2: nodePositions[node.id].y - 25, // top of child node
          });
        }
      }
    });
    
    return lines;
  }, [nodes, nodePositions]);

  // Effect to update active lines when hovering or selecting a node
  useEffect(() => {
    const updateActiveLines = () => {
      const activeNodeId = hoverNode || selectedNodeId;
      if (!activeNodeId) {
        setActiveLines([]);
        return;
      }

      // Find all connections to and from this node
      const newActiveLines = connections
        .filter(conn => conn.from === activeNodeId || conn.to === activeNodeId)
        .map(conn => conn.id);
      
      setActiveLines(newActiveLines);
    };

    updateActiveLines();
  }, [hoverNode, selectedNodeId, connections]);

  // Handle node mouse over
  const handleNodeMouseOver = useCallback((node: MatrixNode) => {
    setHoverNode(node.id);
    
    // Create exploding coin effect
    if (animate) {
      const nodePos = nodePositions[node.id];
      if (nodePos) {
        setExplodingCoin({
          id: `${node.id}-${Date.now()}`,
          coinType: node.coinType,
          x: nodePos.x,
          y: nodePos.y,
        });
      }
    }
  }, [nodePositions, animate]);
  
  // Handle node mouse out
  const handleNodeMouseOut = useCallback(() => {
    setHoverNode(null);
  }, []);
  
  // Function to get node border color based on status
  const getNodeBorderColor = useCallback((node: MatrixNode) => {
    if (node.id === selectedNodeId) {
      return colors.activeBorder;
    }
    
    if (node.status === 'active') {
      return colors.statusActive;
    } else if (node.status === 'pending') {
      return colors.statusPending;
    } else {
      return colors.statusInactive;
    }
  }, [selectedNodeId, colors]);

  return (
    <div className="w-full overflow-auto bg-transparent" style={{ minHeight: '600px' }}>
      <div className="relative w-full h-full" style={{ minWidth: '800px', minHeight: '450px' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 450" 
          className="absolute top-0 left-0"
          style={{ zIndex: 1 }}
        >
          {/* Render connection lines */}
          {connections.map(conn => (
            <line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={activeLines.includes(conn.id) ? colors.lineActive : colors.lineDefault}
              strokeWidth={activeLines.includes(conn.id) ? 2 : 1}
              strokeDasharray={activeLines.includes(conn.id) ? "none" : "5,5"}
            />
          ))}
        </svg>
        
        {/* Render nodes */}
        <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 2 }}>
          {Object.entries(nodesByLevel).map(([level, levelNodes]) => (
            <div key={`level-${level}`} className="absolute w-full">
              {levelNodes.map(node => {
                const position = nodePositions[node.id];
                if (!position) return null;
                
                return (
                  <div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: position.x,
                      top: position.y,
                    }}
                    onMouseOver={() => handleNodeMouseOver(node)}
                    onMouseOut={handleNodeMouseOut}
                    onClick={() => onNodeClick?.(node)}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform ${
                        node.id === selectedNodeId ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: colors.nodeBackground,
                        border: `3px solid ${getNodeBorderColor(node)}`,
                        boxShadow: node.id === selectedNodeId || node.id === hoverNode
                          ? `0 0 10px ${getNodeBorderColor(node)}`
                          : 'none',
                      }}
                    >
                      <div className="relative flex flex-col items-center justify-center w-full h-full">
                        <img 
                          src={coinImages[node.coinType]} 
                          alt={node.coinType}
                          className="w-8 h-8"
                        />
                        <div 
                          className="absolute -bottom-8 text-xs whitespace-nowrap font-medium"
                          style={{ color: colors.nodeText }}
                        >
                          {node.username}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Exploding coin animation */}
        <AnimatePresence>
          {explodingCoin && animate && (
            <div 
              className="absolute"
              style={{ 
                left: explodingCoin.x, 
                top: explodingCoin.y, 
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={`coin-${explodingCoin.id}-${i}`}
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
                  initial={{ 
                    scale: 0.2, 
                    opacity: 0.8,
                    x: 0,
                    y: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    scale: 0,
                    opacity: 0,
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotate: Math.random() * 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1
                  }}
                  onAnimationComplete={() => {
                    if (i === 4) {
                      setExplodingCoin(null);
                    }
                  }}
                >
                  <img 
                    src={coinImages[explodingCoin.coinType]} 
                    alt={explodingCoin.coinType}
                    className="w-full h-full"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MatrixVisualization;