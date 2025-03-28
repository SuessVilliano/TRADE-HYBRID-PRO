import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';

// Sample data for demonstration
const sampleNFTs = [
  {
    id: 1,
    name: 'Advanced Breakout Strategy',
    creator: 'TradingMaster',
    price: 0.25,
    currency: 'THC',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Trading+Strategy',
    category: 'Strategy',
    description: 'A proven breakout strategy for cryptocurrency markets with over 70% win rate.',
    attributes: [
      { name: 'Success Rate', value: '76%' },
      { name: 'Time Frame', value: '4h' },
      { name: 'Markets', value: 'Crypto' },
      { name: 'Backtested', value: 'Yes' }
    ]
  },
  {
    id: 2,
    name: 'Trade Hybrid Membership',
    creator: 'TH Official',
    price: 2.5,
    currency: 'THC',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=TH+Membership',
    category: 'Membership',
    description: 'Premium membership NFT giving access to exclusive trading groups and signals.',
    attributes: [
      { name: 'Duration', value: 'Lifetime' },
      { name: 'Priority Support', value: 'Yes' },
      { name: 'Trading Signals', value: 'Included' },
      { name: 'Group Access', value: 'VIP' }
    ]
  },
  {
    id: 3,
    name: 'Metaverse Trading Floor',
    creator: 'MetaBuilder',
    price: 5.0,
    currency: 'THC',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Trading+Floor',
    category: 'Virtual Real Estate',
    description: 'Own a premium space on the Trade Hybrid metaverse for hosting trading events.',
    attributes: [
      { name: 'Size', value: 'Large' },
      { name: 'Location', value: 'Central' },
      { name: 'Customizable', value: 'Yes' },
      { name: 'Capacity', value: '25 avatars' }
    ]
  },
  {
    id: 4,
    name: 'Elite Trader Avatar',
    creator: 'AvatarArtist',
    price: 0.8,
    currency: 'THC',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Trader+Avatar',
    category: 'Avatar',
    description: 'Unique avatar with special abilities in the Trade Hybrid metaverse.',
    attributes: [
      { name: 'Rarity', value: 'Epic' },
      { name: 'Special Abilities', value: '3' },
      { name: 'Customizable', value: 'Yes' },
      { name: 'Badge', value: 'Pro Trader' }
    ]
  },
];

export default function NFTMarketplaceSimple() {
  const [nfts, setNfts] = useState(sampleNFTs);
  const [selectedTab, setSelectedTab] = useState('explore');
  const [selectedNFT, setSelectedNFT] = useState<null | number>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && nft.category.toLowerCase() === filter.toLowerCase();
  });

  // Simple wallet simulation
  const [wallet] = useState({
    connected: true,
    address: '0x1a2b...3c4d',
    balance: {
      THC: 25.75,
      SOL: 2.5
    }
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">NFT Marketplace</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {wallet.connected ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-sm text-slate-400">Connected: {wallet.address}</div>
                <div className="text-sm font-medium">{wallet.balance.THC} THC · {wallet.balance.SOL} SOL</div>
              </div>
              <Button variant="outline" size="sm">Disconnect</Button>
            </div>
          ) : (
            <Button>Connect Wallet</Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="my-collection">My Collection</TabsTrigger>
          <TabsTrigger value="create">Create NFT</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6 mt-4">
          {selectedNFT === null ? (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow">
                  <Input
                    placeholder="Search NFTs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Strategy">Trading Strategies</option>
                    <option value="Membership">Memberships</option>
                    <option value="Virtual Real Estate">Virtual Real Estate</option>
                    <option value="Avatar">Avatars</option>
                  </select>
                  <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setFilter('all'); }}>
                    ↻
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNFTs.length > 0 ? (
                  filteredNFTs.map(nft => (
                    <Card key={nft.id} className="overflow-hidden">
                      <div 
                        className="h-48 bg-slate-700 flex items-center justify-center cursor-pointer"
                        onClick={() => setSelectedNFT(nft.id)}
                        style={{
                          backgroundImage: `url(${nft.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <span className="sr-only">{nft.name}</span>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 
                            className="font-semibold mb-1 text-lg cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => setSelectedNFT(nft.id)}
                          >
                            {nft.name}
                          </h3>
                          <div className="bg-slate-700 px-2 py-1 rounded text-xs">
                            {nft.category}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400 mb-3">By {nft.creator}</div>
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{nft.price} {nft.currency}</div>
                          <Button size="sm" onClick={() => setSelectedNFT(nft.id)}>View</Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    No NFTs found matching your search criteria
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="p-6">
              {nfts.filter(n => n.id === selectedNFT).map(nft => (
                <div key={nft.id}>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">{nft.name}</h2>
                    <Button variant="outline" onClick={() => setSelectedNFT(null)}>
                      Back to Marketplace
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    <div className="bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundImage: `url(${nft.imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        height: '350px'
                      }}
                    >
                      <span className="sr-only">{nft.name}</span>
                    </div>
                    
                    <div>
                      <div className="bg-slate-700 inline-block px-3 py-1 rounded text-sm mb-4">
                        {nft.category}
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-slate-400">Creator</div>
                        <div className="font-medium">{nft.creator}</div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-sm text-slate-400">Description</div>
                        <p className="mt-1">{nft.description}</p>
                      </div>
                      
                      <div className="bg-slate-800 p-4 rounded-lg mb-6">
                        <div className="text-sm text-slate-400 mb-2">Attributes</div>
                        <div className="grid grid-cols-2 gap-3">
                          {nft.attributes.map((attr, i) => (
                            <div key={i} className="bg-slate-700/50 rounded-md p-2">
                              <div className="text-xs text-slate-400">{attr.name}</div>
                              <div className="font-medium">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-slate-800 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-slate-400">Current Price</div>
                            <div className="text-2xl font-bold">{nft.price} {nft.currency}</div>
                          </div>
                          <Button size="lg">Buy Now</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-collection" className="mt-4">
          <Card className="p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-3">Your NFT Collection</h3>
              <p className="text-slate-400 mb-6">You haven't collected any NFTs yet.</p>
              <Button onClick={() => setSelectedTab('explore')}>
                Browse Marketplace
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Create a New NFT</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">NFT Name</label>
                <Input placeholder="Give your NFT a name" />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Select a category</option>
                  <option value="strategy">Trading Strategy</option>
                  <option value="membership">Membership</option>
                  <option value="realestate">Virtual Real Estate</option>
                  <option value="avatar">Avatar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your NFT and its utility"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Upload Image</label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
                  <div className="text-slate-400 mb-2">PNG, JPG, or GIF. Max 10MB.</div>
                  <Button variant="outline">Select File</Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Price (THC)</label>
                <Input type="number" step="0.01" placeholder="Set a price in THC" />
              </div>
              
              <div className="pt-4">
                <Button>Create NFT</Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}