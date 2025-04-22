import React from 'react';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';
import { AdminNotificationsCenter } from '@/components/admin/notifications-center';

export default function AdminNotificationsPage() {
  return (
    <TradingDashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <AdminNotificationsCenter />
      </div>
    </TradingDashboardLayout>
  );
}