import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Monitor, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Grid3X3, 
  LayoutGrid,
  ExternalLink,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Plus,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TradingPlatform {
  id: number;
  name: string;
  platformType: string;
  webTradeUrl: string;
  authType: string;
  isConnected: boolean;
  credentials?: any;
}

interface TradingTab {
  id: string;
  platformId: number;
  platformName: string;
  url: string;
  title: string;
  isActive: boolean;
}

interface WorkspaceLayout {
  id: string;
  name: string;
  tabs: TradingTab[];
  layout: 'single' | 'split-horizontal' | 'split-vertical' | 'grid-2x2';
}

const UnifiedTradingDashboard: React.FC = () => {
  const [platforms, setPlatforms] = useState<TradingPlatform[]>([]);
  const [tradingTabs, setTradingTabs] = useState<TradingTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [workspaceLayout, setWorkspaceLayout] = useState<'single' | 'split-horizontal' | 'split-vertical' | 'grid-2x2'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedWorkspaces, setSavedWorkspaces] = useState<WorkspaceLayout[]>([]);

  useEffect(() => {
    fetchPlatforms();
    loadSavedWorkspaces();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/trading-platforms/platforms');
      const data = await response.json();
      const connectionsResponse = await fetch('/api/trading-platforms/connections');
      const connectionsData = await connectionsResponse.json();
      
      const platformsWithConnections = data.platforms?.map((platform: any) => {
        const connection = connectionsData.connections?.find((conn: any) => 
          conn.platform?.id === platform.id
        );
        return {
          ...platform,
          isConnected: connection?.connection?.isConnected || false,
          credentials: connection?.connection?.credentials
        };
      }) || [];
      
      setPlatforms(platformsWithConnections);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const loadSavedWorkspaces = () => {
    const saved = localStorage.getItem('tradingWorkspaces');
    if (saved) {
      setSavedWorkspaces(JSON.parse(saved));
    }
  };

  const saveWorkspace = (name: string) => {
    const workspace: WorkspaceLayout = {
      id: `workspace-${Date.now()}`,
      name,
      tabs: tradingTabs,
      layout: workspaceLayout
    };
    
    const updated = [...savedWorkspaces, workspace];
    setSavedWorkspaces(updated);
    localStorage.setItem('tradingWorkspaces', JSON.stringify(updated));
  };

  const loadWorkspace = (workspace: WorkspaceLayout) => {
    setTradingTabs(workspace.tabs);
    setWorkspaceLayout(workspace.layout);
    if (workspace.tabs.length > 0) {
      setActiveTabId(workspace.tabs[0].id);
    }
  };

  const openPlatform = (platform: TradingPlatform) => {
    const newTab: TradingTab = {
      id: `tab-${Date.now()}`,
      platformId: platform.id,
      platformName: platform.name,
      url: platform.webTradeUrl,
      title: platform.name,
      isActive: true
    };

    // Deactivate other tabs
    const updatedTabs = tradingTabs.map(tab => ({ ...tab, isActive: false }));
    const newTabs = [...updatedTabs, newTab];
    
    setTradingTabs(newTabs);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    const filtered = tradingTabs.filter(tab => tab.id !== tabId);
    setTradingTabs(filtered);
    
    if (activeTabId === tabId && filtered.length > 0) {
      setActiveTabId(filtered[0].id);
    } else if (filtered.length === 0) {
      setActiveTabId(null);
    }
  };

  const switchToTab = (tabId: string) => {
    setActiveTabId(tabId);
    setTradingTabs(tabs => tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const renderTradingInterface = () => {
    if (tradingTabs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg">
          <Monitor className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Trading Platforms Open</h3>
          <p className="text-muted-foreground text-center mb-6">
            Select a trading platform to start trading
          </p>
          <div className="flex gap-2">
            {platforms.filter(p => p.isConnected).map(platform => (
              <Button
                key={platform.id}
                onClick={() => openPlatform(platform)}
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open {platform.name}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    const activeTabs = tradingTabs.filter(tab => tab.isActive || workspaceLayout !== 'single');

    return (
      <div className={`h-full ${getLayoutClass()}`}>
        {activeTabs.map((tab, index) => (
          <div key={tab.id} className="h-full border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-2 bg-muted border-b">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{tab.platformName}</Badge>
                <span className="text-sm font-medium">{tab.title}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Refresh iframe
                    const iframe = document.getElementById(`iframe-${tab.id}`) as HTMLIFrameElement;
                    if (iframe) iframe.src = iframe.src;
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeTab(tab.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <iframe
              id={`iframe-${tab.id}`}
              src={tab.url}
              className="w-full h-[calc(100%-50px)]"
              frameBorder="0"
              allow="fullscreen"
              title={`${tab.platformName} Trading Platform`}
            />
          </div>
        ))}
      </div>
    );
  };

  const getLayoutClass = () => {
    switch (workspaceLayout) {
      case 'split-horizontal':
        return 'grid grid-cols-1 grid-rows-2 gap-2';
      case 'split-vertical':
        return 'grid grid-cols-2 grid-rows-1 gap-2';
      case 'grid-2x2':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      default:
        return 'grid grid-cols-1 grid-rows-1';
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-screen'} flex flex-col`}>
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Unified Trading Dashboard</h1>
          
          {/* Platform Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Platform
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {platforms.filter(p => p.isConnected).map(platform => (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => openPlatform(platform)}
                >
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    {platform.name}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Controls */}
          <div className="flex gap-1">
            <Button
              variant={workspaceLayout === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWorkspaceLayout('single')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={workspaceLayout === 'split-vertical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWorkspaceLayout('split-vertical')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={workspaceLayout === 'split-horizontal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWorkspaceLayout('split-horizontal')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={workspaceLayout === 'grid-2x2' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWorkspaceLayout('grid-2x2')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace Selector */}
          {savedWorkspaces.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Workspaces
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {savedWorkspaces.map(workspace => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => loadWorkspace(workspace)}
                  >
                    {workspace.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const name = prompt('Enter workspace name:');
              if (name) saveWorkspace(name);
            }}
          >
            Save Workspace
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      {tradingTabs.length > 0 && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
          {tradingTabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTabId === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => switchToTab(tab.id)}
              className="relative"
            >
              {tab.platformName}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-2 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Button>
          ))}
        </div>
      )}

      {/* Trading Interface */}
      <div className="flex-1 p-4">
        {renderTradingInterface()}
      </div>

      {/* Connected Platforms Status */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/20">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Connected Platforms:</span>
          {platforms.map(platform => (
            <div key={platform.id} className="flex items-center gap-1">
              {platform.isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span>{platform.name}</span>
            </div>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Layout: {workspaceLayout} | Tabs: {tradingTabs.length}
        </div>
      </div>
    </div>
  );
};

export default UnifiedTradingDashboard;