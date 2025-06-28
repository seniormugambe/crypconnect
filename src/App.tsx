import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import React, { useState, useRef, useEffect } from "react";
import { MessagesPage } from "@/components/MessagesPage";
import { Web3Provider, useWeb3 } from "@/contexts/Web3Context";
import Web3UserProfile from '@/components/Web3UserProfile';

const TEST_LOCK_ADDRESS = "0x7A1A37c490112190483c31c0998C08bB24105917"; // Replace with your real lock address when ready
const TEST_LOCK_NETWORK = 84532; // Base Sepolia

function loadUnlockScript() {
  if (document.getElementById('unlock-protocol-script')) return;
  const script = document.createElement('script');
  script.id = 'unlock-protocol-script';
  //script.src = 'https://paywall.unlock-protocol.com/static/unlock.latest.min.js';  script.async = true;
  document.body.appendChild(script);
}

const openUnlockModal = (lockAddress: string) => {
  loadUnlockScript();
  // @ts-expect-error - Unlock Protocol types not available
  if (window.unlockProtocol) {
    // @ts-expect-error - Unlock Protocol types not available
    window.unlockProtocol.loadCheckoutModal({
      locks: { [lockAddress]: { network: TEST_LOCK_NETWORK } },
      pessimistic: true
    });
  }
};

async function checkKeyOwnership(lockAddress, userAddress, network) {
  if (!userAddress) return false;
  
  // Temporarily bypass API check due to network connectivity issues
  // TODO: Re-enable when network connectivity to api.unlock-protocol.com is resolved
  console.log('Bypassing Unlock API check due to network connectivity issues');
  console.log('To re-enable: Remove this bypass and ensure api.unlock-protocol.com is accessible');
  return false; // Temporarily return false to simulate no key ownership
  
  // Original code (commented out until network issue is resolved):
  /*
  try {
    // Try the newer API endpoint first
    const url = `https://api.unlock-protocol.com/v2/key/${network}/lock/${lockAddress}/user/${userAddress}`;
    console.log('Checking key ownership:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unlock API error: ${res.status}`);
    const data = await res.json();
    console.log('Key ownership result:', data);
    return data.hasValidKey;
  } catch (e) {
    console.error('Unlock API unreachable:', e);
    console.log('This might be a network connectivity issue. Please check:');
    console.log('1. Can you access https://api.unlock-protocol.com in your browser?');
    console.log('2. Are you on a network that might block this domain?');
    console.log('3. Try switching networks or disabling VPN if applicable.');
    return false;
  }
  */
}

const Profile = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Web3UserProfile />
  </div>
);

