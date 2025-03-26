import React, { useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { ContextualTooltip } from './contextual-tooltip';
import { Wallet, X, ChevronDown } from 'lucide-react';

// Configure connectors
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 80001]
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY || ''}`,
    3: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY || ''}`,
    4: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY || ''}`,
    5: `https://goerli.infura.io/v3/${process.env.INFURA_KEY || ''}`,
    42: `https://kovan.infura.io/v3/${process.env.INFURA_KEY || ''}`,
    56: 'https://bsc-dataseed.binance.org/',
    97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    137: 'https://polygon-rpc.com/',
    80001: 'https://rpc-mumbai.maticvigil.com/'
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
});

// Get library
function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

// Define WalletConnect component
export function WalletConnect() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WalletConnectInner />
    </Web3ReactProvider>
  );
}

// Define inner component that uses web3-react hooks
function WalletConnectInner() {
  const { active, account, library, connector, activate, deactivate, error, chainId } = useWeb3React<Web3Provider>();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [userBalance, setUserBalance] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  // Setup tooltip on first load
  useEffect(() => {
    const hasSeenWalletTooltip = localStorage.getItem('hasSeenWalletTooltip');
    if (!hasSeenWalletTooltip) {
      setShowTooltip(true);
    }
  }, []);

  // Get user balance when connected
  useEffect(() => {
    if (library && account) {
      let stale = false;

      library.getBalance(account).then((balance: any) => {
        if (!stale) {
          // Convert to ETH and format with 4 decimal places
          const ethBalance = parseFloat(library.utils.formatEther(balance)).toFixed(4);
          setUserBalance(ethBalance);
        }
      }).catch(() => {
        if (!stale) {
          setUserBalance('Error');
        }
      });

      return () => {
        stale = true;
        setUserBalance('');
      };
    }
  }, [library, account]);

  // Trigger MetaMask wallet
  const connectInjected = async () => {
    try {
      await activate(injected);
      setShowWalletOptions(false);
    } catch (ex) {
      console.error(ex);
    }
  };

  // Trigger WalletConnect
  const connectWalletConnect = async () => {
    try {
      await activate(walletconnect);
      setShowWalletOptions(false);
    } catch (ex) {
      console.error(ex);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    try {
      deactivate();
    } catch (ex) {
      console.error(ex);
    }
  };

  // Handle tooltip acknowledgment
  const handleTooltipAcknowledge = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenWalletTooltip', 'true');
  };

  // Helper to truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get network name
  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 56: return 'Binance Smart Chain';
      case 137: return 'Polygon';
      case 3: return 'Ropsten Testnet';
      case 4: return 'Rinkeby Testnet';
      case 5: return 'Goerli Testnet';
      case 42: return 'Kovan Testnet';
      case 97: return 'BSC Testnet';
      case 80001: return 'Mumbai Testnet';
      default: return 'Unknown Network';
    }
  };

  return (
    <div className="relative">
      <ContextualTooltip
        id="wallet-connect-tooltip"
        title="Connect Your Wallet"
        content={
          <div className="space-y-2">
            <p>Connect your crypto wallet to access advanced trading features and securely manage your assets.</p>
            <p>Your wallet serves as your identity in the Trade Hybrid metaverse.</p>
          </div>
        }
        position="bottom"
        highlight={true}
        showArrow={true}
        autoShow={showTooltip}
        onAcknowledge={handleTooltipAcknowledge}
        persistent={false}
      >
        {active && account ? (
          // Connected state
          <Button 
            variant="outline" 
            className="flex items-center gap-2 pr-2"
            onClick={() => setShowWalletOptions(!showWalletOptions)}
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{truncateAddress(account)}</span>
            <span className="inline sm:hidden">Connected</span>
            {userBalance && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-1 rounded-full">
                {userBalance} ETH
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          // Not connected state
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowWalletOptions(!showWalletOptions)}
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </Button>
        )}
      </ContextualTooltip>

      {/* Wallet options dropdown */}
      {showWalletOptions && (
        <Card className="absolute right-0 mt-2 z-50 w-72 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Connect Wallet</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setShowWalletOptions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {active && account && (
              <CardDescription>
                Connected to {getNetworkName(chainId)}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-2 pb-2">
            {active && account ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Connected Account</div>
                  <div className="font-mono text-sm break-all">{account}</div>
                </div>
                
                {userBalance && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Balance</div>
                    <div className="font-medium">{userBalance} ETH</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={connectInjected}
                >
                  <img 
                    src="https://metamask.io/images/metamask-logo.png" 
                    alt="MetaMask" 
                    className="w-5 h-5 mr-2" 
                  />
                  MetaMask / Browser Wallet
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={connectWalletConnect}
                >
                  <img 
                    src="https://1000logos.net/wp-content/uploads/2022/05/WalletConnect-Logo.png" 
                    alt="WalletConnect" 
                    className="w-5 h-5 mr-2" 
                  />
                  WalletConnect
                </Button>
              </div>
            )}
          </CardContent>
          
          {active && (
            <CardFooter className="pt-2">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}