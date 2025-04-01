import React from 'react';
import { Layout } from '@/components/ui/layout';
import { ProfileDashboard } from '@/components/ui/profile-dashboard';
import { useAuth } from '@/lib/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trader Profile</h1>
        {user ? (
          <ProfileDashboard userId={user.id} />
        ) : (
          <div className="p-6 text-center">
            <p>Please log in to view your profile.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}