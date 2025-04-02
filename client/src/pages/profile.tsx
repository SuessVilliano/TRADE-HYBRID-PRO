import React from 'react';

// Simple placeholder component until we implement the full layout
const LayoutPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-900 p-6">
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 p-4 bg-slate-800 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-white">Trade Hybrid Platform</h1>
      </header>
      <main className="bg-slate-800 rounded-lg shadow-sm p-4 text-white">
        {children}
      </main>
    </div>
  </div>
);

// Simple placeholder for ProfileDashboard
const ProfileDashboardPlaceholder: React.FC = () => {
  // Mock user data
  const userData = {
    name: "Demo Trader",
    accountType: "Pro",
    joinDate: "2024-01-15",
    imageUrl: "/placeholders/avatar.jpg"
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-700 pb-6">
        <div className="w-24 h-24 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 text-2xl font-bold">
          {userData.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
              {userData.accountType} Account
            </span>
            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
              Member since {userData.joinDate}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Trading Stats</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Achievement Progress</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
        
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-medium mb-2 text-white">Recent Activity</h3>
          <p className="text-slate-300">Profile data is being loaded...</p>
        </div>
      </div>
    </div>
  );
};

export default function ProfileView() {
  return (
    <LayoutPlaceholder>
      <ProfileDashboardPlaceholder />
    </LayoutPlaceholder>
  );
}