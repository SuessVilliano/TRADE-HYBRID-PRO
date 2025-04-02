import * as React from 'react';
import { useState } from 'react';
import { useUserPreferences, TabConfig } from '../../lib/stores/useUserPreferences';
import { Button } from './button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Label } from './label';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link, useLocation } from 'react-router-dom';

// Import only the icons we need directly
import {
  Home,
  LineChart,
  FileText,
  BookOpen,
  BarChart,
  Brain,
  Settings,
  User,
  Users,
  Sparkles,
  Link2,
  Dices,
  Bell,
  Activity,
  BarChart3,
  Gamepad2,
  Store,
  Share2,
  Circle,
  GripVertical,
  X,
  Check,
} from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

// Create a simple mapping of icon names to components
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Home': return <Home className="h-5 w-5" />;
    case 'LineChart': return <LineChart className="h-5 w-5" />;
    case 'FileText': return <FileText className="h-5 w-5" />;
    case 'BookOpen': return <BookOpen className="h-5 w-5" />;
    case 'BarChart': return <BarChart className="h-5 w-5" />;
    case 'Brain': return <Brain className="h-5 w-5" />;
    case 'Settings': return <Settings className="h-5 w-5" />;
    case 'User': return <User className="h-5 w-5" />;
    case 'Users': return <Users className="h-5 w-5" />;
    case 'Sparkles': return <Sparkles className="h-5 w-5" />;
    case 'Link': return <Link2 className="h-5 w-5" />;
    case 'Dices': return <Dices className="h-5 w-5" />;
    case 'Bell': return <Bell className="h-5 w-5" />;
    case 'Activity': return <Activity className="h-5 w-5" />;
    case 'BarChart3': return <BarChart3 className="h-5 w-5" />;
    case 'Gamepad2': return <Gamepad2 className="h-5 w-5" />;
    case 'Store': return <Store className="h-5 w-5" />;
    case 'Share2': return <Share2 className="h-5 w-5" />;
    default: return <Circle className="h-5 w-5" />;
  }
};

export function BottomNav({ className = '' }: BottomNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get tabs from user preferences
  const { bottomNavTabs, toggleBottomNavTab, reorderBottomNavTabs, resetPreferences } = useUserPreferences();
  
  // Filter tabs to only show active ones and sort by order
  const visibleTabs = React.useMemo(() => {
    return bottomNavTabs
      .filter(t => t.active)
      .sort((a, b) => a.order - b.order);
  }, [bottomNavTabs]);
  
  // State for edit dialog
  const [isEditing, setIsEditing] = useState(false);
  const [editableTabs, setEditableTabs] = useState<TabConfig[]>([]);
  
  // Open edit dialog
  const handleOpenEditDialog = () => {
    setEditableTabs([...bottomNavTabs].sort((a, b) => a.order - b.order));
    setIsEditing(true);
  };
  
  // Toggle tab visibility
  const handleToggleTab = (tabId: string) => {
    setEditableTabs(tabs => 
      tabs.map(tab => tab.id === tabId ? { ...tab, active: !tab.active } : tab)
    );
  };
  
  // Reorder tabs with drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    const newTabs = [...editableTabs];
    const [movedTab] = newTabs.splice(source.index, 1);
    newTabs.splice(destination.index, 0, movedTab);
    
    // Update order property
    const reorderedTabs = newTabs.map((tab, index) => ({
      ...tab,
      order: index
    }));
    
    setEditableTabs(reorderedTabs);
  };
  
  // Save changes
  const handleSaveChanges = () => {
    // Update each tab in the user preferences store
    editableTabs.forEach(tab => {
      // Toggle tab if active state changed
      if (tab.active !== bottomNavTabs.find(t => t.id === tab.id)?.active) {
        toggleBottomNavTab(tab.id);
      }
      
      // Reorder tab if order changed
      if (tab.order !== bottomNavTabs.find(t => t.id === tab.id)?.order) {
        reorderBottomNavTabs(tab.id, tab.order);
      }
    });
    
    setIsEditing(false);
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    resetPreferences();
    setIsEditing(false);
  };
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {/* Visible tabs */}
        {visibleTabs.map((tab) => (
          <Link 
            key={tab.id} 
            to={`/${
              tab.id === 'trading' ? 'trading-space' : 
              tab.id === 'journal' ? 'trade-journal' : 
              tab.id === 'connect-broker' ? 'broker-connections' :
              tab.id === 'smart-trade' ? 'trading-ai' :
              tab.id
            }`}
            className={`flex flex-col items-center justify-center flex-1 p-2 rounded-md transition-colors
              ${
                currentPath.includes(tab.id) || 
                (tab.id === 'trading' && currentPath.includes('trading-space')) ||
                (tab.id === 'journal' && currentPath.includes('trade-journal')) ||
                (tab.id === 'connect-broker' && currentPath.includes('broker-connections')) ||
                (tab.id === 'smart-trade' && currentPath.includes('trading-ai'))
                ? 'text-primary bg-primary/10 active:scale-90 active:opacity-70' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent active:scale-90 active:opacity-70'
              }`}
            onClick={(e) => {
              // Add visible feedback on press
              const element = e.currentTarget;
              element.classList.add('scale-95', 'opacity-80');
              setTimeout(() => {
                element.classList.remove('scale-95', 'opacity-80');
              }, 150);
            }}
          >
            {getIcon(tab.icon)}
            <span className="text-xs mt-1">{tab.label}</span>
          </Link>
        ))}
        
        {/* Settings button */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex flex-col items-center justify-center flex-1 p-2 rounded-md active:scale-90 active:opacity-70"
              onClick={(e) => {
                // Add visible feedback on press
                const element = e.currentTarget;
                element.classList.add('scale-95', 'opacity-80');
                setTimeout(() => {
                  element.classList.remove('scale-95', 'opacity-80');
                  handleOpenEditDialog();
                }, 150);
              }}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Customize</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Navigation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <Tabs defaultValue="tabs">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="tabs">Tabs</TabsTrigger>
                  <TabsTrigger value="order">Order</TabsTrigger>
                </TabsList>
                
                {/* Tab visibility settings */}
                <TabsContent value="tabs" className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {editableTabs.map((tab) => (
                      <div key={tab.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          {getIcon(tab.icon)}
                          <span>{tab.label}</span>
                        </div>
                        <Switch 
                          checked={tab.active} 
                          onCheckedChange={() => handleToggleTab(tab.id)} 
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Tab ordering */}
                <TabsContent value="order" className="space-y-4">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="tabs">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {editableTabs.map((tab, index) => (
                            <Draggable 
                              key={tab.id} 
                              draggableId={tab.id} 
                              index={index}
                              isDragDisabled={!tab.active}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center justify-between p-2 border rounded-md 
                                    ${tab.active ? 'bg-background' : 'bg-muted/40 text-muted-foreground'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    {getIcon(tab.icon)}
                                    <span>{tab.label}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Label className={`text-xs ${tab.active ? '' : 'text-muted-foreground'}`}>
                                      {tab.active ? 'Visible' : 'Hidden'}
                                    </Label>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop to reorder visible tabs. Hidden tabs won't appear in the navigation bar.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleResetToDefaults}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={handleSaveChanges}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}