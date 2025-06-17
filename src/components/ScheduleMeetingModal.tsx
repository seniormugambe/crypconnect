
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');

  const handleSchedule = () => {
    if (!meetingTitle || !meetingDate || !meetingTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate a meeting ID
    const meetingId = Math.random().toString(36).substr(2, 9);
    
    toast({
      title: "📅 Meeting Scheduled!",
      description: `Meeting "${meetingTitle}" scheduled for ${meetingDate} at ${meetingTime}. Meeting ID: ${meetingId}`,
    });

    // Reset form
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setDuration('60');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>
            Plan a future video conference with your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="Enter meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda or description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="bg-green-500 hover:bg-green-600">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
