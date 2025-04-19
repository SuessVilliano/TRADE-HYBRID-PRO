import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  BarChart4,
  PlusCircle,
  Bell,
  Link as LinkIcon,
  Settings
} from 'lucide-react';

interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  action: () => void;
}

interface MobileQuickActionsProps {
  onAddTrade?: () => void;
  onShowSignals?: () => void;
  onShowSettings?: () => void;
}

export function MobileQuickActions({ 
  onAddTrade, 
  onShowSignals, 
  onShowSettings 
}: MobileQuickActionsProps) {
  const navigate = useNavigate();
  
  // Initialize quick actions
  const initializeQuickActions = (): QuickAction[] => [
    {
      id: 'quick_dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      enabled: true,
      action: () => navigate('/trading-dashboard')
    },
    {
      id: 'quick_journal',
      name: 'Journal',
      icon: <FileText className="h-4 w-4" />,
      enabled: true,
      action: () => navigate('/journal')
    },
    {
      id: 'quick_analysis',
      name: 'Analysis',
      icon: <BarChart4 className="h-4 w-4" />,
      enabled: true,
      action: () => navigate('/analysis')
    },
    {
      id: 'quick_add',
      name: 'Add Trade',
      icon: <PlusCircle className="h-4 w-4" />,
      enabled: true,
      action: () => {
        if (onAddTrade) {
          onAddTrade();
        } else {
          navigate('/journal');
          toast({
            title: "Journal opened",
            description: "You can now add a new trade entry"
          });
        }
      }
    },
    {
      id: 'quick_signals',
      name: 'Signals',
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
      action: () => {
        if (onShowSignals) {
          onShowSignals();
        } else {
          navigate('/signals');
        }
      }
    },
    {
      id: 'quick_broker',
      name: 'Connect',
      icon: <LinkIcon className="h-4 w-4" />,
      enabled: true,
      action: () => navigate('/broker-connections')
    }
  ];
  
  const [quickActions, setQuickActions] = useState<QuickAction[]>(initializeQuickActions());

  // Load saved quick actions preferences
  useEffect(() => {
    const savedQuickActions = localStorage.getItem('tradeHybridQuickTools');
    
    if (savedQuickActions) {
      try {
        const parsedQuickActions = JSON.parse(savedQuickActions);
        
        // Update enabled status based on saved preferences
        setQuickActions(quickActions.map(action => ({
          ...action,
          enabled: parsedQuickActions.find((a: any) => a.id === action.id)?.enabled ?? action.enabled
        })));
      } catch (error) {
        console.error('Error parsing saved quick actions:', error);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-slate-700 z-50 md:hidden">
      <div className="container mx-auto px-2 py-2">
        <div className="flex justify-between items-center">
          {quickActions
            .filter(action => action.enabled)
            .map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full"
                onClick={action.action}
                title={action.name}
              >
                {action.icon}
                <span className="sr-only">{action.name}</span>
              </Button>
            ))}
            
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
            onClick={onShowSettings}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}