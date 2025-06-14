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
  Signal,
  X,
  Copy,
  Share2
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
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
      title: !isVideoEnabled ? "📹 Camera turned on" : "📷 Camera turned off",
      description: !isVideoEnabled ? "Your camera is now active" : "Your camera is now disabled",
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    setParticipants(prev => prev.map(p => 
      p.id === 'me' ? { ...p, isAudioEnabled: !isAudioEnabled } : p
    ));
    toast({
      title: !isAudioEnabled ? "🎙️ Microphone on" : "🔇 Microphone muted",
      description: !isAudioEnabled ? "You can now speak" : "Your microphone is muted",
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
          title: "🖥️ Screen sharing started",
          description: "Your screen is now visible to all participants",
        });
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setParticipants(prev => prev.map(p => 
            p.id === 'me' ? { ...p, isScreenSharing: false } : p
          ));
          toast({
            title: "🖥️ Screen sharing stopped",
            description: "You stopped sharing your screen",
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
        title: "❌ Cannot share screen",
        description: "Please allow screen sharing access",
        variant: "destructive",
      });
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "✋ Hand lowered" : "🙋 Hand raised",
      description: isHandRaised ? "You lowered your hand" : "You want to speak",
    });
  };

  const togglePin = (participantId: string) => {
    setParticipants(prev => prev.map(p => ({
      ...p,
      isPinned: p.id === participantId ? !p.isPinned : false
    })));
    toast({
      title: "📌 Participant pinned",
      description: "Participant is now in main view",
    });
  };

  const kickParticipant = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    toast({
      title: "👋 Participant removed",
      description: "Participant has been removed from the meeting",
    });
  };

  const inviteParticipant = () => {
    navigator.clipboard.writeText('https://meeting.web3app.com/join/xyz123');
    toast({
      title: "📋 Meeting link copied!",
      description: "Share this link to invite others to join",
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
      title: "📞 Call ended",
      description: "Thank you for using our video conference",
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
      case 'excellent': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'good': return <Signal className="w-4 h-4 text-yellow-400" />;
      case 'poor': return <Signal className="w-4 h-4 text-red-400" />;
    }
  };

  if (!isOpen) return null;

  // Enhanced Picture-in-Picture mode
  if (isPictureInPicture) {
    return (
      <div className="fixed bottom-6 right-6 w-96 h-64 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl overflow-hidden z-50 shadow-2xl border-2 border-blue-400/30 animate-fade-in backdrop-blur-xl">
        <div className="relative h-full">
          {/* PiP Video Content */}
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="text-center relative z-10">
              <div className="flex -space-x-2 mb-3 justify-center">
                {participants.slice(0, 3).map((p, i) => (
                  <Avatar key={p.id} className="w-12 h-12 border-2 border-white/30 shadow-lg">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {p.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-white text-sm font-semibold opacity-90">
                {participants.length} participants
              </div>
              <div className="text-white/70 text-xs mt-1">
                {formatDuration(callDuration)}
              </div>
            </div>
          </div>
          
          {/* Enhanced PiP Controls */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
            <Badge className="bg-black/50 text-white text-xs px-3 py-1 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-2 animate-pulse"></span>
              LIVE
            </Badge>
            
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTogglePictureInPicture}
                className="text-white h-8 w-8 p-0 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={endCall}
                className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced PiP Bottom Controls */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAudio}
              className={`h-10 w-10 p-0 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                !isAudioEnabled 
                  ? 'bg-red-500/80 hover:bg-red-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`h-10 w-10 p-0 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                !isVideoEnabled 
                  ? 'bg-red-500/80 hover:bg-red-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black z-50 flex flex-col">
      {/* Modern Header with Glass Effect */}
      <div className="p-6 bg-gradient-to-r from-black/70 via-gray-900/70 to-black/70 text-white backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {/* Meeting Info Card */}
            <div className="flex items-center space-x-4 bg-white/10 rounded-2xl px-6 py-3 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Web3 Meeting
                </span>
              </div>
              <div className="h-6 w-px bg-white/20"></div>
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30 px-3 py-1">
                <Users className="w-4 h-4 mr-2" />
                {participants.length} joined
              </Badge>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/20">
              {getConnectionIcon()}
              <div className="text-sm">
                <div className="font-mono text-green-300">
                  {isConnected ? `🔴 ${formatDuration(callDuration)}` : '⏳ Connecting...'}
                </div>
                <div className="text-xs text-white/60 capitalize">{connectionQuality} quality</div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={inviteParticipant}
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 px-4 py-2"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
              className={`text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 px-4 py-2 ${
                showChat ? 'bg-blue-500/30 border border-blue-400/30' : 'hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
              {showChat && <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full"></span>}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 px-4 py-2"
            >
              <Grid3X3 className="w-5 h-5 mr-2" />
              {viewMode === 'grid' ? 'Speaker View' : 'Grid View'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTogglePictureInPicture} 
              className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="text-white hover:bg-red-500/20 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
              <div className="text-center max-w-md">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-white text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Connecting to meeting...
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                  Setting up your video conference experience
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-gradient-to-b from-gray-900/90 to-black/90 border-l border-white/10 backdrop-blur-xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Meeting Chat</h3>
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
                  {participants.length} online
                </Badge>
              </div>
            </div>
            
            <div className="p-6 flex-1">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20 backdrop-blur-sm">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Chat Coming Soon!</h4>
                    <p className="text-gray-400 text-sm">
                      Real-time messaging during video calls will be available in the next update
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Participants ({participants.length})</div>
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {participant.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{participant.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {!participant.isAudioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                          {!participant.isVideoEnabled && <VideoOff className="w-3 h-3 text-red-400" />}
                          {participant.isSpeaking && <span className="text-green-400 text-xs">Speaking</span>}
                        </div>
                      </div>
                      {participant.id === 'me' && (
                        <Badge className="bg-green-500/20 text-green-300 text-xs border border-green-400/30">You</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Control Bar */}
      <div className="p-8 bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-center items-center space-x-6">
          {/* Primary Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleAudio}
              className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 border-2 ${
                !isAudioEnabled 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border-red-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleVideo}
              className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 border-2 ${
                !isVideoEnabled 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border-red-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30'
              }`}
            >
              {isVideoEnabled ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleScreenShare}
              className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 border-2 ${
                isScreenSharing 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 border-green-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30'
              }`}
            >
              <Monitor className="w-7 h-7" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={toggleHandRaise}
              className={`w-16 h-16 rounded-2xl transition-all duration-300 hover:scale-110 border-2 ${
                isHandRaised 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 border-yellow-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30'
              }`}
            >
              <Hand className="w-7 h-7" />
            </Button>
          </div>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/25 border-2 border-red-400/50"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
        </div>
        
        {/* Status Indicators */}
        <div className="text-center mt-6">
          <div className="flex justify-center items-center space-x-6 text-sm">
            {isHandRaised && (
              <span className="flex items-center text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-400/20">
                <Hand className="w-4 h-4 mr-2" />
                Hand raised
              </span>
            )}
            {isScreenSharing && (
              <span className="flex items-center text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-400/20">
                <Monitor className="w-4 h-4 mr-2" />
                Sharing screen
              </span>
            )}
            {!isAudioEnabled && (
              <span className="flex items-center text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-400/20">
                <MicOff className="w-4 h-4 mr-2" />
                Microphone muted
              </span>
            )}
            {!isVideoEnabled && (
              <span className="flex items-center text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-400/20">
                <VideoOff className="w-4 h-4 mr-2" />
                Camera off
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
