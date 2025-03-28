import { useState } from "react";
import { useUserPreferences, TabId } from "@/lib/stores/useUserPreferences";
import { 
  BarChart2, Newspaper, Activity, BookOpen, Award, 
  Bot, Bell, Copy, Coins, BrainCircuit, Zap, 
  Settings, Check, X, MoveHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomizableBottomNavProps {
  activePanel: string;
  onChange: (panel: string) => void;
}

// Map tab IDs to icons
const iconMap: Record<string, React.ReactNode> = {
  market: <BarChart2 size={20} />,
  news: <Newspaper size={20} />,
  trade: <Activity size={20} />,
  journal: <BookOpen size={20} />,
  leaderboard: <Award size={20} />,
  assistant: <Bot size={20} />,
  signals: <Bell size={20} />,
  copy: <Copy size={20} />,
  thc: <Coins size={20} />,
  "ai-analysis": <BrainCircuit size={20} />,
  bots: <Zap size={20} />
};

export function CustomizableBottomNav({ activePanel, onChange }: CustomizableBottomNavProps) {
  const { selectedBottomTabs, availableTabs, setSelectedBottomTabs, resetToDefaults } = useUserPreferences();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState<TabId[]>([...selectedBottomTabs]);
  
  // Get the label for a tab ID
  const getTabLabel = (tabId: string) => {
    const tab = availableTabs.find(t => t.id === tabId);
    return tab ? tab.label : tabId;
  };
  
  // Handle toggling a tab in customization mode
  const toggleTab = (tabId: TabId) => {
    if (selectedTabs.includes(tabId)) {
      // Don't remove if it would leave no tabs
      if (selectedTabs.length <= 1) return;
      setSelectedTabs(selectedTabs.filter(id => id !== tabId));
    } else {
      // Don't add if at max tabs
      if (selectedTabs.length >= 5) return;
      setSelectedTabs([...selectedTabs, tabId]);
    }
  };
  
  // Save customization changes
  const saveCustomization = () => {
    if (selectedTabs.length > 0) {
      setSelectedBottomTabs(selectedTabs);
    }
    setIsCustomizing(false);
  };
  
  // Cancel customization
  const cancelCustomization = () => {
    setSelectedTabs([...selectedBottomTabs]);
    setIsCustomizing(false);
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    resetToDefaults();
    setSelectedTabs([...useUserPreferences.getState().selectedBottomTabs]);
  };
  
  // Swap tab positions
  const swapTabs = (fromIndex: number, toIndex: number) => {
    const tabs = [...selectedTabs];
    const [removed] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, removed);
    setSelectedTabs(tabs);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      {isCustomizing ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Customize Bottom Menu</h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleResetToDefaults}
                className="text-xs h-7 px-2"
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={cancelCustomization}
                className="text-xs h-7 px-2"
              >
                <X size={14} className="mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="default"
                onClick={saveCustomization}
                className="text-xs h-7 px-2"
              >
                <Check size={14} className="mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Selected tabs with drag handles */}
          <div className="mb-4 bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
            <p className="text-xs text-gray-500 mb-2">
              Selected tabs (max 5, drag to reorder):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTabs.map((tabId, index) => (
                <div 
                  key={tabId}
                  className="flex items-center bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <button
                    className="flex items-center py-1 pl-2 pr-1"
                    onClick={() => toggleTab(tabId)}
                  >
                    <span className="flex items-center gap-1 text-xs">
                      {iconMap[tabId]} {getTabLabel(tabId)}
                    </span>
                    <X size={14} className="ml-1 text-gray-500" />
                  </button>
                  
                  <div className="flex border-l border-gray-200 dark:border-gray-700">
                    {index > 0 && (
                      <button
                        className="px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => swapTabs(index, index - 1)}
                        title="Move left"
                      >
                        <MoveHorizontal size={14} className="transform -rotate-90" />
                      </button>
                    )}
                    {index < selectedTabs.length - 1 && (
                      <button
                        className="px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => swapTabs(index, index + 1)}
                        title="Move right"
                      >
                        <MoveHorizontal size={14} className="transform rotate-90" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Available tabs */}
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Available tabs (click to add):
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTabs
                .filter(tab => !selectedTabs.includes(tab.id))
                .map(tab => (
                  <button 
                    key={tab.id}
                    className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-1 px-2 rounded-md"
                    onClick={() => toggleTab(tab.id)}
                    disabled={selectedTabs.length >= 5}
                  >
                    {iconMap[tab.id]} {tab.label}
                  </button>
                ))
              }
            </div>
            {selectedTabs.length >= 5 && (
              <p className="text-xs text-amber-500 mt-2">
                Maximum of 5 tabs reached. Remove a tab to add another.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-5 h-16">
          {selectedBottomTabs.map((tabId) => (
            <button
              key={tabId}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                activePanel === tabId 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              onClick={() => onChange(tabId)}
            >
              <div>
                {iconMap[tabId]}
              </div>
              <span className="text-xs">{getTabLabel(tabId)}</span>
            </button>
          ))}
          
          {/* Only show the customize button if we have fewer than 5 tabs */}
          {selectedBottomTabs.length < 5 && (
            <button
              className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsCustomizing(true)}
            >
              <div>
                <Settings size={20} />
              </div>
              <span className="text-xs">Customize</span>
            </button>
          )}
        </div>
      )}
      
      {/* If we have 5 tabs, show a small customize button in the corner */}
      {!isCustomizing && selectedBottomTabs.length === 5 && (
        <button
          className="absolute right-2 bottom-14 bg-primary text-white rounded-full p-2 shadow-lg"
          onClick={() => setIsCustomizing(true)}
        >
          <Settings size={18} />
        </button>
      )}
    </div>
  );
}