
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ParticipantGrid } from './ParticipantGrid';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone,
  PhoneOff,
  Monitor,
  Minimize2,
  Maximize2,
  Settings,
  Users,
  UserPlus,
  MessageSquare,
  Hand,
  Grid3X3,
  MoreVertical
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  isPinned: boolean;
}

interface VideoConferenceProps {
  contact: {
    id: string;
    name: string;
    avatar: string;
  };
  isOpen: boolean;
  onClose: () => void;
  isPictureInPicture: boolean;
  onTogglePictureInPicture: () => void;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  contact,
  isOpen,
  onClose,
  isPictureInPicture,
  onTogglePictureInPicture
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize participants when call starts
  useEffect(() => {
    if (isOpen && !isPictureInPicture) {
      const mockParticipants: Participant[] = [
        {
          id: 'me',
          name: 'You',
          avatar: '/placeholder.svg',
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false,
          isSpeaking: false,
          isPinned: false
        },
        {
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar,
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false,
          isSpeaking: true,
          isPinned: false
        },
        {
          id: '3',
          name: 'Alex.eth',
          avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=alex',
          isVideoEnabled: false,
          isAudioEnabled: true,
          isScreenSharing: false,
          isSpeaking: false,
          isPinned: false
        },
        {
          id: '4',
          name: 'Sarah.base',
          avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=sarah',
          isVideoEnabled: true,
          isAudioEnabled: false,
          isScreenSharing: false,
          isSpeaking: false,
          isPinned: false
        }
      ];
      setParticipants(mockParticipants);

      const timer = setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Meeting Started",
          description: `Connected with ${mockParticipants.length} participants`,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isPictureInPicture, contact]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // Initialize local video stream
  useEffect(() => {
    if (isOpen && isVideoEnabled) {
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: isAudioEnabled 
      })
        .then(stream => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
          toast({
            title: "Camera Error",
            description: "Unable to access camera or microphone",
            variant: "destructive",
          });
        });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isVideoEnabled, isAudioEnabled]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, isVideoEnabled: !isVideoEnabled } : p
    ));
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, isAudioEnabled: !isAudioEnabled } : p
    ));
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        setIsScreenSharing(true);
        setParticipants(prev => prev.map(p => 
          p.id === 'me' ? { ...p, isScreenSharing: true } : p
        ));
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setParticipants(prev => prev.map(p => 
            p.id === 'me' ? { ...p, isScreenSharing: false } : p
          ));
        };
      } else {
        setIsScreenSharing(false);
        setParticipants(prev => prev.map(p => 
          p.id === 'me' ? { ...p, isScreenSharing: false } : p
        ));
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised ? "You lowered your hand" : "You raised your hand",
    });
  };

  const togglePin = (participantId: string) => {
    setParticipants(prev => prev.map(p => ({
      ...p,
      isPinned: p.id === participantId ? !p.isPinned : false
    })));
  };

  const kickParticipant = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    toast({
      title: "Participant Removed",
      description: "Participant has been removed from the meeting",
    });
  };

  const inviteParticipant = () => {
    toast({
      title: "Invite Link Copied",
      description: "Meeting invite link copied to clipboard",
    });
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    setCallDuration(0);
    setParticipants([]);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Picture-in-Picture mode
  if (isPictureInPicture) {
    return (
      <div className="fixed bottom-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden z-50 shadow-2xl">
        <div className="relative h-full">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm">Multi-user Meeting</span>
          </div>
          
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{participants.length}</span>
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTogglePictureInPicture}
              className="text-white h-6 w-6 p-0 hover:bg-white hover:bg-opacity-20"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={endCall}
              className="h-6 w-6 p-0"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAudio}
              className={`h-6 w-6 p-0 ${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
            >
              {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`h-6 w-6 p-0 ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
            >
              {isVideoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen video conference
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black bg-opacity-50 text-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Meeting</span>
            <Badge className="bg-green-600">{participants.length} participants</Badge>
          </div>
          <div className="text-sm text-gray-300">
            {isConnected ? formatDuration(callDuration) : 'Connecting...'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={inviteParticipant}
            className="text-white"
          >
            <UserPlus className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowChat(!showChat)}
            className="text-white"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="text-white"
          >
            <Grid3X3 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onTogglePictureInPicture} className="text-white">
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          {isConnected ? (
            <ParticipantGrid
              participants={participants}
              onTogglePin={togglePin}
              onKickParticipant={kickParticipant}
              isHost={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Users className="w-16 h-16 text-white mx-auto" />
                </div>
                <p className="text-white text-lg">Connecting to meeting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-4">Chat</h3>
            <div className="text-gray-400 text-sm">
              Chat feature coming soon...
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full ${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
          >
            <Monitor className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleHandRaise}
            className={`w-14 h-14 rounded-full ${isHandRaised ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
          >
            <Hand className="w-6 h-6" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
