import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Coins, LineChart, BarChart3, Signal, Bot, BookOpen, Users, FileText, 
  Settings, Activity, MessageSquare } from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import DesktopHeader from './desktop-header';

interface LayoutProps {
  children: ReactNode;
}

// Define navigation items for sidebar
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: 'Trading',
    path: '/trade',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: 'Signals',
    path: '/signals',
    icon: <Signal className="h-5 w-5" />,
  },
  {
    name: 'Journal',
    path: '/journal',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: 'Bots',
    path: '/bots',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    name: 'Learning',
    path: '/learn',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: 'Metaverse',
    path: '/metaverse',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    name: 'News',
    path: '/news',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: 'TokenHub',
    path: '/trade?location=thc',
    icon: <Coins className="h-5 w-5" />,
  },
];

export function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Desktop Header with Tabs (visible on larger screens) */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      <div className="flex flex-grow">
        {/* Sidebar (visible on larger screens) */}
        <div className="hidden md:flex md:w-64 min-h-full flex-col bg-gray-900 border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-500">TH</span>
              <span className="text-xl font-semibold">Trade Hybrid</span>
            </Link>
          </div>

          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-800">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  {currentUser?.username?.charAt(0) || 'U'}
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{currentUser?.username || 'User'}</div>
                  <div className="text-xs text-gray-400">Profile</div>
                </div>
              </Link>

              <Link
                to="/settings"
                className="flex items-center px-3 py-2 mt-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => logout()}
                className="w-full flex items-center px-3 py-2 mt-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header (visible on small screens) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-500">TH</span>
              <span className="text-lg font-semibold">Trade Hybrid</span>
            </Link>
            
            {/* Mobile menu button */}
            <button className="text-gray-300 hover:text-white focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow md:pt-0 pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}