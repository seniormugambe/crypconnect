
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinMeeting: () => void;
}

export const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({
  isOpen,
  onClose,
  onJoinMeeting
}) => {
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleJoin = () => {
    if (!meetingId.trim()) {
      toast({
        title: "Meeting ID Required",
        description: "Please enter a valid meeting ID",
        variant: "destructive"
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Display Name Required", 
        description: "Please enter your display name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🎉 Joining Meeting",
      description: `Connecting to meeting ${meetingId} as ${displayName}`,
    });

    // Reset form and join meeting
    setMeetingId('');
    setDisplayName('');
    onClose();
    onJoinMeeting();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Join Meeting
          </DialogTitle>
          <DialogDescription>
            Enter the meeting ID to join an existing video conference
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="meetingId">Meeting ID *</Label>
            <Input
              id="meetingId"
              placeholder="Enter meeting ID (e.g. abc-def-123)"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="text-center font-mono tracking-wider"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Display Name *</Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Make sure you have a stable internet connection and allow camera/microphone access when prompted.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleJoin} className="bg-purple-500 hover:bg-purple-600">
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
