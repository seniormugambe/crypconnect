import { useEffect, useState } from "react";

export function useUnlockKey(lockAddress: string, userAddress: string | undefined, chainId: number = 1) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) {
      setHasKey(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(
      `https://api.unlock-protocol.com/v2/key/${lockAddress}/${userAddress}?chain=${chainId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch key status");
        return res.json();
      })
      .then((data) => {
        setHasKey(!!data.hasValidKey);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lockAddress, userAddress, chainId]);

  return { hasKey, loading, error };
} 