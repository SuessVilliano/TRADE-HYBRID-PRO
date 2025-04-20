import * as React from 'react';
import { useState } from 'react';
import { useUserPreferences, TabConfig } from '../../lib/stores/useUserPreferences';
import { Button } from './button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Label } from './label';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

interface BottomNavCustomizerProps {
  trigger: React.ReactNode;
}

export function BottomNavCustomizer({ trigger }: BottomNavCustomizerProps) {
  // Get tabs and preferences from user preferences
  const { 
    bottomNavTabs, 
    toggleBottomNavTab, 
    reorderBottomNavTabs, 
    resetPreferences,
    showBottomNav,
    toggleShowBottomNav,
    setBottomNavTabs
  } = useUserPreferences();
  
  // State for edit dialog
  const [isEditing, setIsEditing] = useState(false);
  const [editableTabs, setEditableTabs] = useState<TabConfig[]>([]);
  const [showNavBar, setShowNavBar] = useState(showBottomNav);
  
  // Open edit dialog
  const handleOpenEditDialog = () => {
    setEditableTabs([...bottomNavTabs].sort((a, b) => a.order - b.order));
    setShowNavBar(showBottomNav);
    setIsEditing(true);
  };
  
  // Toggle tab visibility
  const handleToggleTab = (tabId: string) => {
    setEditableTabs(tabs => {
      // Count currently active tabs
      const activeTabCount = tabs.filter(t => t.active).length;
      const tab = tabs.find(t => t.id === tabId);
      
      // If trying to activate a tab but we already have 4 active ones, don't allow it
      if (!tab?.active && activeTabCount >= 4) {
        // We could show a toast or alert here about the 4 tab limit
        return tabs;
      }
      
      return tabs.map(tab => tab.id === tabId ? { ...tab, active: !tab.active } : tab);
    });
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
  
  // Toggle bottom nav visibility
  const handleToggleBottomNavVisibility = () => {
    setShowNavBar(!showNavBar);
  };
  
  // Save changes
  const handleSaveChanges = () => {
    // Update bottom nav visibility if changed
    if (showNavBar !== showBottomNav) {
      toggleShowBottomNav();
    }

    // Approach 1: Directly set all tabs at once to avoid race conditions
    setBottomNavTabs(editableTabs);
    
    // Approach 2 (fallback): Update each tab individually
    // This can sometimes lead to race conditions when multiple tabs are changed
    /* 
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
    */
    
    setIsEditing(false);
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    resetPreferences();
    setIsEditing(false);
  };

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogTrigger asChild onClick={handleOpenEditDialog}>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Navigation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Global bottom nav toggle */}
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/20 border mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Show Bottom Navigation</span>
            </div>
            <Switch 
              checked={showNavBar} 
              onCheckedChange={handleToggleBottomNavVisibility}
            />
          </div>
            
          <Tabs defaultValue="tabs">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="tabs">Tabs</TabsTrigger>
              <TabsTrigger value="order">Order</TabsTrigger>
            </TabsList>
            
            {/* Tab visibility settings */}
            <TabsContent value="tabs" className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm mb-2">
                You can enable up to 4 tabs to appear in the bottom navigation.
              </div>
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
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm mb-2">
                Only the first 4 active tabs will appear in the bottom navigation.
              </div>
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
                                ${tab.active ? (index < 4 ? 'bg-background border-blue-300' : 'bg-background') : 'bg-muted/40 text-muted-foreground'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {getIcon(tab.icon)}
                                <span>{tab.label}</span>
                                {tab.active && index < 4 && <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded ml-2">Visible</span>}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Label className={`text-xs ${tab.active ? '' : 'text-muted-foreground'}`}>
                                  {tab.active ? (index < 4 ? 'Showing' : 'Hidden (>4)') : 'Hidden'}
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
                Drag and drop to reorder tabs. Only the first 4 active tabs will appear in the navigation bar.
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
  );
}