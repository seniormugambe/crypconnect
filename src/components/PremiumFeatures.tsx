import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  FileText, 
  Download, 
  Award, 
  Shield, 
  Clock, 
  Users, 
  Mic, 
  Video,
  Monitor,
  Hand,
  X,
  Wifi,
  Signal,
  Zap,
  Star,
  Trophy,
  Gift,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Participant } from '@/types/participant';

interface PremiumFeaturesProps {
  isPremium: boolean;
  callDuration: number;
  participants: Participant[];
  isScreenSharing: boolean;
  isHandRaised: boolean;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  isPremium,
  callDuration,
  participants,
  isScreenSharing,
  isHandRaised
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [premiumFeaturesUsed, setPremiumFeaturesUsed] = useState<string[]>([]);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showDAOModal, setShowDAOModal] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Premium features unlock milestones with enhanced animations
  useEffect(() => {
    if (isPremium) {
      if (callDuration === 600 && !premiumFeaturesUsed.includes('transcription')) { // 10 minutes
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 3000);
        toast({
          title: "🎯 Premium Feature Unlocked",
          description: "AI Transcription is now available!",
        });
        setPremiumFeaturesUsed(prev => [...prev, 'transcription']);
        setAchievements(prev => [...prev, 'AI Transcription Master']);
      }
      if (callDuration === 900 && !premiumFeaturesUsed.includes('analytics')) { // 15 minutes
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 3000);
        toast({
          title: "📊 Analytics Available",
          description: "Meeting analytics dashboard unlocked!",
        });
        setPremiumFeaturesUsed(prev => [...prev, 'analytics']);
        setAchievements(prev => [...prev, 'Analytics Expert']);
      }
      if (callDuration === 1800 && !premiumFeaturesUsed.includes('nft')) { // 30 minutes
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 3000);
        toast({
          title: "🎨 NFT Feature Unlocked",
          description: "You can now mint meeting NFTs!",
        });
        setPremiumFeaturesUsed(prev => [...prev, 'nft']);
        setAchievements(prev => [...prev, 'NFT Creator']);
      }
      if (callDuration === 3600 && !premiumFeaturesUsed.includes('dao')) { // 1 hour
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 3000);
        toast({
          title: "🏛️ DAO Integration Unlocked",
          description: "DAO governance features are now available!",
        });
        setPremiumFeaturesUsed(prev => [...prev, 'dao']);
        setAchievements(prev => [...prev, 'DAO Governor']);
      }
    }
  }, [callDuration, isPremium, premiumFeaturesUsed]);

  // Start AI Transcription
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
        "We should consider the user feedback carefully.",
        "The blockchain integration is progressing well.",
        "Smart contract deployment is scheduled for next sprint.",
        "DAO governance proposal has been submitted.",
        "Community voting will begin tomorrow."
      ];
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      setTranscript(prev => [...prev, randomTranscript]);
    }, 10000); // Add transcript every 10 seconds
    
    return () => clearInterval(transcriptionInterval);
  };

  // Start Screen Recording
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

  // Stop Recording
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

  // Generate Meeting Summary
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
    
📋 Key Discussion Points:
• Discussed project timeline and milestones
• Reviewed technical requirements and architecture
• Scheduled follow-up meeting for next week
• Key decisions: Proceed with Phase 1 implementation
• Action items: Team to prepare detailed specifications

🎯 Decisions Made:
• Approve smart contract deployment
• Schedule DAO governance vote
• Allocate budget for premium features

📊 Meeting Metrics:
• Duration: ${Math.floor(callDuration / 60)} minutes
• Participants: ${participants.length}
• Screen shares: ${isScreenSharing ? 1 : 0}
• Hand raises: ${isHandRaised ? 1 : 0}

