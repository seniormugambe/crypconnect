import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ParticipantGrid } from './ParticipantGrid';
import { PremiumFeatures } from './PremiumFeatures';
import { useNavigate } from 'react-router-dom';
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
  Crown,
  Sparkles,
  Clock,
  FileText,
  Download,
  Award,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Participant } from '@/types/participant';

interface VideoConferenceProps {
  contact: { id: string; name: string; avatar: string };
  isOpen: boolean;
  onClose: () => void;
  isPictureInPicture?: boolean;
  onTogglePictureInPicture?: () => void;
  isPremium?: boolean;
  meetingId?: string; // Optional, fallback to contact.id
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  contact,
  isOpen,
  onClose,
  isPictureInPicture,
  onTogglePictureInPicture,
  isPremium = false,
  meetingId: propMeetingId
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
  const [messages, setMessages] = useState<any[]>([]);
  const meetingId = propMeetingId || contact.id;
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEffect, setVoiceEffect] = useState<'normal' | 'pitch' | 'robot' | 'echo'>('normal');
  const [isVoiceChanged, setIsVoiceChanged] = useState(false);
  
  // Premium features state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [premiumFeaturesUsed, setPremiumFeaturesUsed] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const effectNodeRef = useRef<AudioNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const navigate = useNavigate();

  // Fetch participants and messages from Supabase
  useEffect(() => {
    if (!isOpen || !meetingId || meetingId === 'meeting-room') return;
    async function fetchData() {
      try {
        const { data: participantsData, error: participantsError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', meetingId);
        
        if (participantsError) {
          console.error('Error fetching participants:', participantsError);
        } else {
          setParticipants((participantsData || []).map((p: any) => ({
            id: p.id,
            name: p.name || 'Unknown',
            avatar: p.avatar || '',
            isVideoEnabled: p.isVideoEnabled ?? true,
            isAudioEnabled: p.isAudioEnabled ?? true,
            isScreenSharing: p.isScreenSharing ?? false,
            isSpeaking: p.isSpeaking ?? false,
            isPinned: p.isPinned ?? false,
            isPremium: p.isPremium ?? false,
          })));
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from('conference_messages')
          .select('*')
          .eq('id', meetingId)
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else {
          setMessages(messagesData || []);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    }
    fetchData();
  }, [isOpen, meetingId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!isOpen || !meetingId || meetingId === 'meeting-room') return;
    const participantSub = supabase
      .channel('public:participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `id=eq.${meetingId}` },
        (payload) => {
          // Refetch participants
          supabase
            .from('participants')
            .select('*')
            .eq('id', meetingId)
            .then(({ data }) => setParticipants(data || []));
        }
      )
      .subscribe();

    const messageSub = supabase
      .channel('public:conference_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conference_messages', filter: `id=eq.${meetingId}` },
        (payload) => {
          // Refetch messages
          supabase
            .from('conference_messages')
            .select('*')
            .eq('id', meetingId)
            .order('created_at', { ascending: true })
            .then(({ data }) => setMessages(data || []));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantSub);
      supabase.removeChannel(messageSub);
    };
  }, [isOpen, meetingId]);

  // Join/leave conference helpers
  async function joinConference(userId) {
    await supabase.from('participants').insert({ id: meetingId, user_id: userId });
  }

  async function leaveConference(participantId) {
    await supabase.from('participants').update({ left_at: new Date().toISOString() }).eq('id', participantId);
  }

  async function sendMessage(userId, message) {
    await supabase.from('conference_messages').insert({ id: meetingId, user_id: userId, message });
  }

  // Call duration timer (unlimited for premium)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
        
        // Show premium benefits for longer calls
        if (callDuration === 300 && !isPremium) { // 5 minutes
          toast({
            title: "⏰ Time Limit Reached",
            description: "Upgrade to Premium for unlimited meeting duration!",
            variant: "destructive",
          });
        }
        
        // Premium features unlock milestones
        if (isPremium) {
          if (callDuration === 600 && !premiumFeaturesUsed.includes('transcription')) { // 10 minutes
            toast({
              title: "🎯 Premium Feature Unlocked",
              description: "AI Transcription is now available!",
            });
            setPremiumFeaturesUsed((prev: string[]) => [...prev, 'transcription']);
          }
          if (callDuration === 900 && !premiumFeaturesUsed.includes('analytics')) { // 15 minutes
            toast({
              title: "📊 Analytics Available",
              description: "Meeting analytics dashboard unlocked!",
            });
            setPremiumFeaturesUsed((prev: string[]) => [...prev, 'analytics']);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, isPremium, premiumFeaturesUsed]);

  // Premium: Start AI Transcription
  const startTranscription = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "AI Transcription requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    setIsTranscribing(true);
    toast({
      title: "🎤 AI Transcription Started",
      description: "Real-time transcription is now active",
    });
    
    // Simulate transcription
    const transcriptionInterval = setInterval(() => {
      const mockTranscripts = [
        "Great discussion about the project timeline.",
        "Let's schedule the next meeting for next week.",
        "The technical requirements look solid.",
        "We should consider the user feedback carefully."
      ];
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      setTranscript((prev: string[]) => [...prev, randomTranscript]);
    }, 10000); // Add transcript every 10 seconds
    
    return () => clearInterval(transcriptionInterval);
  };

  // Premium: Start Screen Recording
  const startRecording = async () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "Screen Recording requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = chunks;
      setIsRecording(true);
      
      toast({
        title: "🎥 Recording Started",
        description: "Screen recording is now active",
      });
    } catch (error) {
      toast({
        title: "❌ Recording Failed",
        description: "Please allow screen sharing access",
        variant: "destructive",
      });
    }
  };

  // Premium: Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "🎥 Recording Saved",
        description: "Meeting recording has been downloaded",
      });
    }
  };

  // Premium: Generate Meeting Summary
  const generateSummary = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "AI Summary requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    const mockSummary = `Meeting Summary (${Math.floor(callDuration / 60)} minutes):
    
