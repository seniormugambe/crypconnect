
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

interface Web3User {
  address: string;
  ensName?: string;
  avatar?: string;
  balance?: string;
  walletType?: 'metamask' | 'coinbase';
}

interface Web3ContextType {
  user: Web3User | null;
  isConnecting: boolean;
  connect: (walletType?: 'metamask' | 'coinbase') => Promise<void>;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'Base Messaging Platform',
  appLogoUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center'
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Web3User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
    }

    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return { ethereum, accounts, walletType: 'metamask' as const };
  };

  const connectCoinbaseWallet = async () => {
    const ethereum = coinbaseWallet.makeWeb3Provider();
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return { ethereum, accounts, walletType: 'coinbase' as const };
  };

  const connect = async (walletType: 'metamask' | 'coinbase' = 'metamask') => {
    try {
      setIsConnecting(true);
      
      let connectionResult;
      
      if (walletType === 'metamask') {
        connectionResult = await connectMetaMask();
      } else {
        connectionResult = await connectCoinbaseWallet();
      }

      const { ethereum, accounts, walletType: connectedWalletType } = connectionResult;
      const address = accounts[0];
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      
      // Get balance
      const balance = await ethersProvider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);

      // Try to get ENS name (will work on mainnet)
      let ensName;
      try {
        const network = await ethersProvider.getNetwork();
        // Only attempt ENS lookup on mainnet (1) or Goerli (5)
        if (network.chainId === 1 || network.chainId === 5) {
          ensName = await ethersProvider.lookupAddress(address);
        }
      } catch (error) {
        // Suppress ENS errors for unsupported networks
        if (process.env.NODE_ENV === 'development') {
          console.log('ENS lookup failed:', error);
        }
      }

      const userData: Web3User = {
        address,
        ensName: ensName || undefined,
        balance: formattedBalance,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        walletType: connectedWalletType
      };

      setUser(userData);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      
      // Store connection state
      localStorage.setItem('web3_connected', 'true');
      localStorage.setItem('web3_user', JSON.stringify(userData));
      localStorage.setItem('web3_wallet_type', connectedWalletType);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)} via ${connectedWalletType === 'metamask' ? 'MetaMask' : 'Coinbase Wallet'}`,
      });

    } catch (error: any) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setUser(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('web3_connected');
    localStorage.removeItem('web3_user');
    localStorage.removeItem('web3_wallet_type');
    
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out",
    });
  };

  // Auto-connect on app start if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('web3_connected');
    const storedUser = localStorage.getItem('web3_user');
    const storedWalletType = localStorage.getItem('web3_wallet_type') as 'metamask' | 'coinbase';
    
    if (wasConnected && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Try to reconnect to the same wallet type
        if (storedWalletType) {
          connect(storedWalletType).catch(console.error);
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('web3_connected');
        localStorage.removeItem('web3_user');
        localStorage.removeItem('web3_wallet_type');
      }
    }
  }, []);

  return (
    <Web3Context.Provider value={{
      user,
      isConnecting,
      connect,
      disconnect,
      provider,
      signer
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};
