import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PopupContainer } from '@/components/ui/popup-container';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Coins, 
  ArrowDownUp, 
  Wallet, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw,
  Link as LinkIcon, 
  Copy as CopyIcon,
  Info as InfoIcon,
  Trophy,
  Network,
  ChevronsUpDown,
  Sparkles,
  Copy,
  CheckCircle2,
  Rocket,
  ExternalLink,
  Layers,
  Server,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';
import { THC_TOKEN_CONFIG, calculateStakingRewards, calculateStakingApy } from '@/lib/contracts/thc-token-info';
import { useAffiliateTracking, AffiliateService } from '@/lib/services/affiliate-service';
import { THC_TOKEN } from '@/lib/constants';
import { THCMembershipCard } from '@/components/ui/thc-membership-display';
import { useSolanaAuth, MembershipTier } from '@/lib/context/SolanaAuthProvider';
import { Lock } from 'lucide-react';

export default function StakeAndBake() {
  const [activeTab, setActiveTab] = useState('staking');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [stakeDuration, setStakeDuration] = useState('90');
  const [autoCompound, setAutoCompound] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [thcBalance, setThcBalance] = useState(156.75);
  const [stakedAmount, setStakedAmount] = useState(325.5);
  const [referralCount, setReferralCount] = useState(5);
  const [referralAddress, setReferralAddress] = useState('');
  const [matrixTier, setMatrixTier] = useState(1);
  const [referralLink, setReferralLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasCreatedMatrix, setHasCreatedMatrix] = useState(false);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  
  // Solana Validator Information
  const [validatorIdentity, setValidatorIdentity] = useState("2wbzum5jnZscYNqBwTUPmk7X6RngRnJajY8KMpocJTNQ");
  const [voteAccount, setVoteAccount] = useState("7BTUDc1EaAgWjQvm4BipvrXJsbmxRxRRrShcQzCPcRJ2");
  const [validatorStats, setValidatorStats] = useState({
    commission: "0.5%",
    activatedStake: "0.0",
    totalStakers: 0,
    epochVoteCredits: 0,
    lastVote: 0,
    uptime: "99.8%",
    currentEpoch: 422,
    epochProgress: 68,
    timeRemaining: "~12 hours"
  });
  const [solStakeAmount, setSolStakeAmount] = useState('1.0');
  const [fetchingValidatorInfo, setFetchingValidatorInfo] = useState(false);
  const [showCommissionAdjustment, setShowCommissionAdjustment] = useState(false);
  const [newCommission, setNewCommission] = useState(0.5);
  const [isValidatorOperator, setIsValidatorOperator] = useState(false);
  const [dualRewards, setDualRewards] = useState({
    solRewards: 0.055, // 5.5% APY in SOL
    thcRewards: 0.08,  // 8% APY in THC tokens
    thcBonus: 0.02     // 2% bonus for staking through our validator
  });
  
  // Get the Solana wallet auth context
  const solanaAuth = useSolanaAuth();
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null);
  
  // Get the toast function for notifications
  const { toast } = useToast();
  
  // Use the affiliate tracking hook
  const { trackReferral, currentReferralCode, generateReferralLink, trackAction } = useAffiliateTracking();
  
  // For the matrix visualization
  const [matrixData, setMatrixData] = useState<any[]>([
    { id: 'you', level: 0, position: 0, filled: true, username: 'You', earnings: 0 },
    // Level 1 (2 positions)
    { id: 'L1P1', level: 1, position: 0, filled: true, username: 'trader92', earnings: 12.5 },
    { id: 'L1P2', level: 1, position: 1, filled: true, username: 'cryptomaster', earnings: 12.5 },
    // Level 2 (3 positions)
    { id: 'L2P1', level: 2, position: 0, filled: true, username: 'hodlgang', earnings: 6.25 },
    { id: 'L2P2', level: 2, position: 1, filled: true, username: 'moonshot', earnings: 6.25 },
    { id: 'L2P3', level: 2, position: 2, filled: false, username: '', earnings: 0 },
  ]);
  
  useEffect(() => {
    // Simulate connected wallet after 2 seconds
    const timer = setTimeout(() => {
      setConnectedWallet(true);
    }, 2000);
    
    // Generate random referral address
    const generatedAddress = 'TH' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setReferralAddress(generatedAddress);
    
    // Generate and set referral link based on address
    setReferralLink(generateReferralLink(generatedAddress));
    
    // Check if the user was referred by someone
    const storedReferralCode = AffiliateService.getStoredReferralCode();
    if (storedReferralCode) {
      setReferrerCode(storedReferralCode);
      console.log(`User was referred by: ${storedReferralCode}`);
    }
    
    // Check user's THC token membership tier if wallet is connected
    if (solanaAuth.walletConnected && solanaAuth.isAuthenticated) {
      const checkMembership = async () => {
        try {
          // Access the membership tier directly from the context
          if (solanaAuth.tokenMembership) {
            setMembershipTier(solanaAuth.tokenMembership.tier);
            console.log('User membership tier:', solanaAuth.tokenMembership.tier);
          }
        } catch (error) {
          console.error('Error checking THC token membership:', error);
        }
      };
      
      checkMembership();
    }
    
    return () => clearTimeout(timer);
  }, [generateReferralLink, solanaAuth.walletConnected, solanaAuth.isAuthenticated, solanaAuth.tokenMembership]);
  
  // Calculate estimated rewards
  const estimatedRewards = calculateStakingRewards(
    parseFloat(stakeAmount) || 0, 
    parseInt(stakeDuration) || 0
  );
  
  // Calculate APY based on staking period
  const currentApy = calculateStakingApy(parseInt(stakeDuration) || 0);
  
  // Handle staking action
  const handleStake = () => {
    if (!connectedWallet) return;
    
    const amount = parseFloat(stakeAmount);
    
    // Update UI with staked amount
    setStakedAmount(prev => prev + amount);
    setThcBalance(prev => prev - amount);
    setStakeAmount('');
    
    // Track staking action for affiliate rewards
    trackAction('stake', amount);
    
    // Log referrer if exists
    if (referrerCode) {
      console.log(`Staking ${amount} THC with referral from: ${referrerCode}`);
    }
    
    // Show success message via toast notification
    toast({
      title: "Staking Successful",
      description: `You've staked ${amount} THC tokens for ${stakeDuration} days`,
      variant: "default",
    });
  };
  
  // Handle matrix creation
  const handleCreateMatrix = () => {
    setHasCreatedMatrix(true);
    
    // Generate a realistic referral link
    const host = window.location.host;
    const newReferralLink = `https://${host}/?ref=${referralAddress}`;
    setReferralLink(newReferralLink);
    
    // Update matrix with realistic data
    updateMatrixData();
    
    // Track matrix creation for affiliate rewards (matrix activation fee would be 0.1 SOL)
    trackAction('registration');
    
    // Log referrer if exists for matrix creation
    if (referrerCode) {
      console.log(`Matrix created with referral from: ${referrerCode}`);
    }
    
    // In a real implementation, this would make a contract call to initialize the matrix
    
    // Show success notification
    toast({
      title: "Matrix Created!",
      description: "Your 2x3 affiliate matrix has been activated",
      variant: "default",
    });
  };
  
  // Function to update matrix data (would be connected to blockchain in real implementation)
  const updateMatrixData = () => {
    // This simulates getting updated matrix data from a blockchain or database
    const updatedMatrix = [
      { id: 'you', level: 0, position: 0, filled: true, username: 'You', earnings: 0 },
      // Level 1 (2 positions)
      { id: 'L1P1', level: 1, position: 0, filled: true, username: 'trader92', earnings: 12.5 },
      { id: 'L1P2', level: 1, position: 1, filled: true, username: 'cryptomaster', earnings: 12.5 },
      // Level 2 (3 positions)
      { id: 'L2P1', level: 2, position: 0, filled: true, username: 'hodlgang', earnings: 6.25 },
      { id: 'L2P2', level: 2, position: 1, filled: true, username: 'moonshot', earnings: 6.25 },
      { id: 'L2P3', level: 2, position: 2, filled: false, username: '', earnings: 0 },
    ];
    
    setMatrixData(updatedMatrix);
  };

  // Handle copying of referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    
    // Show toast notification
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard",
    });
  };
  
  // Fetch validator information from Solana network
  const fetchValidatorInfo = async () => {
    if (!window.solana || !solanaAuth.walletConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Solana wallet first",
        variant: "destructive",
      });
      return;
    }
    
    setFetchingValidatorInfo(true);
    
    try {
      // Import required modules from @solana/web3.js
      const { Connection, clusterApiUrl, PublicKey } = await import('@solana/web3.js');
      
      // Create connection to Solana network (mainnet-beta for production, devnet for testing)
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      
      // Convert validator identity and vote account to PublicKey objects
      const identityPubkey = new PublicKey(validatorIdentity);
      const votePubkey = new PublicKey(voteAccount);
      
      // Fetch validator information from the network
      const voteAccounts = await connection.getVoteAccounts();
      
      // Find our validator in the vote accounts
      const ourValidator = voteAccounts.current.find(
        account => account.votePubkey === voteAccount
      ) || voteAccounts.delinquent.find(
        account => account.votePubkey === voteAccount
      );
      
      if (ourValidator) {
        // Get stake accounts info - all accounts delegated to this validator
        const stakeAccounts = await connection.getProgramAccounts(
          new PublicKey('Stake11111111111111111111111111111111111111'),
          {
            filters: [
              {
                memcmp: {
                  offset: 124, // Offset for vote account data in stake account
                  bytes: votePubkey.toBase58()
                }
              }
            ]
          }
        );
        
        // Calculate total SOL staked
        const totalActivatedStake = ourValidator.activatedStake / 10**9; // Convert lamports to SOL
        
        // Get validator commission and other stats
        const commission = (ourValidator.commission / 100).toFixed(1) + '%';
        const lastVote = ourValidator.lastVote;
        const epochVoteCredits = (ourValidator.epochCredits && ourValidator.epochCredits.length > 0) 
          ? ourValidator.epochCredits[ourValidator.epochCredits.length - 1][1] 
          : 0;
        
        // Get the current epoch info to check if commission changes are allowed
        const epochInfo = await connection.getEpochInfo();
        
        // Update validator stats with real data
        setValidatorStats(prev => ({
          ...prev,
          commission: commission,
          activatedStake: totalActivatedStake.toFixed(1),
          totalStakers: stakeAccounts.length,
          epochVoteCredits: epochVoteCredits,
          lastVote: lastVote,
          uptime: voteAccounts.delinquent.includes(ourValidator) ? "Delinquent" : "99.8%", // Could be calculated more precisely
          currentEpoch: epochInfo.epoch,
          epochProgress: Math.floor(epochInfo.slotIndex / epochInfo.slotsInEpoch * 100),
          timeRemaining: `~${Math.floor(24 * (1 - (epochInfo.slotIndex / epochInfo.slotsInEpoch)))} hours`
        }));
        
        toast({
          title: "Validator Info Updated",
          description: "Latest validator statistics have been fetched from the Solana network",
        });
        
        // Check if the wallet is the vote account authority (validator operator)
        try {
          // Get the vote account info
          const voteAccountInfo = await connection.getAccountInfo(votePubkey);
          
          // In a real implementation, we would check if the connected wallet is the vote account authority
          // For demo purposes, we're just enabling the option if the wallet is connected
          if (voteAccountInfo && voteAccountInfo.data && solanaAuth.walletConnected) {
            // For demo purposes only
            setIsValidatorOperator(true);
          }
        } catch (error) {
          console.error("Error checking vote account authority:", error);
        }
      } else {
        throw new Error("Validator not found in active vote accounts");
      }
    } catch (error) {
      console.error("Error fetching validator info:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch validator information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFetchingValidatorInfo(false);
    }
  };

  // Update validator commission
  const handleUpdateCommission = async () => {
    if (!window.solana || !solanaAuth.walletConnected || !isValidatorOperator) {
      toast({
        title: "Access Denied",
        description: "You must be the validator operator to change commission",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Import required modules from @solana/web3.js
      const { 
        Connection, 
        clusterApiUrl, 
        PublicKey, 
        Transaction, 
        VoteProgram,
        sendAndConfirmTransaction
      } = await import('@solana/web3.js');
      
      // Create connection to Solana network
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      
      // Get the current epoch info to check if commission changes are allowed
      const epochInfo = await connection.getEpochInfo();
      const slotsInEpoch = epochInfo.slotsInEpoch;
      const currentSlot = epochInfo.slotIndex;
      
      // Commission changes can only be made during the first half of an epoch
      if (currentSlot > slotsInEpoch / 2) {
        toast({
          title: "Commission Change Not Allowed",
          description: "Commission changes can only be made during the first half of an epoch",
          variant: "destructive",
        });
        return;
      }
      
      // Convert value to percentage points (0.5% -> 50)
      const commissionPercentage = Math.floor(newCommission * 100);
      
      // Show progress notification
      toast({
        title: "Preparing Transaction",
        description: "Setting up the commission update transaction...",
      });
      
      // Create vote commission update instruction
      const votePubkey = new PublicKey(voteAccount);
      const updateCommissionTransaction = VoteProgram.updateCommission({
        votePubkey: votePubkey,
        authorizedVoterPubkey: wallet.publicKey!,
        commission: commissionPercentage
      });
      
      // Create transaction
      const transaction = new Transaction().add(updateCommissionTransaction);
      
      // Set options with recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;
      
      // Sign the transaction
      const signedTransaction = await wallet.signTransaction!(transaction);
      
      // Send and confirm transaction
      toast({
        title: "Confirm Transaction",
        description: "Please confirm the commission update transaction in your wallet",
      });
      
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      toast({
        title: "Commission Updated",
        description: `Validator commission successfully updated to ${newCommission}%`,
        variant: "default",
      });
      
      // Update UI
      setValidatorStats(prev => ({
        ...prev,
        commission: `${newCommission}%`,
      }));
      
      // Close the commission adjustment form
      setShowCommissionAdjustment(false);
      
      // Refresh validator info
      fetchValidatorInfo();
    } catch (error) {
      console.error("Error updating validator commission:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update validator commission. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle SOL staking
  const handleStakeSol = async () => {
    if (!window.solana || !solanaAuth.walletConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Solana wallet first",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(solStakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import required modules from Solana Web3.js
      const { 
        Connection, 
        clusterApiUrl, 
        PublicKey, 
        Transaction, 
        StakeProgram, 
        Authorized, 
        Lockup,
        sendAndConfirmTransaction
      } = await import('@solana/web3.js');
      
      // Import Solana wallet adapter
      const { useWallet } = await import('@solana/wallet-adapter-react');
      const wallet = useWallet();
      
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected or doesn't support signing");
      }
      
      // Show progress notification
      toast({
        title: "Preparing Transaction",
        description: "Setting up the staking transaction...",
      });
      
      // Create connection to Solana network
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      
      // Convert validator vote account to PublicKey
      const votePubkey = new PublicKey(voteAccount);
      
      // Calculate the amount in lamports (1 SOL = 10^9 lamports)
      const lamports = amount * 10**9;
      
      // Create a new stake account with wallet as the authority
      const fromPubkey = wallet.publicKey;
      
      // Create a stake account - this account will hold the staked SOL
      const stakeAccount = StakeProgram.createAccount({
        fromPubkey: fromPubkey, // The account paying for the transaction
        stakePubkey: fromPubkey, // The stake account (usually a new derived account)
        authorized: new Authorized(fromPubkey, fromPubkey), // Staker and withdrawer authorities
        lockup: new Lockup(0, 0, fromPubkey), // No lockup
        lamports: lamports // Amount to stake
      });
      
      // Create a delegation transaction to delegate stake to our validator
      const delegateTransaction = StakeProgram.delegate({
        stakePubkey: fromPubkey, // The stake account
        authorizedPubkey: fromPubkey, // The account with staker authority
        votePubkey: votePubkey // The validator's vote account
      });
      
      // Combine transactions
      const transaction = new Transaction()
        .add(stakeAccount)
        .add(delegateTransaction);
      
      // Set transaction options with recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      
      // Sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send and confirm transaction
      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet",
      });
      
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Show pending notification
      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Update validator stats
      fetchValidatorInfo();
      
      // Show success message
      toast({
        title: "Staking Successful!",
        description: `You have successfully staked ${amount} SOL to our validator.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error staking SOL:", error);
      
      toast({
        title: "Staking Failed",
        description: error instanceof Error ? error.message : "There was an error processing your staking transaction. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <PopupContainer className="min-h-screen container mx-auto py-8 px-4" padding>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">THC Token - Platform Currency</h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          Stake your THC tokens to earn rewards, build your affiliate network, and access platform benefits with reduced fees.
        </p>
        
        {referrerCode && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
            <LinkIcon size={16} className="mr-2" />
            <span className="text-sm">You were referred by: {referrerCode}</span>
          </div>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="staking" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="staking" className="text-lg py-3">
              <Coins className="mr-2 h-5 w-5" />
              THC
            </TabsTrigger>
            <TabsTrigger value="validator" className="text-lg py-3">
              <Server className="mr-2 h-5 w-5" />
              Validator
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-lg py-3">
              <Network className="mr-2 h-5 w-5" />
              Matrix
            </TabsTrigger>
            <TabsTrigger value="acquire" className="text-lg py-3">
              <Rocket className="mr-2 h-5 w-5" />
              Acquire THC
            </TabsTrigger>
          </TabsList>
          
          {/* Validator Tab */}
          <TabsContent value="validator">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="mr-2 h-5 w-5 text-green-500" />
                      Solana Validator
                    </CardTitle>
                    <CardDescription>
                      Stake your SOL tokens to our validator and earn rewards while supporting the Solana network.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                        <h3 className="text-sm font-medium flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-green-600" />
                          Validator Status: <span className="ml-1 font-bold text-green-600">Active</span>
                        </h3>
                        <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                          Our validator is currently active and processing transactions on the Solana network.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="solStakeAmount">Amount to Stake (SOL)</Label>
                        <div className="flex mt-2">
                          <Input 
                            id="solStakeAmount" 
                            type="number" 
                            value={solStakeAmount} 
                            onChange={(e) => setSolStakeAmount(e.target.value)} 
                            placeholder="Enter SOL amount" 
                            className="flex-1" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2"
                            onClick={() => setSolStakeAmount('1.0')}
                          >
                            Max
                          </Button>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Minimum stake: 0.1 SOL
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <RefreshCcw size={16} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium">Estimated Rewards</span>
                          </div>
                          <Badge className="bg-blue-600">~5.5% APY</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="text-xl font-bold">
                            +{(parseFloat(solStakeAmount || '0') * 0.055).toFixed(3)} SOL
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Annual yield (paid out continuously)
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      disabled={!connectedWallet || parseFloat(solStakeAmount) <= 0}
                      onClick={handleStakeSol}
                    >
                      {!connectedWallet ? 'Connect Wallet to Stake' : 'Stake SOL to Validator'}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <InfoIcon className="mr-2 h-5 w-5 text-blue-500" />
                      Validator Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Validator Identity:</span>
                        <div className="flex items-center">
                          <span className="text-sm font-mono truncate max-w-[200px]">{validatorIdentity.slice(0, 8)}...{validatorIdentity.slice(-8)}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => {
                            navigator.clipboard.writeText(validatorIdentity);
                            toast({
                              title: "Copied!",
                              description: "Validator identity copied to clipboard",
                            });
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Vote Account:</span>
                        <div className="flex items-center">
                          <span className="text-sm font-mono truncate max-w-[200px]">{voteAccount.slice(0, 8)}...{voteAccount.slice(-8)}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => {
                            navigator.clipboard.writeText(voteAccount);
                            toast({
                              title: "Copied!",
                              description: "Vote account copied to clipboard",
                            });
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Commission:</span>
                        <span className="text-sm font-semibold">{validatorStats.commission}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Activated Stake:</span>
                        <span className="text-sm font-semibold">{validatorStats.activatedStake} SOL</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Total Stakers:</span>
                        <span className="text-sm font-semibold">{validatorStats.totalStakers}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Uptime:</span>
                        <span className="text-sm font-semibold">{validatorStats.uptime}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center" 
                        onClick={fetchValidatorInfo}
                        disabled={fetchingValidatorInfo}
                      >
                        {fetchingValidatorInfo ? 
                          <div className="flex items-center">
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </div> : 
                          <div className="flex items-center">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh Stats
                          </div>
                        }
                      </Button>
                      
                      <a 
                        href={`https://explorer.solana.com/address/${validatorIdentity}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                      Validator Performance
                    </CardTitle>
                    <CardDescription>
                      Track our validator's performance metrics over time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Current Epoch Activity</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-slate-500">Credits Earned</div>
                              <div className="text-lg font-bold">{validatorStats.epochVoteCredits}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Last Vote</div>
                              <div className="text-lg font-bold">Slot {validatorStats.lastVote}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Projected Epoch Timeline</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Current Progress</span>
                              <span>68%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                            <div className="flex justify-between text-xs mt-1">
                              <span>
                                <Clock className="h-3 w-3 inline mr-1" />
                                ~12 hours remaining
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Stake Distribution</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg h-[200px] flex items-center justify-center">
                          {/* This would be a chart in a real implementation */}
                          <div className="text-center text-slate-500">
                            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <span className="text-xs">Stake distribution chart would appear here</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-md">
                      <h3 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Validator Security
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <ArrowRight className="h-3 w-3 text-indigo-500 mr-1 mt-1 flex-shrink-0" />
                          <span>Our validator runs on enterprise-grade hardware with redundant systems</span>
                        </div>
                        <div className="flex items-start">
                          <ArrowRight className="h-3 w-3 text-indigo-500 mr-1 mt-1 flex-shrink-0" />
                          <span>24/7 monitoring ensures maximum uptime and performance</span>
                        </div>
                        <div className="flex items-start">
                          <ArrowRight className="h-3 w-3 text-indigo-500 mr-1 mt-1 flex-shrink-0" />
                          <span>Secure key management with hardware security modules</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        
          {/* Staking Tab */}
          <TabsContent value="staking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Coins className="mr-2 h-5 w-5 text-blue-500" />
                      Stake THC Tokens
                    </CardTitle>
                    <CardDescription>
                      Earn rewards by staking your THC tokens. The longer you stake, the higher the APY.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stakeAmount">Amount to Stake</Label>
                        <div className="flex mt-2">
                          <Input 
                            id="stakeAmount" 
                            type="number" 
                            value={stakeAmount} 
                            onChange={(e) => setStakeAmount(e.target.value)} 
                            placeholder="Enter THC amount" 
                            className="flex-1" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2"
                            onClick={() => setStakeAmount(thcBalance.toString())}
                          >
                            Max
                          </Button>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Available: {thcBalance.toFixed(2)} THC
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="stakeDuration">Staking Period</Label>
                        <Select value={stakeDuration} onValueChange={setStakeDuration}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select staking period" />
                          </SelectTrigger>
                          <SelectContent>
                            {THC_TOKEN_CONFIG.stakingApyTiers.map((tier, index) => (
                              <SelectItem key={index} value={tier.minStakingPeriod.toString()}>
                                {tier.minStakingPeriod} Days - {tier.apy}% APY
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="auto-compound" 
                          checked={autoCompound} 
                          onChange={(e) => setAutoCompound(e.target.checked)} 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="auto-compound">Auto-compound rewards (90+ day periods)</Label>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RefreshCcw size={16} className="text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium">Estimated Rewards</span>
                        </div>
                        <Badge className="bg-green-600">{currentApy}% APY</Badge>
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-bold">
                          +{estimatedRewards.toFixed(2)} THC
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          After {stakeDuration} days
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      disabled={!connectedWallet || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > thcBalance}
                      onClick={handleStake}
                    >
                      {!connectedWallet ? 'Connect Wallet to Stake' : 'Stake THC Tokens'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-purple-500" />
                      Your Staking Stats
                    </CardTitle>
                    <CardDescription>
                      Overview of your current staking positions and rewards.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Staked</div>
                        <div className="text-2xl font-bold mt-1">{stakedAmount.toFixed(2)} THC</div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Est. Monthly Yield</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          +{(stakedAmount * currentApy / 100 / 12).toFixed(2)} THC
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Staking Positions</div>
                      <div className="space-y-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">90-Day Stake</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Ends in 47 days
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">125.5 THC</div>
                              <div className="text-xs text-green-600">+4.2 THC earned</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>48%</span>
                            </div>
                            <Progress value={48} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">180-Day Stake</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Ends in 162 days
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">200.0 THC</div>
                              <div className="text-xs text-green-600">+2.8 THC earned</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>10%</span>
                            </div>
                            <Progress value={10} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium">Staking Benefits</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>Trading fee reduction: 25%</span>
                        </div>
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>Premium market data access</span>
                        </div>
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>THC governance voting rights</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* 2x3 Matrix Tab */}
          <TabsContent value="matrix">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Network className="mr-2 h-5 w-5 text-indigo-500" />
                      Matrix System
                    </CardTitle>
                    <CardDescription>
                      Build your affiliate network and earn passive income through our infinite spillover matrix structure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!hasCreatedMatrix ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
                          <p className="text-sm">
                            Create your infinite spillover matrix to start earning affiliate commissions. This requires a one-time 
                            activation fee of 0.1 SOL, which covers the smart contract initialization.
                          </p>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">How It Works</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>You occupy the top position in your personal infinite spillover matrix</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Earn 2.5% commission on all trades made by your direct referrals</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Earn 1.25% commission on all trades made by your level 2 referrals</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Matrix automatically allocates referrals in a spillover system</span>
                            </li>
                          </ul>
                        </div>
                        
                        <Button 
                          onClick={handleCreateMatrix}
                          disabled={!connectedWallet}
                          className="w-full"
                        >
                          {!connectedWallet ? 'Connect Wallet to Create Matrix' : 'Create Your Matrix (0.1 SOL)'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-yellow-600" size={16} />
                            <span className="font-medium">Matrix Active</span>
                          </div>
                          <p className="text-sm mt-2">
                            Your infinite spillover matrix is active and ready to receive referrals. Share your referral link to start building your network!
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="referralLink">Your Referral Link</Label>
                          <div className="flex mt-2">
                            <Input 
                              id="referralLink" 
                              value={referralLink} 
                              readOnly 
                              className="flex-1" 
                            />
                            <Button 
                              variant="outline" 
                              className="ml-2"
                              onClick={handleCopyLink}
                            >
                              {linkCopied ? 'Copied!' : <Copy size={16} />}
                            </Button>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Share this link to invite new users to Trade Hybrid
                          </p>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-blue-500" />
                              <span className="font-medium">Your Referrals</span>
                            </div>
                            <Badge>{referralCount} users</Badge>
                          </div>
                          <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Direct (Level 1)</span>
                              <span className="font-medium">2 users</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Indirect (Level 2)</span>
                              <span className="font-medium">3 users</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <Coins size={16} className="text-green-500" />
                              <span className="font-medium">Earnings</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">This Month</span>
                              <span className="font-medium text-green-600">+25.0 THC</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Earned</span>
                              <span className="font-medium text-green-600">+37.5 THC</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ChevronsUpDown className="mr-2 h-5 w-5 text-emerald-500" />
                      Your Matrix Visualization
                    </CardTitle>
                    <CardDescription>
                      Visual representation of your infinite spillover matrix structure and positions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!hasCreatedMatrix ? (
                      <div className="flex flex-col items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Network size={48} className="text-slate-400 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
                          Create your infinite spillover matrix to view your network structure and track referral earnings.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="relative">
                          {/* Level 0 - You */}
                          <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-blue-700 dark:text-blue-300 text-sm">YOU</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">Top</div>
                            </div>
                          </div>
                          
                          {/* Level 1 - Direct Referrals (2 positions) */}
                          <div className="flex justify-center gap-16 mb-8 relative">
                            <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[200px] h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-1 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-green-700 dark:text-green-300 text-xs">trader92</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">+12.5 THC</div>
                            </div>
                            
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-green-700 dark:text-green-300 text-xs">cryptom...</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">+12.5 THC</div>
                            </div>
                          </div>
                          
                          {/* Level 2 - Indirect Referrals (3 positions) */}
                          <div className="flex justify-center gap-8 relative">
                            <div className="absolute top-[-40px] left-1/4 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-40px] left-2/4 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-1/4 transform -translate-x-1/2 w-[280px] h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-3 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-4 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-5 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs">hodlgang</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">+6.25 THC</div>
                            </div>
                            
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs">moonshot</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">+6.25 THC</div>
                            </div>
                            
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center">
                              <div className="text-xs text-slate-400 dark:text-slate-500">Empty</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy size={16} className="text-yellow-600" />
                            <span className="font-medium">Matrix Benefits</span>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>2.5% commission on all direct referral trades</span>
                            </li>
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>1.25% commission on all level 2 referral trades</span>
                            </li>
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>Automatic matrix filling from team spillover</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Add a new row for the advanced affiliate tools */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
                Advanced Affiliate Tools
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Affiliate Link Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="affiliate-link">Your Affiliate Link</Label>
                      <div className="flex">
                        <Input 
                          id="affiliate-link" 
                          value={`https://pro.tradehybrid.club?ref=${referralAddress || 'THC' + Math.random().toString(36).substring(2, 8)}`} 
                          readOnly 
                          className="flex-1 rounded-r-none"
                        />
                        <Button 
                          onClick={() => {
                            const customDomain = 'https://pro.tradehybrid.club';
                            navigator.clipboard.writeText(`${customDomain}?ref=${referralAddress || 'THC' + Math.random().toString(36).substring(2, 8)}`);
                            toast({
                              title: "Copied!",
                              description: "Affiliate link copied to clipboard",
                            });
                          }}
                          className="rounded-l-none"
                        >
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Share on Social Media</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customDomain = 'https://pro.tradehybrid.club';
                            window.open(`https://twitter.com/intent/tweet?text=Join%20Trade%20Hybrid%20and%20earn%20with%20me!&url=${encodeURIComponent(`${customDomain}?ref=${referralAddress || 'default'}`)}`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customDomain = 'https://pro.tradehybrid.club';
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${customDomain}?ref=${referralAddress || 'default'}`)}`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customDomain = 'https://pro.tradehybrid.club';
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(`${customDomain}?ref=${referralAddress || 'default'}`)}&text=Join%20Trade%20Hybrid%20and%20earn%20with%20me!`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          Telegram
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium">Affiliate Stats</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">Total Referrals</div>
                          <div className="text-xl font-bold">
                            {Math.floor(Math.random() * 10)}
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">Earnings (THC)</div>
                          <div className="text-xl font-bold">
                            {(Math.random() * 1000).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-900/30 border-blue-800">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Affiliate Tips</AlertTitle>
                      <AlertDescription className="text-sm">
                        Share your link on social media, in trading communities, or with friends to maximize your matrix filling and earn THC tokens.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Acquire THC Tab */}
          <TabsContent value="acquire">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5 text-blue-500" />
                    Acquire THC Tokens
                  </CardTitle>
                  <CardDescription>
                    Get your THC tokens via pump.fun and join our ecosystem with multiple benefits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 
                    border border-blue-200 dark:border-blue-800 p-6 rounded-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
                        <Layers className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">THC Token on pump.fun</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">The official Trade Hybrid platform token</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-md">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Current Price</div>
                        <div className="text-2xl font-bold mt-1">${THC_TOKEN.price.toFixed(6)} USD</div>
                        <div className="text-xs text-green-600 mt-1">+{THC_TOKEN.priceChange24h}% (24h)</div>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-md">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Contract Address</div>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">
                            {THC_TOKEN.contractAddress.substring(0, 8)}...{THC_TOKEN.contractAddress.substring(THC_TOKEN.contractAddress.length - 8)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              navigator.clipboard.writeText(THC_TOKEN.contractAddress);
                              toast({
                                title: "Copied!",
                                description: "Contract address copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <a
                            href={`${THC_TOKEN.explorerUrl}${THC_TOKEN.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center"
                          >
                            View on Solscan
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-md relative overflow-hidden mb-6">
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Why Buy THC Tokens?</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Reduced platform fees (up to 50% discount)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Stake to earn passive income (up to 20% APY)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Participate in platform governance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Access to exclusive premium features</span>
                          </li>
                        </ul>
                      </div>
                      <div className="absolute top-0 right-0 opacity-10">
                        <Coins className="h-32 w-32" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <a 
                        href={THC_TOKEN.pumpFunUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
                      >
                        <Rocket className="mr-2 h-5 w-5" />
                        Buy THC on pump.fun
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        pump.fun is the premier Solana token platform. Make sure you're connected to your Solana wallet before purchasing.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-md">
                    <h3 className="font-medium mb-3">THC Token Membership Benefits</h3>
                    <p className="text-sm mb-4">
                      Holding THC tokens automatically qualifies you for premium membership benefits on the Trade Hybrid platform. 
                      Your membership tier depends on the amount of THC tokens in your wallet:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-slate-500">Basic</Badge>
                            <span className="font-medium">0-999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">5% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-blue-500">Advanced</Badge>
                            <span className="font-medium">1,000-9,999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">25% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-purple-500">Premium</Badge>
                            <span className="font-medium">10,000-49,999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">35% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-amber-500">Elite</Badge>
                            <span className="font-medium">50,000+ THC</span>
                          </div>
                          <span className="text-sm text-slate-500">50% fee discount</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                      <h3 className="font-medium mb-4 flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-blue-500" />
                        Your Current Membership Status
                      </h3>
                      
                      {solanaAuth.walletConnected && solanaAuth.isAuthenticated ? (
                        <div>
                          <THCMembershipCard />
                          <p className="text-sm mt-3 text-slate-600 dark:text-slate-400">
                            Your THC token balance determines your membership tier and platform benefits.
                            {membershipTier === MembershipTier.Basic && "Upgrade to Advanced tier by acquiring more THC tokens!"}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-sm mb-3">Connect your Solana wallet to check your membership status</p>
                          <Button 
                            variant="outline" 
                            onClick={() => solanaAuth.login()}
                            disabled={solanaAuth.isAuthenticating}
                            className="text-sm"
                          >
                            {solanaAuth.isAuthenticating ? 'Connecting...' : 'Connect Wallet'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PopupContainer>
  );
}

// Add custom CSS for visualization 
const styles = `
.left-calc-1 {
  left: calc(50% - 100px);
}
.left-calc-2 {
  left: calc(50% + 100px);
}
.left-calc-3 {
  left: calc(25% - 65px);
}
.left-calc-4 {
  left: calc(50% - 0px);
}
.left-calc-5 {
  left: calc(75% + 65px);
}
`;

// Adding the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}