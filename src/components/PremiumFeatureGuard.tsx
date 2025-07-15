import React from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useUnlockKey } from "../hooks/useUnlockKey";

const LOCK_ADDRESS = "0xBf25682b4A171490ce2CEe5f28417256426805F7";
const CHAIN_ID = 1; // Ethereum mainnet

export const PremiumFeatureGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConnecting, connect } = useWeb3();
  const userAddress = user?.address;
  const { hasKey, loading, error } = useUnlockKey(LOCK_ADDRESS, userAddress, CHAIN_ID);

  if (!userAddress) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
        <p>You must connect your wallet to access this premium feature.</p>
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => connect()}>Connect Wallet</button>
      </div>
    );
  }

  if (loading || isConnecting) {
    return <div>Checking premium access...</div>;
  }

  if (error) {
    return <div className="p-4 border rounded bg-red-50 text-red-900">Error: {error}</div>;
  }

  if (!hasKey) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
        <p>This is a premium feature. You need to purchase a key to access it.</p>
        <a
          href={`https://app.unlock-protocol.com/checkout?locks=${LOCK_ADDRESS}&network=${CHAIN_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded"
        >
          Purchase Access
        </a>
      </div>
    );
  }

  return <>{children}</>;
}; 