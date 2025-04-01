import React from 'react';
import { Layout } from '@/components/ui/layout';
import { SettingsPanel } from '@/components/ui/settings-panel';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
        <SettingsPanel />
      </div>
    </Layout>
  );
}