import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Settings, User, Wallet, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';

const Web3Sidebar = () => {
  const { user } = useWeb3();
  const location = useLocation();

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
      id: 'dashboard',
      label: 'Dashboard',
      icon: MessageCircle,
      path: '/dashboard',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      badge: '3'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Base Messages
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
          
          {typeof user.balance === "number" && (
            <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Balance</p>
              <p className="text-sm font-medium">{user.balance.toFixed(4)} ETH</p>
            </div>
          )}
        </div>
      )}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link to={item.path} key={item.id} className="block">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
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