• Discussed project timeline and milestones
• Reviewed technical requirements and architecture
• Scheduled follow-up meeting for next week
• Key decisions: Proceed with Phase 1 implementation
• Action items: Team to prepare detailed specifications`;
    
    setMeetingSummary(mockSummary);
    toast({
      title: "📝 AI Summary Generated",
      description: "Meeting summary is ready",
    });
  };

  // Premium: Toggle Whiteboard
  const toggleWhiteboard = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "Collaborative Whiteboard requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    setShowWhiteboard(!showWhiteboard);
    toast({
      title: showWhiteboard ? "📝 Whiteboard Closed" : "🎨 Whiteboard Opened",
      description: showWhiteboard ? "Whiteboard has been closed" : "Collaborative whiteboard is now active",
    });
  };

  // Premium: Show Analytics
  const showAnalyticsDashboard = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "Analytics Dashboard requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    setShowAnalytics(!showAnalytics);
    toast({
      title: "📊 Analytics Dashboard",
      description: showAnalytics ? "Analytics dashboard closed" : "Meeting analytics are now visible",
    });
  };

  // Helper to apply/remove effects
  const applyVoiceEffect = useCallback((stream: MediaStream, effect: string) => {
    if (!stream) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    // Disconnect previous nodes if any
    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (effectNodeRef.current) effectNodeRef.current.disconnect();
    // Create source node
    sourceNodeRef.current = audioContext.createMediaStreamSource(stream);
    const node: AudioNode = sourceNodeRef.current;
    // Apply selected effect
    switch (effect) {
      case 'pitch': {
        // Simple pitch shift using playbackRate (not perfect, demo only)
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1;
        node.connect(gainNode);
        gainNode.connect(audioContext.destination);
        effectNodeRef.current = gainNode;
        break;
      }
      case 'robot': {
        // Robot effect: distortion
        const waveShaper = audioContext.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; ++i) {
          curve[i] = (i - 128) / 128;
        }
        waveShaper.curve = curve;
        waveShaper.oversample = '4x';
        node.connect(waveShaper);
        waveShaper.connect(audioContext.destination);
        effectNodeRef.current = waveShaper;
        break;
      }
      case 'echo': {
        // Echo effect
        const delay = audioContext.createDelay();
        delay.delayTime.value = 0.25;
        const feedback = audioContext.createGain();
        feedback.gain.value = 0.4;
        node.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(audioContext.destination);
        effectNodeRef.current = delay;
        break;
      }
      default: {
        // Normal (no effect)
        node.connect(audioContext.destination);
        effectNodeRef.current = node;
        break;
      }
    }
  }, []);

  // Toggle voice changer effect
  const handleToggleVoiceChanger = () => {
    setIsVoiceChanged((prev) => {
      const newState = !prev;
      if (localStreamRef.current) {
        if (newState) {
          applyVoiceEffect(localStreamRef.current, voiceEffect);
        } else {
          // Remove all effects
          if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
          if (effectNodeRef.current) effectNodeRef.current.disconnect();
        }
      }
      toast({
        title: newState ? `🔊 Voice Changer (${voiceEffect}) Enabled` : "🔊 Voice Changer Disabled",
        description: newState ? `Your voice effect: ${voiceEffect}` : "Your voice is back to normal.",
      });
      return newState;
    });
  };

  // Change effect handler
  const handleChangeEffect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const effect = e.target.value as 'normal' | 'pitch' | 'robot' | 'echo';
    setVoiceEffect(effect);
    if (isVoiceChanged && localStreamRef.current) {
      applyVoiceEffect(localStreamRef.current, effect);
      toast({
        title: `🔊 Voice Effect Changed`,
        description: `Your voice effect: ${effect}`,
      });
    }
  };

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

  const inviteParticipant = () => {
    const inviteCode = Math.random().toString(36).substring(2, 8);
    navigator.clipboard.writeText(`${window.location.origin}/chat/invite/${inviteCode}`);
    toast({
      title: "📋 Invite Link Copied",
      description: "Share this link to invite participants",
    });
    
    // Automatically navigate to Messages page after inviting
    setTimeout(() => {
      navigate('/messages');
    }, 1500); // Small delay to let user see the toast notification
  };

  const endCall = () => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
    toast({
      title: "📞 Call Ended",
      description: `Meeting ended after ${Math.floor(callDuration / 60)} minutes`,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  if (isPictureInPicture) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-60 bg-black rounded-lg shadow-2xl border border-gray-600 z-50">
        <div className="relative w-full h-full">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePictureInPicture}
              className="w-8 h-8 p-0 bg-black/50 text-white hover:bg-black/70"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 bg-red-600 text-white hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <PremiumFeatures
        isPremium={isPremium}
        callDuration={callDuration}
        participants={participants}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-white font-semibold text-lg">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={inviteParticipant}
            className="text-white hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 border border-white/20"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowChat(!showChat)}
            className={`text-white rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 border ${
              showChat ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/25' : 'border-white/20 hover:bg-white/20'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat
            {showChat && <span className="ml-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
            className="text-white hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 border border-white/20"
          >
            <Grid3X3 className="w-5 h-5 mr-2" />
            {viewMode === 'grid' ? 'Speaker View' : 'Grid View'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 border border-white/20"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Enhanced Main Video Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/10 via-transparent to-cyan-900/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Enhanced Participant Grid */}
          <div className="relative z-10 h-full p-8">
            <div className="h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm">
              <ParticipantGrid 
                participants={participants} 
                onTogglePin={(participantId) => {
                  setParticipants((prev: Participant[]) => prev.map(p => ({
                    ...p,
                    isPinned: p.id === participantId ? !p.isPinned : false
                  })));
                }}
                isHost={true}
              />
            </div>
          </div>

          {/* Premium Features Overlay */}
          <PremiumFeatures
            isPremium={isPremium}
            callDuration={callDuration}
            participants={participants}
            isScreenSharing={isScreenSharing}
            isHandRaised={isHandRaised}
          />

          {/* Enhanced Floating Elements */}
          <div className="absolute top-8 left-8 z-20">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Live</span>
              </div>
            </div>
          </div>

          <div className="absolute top-8 right-8 z-20">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30 shadow-2xl">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <span className="text-purple-200 font-semibold">Premium Active</span>
              </div>
            </div>
          </div>

          {/* Enhanced Connection Status */}
          <div className="absolute bottom-8 left-8 z-20">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3">
                <Signal className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">{connectionQuality}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Call Duration */}
          <div className="absolute bottom-8 right-8 z-20">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-white font-mono font-bold text-lg">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Sidebar */}
        {showChat && (
          <div className="w-96 bg-black/40 backdrop-blur-2xl border-l border-white/30 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h3 className="text-white font-bold text-xl">Chat</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)} 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                <span className="font-semibold text-blue-300">Alex.eth:</span>
                <p className="text-white/90 mt-1">Great meeting everyone!</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                <span className="font-semibold text-green-300">Sarah.base:</span>
                <p className="text-white/90 mt-1">Looking forward to the next steps.</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-4 rounded-2xl border border-purple-400/30">
                <span className="font-semibold text-purple-300">Premium:</span>
                <p className="text-purple-200 mt-1">File sharing and code snippets available</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Settings Sidebar */}
        {showSettings && (
          <div className="w-96 bg-black/40 backdrop-blur-2xl border-l border-white/30 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h3 className="text-white font-bold text-xl">Settings</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(false)} 
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                <label className="text-sm font-medium text-white mb-3 block">Voice Effect</label>
                <select
                  value={voiceEffect}
                  onChange={handleChangeEffect}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white backdrop-blur-xl"
                  disabled={!isVoiceChanged}
                >
                  <option value="normal">Normal</option>
                  <option value="pitch">Pitch Shift</option>
                  <option value="robot">Robot</option>
                  <option value="echo">Echo</option>
                </select>
                <Button
                  variant={isVoiceChanged ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleToggleVoiceChanger}
                  className="w-full mt-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-white hover:from-blue-500/30 hover:to-cyan-500/30"
                >
                  {isVoiceChanged ? "Disable Voice Changer" : "Enable Voice Changer"}
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-6 rounded-2xl border border-purple-400/30">
                <h4 className="font-bold text-lg mb-4 flex items-center text-purple-200">
                  <span className="text-2xl mr-3">👑</span>
                  Premium Features
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-white">AI Transcription</span>
                    <Badge className="bg-green-600 text-white border-0">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-white">Screen Recording</span>
                    <Badge className="bg-green-600 text-white border-0">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-white">Unlimited Duration</span>
                    <Badge className="bg-green-600 text-white border-0">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-white">NFT Minting</span>
                    <Badge className="bg-green-600 text-white border-0">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <span className="text-white">DAO Integration</span>
                    <Badge className="bg-green-600 text-white border-0">Available</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="p-8 bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <div className="flex justify-center items-center space-x-8">
          {/* Primary Controls */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleAudio}
              className={`w-20 h-20 rounded-3xl transition-all duration-500 hover:scale-110 border-2 shadow-2xl ${
                !isAudioEnabled 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border-red-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30 hover:shadow-white/25'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleVideo}
              className={`w-20 h-20 rounded-3xl transition-all duration-500 hover:scale-110 border-2 shadow-2xl ${
                !isVideoEnabled 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border-red-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30 hover:shadow-white/25'
              }`}
            >
              {isVideoEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleScreenShare}
              className={`w-20 h-20 rounded-3xl transition-all duration-500 hover:scale-110 border-2 shadow-2xl ${
                isScreenSharing 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 border-green-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30 hover:shadow-white/25'
              }`}
            >
              <Monitor className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={toggleHandRaise}
              className={`w-20 h-20 rounded-3xl transition-all duration-500 hover:scale-110 border-2 shadow-2xl ${
                isHandRaised 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 border-yellow-400/50 text-white' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 hover:border-white/30 hover:shadow-white/25'
              }`}
            >
              <Hand className="w-8 h-8" />
            </Button>
          </div>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="w-20 h-20 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-500 hover:scale-110 shadow-2xl shadow-red-500/25 border-2 border-red-400/50 animate-pulse"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
        
        {/* Enhanced Status Indicators */}
        <div className="flex justify-center items-center space-x-8 mt-6 text-white/80 text-base">
          <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20">
            <Wifi className="w-5 h-5 text-green-400" />
            <span className="font-semibold">{connectionQuality}</span>
          </div>
          <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">{participants.length} participants</span>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl px-4 py-2 border border-purple-400/30">
            <span className="text-2xl">👑</span>
            <span className="font-semibold text-purple-200">Premium Mode</span>
          </div>
        </div>
      </div>

      {/* Premium Features Modals */}
      {showWhiteboard && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-3/4 h-3/4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Collaborative Whiteboard</h3>
              <Button onClick={() => setShowWhiteboard(false)}>Close</Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded h-full flex items-center justify-center text-gray-500">
              Interactive Whiteboard (Premium Feature)
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-3/4 h-3/4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Meeting Analytics</h3>
              <Button onClick={() => setShowAnalytics(false)}>Close</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold">Participation</h4>
                <p>Active participants: {participants.length}</p>
                <p>Meeting duration: {formatDuration(callDuration)}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold">Engagement</h4>
                <p>Screen shares: {isScreenSharing ? 1 : 0}</p>
                <p>Hand raises: {isHandRaised ? 1 : 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {meetingSummary && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-2/3 h-2/3 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">AI Meeting Summary</h3>
              <Button onClick={() => setMeetingSummary('')}>Close</Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">{meetingSummary}</pre>
          </div>
        </div>
      )}

      {/* Transcription Display */}
      {isTranscribing && transcript.length > 0 && (
        <div className="fixed bottom-20 left-4 w-80 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-2">Live Transcription</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {transcript.slice(-5).map((text, index) => (
              <div key={index} className="text-white/80 text-sm bg-white/10 p-2 rounded">
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
