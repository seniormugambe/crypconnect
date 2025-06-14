
import React, { useState } from 'react';
import { Web3Provider } from '@/contexts/Web3Context';
import Web3AuthGuard from '@/components/Web3AuthGuard';
import Web3Sidebar from '@/components/Web3Sidebar';
import Web3UserProfile from '@/components/Web3UserProfile';
import { MessagesPage } from '@/components/MessagesPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('messages');

  const renderPage = () => {
    switch (currentPage) {
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Web3UserProfile />
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <MessagesPage />;
    }
  };

  return (
    <Web3Provider>
      <Web3AuthGuard>
        <div className="flex h-screen bg-gray-50">
          <Web3Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
          <main className="flex-1 overflow-hidden">
            {renderPage()}
          </main>
        </div>
      </Web3AuthGuard>
    </Web3Provider>
  );
};

export default Index;
