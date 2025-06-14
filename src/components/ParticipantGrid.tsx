import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Pin, MoreVertical } from 'lucide-react';

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
        <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          <ParticipantVideo participant={pinnedParticipant} isMainView={true} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(pinnedParticipant.id)}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
          >
            <Pin className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Other participants (thumbnail view) */}
        {otherParticipants.length > 0 && (
          <div className={`grid ${getGridCols(otherParticipants.length)} gap-2 h-32`}>
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
    <div className={`grid ${getGridCols(participants.length)} gap-4 h-full`}>
      {participants.map(participant => (
        <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
          <ParticipantVideo participant={participant} />
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(participant.id)}
              className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 h-6 w-6 p-0"
            >
              <Pin className="w-3 h-3" />
            </Button>
            {isHost && onKickParticipant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onKickParticipant(participant.id)}
                className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 h-6 w-6 p-0"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            )}
          </div>
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
    <div className="w-full h-full relative">
      {participant.isVideoEnabled ? (
        <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${participant.isSpeaking ? 'ring-4 ring-green-500' : ''}`}>
          <span className="text-white font-semibold">Video Feed</span>
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gray-800 ${participant.isSpeaking ? 'ring-4 ring-green-500' : ''}`}>
          <Avatar className={isMainView ? 'w-24 h-24' : 'w-12 h-12'}>
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback>{participant.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
          {participant.name}
        </span>
        <div className="flex space-x-1">
          {!participant.isAudioEnabled && (
            <div className="bg-red-600 p-1 rounded">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="bg-green-600 p-1 rounded">
              <Video className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
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
    <div className="relative bg-gray-900 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500">
      <ParticipantVideo participant={participant} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTogglePin(participant.id)}
        className="absolute top-1 right-1 text-white bg-black bg-opacity-50 hover:bg-opacity-70 h-5 w-5 p-0"
      >
        <Pin className="w-2 h-2" />
      </Button>
    </div>
  );
};
