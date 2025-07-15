import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoConference } from './VideoConference';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical,
  Eye,
  Clock,
  Search,
  Plus,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isDisappearing: boolean;
  isRevealed: boolean;
  countdown?: number;
  type: 'text' | 'image' | 'video' | 'voice';
}

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  unreadCount: number;
}

export const MessagesPage = () => {
  const { user } = useWeb3();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock contacts data with more variety
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Alice.eth',
      address: '0x1234...5678',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
      isOnline: true,
      unreadCount: 3
    },
    {
      id: '2', 
      name: 'Bob.base',
      address: '0xabcd...efgh',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=bob',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 1
    },
    {
      id: '3',
      name: 'Charlie.sol',
      address: '0x9876...5432',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: '4',
      name: 'Diana.arb',
      address: '0x5555...7777',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=diana',
      isOnline: true,
      unreadCount: 5
    },
    {
      id: '5',
      name: 'Eve.poly',
      address: '0x8888...9999',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=eve',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0
    }
  ];

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock messages data
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hey! How are you doing? 👋',
          sender: selectedContact.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isDisappearing: false,
          isRevealed: true,
          type: 'text'
        },
        {
          id: '2',
          text: 'This message will disappear in 60 seconds! 🔥✨',
          sender: user?.address || '',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
          isDisappearing: true,
          isRevealed: true,
          countdown: 45,
          type: 'text'
        },
        {
          id: '3',
          text: 'Tap to view this secret message 🔒💫',
          sender: selectedContact.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 1),
          isDisappearing: true,
          isRevealed: false,
          type: 'text'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedContact, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Countdown timer for disappearing messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.isDisappearing && msg.countdown && msg.countdown > 0) {
          const newCountdown = msg.countdown - 1;
          if (newCountdown === 0) {
            toast({
              title: "✨ Message Vanished",
              description: "A disappearing message has been deleted",
            });
            return { ...msg, countdown: 0 };
          }
          return { ...msg, countdown: newCountdown };
        }
        return msg;
      }).filter(msg => !msg.isDisappearing || msg.countdown !== 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedContact || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: user.address,
      timestamp: new Date(),
      isDisappearing: messageText.includes('🔥'),
      isRevealed: true,
      countdown: messageText.includes('🔥') ? 60 : undefined,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    toast({
      title: "✅ Message Sent",
      description: newMessage.isDisappearing ? "🔥 Disappearing message sent!" : "Message sent successfully",
    });
  };

  const revealMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isRevealed: true, countdown: 60 }
        : msg
    ));
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    setIsPictureInPicture(false);
    toast({
      title: "📹 Video Call Started",
      description: `Calling ${selectedContact?.name}...`,
    });
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
    setIsPictureInPicture(false);
  };

  const togglePictureInPicture = () => {
    setIsPictureInPicture(!isPictureInPicture);
  };

  if (!selectedContact) {
    return (
      <div className="flex h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Enhanced Contacts List */}
        <div className="w-1/3 bg-white shadow-lg border-r border-gray-100">
          {/* Header with search */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Messages</h2>
                <p className="text-blue-100 text-sm">{contacts.length} contacts online</p>
              </div>
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
            </div>
          </div>
          
          {/* Contacts List */}
          <div className="overflow-y-auto h-full">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact.id}
                className="p-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] group"
                onClick={() => setSelectedContact(contact)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                        {contact.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {contact.name}
                      </p>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-bounce">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate font-mono">{contact.address}</p>
                    {!contact.isOnline && contact.lastSeen && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last seen {contact.lastSeen.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Send className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome to Web3 Chat! 🚀
            </h3>
            <p className="text-gray-600 mb-4 text-lg">
              Select a contact to start your decentralized conversation
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span>Secure • Private • Decentralized</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Contacts List - Selected State */}
      <div className="w-1/3 bg-white shadow-lg border-r border-gray-100">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Messages</h2>
              <p className="text-blue-100 text-sm">{contacts.length} contacts online</p>
            </div>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto">
          {filteredContacts.map((contact, index) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 ${
                selectedContact.id === contact.id 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-l-blue-500' 
                  : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              {/* ... keep existing code (contact item structure) */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                      {contact.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {contact.name}
                    </p>
                    {contact.unreadCount > 0 && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-bounce">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate font-mono">{contact.address}</p>
                  {!contact.isOnline && contact.lastSeen && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last seen {contact.lastSeen.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-lg">
        {/* Enhanced Chat Header */}
        <div className="p-6 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-12 h-12 ring-2 ring-blue-200">
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                    {selectedContact.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {selectedContact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedContact.isOnline ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Online now
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startVideoCall}
                className="hover:bg-green-50 text-green-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
              >
                <Video className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-50 text-gray-600 hover:text-gray-700 transition-all duration-200 hover:scale-110"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user?.address ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className={`max-w-xs lg:max-w-md transition-all duration-200 hover:scale-105 ${
                message.sender === user?.address
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white shadow-md hover:shadow-lg border border-gray-100'
              }`}>
                <CardContent className="p-4">
                  {!message.isRevealed ? (
                    <Button
                      variant="ghost"
                      className="w-full text-left p-0 h-auto font-normal hover:bg-white/10"
                      onClick={() => revealMessage(message.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5 animate-pulse" />
                        <span>✨ Tap to reveal secret message</span>
                      </div>
                    </Button>
                  ) : (
                    <div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.isDisappearing && message.countdown && (
                          <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span className="text-xs font-mono">{message.countdown}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-blue-50 text-blue-600 hover:scale-110 transition-all"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message... ✨"
              className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm bg-white shadow-sm"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-yellow-50 text-yellow-600 hover:scale-110 transition-all"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-purple-50 text-purple-600 hover:scale-110 transition-all"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              onClick={sendMessage} 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-xs text-gray-500 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full border border-yellow-200">
              💡 Pro tip: Add 🔥 to your message to make it disappear after 60 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Video Conference Component */}
      {selectedContact && (
        <VideoConference
          contact={selectedContact}
          isOpen={isVideoCall}
          onClose={endVideoCall}
          isPictureInPicture={isPictureInPicture}
          onTogglePictureInPicture={togglePictureInPicture}
        />
      )}
    </div>
  );
};
