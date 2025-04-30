import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { PageTitle } from '@/components/common/PageTitle';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { SolscanSettings } from '@/components/admin/SolscanSettings';

const ApiSettingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="API Settings" />
        
        <Card className="mt-6">
          <Tabs defaultValue="solscan" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="solscan">Solscan API</TabsTrigger>
              <TabsTrigger value="rapidapi">RapidAPI</TabsTrigger>
              <TabsTrigger value="other">Other APIs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="solscan">
              <div className="p-6">
                <SolscanSettings />
              </div>
            </TabsContent>
            
            <TabsContent value="rapidapi">
              <div className="p-6">
                <h3 className="text-lg font-medium">RapidAPI Settings</h3>
                <p className="text-gray-500 mt-2">
                  RapidAPI integration settings will be available here in a future update.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="other">
              <div className="p-6">
                <h3 className="text-lg font-medium">Other API Settings</h3>
                <p className="text-gray-500 mt-2">
                  Additional API configuration options will be available here in a future update.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ApiSettingsPage;