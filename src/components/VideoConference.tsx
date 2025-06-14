
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Simulate call connection after 3 seconds
  useEffect(() => {
    if (isOpen && !isPictureInPicture) {
      const timer = setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Call Connected",
          description: `Connected to ${contact.name}`,
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isPictureInPicture, contact.name]);

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
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared",
        });
        
        // Stop screen sharing when user stops it from browser
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "Screen sharing has been disabled",
        });
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      toast({
        title: "Screen Share Error",
        description: "Unable to share screen",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    setCallDuration(0);
    onClose();
    toast({
      title: "Call Ended",
      description: `Call with ${contact.name} ended`,
    });
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
          {isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Avatar className="w-16 h-16">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {formatDuration(callDuration)}
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
              className={`h-8 w-8 p-0 ${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`h-8 w-8 p-0 ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'} text-white`}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
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
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{contact.name}</h3>
            <p className="text-sm text-gray-300">
              {isConnected ? `Connected - ${formatDuration(callDuration)}` : 'Connecting...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-white">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onTogglePictureInPicture} className="text-white">
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          {isConnected ? (
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="text-4xl">{contact.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <p className="text-white text-lg">{contact.name}</p>
              <p className="text-gray-400">Camera is off</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-pulse">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback className="text-4xl">{contact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-white text-lg">Connecting to {contact.name}...</p>
            </div>
          )}
        </div>

        {/* Local Video (Small overlay) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
          {isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Screen sharing indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Screen Sharing</span>
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
