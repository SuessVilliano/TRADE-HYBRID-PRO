import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetHeader,
  SheetTitle
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Settings,
  LayoutDashboard,
  LineChart,
  BrainCircuit,
  Bot,
  MessageCircle,
  Wallet,
  Book,
  Globe,
  Signal,
  BarChart2,
  Zap,
  Bell,
  FileText,
  BarChart4,
  PlusCircle,
  Link as LinkIcon
} from 'lucide-react';

// Define tool interfaces
interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  path?: string;
}

// Define the props for the component
interface HamburgerMenuProps {
  onToolSelect?: (toolId: string) => void;
}

export function HamburgerMenu({ onToolSelect }: HamburgerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Define available tools and their default states
  const [tools, setTools] = useState<Tool[]>([
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} />, enabled: true, path: '/trading-dashboard/custom' },
    { id: 'trade', name: 'Trade', icon: <LineChart size={18} />, enabled: true, path: '/trading-dashboard/custom' },
    { id: 'ai_analysis', name: 'AI Analysis', icon: <BrainCircuit size={18} />, enabled: true, path: '/ai-analysis' },
    { id: 'trading_bots', name: 'Trading Bots', icon: <Bot size={18} />, enabled: true, path: '/trading-bots' },
    { id: 'ai_chat', name: 'AI Chat', icon: <MessageCircle size={18} />, enabled: true, path: '/ai-assistant' },
    { id: 'market_data', name: 'Market Data', icon: <BarChart2 size={18} />, enabled: true, path: '/market-overview' },
    { id: 'portfolio', name: 'Portfolio', icon: <Wallet size={18} />, enabled: true, path: '/portfolio-dashboard' },
    { id: 'signals', name: 'Signals', icon: <Signal size={18} />, enabled: true, path: '/signals' },
    { id: 'journal', name: 'Trade Journal', icon: <FileText size={18} />, enabled: true, path: '/journal' },
    { id: 'broker', name: 'Broker Connections', icon: <LinkIcon size={18} />, enabled: true, path: '/broker-connections' },
    { id: 'learning', name: 'Learning Center', icon: <Book size={18} />, enabled: false, path: '/learning-center/courses' },
    { id: 'news', name: 'News', icon: <Globe size={18} />, enabled: false, path: '/news' },
    { id: 'alerts', name: 'Alerts', icon: <Bell size={18} />, enabled: false, path: '/alerts' }
  ]);
  
  // Quick action tools for the bottom bar
  const [quickTools, setQuickTools] = useState<Tool[]>([
    { id: 'quick_dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} />, enabled: true },
    { id: 'quick_journal', name: 'Journal', icon: <FileText size={16} />, enabled: true },
    { id: 'quick_analysis', name: 'Analysis', icon: <BarChart4 size={16} />, enabled: true },
    { id: 'quick_add', name: 'Add Trade', icon: <PlusCircle size={16} />, enabled: true },
    { id: 'quick_signals', name: 'Signals', icon: <Bell size={16} />, enabled: true },
    { id: 'quick_broker', name: 'Connect', icon: <LinkIcon size={16} />, enabled: true }
  ]);

  // Load saved tool preferences
  useEffect(() => {
    const savedTools = localStorage.getItem('tradeHybridMobileTools');
    const savedQuickTools = localStorage.getItem('tradeHybridQuickTools');
    
    if (savedTools) {
      try {
        const parsedTools = JSON.parse(savedTools);
        setTools(tools.map(tool => ({
          ...tool,
          enabled: parsedTools.find((t: Tool) => t.id === tool.id)?.enabled ?? tool.enabled
        })));
      } catch (error) {
        console.error('Error parsing saved tools:', error);
      }
    }
    
    if (savedQuickTools) {
      try {
        const parsedQuickTools = JSON.parse(savedQuickTools);
        setQuickTools(quickTools.map(tool => ({
          ...tool,
          enabled: parsedQuickTools.find((t: Tool) => t.id === tool.id)?.enabled ?? tool.enabled
        })));
      } catch (error) {
        console.error('Error parsing saved quick tools:', error);
      }
    }
  }, []);

  // Save tool preferences when they change
  useEffect(() => {
    localStorage.setItem('tradeHybridMobileTools', JSON.stringify(tools));
  }, [tools]);
  
  useEffect(() => {
    localStorage.setItem('tradeHybridQuickTools', JSON.stringify(quickTools));
  }, [quickTools]);

  // Toggle tool enabled state
  const toggleTool = (id: string) => {
    setTools(tools.map(tool => 
      tool.id === id ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };
  
  // Toggle quick tool enabled state
  const toggleQuickTool = (id: string) => {
    setQuickTools(quickTools.map(tool => 
      tool.id === id ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };

  // Handle navigation
  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
      setOpen(false);
    }
  };
  
  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/images/trade_hybrid_logo.png" 
                alt="Trade Hybrid" 
                className="h-8 w-auto object-contain" 
              />
              <SheetTitle className="text-xl">Trade Hybrid</SheetTitle>
            </div>
            
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between"
            onClick={() => setShowSettings(!showSettings)}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Customize Tools
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          {showSettings ? (
            <div className="p-4">
              <h3 className="font-medium text-sm mb-3">Visible Tools</h3>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        {tool.icon}
                      </div>
                      <Label htmlFor={`toggle-${tool.id}`} className="text-sm">
                        {tool.name}
                      </Label>
                    </div>
                    <Switch 
                      id={`toggle-${tool.id}`} 
                      checked={tool.enabled}
                      onCheckedChange={() => toggleTool(tool.id)}
                    />
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
              <div className="space-y-3">
                {quickTools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        {tool.icon}
                      </div>
                      <Label htmlFor={`toggle-${tool.id}`} className="text-sm">
                        {tool.name}
                      </Label>
                    </div>
                    <Switch 
                      id={`toggle-${tool.id}`} 
                      checked={tool.enabled}
                      onCheckedChange={() => toggleQuickTool(tool.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2">
              {tools
                .filter(tool => tool.enabled)
                .map((tool) => (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start mb-1 px-3 py-2",
                      isActive(tool.path || '') && "bg-slate-800"
                    )}
                    onClick={() => handleNavigation(tool.path)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-slate-400">{tool.icon}</div>
                      <span>{tool.name}</span>
                    </div>
                    {tool.id === 'signals' && (
                      <Badge className="ml-auto bg-blue-600 text-xs py-0">3</Badge>
                    )}
                  </Button>
                ))
              }
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            Account Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}