const Settings = () => {
  const { user, connect, disconnect, isConnecting } = useWeb3();

  useEffect(() => {
    if (user?.address) {
      // Key check logic
    }
  }, [user?.address]);

  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  const [hasKey, setHasKey] = React.useState(false);
  const [checkingKey, setCheckingKey] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  React.useEffect(() => {
    loadUnlockScript();
  }, []);

  React.useEffect(() => {
    let isCurrent = true;
    if (user && user.address) {
      setCheckingKey(true);
      checkKeyOwnership(TEST_LOCK_ADDRESS, user.address, TEST_LOCK_NETWORK)
        .then(result => {
          if (isCurrent) setHasKey(result);
        })
        .finally(() => {
          if (isCurrent) setCheckingKey(false);
        });
    } else {
      setHasKey(false);
    }
    return () => { isCurrent = false; };
  }, [user?.address]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <h2 className="text-3xl font-bold mb-4">Settings</h2>
      {/* Wallet Connection */}
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold mb-2">Wallet</h3>
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-gray-800 dark:text-gray-200">{user.address.slice(0, 8)}...{user.address.slice(-4)}</span>
              <button className="text-xs text-blue-600 underline" onClick={disconnect}>Disconnect</button>
            </div>
            <div className="text-sm text-gray-500">Connected via {user.walletType}</div>
          </div>
        ) : (
          <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={isConnecting} onClick={() => connect('metamask')}>Connect MetaMask</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isConnecting} onClick={() => connect('coinbase')}>Connect Coinbase</button>
          </div>
        )}
      </div>
      {/* Theme Toggle */}
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold mb-2">Display Theme</h3>
        <div className="flex items-center space-x-4">
          <span>Light</span>
          <input type="checkbox" checked={theme === 'dark'} onChange={e => setTheme(e.target.checked ? 'dark' : 'light')} className="accent-blue-600 w-6 h-6" />
          <span>Dark</span>
        </div>
      </div>
      {/* Premium Features */}
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold mb-2">Premium Features</h3>
        {user ? (
          checkingKey ? (
            <div className="text-gray-500">Checking premium status...</div>
          ) : hasKey ? (
            <div className="text-green-600 font-semibold">✅ Premium Unlocked! You have access to exclusive features.</div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300">Unlock exclusive features by purchasing a key (NFT) via Unlock Protocol.</p>
              <p className="text-purple-600 font-bold mb-2">Price: 0.01 ETH</p>
              <Button
                className="w-full bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                onClick={() => openUnlockModal(TEST_LOCK_ADDRESS)}
              >
                Unlock Premium
              </Button>
            </>
          )
        ) : (
          <div className="text-gray-500">Connect your wallet to check premium status.</div>
        )}
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const AppLayout = ({ children, navigate }: { children: React.ReactNode; navigate: (path: string) => void }) => {
  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="font-bold text-2xl cursor-pointer" onClick={() => navigate("/")}>crypconnect</div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")}>Welcome</Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button variant="ghost" onClick={() => navigate("/messages")}>Messages</Button>
          <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
          <Button variant="ghost" onClick={() => navigate("/settings")}>Settings</Button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

// In-memory chat session store (for demo)
const chatSessions = {} as Record<string, { users: string[] }>;
// @ts-expect-error - Global invite codes for demo
const inviteCodes = window.__inviteCodes = window.__inviteCodes || {};

// Simulate current user (replace with real auth in production)
const getCurrentUser = () => {
  return window.localStorage.getItem("demo_user") || "user" + Math.floor(Math.random() * 10000);
};

// ChatSession component with simple chat UI
const ChatSession = ({ sessionId }: { sessionId: string }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const currentUser = getCurrentUser();

  // Load messages from localStorage for demo
  useEffect(() => {
    const stored = window.localStorage.getItem("chat_" + sessionId);
    if (stored) setMessages(JSON.parse(stored));
  }, [sessionId]);

  // Save messages to localStorage for demo
  useEffect(() => {
    window.localStorage.setItem("chat_" + sessionId, JSON.stringify(messages));
  }, [messages, sessionId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: currentUser, text: input.trim() }]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-6 flex flex-col h-[70vh]">
        <h2 className="text-2xl font-bold mb-4">Chat Session</h2>
        <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-100">
          {messages.length === 0 && <div className="text-gray-400 text-center">No messages yet.</div>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg ${msg.sender === currentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <span className="block text-xs font-semibold mb-1">{msg.sender === currentUser ? 'You' : msg.sender}</span>
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

// Handle /chat/invite/:code
const ChatInviteHandler = () => {
  const { code } = useParams();
  const [redirect, setRedirect] = useState<string | null>(null);
  React.useEffect(() => {
    const currentUser = getCurrentUser();
    if (!code) return;
    let inviter = inviteCodes[code];
    if (!inviter) {
      // If code not found, treat current user as inviter (fallback)
      inviter = currentUser;
      inviteCodes[code] = inviter;
    }
    // Create or find session between inviter and current user
    let sessionId = Object.keys(chatSessions).find(
      id => chatSessions[id].users.includes(inviter) && chatSessions[id].users.includes(currentUser)
    );
    if (!sessionId) {
      sessionId = code + "-" + currentUser;
      chatSessions[sessionId] = { users: [inviter, currentUser] };
    }
    setRedirect(`/chat/${sessionId}`);
  }, [code]);
  if (redirect) return <Navigate to={redirect} replace />;
  return <div className="flex items-center justify-center min-h-screen">Joining chat...</div>;
};

// Handle /chat/:target
const ChatDirectHandler = () => {
  const { target } = useParams();
  const [redirect, setRedirect] = useState<string | null>(null);
  React.useEffect(() => {
    const currentUser = getCurrentUser();
    if (!target) return;
    // Create or find session
    let sessionId = Object.keys(chatSessions).find(
      id => chatSessions[id].users.includes(target) && chatSessions[id].users.includes(currentUser)
    );
    if (!sessionId) {
      sessionId = currentUser + "-" + target;
      chatSessions[sessionId] = { users: [currentUser, target] };
    }
    setRedirect(`/chat/${sessionId}`);
  }, [target]);
  if (redirect) return <Navigate to={redirect} replace />;
  return <div className="flex items-center justify-center min-h-screen">Opening chat...</div>;
};

// Handle /chat/session/:sessionId
const ChatSessionHandler = () => {
  const { sessionId } = useParams();
  if (!sessionId || !chatSessions[sessionId]) {
    return <div className="flex items-center justify-center min-h-screen">Chat session not found.</div>;
  }
  return <ChatSession sessionId={sessionId} />;
};

const AppWithWeb3 = () => {
  const { user } = useWeb3();
  const [hasKey, setHasKey] = React.useState(false);
  const [checkingKey, setCheckingKey] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadUnlockScript();
  }, []);

  React.useEffect(() => {
    let isCurrent = true;
    if (user && user.address) {
      setCheckingKey(true);
      checkKeyOwnership(TEST_LOCK_ADDRESS, user.address, TEST_LOCK_NETWORK)
        .then(result => {
          if (isCurrent) setHasKey(result);
        })
        .finally(() => {
          if (isCurrent) setCheckingKey(false);
        });
    } else {
      setHasKey(false);
    }
    return () => { isCurrent = false; };
  }, [user?.address]);

  // Simulate user info and recent activity for demo
  const [recentActivity] = useState([
    { type: "Meeting", detail: "Weekly Sync", time: "2 hours ago" },
    { type: "Message", detail: "You received a new message", time: "Yesterday" },
  ]);

  return (
    <AppLayout navigate={navigate}>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to crypconnect!</h1>
            <p className="text-lg text-gray-700 mb-8">Connect, collaborate, and communicate securely on the Base network.</p>
            {/* Quick Actions */}
            <div className="flex space-x-4 mb-8">
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              <Button onClick={() => navigate("/dashboard?startMeeting=true")} variant="secondary">Start Meeting</Button>
              <Button onClick={() => navigate("/dashboard?joinMeeting=true")} variant="outline">Join Meeting</Button>
            </div>
            {/* Recent Activity */}
            <div className="w-full max-w-md bg-white/80 rounded shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Recent Activity</h2>
              <ul className="space-y-2">
                {recentActivity.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <span className="font-semibold text-gray-800">{item.type}:</span>
                    <span className="text-gray-600">{item.detail}</span>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        } />
        <Route path="/dashboard" element={<Index hasKey={hasKey} user={user} checkingKey={checkingKey} />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat/invite/:code" element={<ChatInviteHandler />} />
        <Route path="/chat/:target" element={<ChatDirectHandler />} />
        <Route path="/chat/session/:sessionId" element={<ChatSessionHandler />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Web3Provider>
            <AppWithWeb3 />
          </Web3Provider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
