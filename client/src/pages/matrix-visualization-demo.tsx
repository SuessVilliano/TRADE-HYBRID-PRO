import React, { useState } from 'react';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MatrixVisualization, { MatrixNode } from '@/components/ui/matrix-visualization';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight, Info, Users } from 'lucide-react';

// Sample data for the matrix visualization
const sampleMatrixData: MatrixNode[] = [
  // Level 1 (Root)
  {
    id: '1',
    level: 1,
    position: 1,
    parentId: null,
    userId: 'user1',
    username: 'YourUsername',
    joinedAt: new Date('2023-01-01'),
    coinType: 'bitcoin',
    isActive: true,
    referrals: 8,
    earnings: 2500,
    status: 'active',
  },
  // Level 2
  {
    id: '2',
    level: 2,
    position: 1,
    parentId: '1',
    userId: 'user2',
    username: 'Alice',
    joinedAt: new Date('2023-02-15'),
    coinType: 'ethereum',
    isActive: true,
    referrals: 5,
    earnings: 1200,
    status: 'active',
  },
  {
    id: '3',
    level: 2,
    position: 2,
    parentId: '1',
    userId: 'user3',
    username: 'Bob',
    joinedAt: new Date('2023-03-10'),
    coinType: 'solana',
    isActive: true,
    referrals: 3,
    earnings: 800,
    status: 'active',
  },
  {
    id: '4',
    level: 2,
    position: 3,
    parentId: '1',
    userId: 'user4',
    username: 'Charlie',
    joinedAt: new Date('2023-04-05'),
    coinType: 'tether',
    isActive: false,
    referrals: 0,
    earnings: 0,
    status: 'pending',
  },
  // Level 3
  {
    id: '5',
    level: 3,
    position: 1,
    parentId: '2',
    userId: 'user5',
    username: 'Dave',
    joinedAt: new Date('2023-05-20'),
    coinType: 'binance',
    isActive: true,
    referrals: 2,
    earnings: 500,
    status: 'active',
  },
  {
    id: '6',
    level: 3,
    position: 2,
    parentId: '2',
    userId: 'user6',
    username: 'Eve',
    joinedAt: new Date('2023-06-15'),
    coinType: 'ethereum',
    isActive: true,
    referrals: 1,
    earnings: 300,
    status: 'active',
  },
  {
    id: '7',
    level: 3,
    position: 3,
    parentId: '3',
    userId: 'user7',
    username: 'Frank',
    joinedAt: new Date('2023-07-10'),
    coinType: 'solana',
    isActive: false,
    referrals: 0,
    earnings: 0,
    status: 'inactive',
  },
];

const MatrixVisualizationDemo: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MatrixNode | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);

  const handleNodeClick = (node: MatrixNode) => {
    setSelectedNode(node);
    setShowDetailCard(true);
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <PageLayout title="Matrix Visualization">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Matrix Overview Card */}
          <div className="col-span-1 md:col-span-2">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Matrix Network</CardTitle>
                    <CardDescription>
                      Your decentralized affiliate network visualization
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users size={14} />
                      <span>Total: {sampleMatrixData.length}</span>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ArrowUpRight size={14} />
                      <span>Earnings: {formatCurrency(2500)}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <MatrixVisualization
                    nodes={sampleMatrixData}
                    maxLevel={3}
                    onNodeClick={handleNodeClick}
                    selectedNodeId={selectedNode?.id}
                    animate={true}
                  />
                </div>
                <div className="mt-4 flex gap-2 items-center text-sm text-muted-foreground">
                  <Info size={16} />
                  <span>Click on any node to view details</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail Card */}
          <div className="col-span-1">
            <Card className={`w-full h-full ${!showDetailCard ? 'flex items-center justify-center' : ''}`}>
              {showDetailCard && selectedNode ? (
                <>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/assets/coins/${selectedNode.coinType}.svg`} alt={selectedNode.coinType} />
                        <AvatarFallback>{selectedNode.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedNode.username}</CardTitle>
                        <CardDescription>Level {selectedNode.level} • Position {selectedNode.position}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className="mt-2 self-start" 
                      variant={
                        selectedNode.status === 'active' ? 'success' : 
                        selectedNode.status === 'pending' ? 'warning' : 'outline'
                      }
                    >
                      {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details">
                      <TabsList className="w-full">
                        <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                        <TabsTrigger value="earnings" className="flex-1">Earnings</TabsTrigger>
                        <TabsTrigger value="referrals" className="flex-1">Referrals</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">User ID</div>
                          <div className="font-medium">{selectedNode.userId}</div>
                          
                          <div className="text-muted-foreground">Joined</div>
                          <div className="font-medium">{formatDate(selectedNode.joinedAt)}</div>
                          
                          <div className="text-muted-foreground">Coin Type</div>
                          <div className="font-medium capitalize">{selectedNode.coinType}</div>
                          
                          <div className="text-muted-foreground">Status</div>
                          <div className="font-medium capitalize">{selectedNode.status}</div>
                        </div>
                      </TabsContent>
                      <TabsContent value="earnings" className="mt-4">
                        <div className="text-center py-6">
                          <div className="text-3xl font-bold mb-2">{formatCurrency(selectedNode.earnings)}</div>
                          <div className="text-muted-foreground text-sm">Total earnings to date</div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium mb-2">Recent Payments</h4>
                          {selectedNode.earnings > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Level 1 Commission</span>
                                <span>{formatCurrency(selectedNode.earnings * 0.6)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Level 2 Commission</span>
                                <span>{formatCurrency(selectedNode.earnings * 0.3)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bonus Earnings</span>
                                <span>{formatCurrency(selectedNode.earnings * 0.1)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No earnings yet</div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="referrals" className="mt-4">
                        <div className="text-center py-4">
                          <div className="text-3xl font-bold mb-2">{selectedNode.referrals}</div>
                          <div className="text-muted-foreground text-sm">Total referrals</div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-sm font-medium mb-2">Referral Stats</h4>
                          {selectedNode.referrals > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Active Referrals</span>
                                <span>{Math.ceil(selectedNode.referrals * 0.8)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending Referrals</span>
                                <span>{Math.floor(selectedNode.referrals * 0.2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Referral Rate</span>
                                <span className="text-green-500">+{Math.round(selectedNode.referrals / 12 * 100)}%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No referrals yet</div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="mt-6">
                      <Button className="w-full">
                        Invite New Affiliate
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="p-6 text-center">
                  <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Node Details</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a node in the matrix to view detailed information
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MatrixVisualizationDemo;