import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Access the in-memory chatSessions and inviteCodes stores from App.tsx
// @ts-expect-error - Global chat sessions for demo
const chatSessions = window.__chatSessions = window.__chatSessions || {};
// @ts-expect-error - Global invite codes for demo
const inviteCodes = window.__inviteCodes = window.__inviteCodes || {};
const getCurrentUser = () => {
  return window.localStorage.getItem("demo_user") || "user" + Math.floor(Math.random() * 10000);
};

const generateChatCode = () => Math.random().toString(36).substring(2, 10);

export const MessagesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<string[]>([]);
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());

  // Only show real chat sessions (created via invite or direct chat)
  useEffect(() => {
    const allSessions = Object.keys(chatSessions).filter(
      id => chatSessions[id].users.includes(currentUser)
    );
    setSessions(allSessions);
  }, [showModal, currentUser]);

  const handleGenerateLink = () => {
    const code = generateChatCode();
    inviteCodes[code] = currentUser;
    setInviteLink(`${window.location.origin}/chat/invite/${code}`);
    setError('');
  };

  const handleStartChat = () => {
    if (!input.trim()) {
      setError('Please enter a wallet address or username.');
      return;
    }
    window.location.href = `/chat/${input.trim()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Messages</h2>
      <p className="text-gray-600 mb-8">Your chat sessions are listed below. Click to open a chat.</p>
      <Button onClick={() => setShowModal(true)} className="mb-4">New Chat</Button>
      <div className="w-full max-w-md bg-white rounded shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">Your Chats</h3>
        {sessions.length === 0 && <div className="text-gray-400 text-center">No chats yet.</div>}
        <ul>
          {sessions.map(sessionId => (
            <li key={sessionId} className="mb-2">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate(`/chat/${sessionId}`)}>
                <span>Session: {sessionId}</span>
                <span className="text-xs text-gray-500">{chatSessions[sessionId].users.filter(u => u !== currentUser).join(', ')}</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Start a New Chat</h3>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Invite by Link</label>
              <Button onClick={handleGenerateLink} variant="secondary">Generate Invite Link</Button>
              {inviteLink && (
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="truncate text-blue-700">{inviteLink}</span>
                  <Button size="sm" onClick={() => {navigator.clipboard.writeText(inviteLink)}}>Copy</Button>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Invite by Address/Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="Enter wallet address or username"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <Button onClick={handleStartChat} variant="outline">Start Chat</Button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
