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
  MoreVertical,
  Volume2,
  VolumeX,
  Wifi,
  Signal
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
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
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
          title: "🎉 Meeting Started",
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
            title: "📷 Camera Error",
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
    toast({
      title: !isVideoEnabled ? "📹 Camera On" : "📷 Camera Off",
      description: !isVideoEnabled ? "Video enabled" : "Video disabled",
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, isAudioEnabled: !isAudioEnabled } : p
    ));
    toast({
      title: !isAudioEnabled ? "🎙️ Mic On" : "🔇 Mic Off",
      description: !isAudioEnabled ? "Microphone enabled" : "Microphone muted",
    });
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
        
        toast({
          title: "🖥️ Screen Sharing Started",
          description: "Your screen is now being shared",
        });
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setParticipants(prev => prev.map(p => 
            p.id === 'me' ? { ...p, isScreenSharing: false } : p
          ));
          toast({
            title: "🖥️ Screen Sharing Stopped",
            description: "Screen sharing has ended",
          });
        };
      } else {
        setIsScreenSharing(false);
        setParticipants(prev => prev.map(p => 
          p.id === 'me' ? { ...p, isScreenSharing: false } : p
        ));
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      toast({
        title: "❌ Screen Share Error",
        description: "Unable to share screen",
        variant: "destructive",
      });
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "✋ Hand Lowered" : "🙋 Hand Raised",
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
      title: "👋 Participant Removed",
      description: "Participant has been removed from the meeting",
    });
  };

  const inviteParticipant = () => {
    toast({
      title: "📋 Invite Link Copied",
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
    toast({
      title: "📞 Call Ended",
      description: "Video call has been terminated",
    });
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good': return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <Signal className="w-4 h-4 text-red-500" />;
    }
  };

  if (!isOpen) return null;

  // Enhanced Picture-in-Picture mode
  if (isPictureInPicture) {
    return (
      <div className="fixed bottom-6 right-6 w-80 h-56 bg-black rounded-2xl overflow-hidden z-50 shadow-2xl border-4 border-white animate-fade-in">
        <div className="relative h-full">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 text-white mx-auto mb-2 animate-pulse" />
              <span className="text-white text-sm font-semibold">Multi-user Meeting</span>
            </div>
          </div>
          
          {/* Enhanced PiP Header */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <Badge className="bg-black/50 text-white text-xs px-2 py-1 border border-white/20">
              <Users className="w-3 h-3 mr-1" />
              {participants.length}
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 text-xs px-2 py-1 border border-green-400/30">
              🔴 {formatDuration(callDuration)}
            </Badge>
          </div>
          
          <div className="absolute top-3 right-3 flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTogglePictureInPicture}
              className="text-white h-8 w-8 p-0 hover:bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={endCall}
              className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600 rounded-lg"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced PiP Controls */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAudio}
              className={`h-8 w-8 p-0 rounded-lg backdrop-blur-sm transition-all ${
                !isAudioEnabled 
                  ? 'bg-red-500/80 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              } text-white`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`h-8 w-8 p-0 rounded-lg backdrop-blur-sm transition-all ${
                !isVideoEnabled 
                  ? 'bg-red-500/80 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              } text-white`}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced full-screen video conference
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="p-6 bg-gradient-to-r from-black/50 to-gray-900/50 text-white backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-lg">Web3 Meeting</span>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
                {participants.length} participants
              </Badge>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              {getConnectionIcon()}
              <span className="text-sm font-mono">
                {isConnected ? `🔴 ${formatDuration(callDuration)}` : '⏳ Connecting...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={inviteParticipant}
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
              className={`text-white rounded-xl backdrop-blur-sm transition-all hover:scale-105 ${
                showChat ? 'bg-blue-500/30' : 'hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
            >
              <Grid3X3 className="w-5 h-5 mr-2" />
              {viewMode === 'grid' ? 'Speaker' : 'Grid'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTogglePictureInPicture} 
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-6">
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
                <div className="animate-pulse mb-6">
                  <Users className="w-20 h-20 text-white mx-auto mb-4" />
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">Connecting to meeting...</h3>
                <p className="text-gray-400">Please wait while we set up your video conference</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-gradient-to-b from-gray-900 to-black border-l border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Meeting Chat</h3>
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {participants.length} online
              </Badge>
            </div>
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-white text-sm">💬 Chat feature coming soon...</p>
                <p className="text-gray-400 text-xs mt-2">Real-time messaging during video calls</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="p-8 bg-gradient-to-r from-black/70 to-gray-900/70 backdrop-blur-sm border-t border-gray-700/50">
        <div className="flex justify-center items-center space-x-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleAudio}
            className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 ${
              !isAudioEnabled 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            } text-white border border-white/20`}
          >
            {isAudioEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleVideo}
            className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 ${
              !isVideoEnabled 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            } text-white border border-white/20`}
          >
            {isVideoEnabled ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleScreenShare}
            className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 ${
              isScreenSharing 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            } text-white border border-white/20`}
          >
            <Monitor className="w-7 h-7" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleHandRaise}
            className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 ${
              isHandRaised 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            } text-white border border-white/20`}
          >
            <Hand className="w-7 h-7" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/25 border border-red-400/30"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            {isHandRaised && "✋ Your hand is raised"} 
            {isScreenSharing && "🖥️ You're sharing your screen"}
            {!isAudioEnabled && "🔇 You're muted"}
            {!isVideoEnabled && "📷 Camera is off"}
          </p>
        </div>
      </div>
    </div>
  );
};
