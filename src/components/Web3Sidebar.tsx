
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Settings, User, Wallet, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUnlockKey } from "./../hooks/useUnlockKey";

const LOCK_ADDRESS = "0xb2b196026ac3fc1bcbd9037186040acf44ff6b68";
const CHAIN_ID = 1;

interface Web3SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Web3Sidebar = ({ currentPage, onPageChange }: Web3SidebarProps) => {
  const { user } = useWeb3();
  const userAddress = user?.address;
  const { hasKey: isPremium } = useUnlockKey(LOCK_ADDRESS, userAddress, CHAIN_ID);

  const copyAddress = () => {
    if (user) {
      navigator.clipboard.writeText(user.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const menuItems = [
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: '3'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          crypconnect
        </h1>
        <p className="text-sm text-gray-500 mt-1">Decentralized Messaging</p>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-blue-200">
              <AvatarImage src={user.avatar} alt="User avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.ensName || `${user.address.slice(0, 8)}...${user.address.slice(-4)}`}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  <Wallet className="w-3 h-3 mr-1" />
                  Base
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0"
                  onClick={copyAddress}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {user.balance && (
            <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Balance</p>
              <p className="text-sm font-medium">{parseFloat(user.balance).toFixed(4)} ETH</p>
            </div>
          )}
          <div className="mt-4 text-center">
            {isPremium ? (
              <Badge className="bg-green-100 text-green-700">Premium Member</Badge>
            ) : (
              <a
                href={`https://app.unlock-protocol.com/checkout?locks=${LOCK_ADDRESS}&network=${CHAIN_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition"
              >
                Subscribe to Premium
              </a>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-12 ${
                  currentPage === item.id 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">Powered by Base Network</p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Web3Sidebar;
