import React from 'react';
import { Leaderboard } from '@/components/ui/leaderboard';
import { Layout } from '@/components/ui/layout';

export default function LeaderboardPage() {
  return (
    <Layout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trading Leaderboard</h1>
        <Leaderboard />
      </div>
    </Layout>
  );
}