import React from 'react';
import WebhookSettings from '../components/settings/WebhookSettings';
import { SettingsPanel } from '../components/ui/settings-panel';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Layout component with back navigation
const LayoutWithNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trade Hybrid Platform</h1>
          </div>
        </header>
        <main className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function SettingsView() {
  return (
    <LayoutWithNavigation>
      <SettingsPanel />
    </LayoutWithNavigation>
  );
}