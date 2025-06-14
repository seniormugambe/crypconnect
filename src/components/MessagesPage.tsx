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
  Clock
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Alice.eth',
      address: '0x1234...5678',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
      isOnline: true,
      unreadCount: 2
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
      name: 'Charlie',
      address: '0x9876...5432',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie',
      isOnline: true,
      unreadCount: 0
    }
  ];

  // Mock messages data
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hey! How are you doing?',
          sender: selectedContact.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isDisappearing: false,
          isRevealed: true,
          type: 'text'
        },
        {
          id: '2',
          text: 'This message will disappear in 60 seconds! 👻',
          sender: user?.address || '',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
          isDisappearing: true,
          isRevealed: true,
          countdown: 45,
          type: 'text'
        },
        {
          id: '3',
          text: 'Tap to view this secret message 🔒',
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
              title: "Message Disappeared",
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
      title: "Message Sent",
      description: newMessage.isDisappearing ? "Disappearing message sent!" : "Message sent successfully",
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
      title: "Video Call Started",
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
      <div className="flex h-full">
        {/* Contacts List */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-sm text-gray-500">{contacts.length} contacts</p>
          </div>
          
          <div className="overflow-y-auto">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white">{contact.unreadCount}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.address}</p>
                    {!contact.isOnline && contact.lastSeen && (
                      <p className="text-xs text-gray-400">
                        Last seen {contact.lastSeen.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a contact to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* Contacts List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="text-sm text-gray-500">{contacts.length} contacts</p>
        </div>
        
        <div className="overflow-y-auto">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedContact.id === contact.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                    {contact.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white">{contact.unreadCount}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.address}</p>
                  {!contact.isOnline && contact.lastSeen && (
                    <p className="text-xs text-gray-400">
                      Last seen {contact.lastSeen.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedContact.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={startVideoCall}>
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user?.address ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card className={`max-w-xs lg:max-w-md ${
                message.sender === user?.address
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white'
              }`}>
                <CardContent className="p-3">
                  {!message.isRevealed ? (
                    <Button
                      variant="ghost"
                      className="w-full text-left p-0 h-auto font-normal"
                      onClick={() => revealMessage(message.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Tap to view</span>
                      </div>
                    </Button>
                  ) : (
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.isDisappearing && message.countdown && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{message.countdown}s</span>
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

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message... (Add 🔥 for disappearing messages)"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="ghost" size="sm">
              <Smile className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mic className="w-5 h-5" />
            </Button>
            <Button onClick={sendMessage} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Add 🔥 to your message to make it disappear after 60 seconds
          </p>
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
