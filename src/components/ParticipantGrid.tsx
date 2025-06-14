
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Pin, MoreVertical, Crown } from 'lucide-react';

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

interface ParticipantGridProps {
  participants: Participant[];
  onTogglePin: (participantId: string) => void;
  onKickParticipant?: (participantId: string) => void;
  isHost?: boolean;
}

export const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  onTogglePin,
  onKickParticipant,
  isHost = false
}) => {
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const pinnedParticipant = participants.find(p => p.isPinned);
  const otherParticipants = participants.filter(p => !p.isPinned);

  if (pinnedParticipant) {
    return (
      <div className="h-full flex flex-col">
        {/* Pinned participant (main view) */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden mb-4 shadow-2xl border border-gray-700/50">
          <ParticipantVideo participant={pinnedParticipant} isMainView={true} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(pinnedParticipant.id)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-xl backdrop-blur-sm transition-all hover:scale-110"
          >
            <Pin className="w-5 h-5" />
          </Button>
          {pinnedParticipant.id === 'me' && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-xl text-sm font-semibold animate-pulse">
              📌 Pinned
            </div>
          )}
        </div>
        
        {/* Other participants (thumbnail view) */}
        {otherParticipants.length > 0 && (
          <div className={`grid ${getGridCols(otherParticipants.length)} gap-3 h-36`}>
            {otherParticipants.map(participant => (
              <ParticipantThumbnail
                key={participant.id}
                participant={participant}
                onTogglePin={onTogglePin}
                onKickParticipant={onKickParticipant}
                isHost={isHost}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols(participants.length)} gap-6 h-full`}>
      {participants.map((participant, index) => (
        <div 
          key={participant.id} 
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 transition-all duration-300 hover:scale-105 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <ParticipantVideo participant={participant} />
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(participant.id)}
              className="text-white bg-black/50 hover:bg-black/70 h-8 w-8 p-0 rounded-xl backdrop-blur-sm transition-all hover:scale-110"
            >
              <Pin className="w-4 h-4" />
            </Button>
            {isHost && onKickParticipant && participant.id !== 'me' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onKickParticipant(participant.id)}
                className="text-white bg-red-500/50 hover:bg-red-600/70 h-8 w-8 p-0 rounded-xl backdrop-blur-sm transition-all hover:scale-110"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
          {participant.id === 'me' && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center">
              <Crown className="w-3 h-3 mr-1" />
              You
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ParticipantVideo: React.FC<{ participant: Participant; isMainView?: boolean }> = ({ 
  participant, 
  isMainView = false 
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {participant.isVideoEnabled ? (
        <div className={`w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center transition-all ${
          participant.isSpeaking 
            ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/25' 
            : ''
        }`}>
          <div className="text-center">
            <Video className="w-12 h-12 text-white mx-auto mb-2 animate-pulse" />
            <span className="text-white font-semibold text-lg">Live Video</span>
          </div>
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 transition-all ${
          participant.isSpeaking 
            ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/25' 
            : ''
        }`}>
          <Avatar className={`${isMainView ? 'w-32 h-32' : 'w-16 h-16'} ring-4 ring-white/20`}>
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
              {participant.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 flex items-center space-x-3">
        <div className="bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-xl border border-white/20">
          {participant.name}
          {participant.isSpeaking && (
            <span className="ml-2 animate-pulse">🗣️</span>
          )}
        </div>
        <div className="flex space-x-2">
          {!participant.isAudioEnabled && (
            <div className="bg-red-500/80 backdrop-blur-sm p-2 rounded-xl border border-red-400/30">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="bg-green-500/80 backdrop-blur-sm p-2 rounded-xl border border-green-400/30">
              <Video className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {participant.isSpeaking && (
        <div className="absolute inset-0 bg-green-400/10 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

const ParticipantThumbnail: React.FC<{
  participant: Participant;
  onTogglePin: (id: string) => void;
  onKickParticipant?: (id: string) => void;
  isHost: boolean;
}> = ({ participant, onTogglePin, onKickParticipant, isHost }) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200 shadow-lg border border-gray-700/50 hover:scale-105">
      <ParticipantVideo participant={participant} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTogglePin(participant.id)}
        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 h-6 w-6 p-0 rounded-lg backdrop-blur-sm transition-all hover:scale-110"
      >
        <Pin className="w-3 h-3" />
      </Button>
    </div>
  );
};
