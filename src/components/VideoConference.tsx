import React, { useState } from 'react';
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
  Share2,
  Lock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWeb3 } from "../contexts/Web3Context";
import { useUnlockKey } from "../hooks/useUnlockKey";

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

export interface VideoConferenceProps {
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
  if (!isOpen) return null;
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
  
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const { user } = useWeb3();
  const userAddress = user?.address;
  const { hasKey: isPremium } = useUnlockKey("0xb2b196026ac3fc1bcbd9037186040acf44ff6b68", userAddress, 1);
  const [videoQuality, setVideoQuality] = useState<'sd' | 'hd' | 'fullhd'>('sd');
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [echoCancellation, setEchoCancellation] = useState(false);
  const [backgroundEffect, setBackgroundEffect] = useState<'none' | 'blur' | 'replace'>('none');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [replaceImage] = useState<string>('/placeholder.svg'); // Example replacement image
  const [voiceEffect, setVoiceEffect] = useState<'none' | 'robot' | 'chipmunk' | 'deep'>('none');

  // Initialize participants when call starts
  React.useEffect(() => {
    if (isOpen && !isPictureInPicture) {
      const userParticipant: Participant = {
        id: 'me',
        name: user?.ensName || user?.address || 'You',
        avatar: user?.avatar || '/placeholder.svg',
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        isPinned: false
      };
      setParticipants([userParticipant]);

      const timer = setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "🎉 Meeting Started",
          description: `Connected with ${participants.length} participants`,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isPictureInPicture, contact, user]);

  // Call duration timer
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (isOpen && isVideoEnabled) {
      let videoConstraints: MediaTrackConstraints = { width: 640, height: 480 };
      if (isPremium) {
        if (videoQuality === 'hd') {
          videoConstraints = { width: { ideal: 1280 }, height: { ideal: 720 } };
        } else if (videoQuality === 'fullhd') {
          videoConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 } };
        } else {
          videoConstraints = { width: 640, height: 480 };
        }
      }
      let audioConstraints: MediaTrackConstraints | boolean = {};
      if (isAudioEnabled) {
        if (isPremium) {
          audioConstraints = {
            noiseSuppression,
            echoCancellation
          };
        } else {
          audioConstraints = {};
        }
      } else {
        audioConstraints = false;
      }
      navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: audioConstraints 
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
  }, [isOpen, isVideoEnabled, isAudioEnabled, videoQuality, isPremium, noiseSuppression, echoCancellation]);

  // Effect to process video for background blur/replacement
  React.useEffect(() => {
    if (!localVideoRef.current || !canvasRef.current) return;
    if (backgroundEffect === 'none') {
      localVideoRef.current.style.display = 'block';
      canvasRef.current.style.display = 'none';
      return;
    }
    const video = localVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    video.style.display = 'none';
    canvas.style.display = 'block';
    let animationFrameId: number;
    function renderFrame() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (backgroundEffect === 'blur') {
        ctx.globalAlpha = 0.7;
        ctx.filter = 'blur(12px)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
      } else if (backgroundEffect === 'replace') {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = ctx.createPattern(new Image(), 'repeat') || '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const img = new window.Image();
        img.src = replaceImage;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;
        };
      }
      animationFrameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.style.display = 'none';
      video.style.display = 'block';
    };
  }, [backgroundEffect, replaceImage]);

  // Effect to process audio for voice change
  React.useEffect(() => {
    if (!localStreamRef.current) return;
    const stream = localStreamRef.current;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;
    if (voiceEffect === 'none') return; // No effect
    // Web Audio API setup
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(new MediaStream([audioTracks[0]]));
    let effectNode: AudioNode = source;
    if (voiceEffect === 'chipmunk' || voiceEffect === 'deep') {
      // Pitch shifting using playbackRate (simple stub, not real-time accurate)
      const pitchShifter = audioCtx.createBiquadFilter();
      pitchShifter.type = 'allpass';
      pitchShifter.frequency.value = voiceEffect === 'chipmunk' ? 2000 : 100;
      effectNode.connect(pitchShifter);
      effectNode = pitchShifter;
    } else if (voiceEffect === 'robot') {
      // Simple distortion for robot effect
      const distortion = audioCtx.createWaveShaper();
      const curve = new Float32Array(44100);
      for (let i = 0; i < 44100; ++i) {
        curve[i] = Math.sin(i / 44100 * Math.PI * 2 * 10);
      }
      distortion.curve = curve;
      distortion.oversample = '4x';
      effectNode.connect(distortion);
      effectNode = distortion;
    }
    effectNode.connect(audioCtx.destination);
    return () => {
      audioCtx.close();
    };
  }, [voiceEffect, localStreamRef]);

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
        <div className="flex-1 p-6" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {isConnected ? (
            <>
              <div className="flex items-center justify-center h-full w-full">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/20 p-12 flex flex-col items-center max-w-lg w-full mx-auto animate-fade-in">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg mb-6 animate-pulse" style={{ width: 96, height: 96 }}>
                      <Lock className="w-16 h-16 text-white drop-shadow-lg" />
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Camera is Hidden</h2>
                    <p className="text-base text-blue-100 mb-6 text-center max-w-xs">For your privacy, your camera feed is never shown. You can still chat, invite others, and use all features securely.</p>
                    <button
                      className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition text-lg"
                      onClick={inviteParticipant}
                    >
                      <Share2 className="inline w-5 h-5 mr-2 align-text-bottom" /> Invite Others
                    </button>
                    <span className="mt-4 text-xs text-blue-200">🔒 Privacy-first video conference</span>
                  </div>
                </div>
              </div>
              <ParticipantGrid
                participants={participants}
                onTogglePin={togglePin}
                onKickParticipant={kickParticipant}
                isHost={true}
              />
            </>
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-24 right-12 bg-white/90 rounded-2xl shadow-2xl p-6 z-50 w-80 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Settings</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Video Quality</label>
            <select
              className="w-full p-2 rounded border border-gray-300"
              value={videoQuality}
              onChange={e => setVideoQuality(e.target.value as 'sd' | 'hd' | 'fullhd')}
              disabled={!isPremium}
            >
              <option value="sd">SD (Default)</option>
              {isPremium && <option value="hd">HD (720p)</option>}
              {isPremium && <option value="fullhd">Full HD (1080p)</option>}
            </select>
            {!isPremium && (
              <div className="text-xs text-yellow-600 mt-2">Upgrade to premium for HD/Full HD video</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Noise Suppression</label>
            <input
              type="checkbox"
              className="mr-2"
              checked={noiseSuppression}
              onChange={e => setNoiseSuppression(e.target.checked)}
              disabled={!isPremium}
            />
            <span className={!isPremium ? "text-gray-400" : "text-gray-900"}>Enable Noise Suppression</span>
            {!isPremium && (
              <div className="text-xs text-yellow-600 mt-2">Upgrade to premium for noise suppression</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Echo Cancellation</label>
            <input
              type="checkbox"
              className="mr-2"
              checked={echoCancellation}
              onChange={e => setEchoCancellation(e.target.checked)}
              disabled={!isPremium}
            />
            <span className={!isPremium ? "text-gray-400" : "text-gray-900"}>Enable Echo Cancellation</span>
            {!isPremium && (
              <div className="text-xs text-yellow-600 mt-2">Upgrade to premium for echo cancellation</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Background Effect</label>
            <select
              className="w-full p-2 rounded border border-gray-300"
              value={backgroundEffect}
              onChange={e => setBackgroundEffect(e.target.value as 'none' | 'blur' | 'replace')}
              disabled={!isPremium}
            >
              <option value="none">None</option>
              {isPremium && <option value="blur">Blur</option>}
              {isPremium && <option value="replace">Replace</option>}
            </select>
            {!isPremium && (
              <div className="text-xs text-yellow-600 mt-2">Upgrade to premium for background blur or replacement</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Voice Effect</label>
            <select
              className="w-full p-2 rounded border border-gray-300"
              value={voiceEffect}
              onChange={e => setVoiceEffect(e.target.value as 'none' | 'robot' | 'chipmunk' | 'deep')}
              disabled={!isPremium}
            >
              <option value="none">None</option>
              {isPremium && <option value="robot">Robot</option>}
              {isPremium && <option value="chipmunk">Chipmunk</option>}
              {isPremium && <option value="deep">Deep</option>}
            </select>
            {!isPremium && (
              <div className="text-xs text-yellow-600 mt-2">Upgrade to premium for voice effects</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
