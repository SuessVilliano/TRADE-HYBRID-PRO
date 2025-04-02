import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X, CheckCircle, Search, Filter, ChevronDown, ChevronUp, RefreshCw, BookOpen, Code, BarChart2, Star, Clock, Tag, Trash } from 'lucide-react';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { calculateTradingFee } from '../lib/contracts/thc-token-info';
import { nftService, type NFTItem, type NFTAttribute } from '../lib/services/nft-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export default function NFTMarketplace() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('explore');
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thcBalance, setThcBalance] = useState(25.75); // Mock THC balance
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useSolanaAuth();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [showListedOnly, setShowListedOnly] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest');
  
  // NFT creation form state
  const [nftName, setNftName] = useState('');
  const [nftCategory, setNftCategory] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftPrice, setNftPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Array<{name: string, value: string}>>([
    { name: '', value: '' }
  ]);
  const [hasStrategy, setHasStrategy] = useState(false);
  const [strategyCode, setStrategyCode] = useState('');
  const [backtestResults, setBacktestResults] = useState({
    winRate: 0,
    totalTrades: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    maxDrawdown: 0
  });

  // Purchase state
  const [isPurchasing, setPurchasing] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  
  // Fee calculation
  const baseFeePercent = 2.5; // 2.5% base fee for NFT creation
  const feeReduction = calculateTradingFee(100, thcBalance);
  const calculatedFee = parseFloat(nftPrice || '0') * (baseFeePercent - feeReduction) / 100;
  const formattedFee = isNaN(calculatedFee) ? '0.00' : calculatedFee.toFixed(2);

  // Initialize wallet connection and fetch NFTs on mount
  useEffect(() => {
    console.log('NFT Marketplace: Auth state changed', { 
      isAuthenticated: auth.isWalletAuthenticated, 
      walletAddress: auth.walletAddress,
      isPhantomAvailable: typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana
    });
    
    // Use real wallet address if authenticated, otherwise use a temporary placeholder
    // that clearly shows it's not a real address, avoiding mock data
    if (auth.isWalletAuthenticated && auth.walletAddress) {
      console.log('Using authenticated wallet address:', auth.walletAddress);
      nftService.setUserWallet(auth.walletAddress);
    } else {
      console.log('No wallet authenticated, using placeholder wallet ID');
      // The wallet will be updated when authentication happens
      nftService.setUserWallet("not-connected");
    }
    
    nftService.setThcBalance(thcBalance);
    
    // Load NFTs
    loadNFTs();
    
    // If there's an ID in the URL, try to load that specific NFT
    if (id) {
      const nft = nftService.getNFTById(id);
      if (nft) {
        setSelectedNFT(nft);
      }
    }
  }, [id, auth.isWalletAuthenticated, auth.walletAddress]);

  // Reload NFTs when active tab changes
  useEffect(() => {
    loadNFTs();
  }, [activeTab]);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, priceRange, showListedOnly, showVerifiedOnly, sortBy, nfts]);

  // Load NFT data based on active tab
  const loadNFTs = () => {
    setIsLoading(true);
    
    try {
      let loadedNfts: NFTItem[] = [];
      
      switch (activeTab) {
        case 'explore':
          loadedNfts = nftService.getAllNFTs();
          break;
        case 'my-collection':
          loadedNfts = nftService.getMyNFTs();
          break;
        case 'created':
          loadedNfts = nftService.getCreatedNFTs();
          break;
        default:
          loadedNfts = nftService.getAllNFTs();
      }
      
      setNfts(loadedNfts);
      setFilteredNfts(loadedNfts);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load NFTs');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to NFTs
  const applyFilters = useCallback(() => {
    if (!nfts.length) return;
    
    let filtered = [...nfts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.creator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(nft => nft.category === categoryFilter);
    }
    
    // Apply price range filter
    filtered = filtered.filter(nft => 
      nft.price >= priceRange[0] && nft.price <= priceRange[1]
    );
    
    // Apply listing filter
    if (showListedOnly) {
      filtered = filtered.filter(nft => nft.listed);
    }
    
    // Apply verification filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(nft => nft.verified);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }
    
    setFilteredNfts(filtered);
  }, [nfts, searchTerm, categoryFilter, priceRange, showListedOnly, showVerifiedOnly, sortBy]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPriceRange([0, 10]);
    setShowListedOnly(true);
    setShowVerifiedOnly(false);
    setSortBy('newest');
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File too large. Please select an image under 10MB');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Attribute management
  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
  };
  
  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  
  const removeAttribute = (index: number) => {
    if (attributes.length > 1) {
      const newAttributes = [...attributes];
      newAttributes.splice(index, 1);
      setAttributes(newAttributes);
    }
  };
  
  // NFT creation
  const handleCreateNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Phantom wallet is installed and try to connect
    if (typeof window !== 'undefined' && window.phantom?.solana) {
      try {
        // Connect or verify wallet connection
        const phantomWallet = window.phantom?.solana;
        if (!phantomWallet.isConnected) {
          toast.info('Connecting to wallet...');
          await phantomWallet.connect();
          // Update auth context after successful connection
          auth.connectAndAuthenticate();
        }
      } catch (error) {
        console.error('Error connecting to Phantom wallet:', error);
        toast.error('Could not connect to wallet', {
          description: 'Please make sure your Phantom wallet is installed and unlocked.'
        });
        return;
      }
    } else {
      toast.error('Phantom wallet not found', {
        description: 'Please install the Phantom wallet extension and try again.'
      });
      return;
    }
    
    if (!nftName || !nftCategory || !nftDescription || !nftPrice || !selectedFile) {
      toast.error('Please fill all required fields and upload an image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the NFT
      const newNft = await nftService.createNFT({
        name: nftName,
        category: nftCategory,
        description: nftDescription,
        price: parseFloat(nftPrice),
        imageFile: selectedFile,
        attributes: attributes.filter(attr => attr.name && attr.value),
        strategyCode: hasStrategy ? strategyCode : undefined,
        backtestResults: hasStrategy ? backtestResults : undefined
      });
      
      // Reset form
      setNftName('');
      setNftCategory('');
      setNftDescription('');
      setNftPrice('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setAttributes([{ name: '', value: '' }]);
      setHasStrategy(false);
      setStrategyCode('');
      setBacktestResults({
        winRate: 0,
        totalTrades: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        maxDrawdown: 0
      });
      
      // Show success message
      toast.success(`${nftName} has been created with a fee of ${formattedFee} THC`);
      
      // Switch to explore tab to view the new NFT
      setActiveTab('explore');
      
      // Reload NFTs to include the new one
      loadNFTs();
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle purchase
  const handlePurchase = async (nftId: string) => {
    setSelectedTokenId(nftId);
    setShowPurchaseDialog(true);
  };
  
  const confirmPurchase = async () => {
    if (!selectedTokenId) return;
    
    setPurchasing(true);
    
    try {
      const purchasedNft = await nftService.purchaseNFT(selectedTokenId);
      
      if (purchasedNft) {
        // Show success message
        toast.success(`Successfully purchased ${purchasedNft.name}`);
        
        // Reload NFTs to reflect changes
        loadNFTs();
        
        // If we're viewing the purchased NFT, update the view
        if (selectedNFT && selectedNFT.id === selectedTokenId) {
          setSelectedNFT(purchasedNft);
        }
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast.error('Failed to purchase NFT. Please try again.');
    } finally {
      setPurchasing(false);
      setShowPurchaseDialog(false);
      setSelectedTokenId(null);
    }
  };
  
  // Toggle listing status
  const toggleListNFT = async (nftId: string, listStatus: boolean) => {
    try {
      const updatedNft = nftService.toggleListNFT(nftId, listStatus);
      
      if (updatedNft) {
        // Show success message
        toast.success(`${updatedNft.name} has been ${listStatus ? 'listed for sale' : 'unlisted'}`);
        
        // Reload NFTs to reflect changes
        loadNFTs();
        
        // If we're viewing the updated NFT, update the view
        if (selectedNFT && selectedNFT.id === nftId) {
          setSelectedNFT(updatedNft);
        }
      }
    } catch (error) {
      console.error('Error updating NFT listing:', error);
      toast.error('Failed to update listing status. Please try again.');
    }
  };
  
  // Update NFT price
  const updateNFTPrice = async (nftId: string, newPrice: number) => {
    try {
      const updatedNft = nftService.updateNFTPrice(nftId, newPrice);
      
      if (updatedNft) {
        // Show success message
        toast.success(`${updatedNft.name} price updated to ${newPrice} THC`);
        
        // Reload NFTs to reflect changes
        loadNFTs();
        
        // If we're viewing the updated NFT, update the view
        if (selectedNFT && selectedNFT.id === nftId) {
          setSelectedNFT(updatedNft);
        }
      }
    } catch (error) {
      console.error('Error updating NFT price:', error);
      toast.error('Failed to update price. Please try again.');
    }
  };
  
  // Back to marketplace
  const backToMarketplace = () => {
    setSelectedNFT(null);
    navigate('/nft-marketplace');
  };

  // Render NFT card
  const renderNFTCard = (nft: NFTItem) => (
    <Card key={nft.id} className="overflow-hidden border-slate-800 hover:border-slate-700 transition-all">
      <div 
        className="h-48 bg-slate-800 flex items-center justify-center cursor-pointer relative"
        onClick={() => {
          setSelectedNFT(nft);
          navigate(`/nft-marketplace/${nft.id}`);
        }}
        style={{
          backgroundImage: `url(${nft.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {nft.verified && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-blue-600/80 hover:bg-blue-600/90">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )}
        {nft.category === 'Strategy' && (
          <Badge variant="outline" className="absolute top-2 left-2 bg-slate-900/80 border-slate-700">
            <Code className="h-3 w-3 mr-1" /> Strategy
          </Badge>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 
            className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              setSelectedNFT(nft);
              navigate(`/nft-marketplace/${nft.id}`);
            }}
          >
            {nft.name}
          </h3>
          <Badge variant="outline" className="bg-slate-800 text-xs">
            {nft.category}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1 mb-3 flex items-center">
          By {nft.creator}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="font-semibold text-lg">
            {nft.price} <span className="text-primary">{nft.currency}</span>
          </div>
          {nft.listed ? (
            <Button 
              size="sm" 
              onClick={() => handlePurchase(nft.id)}
              disabled={nft.ownerWallet === nftService.getUserWallet()}
            >
              Buy Now
            </Button>
          ) : (
            <Badge variant="secondary" className="bg-slate-700 hover:bg-slate-700">
              Not Listed
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );

  // Render detailed NFT view
  const renderDetailedNFT = () => {
    if (!selectedNFT) return null;
    
    const isOwner = selectedNFT.ownerWallet === nftService.getUserWallet();
    const isCreator = selectedNFT.creatorWallet === nftService.getUserWallet();
    
    return (
      <div className="container mx-auto py-6">
        {/* Back button and NFT title */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" size="sm" onClick={backToMarketplace}>
            ← Back to Marketplace
          </Button>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Owner Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>NFT Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleListNFT(selectedNFT.id, !selectedNFT.listed)}>
                  {selectedNFT.listed ? 'Unlist from Marketplace' : 'List for Sale'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Update Price
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Transfer to Another Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* NFT Image (2 columns) */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl overflow-hidden aspect-square flex items-center justify-center"
            style={{
              backgroundImage: `url(${selectedNFT.imageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <span className="sr-only">{selectedNFT.name}</span>
          </div>
          
          {/* NFT Info (3 columns) */}
          <div className="lg:col-span-3">
            <div className="flex flex-col h-full">
              {/* Title and verification */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{selectedNFT.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="bg-slate-800">
                      {selectedNFT.category}
                    </Badge>
                    {selectedNFT.verified && (
                      <Badge variant="secondary" className="bg-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Creator and price */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm">Created by</p>
                  <p className="font-medium">{selectedNFT.creator}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Current owner</p>
                  <p className="font-medium">{isOwner ? 'You' : `${selectedNFT.ownerWallet.substring(0, 6)}...${selectedNFT.ownerWallet.substring(selectedNFT.ownerWallet.length - 4)}`}</p>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedNFT.description}</p>
              </div>
              
              {/* Attributes */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Attributes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedNFT.attributes.map((attr, i) => (
                    <div key={i} className="bg-slate-800 rounded-md p-3">
                      <p className="text-xs text-muted-foreground">{attr.name}</p>
                      <p className="font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Strategy details (if applicable) */}
              {selectedNFT.strategy && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Trading Strategy Details</h3>
                  <div className="bg-slate-800 rounded-md p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {selectedNFT.strategy.backtestResults && (
                        <>
                          <div>
                            <p className="text-xs text-muted-foreground">Win Rate</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.winRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Profit Factor</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.profitFactor.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Trades</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.totalTrades}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg. Win</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.averageWin.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg. Loss</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.averageLoss.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Max Drawdown</p>
                            <p className="font-semibold">{selectedNFT.strategy.backtestResults.maxDrawdown.toFixed(2)}%</p>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedNFT.strategy.code && isOwner && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strategy Code</h4>
                        <div className="bg-slate-900 rounded p-3 relative">
                          <pre className="text-xs overflow-x-auto">{selectedNFT.strategy.code.length > 100 ? 
                            `${selectedNFT.strategy.code.substring(0, 100)}...` : 
                            selectedNFT.strategy.code}
                          </pre>
                          <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                            View Full Code
                          </Button>
                        </div>
                      </div>
                    )}
                    {!isOwner && (
                      <p className="text-sm text-muted-foreground italic">
                        Purchase this NFT to access the complete trading strategy code and implementation details.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Purchase section */}
              <div className="mt-auto">
                <div className="bg-slate-800 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold text-primary">{selectedNFT.price} THC</p>
                    </div>
                    {selectedNFT.listed && !isOwner ? (
                      <Button size="lg" onClick={() => handlePurchase(selectedNFT.id)}>
                        Buy Now
                      </Button>
                    ) : isOwner ? (
                      <div className="flex items-center gap-3">
                        {selectedNFT.listed ? (
                          <Button variant="outline" onClick={() => toggleListNFT(selectedNFT.id, false)}>
                            Remove Listing
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => toggleListNFT(selectedNFT.id, true)}>
                            List for Sale
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="px-3 py-1 text-base bg-slate-700 hover:bg-slate-700">
                        Not Listed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Create NFT form
  const renderCreateNFTForm = () => (
    <form onSubmit={handleCreateNFT} className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image upload area */}
        <div className="md:col-span-1">
          <div className="mb-4">
            <Label htmlFor="nft-image" className="text-base font-medium mb-2 block">
              NFT Image
            </Label>
            <div 
              className={`border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors p-4 ${
                previewUrl ? 'border-slate-600' : 'border-slate-700'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="w-full h-full relative">
                  <img 
                    src={previewUrl} 
                    alt="NFT Preview" 
                    className="w-full h-full object-contain rounded-md"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800 p-3 rounded-full mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-center text-sm mb-1">Click to upload image</p>
                  <p className="text-center text-xs text-muted-foreground">
                    PNG, JPG or GIF (max 10MB)
                  </p>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file"
                id="nft-image"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium mb-3">NFT Fee Information</h3>
            <div className="bg-slate-800 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Base Fee:</span>
                <span>{baseFeePercent}%</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Your THC Balance:</span>
                <span>{thcBalance} THC</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Fee Reduction:</span>
                <span>{feeReduction}%</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-medium">
                <span>Your Fee:</span>
                <span className="text-primary">{formattedFee} THC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Fee is calculated based on your THC balance and the NFT price. Hold more THC to reduce fees.
              </p>
            </div>
          </div>
        </div>

        {/* NFT details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium mb-2 block">
              NFT Name
            </Label>
            <Input
              id="name"
              placeholder="Enter a name for your NFT"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-base font-medium mb-2 block">
              Category
            </Label>
            <Select value={nftCategory} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strategy">Trading Strategy</SelectItem>
                <SelectItem value="Indicator">Indicator</SelectItem>
                <SelectItem value="Membership">Membership</SelectItem>
                <SelectItem value="Virtual Real Estate">Virtual Real Estate</SelectItem>
                <SelectItem value="Avatar">Avatar</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your NFT and its features"
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-base font-medium mb-2 block">
              Price (THC)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter price in THC"
              value={nftPrice}
              onChange={(e) => setNftPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-medium">Attributes</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addAttribute}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Attribute
              </Button>
            </div>
            <div className="space-y-3">
              {attributes.map((attr, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Attribute Name"
                    value={attr.name}
                    onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Attribute Value"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  {attributes.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strategy-specific fields (only visible when category is "Strategy") */}
          {nftCategory === 'Strategy' && (
            <div className="border border-slate-700 rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Trading Strategy Details</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-strategy"
                    checked={hasStrategy}
                    onCheckedChange={setHasStrategy}
                  />
                  <Label htmlFor="has-strategy">Include Strategy Code</Label>
                </div>
              </div>

              {hasStrategy && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="strategy-code" className="text-sm font-medium mb-2 block">
                      Strategy Code
                    </Label>
                    <Textarea
                      id="strategy-code"
                      placeholder="Paste your trading strategy code here"
                      value={strategyCode}
                      onChange={(e) => setStrategyCode(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be visible only to the owner of the NFT.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Backtest Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="win-rate" className="text-xs mb-1 block">
                          Win Rate (%)
                        </Label>
                        <Input
                          id="win-rate"
                          type="number"
                          min="0"
                          max="100"
                          value={backtestResults.winRate}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            winRate: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="total-trades" className="text-xs mb-1 block">
                          Total Trades
                        </Label>
                        <Input
                          id="total-trades"
                          type="number"
                          min="0"
                          value={backtestResults.totalTrades}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            totalTrades: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profit-factor" className="text-xs mb-1 block">
                          Profit Factor
                        </Label>
                        <Input
                          id="profit-factor"
                          type="number"
                          step="0.01"
                          min="0"
                          value={backtestResults.profitFactor}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            profitFactor: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="avg-win" className="text-xs mb-1 block">
                          Average Win (%)
                        </Label>
                        <Input
                          id="avg-win"
                          type="number"
                          step="0.01"
                          min="0"
                          value={backtestResults.averageWin}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            averageWin: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="avg-loss" className="text-xs mb-1 block">
                          Average Loss (%)
                        </Label>
                        <Input
                          id="avg-loss"
                          type="number"
                          step="0.01"
                          min="0"
                          value={backtestResults.averageLoss}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            averageLoss: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-drawdown" className="text-xs mb-1 block">
                          Max Drawdown (%)
                        </Label>
                        <Input
                          id="max-drawdown"
                          type="number"
                          step="0.01"
                          min="0"
                          value={backtestResults.maxDrawdown}
                          onChange={(e) => setBacktestResults({
                            ...backtestResults,
                            maxDrawdown: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating NFT...
                </>
              ) : (
                'Create NFT'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );

  // If a specific NFT is selected, render its details
  if (selectedNFT) {
    return renderDetailedNFT();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">NFT Marketplace</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {auth.isWalletAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-sm text-muted-foreground">Connected: {`${auth.walletAddress?.substring(0, 6)}...${auth.walletAddress?.substring(auth.walletAddress.length - 4) || ''}`}</div>
                <div className="text-sm font-medium">{thcBalance} THC</div>
              </div>
              <Button variant="outline" size="sm" onClick={auth.logoutFromSolana}>
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className="wallet-adapter-dropdown">
                <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2" />
              </div>
              {typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana && (
                <Button variant="ghost" size="sm" onClick={auth.loginWithSolana} className="mt-2">
                  Sign & Verify
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="my-collection">My Collection</TabsTrigger>
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="create">Create NFT</TabsTrigger>
        </TabsList>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6 mt-4">
          {/* Search and filter bar */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NFTs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Strategy">Trading Strategies</SelectItem>
                    <SelectItem value="Indicator">Indicators</SelectItem>
                    <SelectItem value="Membership">Memberships</SelectItem>
                    <SelectItem value="Virtual Real Estate">Virtual Real Estate</SelectItem>
                    <SelectItem value="Avatar">Avatars</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Extended filters */}
            {showFilters && (
              <div className="bg-slate-800 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 block text-sm">Price Range (THC)</Label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 10]}
                      min={0}
                      max={10}
                      step={0.1}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>{priceRange[0].toFixed(1)}</span>
                      <span>{priceRange[1].toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Listing Status</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="listed-only" 
                      checked={showListedOnly}
                      onCheckedChange={(checked) => setShowListedOnly(checked as boolean)}
                    />
                    <Label htmlFor="listed-only" className="text-sm">Show listed only</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox 
                      id="verified-only" 
                      checked={showVerifiedOnly}
                      onCheckedChange={(checked) => setShowVerifiedOnly(checked as boolean)}
                    />
                    <Label htmlFor="verified-only" className="text-sm">Show verified only</Label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block text-sm">Sort By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={sortBy === 'newest' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSortBy('newest')}
                      className="justify-start"
                    >
                      <Clock className="mr-2 h-4 w-4" /> Newest
                    </Button>
                    <Button 
                      variant={sortBy === 'oldest' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSortBy('oldest')}
                      className="justify-start"
                    >
                      <Clock className="mr-2 h-4 w-4" /> Oldest
                    </Button>
                    <Button 
                      variant={sortBy === 'price_asc' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSortBy('price_asc')}
                      className="justify-start"
                    >
                      <Tag className="mr-2 h-4 w-4" /> Price: Low to High
                    </Button>
                    <Button 
                      variant={sortBy === 'price_desc' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSortBy('price_desc')}
                      className="justify-start"
                    >
                      <Tag className="mr-2 h-4 w-4" /> Price: High to Low
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NFT Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNfts.map(nft => renderNFTCard(nft))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No NFTs Found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any NFTs matching your search criteria. Try adjusting your filters or search term.
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* My Collection Tab */}
        <TabsContent value="my-collection" className="space-y-6 mt-4">
          {!auth.isWalletAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You need to connect your wallet to view your NFT collection.
              </p>
              <div className="flex flex-col gap-2 items-center">
                <div className="wallet-adapter-dropdown">
                  <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2" />
                </div>
                {typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana && (
                  <Button variant="ghost" size="sm" onClick={auth.loginWithSolana} className="mt-2">
                    Sign & Verify
                  </Button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNfts.map(nft => renderNFTCard(nft))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No NFTs in Your Collection</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You don't own any NFTs yet. Explore the marketplace to find NFTs to purchase.
              </p>
              <Button onClick={() => setActiveTab('explore')}>
                Explore Marketplace
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Created Tab */}
        <TabsContent value="created" className="space-y-6 mt-4">
          {!auth.isWalletAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You need to connect your wallet to view your created NFTs.
              </p>
              <div className="flex flex-col gap-2 items-center">
                <div className="wallet-adapter-dropdown">
                  <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2" />
                </div>
                {typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana && (
                  <Button variant="ghost" size="sm" onClick={auth.loginWithSolana} className="mt-2">
                    Sign & Verify
                  </Button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNfts.map(nft => renderNFTCard(nft))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Created NFTs</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You haven't created any NFTs yet. Use the Create tab to mint your first NFT.
              </p>
              <Button onClick={() => setActiveTab('create')}>
                Create Your First NFT
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Create NFT Tab */}
        <TabsContent value="create" className="mt-4">
          {!auth.isWalletAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You need to connect your wallet to create NFTs on the marketplace.
              </p>
              <div className="flex flex-col gap-2 items-center">
                <div className="wallet-adapter-dropdown">
                  <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2" />
                </div>
                {typeof window !== 'undefined' && 'phantom' in window && !!(window as any).phantom?.solana && (
                  <Button variant="ghost" size="sm" onClick={auth.loginWithSolana} className="mt-2">
                    Sign & Verify
                  </Button>
                )}
              </div>
            </div>
          ) : (
            renderCreateNFTForm()
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase confirmation dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase an NFT. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTokenId && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Item:</span>
                <span className="font-medium">
                  {nftService.getNFTById(selectedTokenId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium text-primary">
                  {nftService.getNFTById(selectedTokenId)?.price} THC
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-medium">
                  {nftService.getNFTById(selectedTokenId)?.creator}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPurchaseDialog(false)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}