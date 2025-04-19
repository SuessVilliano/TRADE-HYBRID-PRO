import React from 'react';
import { WebhookSettings } from '../components/settings/WebhookSettings';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

// Layout component with back navigation
const LayoutWithNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Webhook Management</h1>
            </div>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/webhook-logs">
                <ClipboardList className="h-4 w-4" />
                View Execution Logs
              </Link>
            </Button>
          </div>
        </header>
        <main className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function WebhookSettingsPage() {
  return (
    <LayoutWithNavigation>
      <WebhookSettings />
    </LayoutWithNavigation>
  );
}