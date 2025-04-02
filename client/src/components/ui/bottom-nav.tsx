import * as React from 'react';
import { useUserPreferences } from '../../lib/stores/useUserPreferences';
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
  const [isVisible, setIsVisible] = React.useState(false);

  // Get tabs from user preferences
  const { bottomNavTabs, toggleBottomNavTab, reorderBottomNavTabs, resetPreferences } = useUserPreferences();
  
  // Filter tabs to only show active ones and sort by order
  const visibleTabs = React.useMemo(() => {
    return bottomNavTabs
      .filter(t => t.active)
      .sort((a, b) => a.order - b.order)
      .slice(0, 4); // Limit to exactly 4 buttons
  }, [bottomNavTabs]);
  
  // Add scroll event listener to show/hide bottom nav
  React.useEffect(() => {
    const handleScroll = () => {
      // Show navbar when scrolled down at least 200px
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 200);
    };
    
    // Initial check
    handleScroll();
    
    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className={`fixed bottom-0 left-[120px] right-[120px] z-50 bg-background border-t rounded-t-2xl shadow-lg transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {/* Visible tabs */}
        {visibleTabs.map((tab) => (
          <Link 
            key={tab.id} 
            to={`/${
              tab.id === 'home' ? 'dashboard' :
              tab.id === 'trading' ? 'trading-dashboard' : 
              tab.id === 'journal' ? 'trade-journal' : 
              tab.id === 'connect-broker' ? 'broker-connections' :
              tab.id === 'smart-trade' ? 'trading-ai' :
              tab.id === 'social' ? 'social-network' :
              tab.id
            }`}
            className={`flex flex-col items-center justify-center flex-1 p-2 rounded-md transition-colors
              ${
                currentPath.includes(tab.id) || 
                (tab.id === 'home' && currentPath.includes('dashboard')) ||
                (tab.id === 'trading' && (currentPath.includes('trading-dashboard') || currentPath.includes('trading-space'))) ||
                (tab.id === 'journal' && currentPath.includes('trade-journal')) ||
                (tab.id === 'connect-broker' && currentPath.includes('broker-connections')) ||
                (tab.id === 'smart-trade' && currentPath.includes('trading-ai')) ||
                (tab.id === 'social' && currentPath.includes('social-network'))
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
        
        {/* No customize button here anymore - moved to settings page */}
      </div>
    </div>
  );
}