🏆 Achievements Unlocked:
${achievements.map(achievement => `• ${achievement}`).join('\n')}`;
    
    setMeetingSummary(mockSummary);
    toast({
      title: "📝 AI Summary Generated",
      description: "Meeting summary is ready",
    });
  };

  // Toggle Whiteboard
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

  // Show Analytics
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

  // Mint Meeting NFT
  const mintMeetingNFT = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "NFT Minting requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    setShowNFTModal(true);
    toast({
      title: "🎨 NFT Minting",
      description: "Mint your meeting as an NFT",
    });
  };

  // Show DAO Integration
  const showDAOIntegration = () => {
    if (!isPremium) {
      toast({
        title: "🔒 Premium Feature",
        description: "DAO Integration requires Premium subscription",
        variant: "destructive",
      });
      return;
    }
    
    setShowDAOModal(true);
    toast({
      title: "🏛️ DAO Governance",
      description: "Access DAO governance features",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isPremium) {
    return (
      <div className="fixed top-4 right-4 z-10">
        <Badge className="bg-gray-600 text-white border-0 shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(callDuration)}
        </Badge>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Premium Badge with Animation */}
      <div className={`fixed top-4 left-4 z-10 transition-all duration-500 ${isPulsing ? 'scale-110' : 'scale-100'}`}>
        <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 shadow-2xl animate-pulse">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      </div>

      {/* Enhanced Premium Features Overlay with Glassmorphism */}
      <div className="absolute top-4 right-4 flex flex-col space-y-3">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={startTranscription}
            disabled={isTranscribing}
            className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isTranscribing ? 'Transcribing...' : 'AI Transcribe'}
          </Button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full rounded-xl transition-all duration-300 hover:scale-105 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 text-red-200' 
                : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-white hover:from-green-500/30 hover:to-emerald-500/30'
            }`}
          >
            {isRecording ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRecording ? 'Stop Recording' : 'Record'}
          </Button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWhiteboard}
            className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-400/30 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-4 h-4 mr-2" />
            Whiteboard
          </Button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSummary}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Award className="w-4 h-4 mr-2" />
            AI Summary
          </Button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={showAnalyticsDashboard}
            className="w-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-white hover:from-indigo-500/30 hover:to-blue-500/30 border border-indigo-400/30 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Shield className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {premiumFeaturesUsed.includes('nft') && (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl animate-bounce">
            <Button
              variant="ghost"
              size="sm"
              onClick={mintMeetingNFT}
              className="w-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:from-purple-500/50 hover:to-pink-500/50 border border-purple-400/50 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Mint NFT
            </Button>
          </div>
        )}

        {premiumFeaturesUsed.includes('dao') && (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl animate-bounce">
            <Button
              variant="ghost"
              size="sm"
              onClick={showDAOIntegration}
              className="w-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-white hover:from-blue-500/50 hover:to-cyan-500/50 border border-blue-400/50 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Trophy className="w-4 h-4 mr-2" />
              DAO
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Duration Display */}
      <div className="flex items-center space-x-3 text-white/90 bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20 shadow-2xl">
        <Clock className="w-5 h-5 text-blue-400" />
        <span className="font-mono text-lg font-bold">{formatDuration(callDuration)}</span>
        <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
          <Sparkles className="w-3 h-3 mr-1" />
          Unlimited
        </Badge>
      </div>

      {/* Enhanced Achievements Display */}
      {achievements.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-3">
            {achievements.slice(-3).map((achievement, index) => (
              <Badge 
                key={index} 
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0 shadow-2xl animate-pulse"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <Star className="w-3 h-3 mr-1" />
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Premium Features Modals */}
      {showWhiteboard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 w-4/5 h-4/5 shadow-2xl border border-gray-200 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Collaborative Whiteboard
              </h3>
              <Button 
                onClick={() => setShowWhiteboard(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce">🎨</div>
                <h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Interactive Whiteboard
                </h4>
                <p className="text-gray-600 text-lg mb-2">Draw, collaborate, and brainstorm in real-time</p>
                <p className="text-sm text-gray-400">Premium Feature</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 w-4/5 h-4/5 shadow-2xl border border-gray-200 animate-in zoom-in duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Meeting Analytics
              </h3>
              <Button 
                onClick={() => setShowAnalytics(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-blue-800">Participation</h4>
                <div className="space-y-2 text-blue-700">
                  <p>Active participants: {participants.length}</p>
                  <p>Meeting duration: {formatDuration(callDuration)}</p>
                  <p>Premium features used: {premiumFeaturesUsed.length}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-green-800">Engagement</h4>
                <div className="space-y-2 text-green-700">
                  <p>Screen shares: {isScreenSharing ? 1 : 0}</p>
                  <p>Hand raises: {isHandRaised ? 1 : 0}</p>
                  <p>Achievements: {achievements.length}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-purple-800">AI Insights</h4>
                <div className="space-y-2 text-purple-700">
                  <p>Transcription lines: {transcript.length}</p>
                  <p>Recording status: {isRecording ? 'Active' : 'Inactive'}</p>
                  <p>Whiteboard sessions: {showWhiteboard ? 1 : 0}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-orange-800">Web3 Features</h4>
                <div className="space-y-2 text-orange-700">
                  <p>NFT minting: {premiumFeaturesUsed.includes('nft') ? 'Available' : 'Locked'}</p>
                  <p>DAO integration: {premiumFeaturesUsed.includes('dao') ? 'Available' : 'Locked'}</p>
                  <p>Premium status: Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced AI Summary Modal */}
      {meetingSummary && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 w-2/3 h-2/3 shadow-2xl border border-gray-200 animate-in zoom-in duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Meeting Summary
              </h3>
              <Button 
                onClick={() => setMeetingSummary('')}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">{meetingSummary}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced NFT Minting Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 w-2/3 h-2/3 shadow-2xl border border-gray-200 animate-in zoom-in duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mint Meeting NFT
              </h3>
              <Button 
                onClick={() => setShowNFTModal(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl border border-purple-300 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-purple-800">Meeting NFT Details</h4>
                <div className="grid grid-cols-2 gap-4 text-purple-700">
                  <p>Duration: {formatDuration(callDuration)}</p>
                  <p>Participants: {participants.length}</p>
                  <p>Features Used: {premiumFeaturesUsed.length}</p>
                  <p>Achievements: {achievements.length}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl border border-gray-300 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-gray-800">NFT Metadata</h4>
                <div className="space-y-2 text-gray-700">
                  <p>Name: "Epic Meeting #{Date.now()}"</p>
                  <p>Description: "A productive meeting with amazing insights"</p>
                  <p>Attributes: Premium, AI-Enhanced, Web3-Enabled</p>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-2xl py-4 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105">
                <Zap className="w-5 h-5 mr-3" />
                Mint NFT (0.01 ETH)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced DAO Integration Modal */}
      {showDAOModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-8 w-2/3 h-2/3 shadow-2xl border border-gray-200 animate-in zoom-in duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                DAO Governance
              </h3>
              <Button 
                onClick={() => setShowDAOModal(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-2xl border border-blue-300 shadow-lg">
                <h4 className="font-bold text-lg mb-4 text-blue-800">Active Proposals</h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-md">
                    <p className="font-semibold text-blue-800">Proposal #1: Feature Enhancement</p>
                    <p className="text-sm text-blue-600 mt-1">Add more AI features to the platform</p>
                    <div className="flex space-x-3 mt-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl">Vote Yes</Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl">Vote No</Button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-md">
                    <p className="font-semibold text-blue-800">Proposal #2: Token Distribution</p>
                    <p className="text-sm text-blue-600 mt-1">Distribute governance tokens to active users</p>
                    <div className="flex space-x-3 mt-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl">Vote Yes</Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl">Vote No</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl border border-gray-300 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-gray-800">Your Voting Power</h4>
                <div className="grid grid-cols-3 gap-4 text-gray-700">
                  <div className="text-center">
                    <p className="font-bold text-2xl text-blue-600">1,000</p>
                    <p className="text-sm">Governance Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-2xl text-green-600">10%</p>
                    <p className="text-sm">Voting Weight</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-2xl text-purple-600">5</p>
                    <p className="text-sm">Proposals Voted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Transcription Display */}
      {isTranscribing && transcript.length > 0 && (
        <div className="fixed bottom-20 left-4 w-96 bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <h4 className="text-white font-bold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Live Transcription
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {transcript.slice(-5).map((text, index) => (
              <div key={index} className="text-white/90 text-sm bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm animate-in fade-in duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}; 