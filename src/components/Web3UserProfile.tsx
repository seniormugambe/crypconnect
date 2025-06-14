
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, LogOut, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Web3UserProfile = () => {
  const { user, disconnect } = useWeb3();

  if (!user) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const openInExplorer = () => {
    window.open(`https://basescan.org/address/${user.address}`, '_blank');
  };

  const getWalletDisplayName = () => {
    return user.walletType === 'metamask' ? 'MetaMask' : 'Coinbase Wallet';
  };

  const getWalletIcon = () => {
    if (user.walletType === 'metamask') {
      return <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-3 h-3 mr-1" />;
    }
    return <Wallet className="w-3 h-3 mr-1" />;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="w-20 h-20 border-4 border-blue-200">
            <AvatarImage src={user.avatar} alt="User avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
              {user.address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {user.ensName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
        </CardTitle>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Wallet className="w-3 h-3 mr-1" />
            Base Network
          </Badge>
          <Badge variant="secondary" className={user.walletType === 'metamask' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
            {getWalletIcon()}
            {getWalletDisplayName()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Wallet Address</label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
              {user.address.slice(0, 20)}...
            </code>
            <Button variant="outline" size="sm" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={openInExplorer}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {user.balance && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Balance</label>
            <div className="px-3 py-2 bg-gray-100 rounded text-sm">
              {parseFloat(user.balance).toFixed(4)} ETH
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={disconnect}
          className="w-full mt-6 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
};

export default Web3UserProfile;
