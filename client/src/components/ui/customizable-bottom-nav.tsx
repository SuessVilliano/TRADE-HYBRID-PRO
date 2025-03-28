import React, { useState } from 'react';
import { useUserPreferences, TabConfig } from '@/lib/stores/useUserPreferences';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, X, Plus, Settings, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

// Define type for dynamic icon component
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Map of all available icons
const iconMap: Record<string, IconComponent> = Icons;

interface CustomizableBottomNavProps {
  className?: string;
}

export function CustomizableBottomNav({ className = '' }: CustomizableBottomNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get tabs from user preferences
  const { bottomNavTabs, toggleBottomNavTab, reorderBottomNavTabs, resetPreferences } = useUserPreferences();
  
  // Filter tabs to only show active ones and sort by order
  const visibleTabs = bottomNavTabs
    .filter(t => t.active)
    .sort((a, b) => a.order - b.order);
  
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
  
  // Dynamic icon component
  const getIcon = (iconName: string) => {
    // Fallback to 'Circle' if icon not found
    const IconComponent = iconMap[iconName] || iconMap['Circle'];
    return <IconComponent className="h-5 w-5" />;
  };
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {/* Visible tabs */}
        {visibleTabs.map((tab) => (
          <Link 
            key={tab.id} 
            to={`/${tab.id === 'trading' ? 'trading-space' : tab.id}`}
            className={`flex flex-col items-center justify-center flex-1 p-2 rounded-md transition-colors
              ${currentPath.includes(tab.id) || (tab.id === 'trading' && currentPath.includes('trading-space')) 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
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
              className="flex flex-col items-center justify-center flex-1 p-2 rounded-md"
              onClick={handleOpenEditDialog}
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