import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, MessageCircle, Zap } from 'lucide-react';

interface Web3AuthGuardProps {
  children: React.ReactNode;
}

const Web3AuthGuard = ({ children }: Web3AuthGuardProps) => {
  const { user, isConnecting, connect } = useWeb3();

  if (user) {
    return <>{children}</>;
  }

  const handleMetaMaskConnect = () => {
    connect('metamask');
  };

  const handleCoinbaseConnect = () => {
    connect('coinbase');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Base Messaging Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your Web3 wallet to access decentralized messaging
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                <CardDescription className="text-base">
                  Choose your preferred wallet to sign in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleMetaMaskConnect} 
                  disabled={isConnecting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isConnecting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5 mr-2" />
                      Connect with MetaMask
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={handleCoinbaseConnect} 
                  disabled={isConnecting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isConnecting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect with Coinbase Wallet
                    </div>
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Secure Web3 authentication with your private keys
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                  <p className="text-gray-600 text-sm">Your messages are encrypted and stored on-chain</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Disappearing Messages</h3>
                  <p className="text-gray-600 text-sm">Snapchat-style messages that auto-delete</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Base Network</h3>
                  <p className="text-gray-600 text-sm">Fast and low-cost transactions on Base</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Web3AuthGuard;
