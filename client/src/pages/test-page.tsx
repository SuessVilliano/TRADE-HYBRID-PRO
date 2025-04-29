import React from 'react';
import TestChart from '../components/ui/test-chart';
import { MCPTestPanel } from '../components/ui/mcp-test-panel';
import { SignalTestButtons } from '../components/ui/signal-test-buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Trade Hybrid Test Page</h1>
        <p className="text-gray-300 mb-4">
          This page provides tools for testing various platform features.
        </p>
        
        <Tabs defaultValue="charts" className="w-full mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="charts">Price Charts</TabsTrigger>
            <TabsTrigger value="signals">Signal Testing</TabsTrigger>
            <TabsTrigger value="mcp">MCP System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TestChart symbol="BTCUSDT" />
              <TestChart symbol="ETHUSDT" />
            </div>
          </TabsContent>
          
          <TabsContent value="signals">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold">Legacy Signal Test</h2>
              <p className="text-gray-300 mb-4">
                Test the legacy webhook-based signal system.
              </p>
              <SignalTestButtons />
            </div>
          </TabsContent>
          
          <TabsContent value="mcp">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold">MCP System Test</h2>
              <p className="text-gray-300 mb-4">
                Test the new Message Control Plane (MCP) system for signals and notifications.
              </p>
              <MCPTestPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestPage;