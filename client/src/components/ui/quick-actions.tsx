import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Link as LinkIcon, 
  BarChart4, 
  Zap,
  ArrowRight 
} from 'lucide-react';
import { Button } from './button';
import { ConnectBrokerModal } from '../broker/connect-broker-modal';

interface QuickActionsProps {
  collapsed: boolean;
  className?: string;
}

export function QuickActions({ collapsed, className = '' }: QuickActionsProps) {
  const navigate = useNavigate();
  
  // Handle broker connection
  const handleConnectBroker = async (brokerId: string, credentials: Record<string, string>) => {
    console.log('Connecting to broker:', brokerId, credentials);
    // In a real implementation, we would call the API to connect the broker
    return Promise.resolve();
  };

  // If the sidebar is collapsed, we'll show just icons
  if (collapsed) {
    return (
      <div className={`p-2 space-y-2 ${className}`}>
        <Button
          variant="outline"
          size="icon"
          className="w-full h-8 text-blue-500 border-blue-500/50 hover:bg-blue-500/10"
          onClick={() => navigate('/trading-dashboard/custom')}
          title="Smart Trade"
        >
          <Sparkles size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="w-full h-8 border-slate-700 hover:bg-slate-800/60"
          onClick={() => navigate('/broker-connections')}
          title="Connect Broker"
        >
          <LinkIcon size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="w-full h-8 border-slate-700 hover:bg-slate-800/60"
          onClick={() => navigate('/market-overview')}
          title="Market Overview"
        >
          <BarChart4 size={16} />
        </Button>
      </div>
    );
  }
  
  // Full sidebar view
  return (
    <div className={`p-2 space-y-2 ${className}`}>
      <h3 className="text-xs font-medium text-slate-400 px-2 mb-1">QUICK ACTIONS</h3>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-blue-500 border-blue-500/50 hover:bg-blue-500/10"
        onClick={() => navigate('/trading-dashboard/custom')}
      >
        <Sparkles size={16} />
        <span>Smart Trade</span>
      </Button>
      
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 border-slate-700 hover:bg-slate-800/60"
          onClick={() => navigate('/broker-connections')}
        >
          <LinkIcon size={16} />
          <span>Connect Broker</span>
        </Button>
        <ConnectBrokerModal onConnect={handleConnectBroker} />
      </div>
      
      <div className="px-2 py-2">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-slate-400 p-0 h-auto flex items-center"
          onClick={() => navigate('/portfolio-dashboard')}
        >
          View all tools
          <ArrowRight size={12} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}