import React, { useState, useMemo } from 'react';
import { Web3Provider } from '@/contexts/Web3Context';
import Web3AuthGuard from '@/components/Web3AuthGuard';
import Web3Sidebar from '@/components/Web3Sidebar';
import Web3UserProfile from '@/components/Web3UserProfile';
import { MessagesPage } from '@/components/MessagesPage';
import { VideoConference } from '@/components/VideoConference';
import { ScheduleMeetingModal } from '@/components/ScheduleMeetingModal';
import { JoinMeetingModal } from '@/components/JoinMeetingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Users, 
  Calendar, 
  Settings, 
  Plus,
  Clock,
  Globe,
  Shield
} from 'lucide-react';

interface IndexProps {
  hasKey: boolean;
  user: any;
  checkingKey: boolean;
}

const Index: React.FC<IndexProps> = ({ hasKey, user, checkingKey }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isVideoConferenceOpen, setIsVideoConferenceOpen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Recent meetings as state
  const [recentMeetings, setRecentMeetings] = useState([
    {
      id: '1',
      title: 'Matricop Launch Party',
      time: 'Just now',
      participants: 12,
      duration: '1 hr'
    },
    {
      id: '2',
      title: 'DAO Governance Call',
      time: 'Today, 10:00 AM',
      participants: 8,
      duration: '50 min'
    }
  ]);

  // Upcoming meetings as state
  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: '1',
      title: 'Web3 Community AMA',
      time: 'Tomorrow, 5:00 PM',
      participants: ['satoshi.eth', 'vitalik.eth', 'ava.sol']
    },
    {
      id: '2',
      title: 'Product Feedback Session',
      time: 'Friday, 2:00 PM',
      participants: ['alice.eth', 'bob.base']
    }
  ]);

  // Create a stable meeting ID
  const meetingId = useMemo(() => {
    // Generate a proper UUID for Supabase
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  // Callback to add a new meeting
  const handleScheduleMeeting = (meeting) => {
    setUpcomingMeetings((prev) => [
      { ...meeting, id: Math.random().toString(36).substr(2, 9) },
      ...prev
    ]);
  };

  // Mark an upcoming meeting as completed
  const handleCompleteMeeting = (meeting) => {
    setUpcomingMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    setRecentMeetings((prev) => [
      {
        ...meeting,
        time: 'Just now',
        duration: meeting.duration || 'N/A',
      },
      ...prev
    ]);
  };

  const handleStartVideoCall = () => {
    setIsVideoConferenceOpen(true);
  };

  const handleCloseVideoCall = () => {
    setIsVideoConferenceOpen(false);
    setIsPictureInPicture(false);
  };

  const handleTogglePictureInPicture = () => {
    setIsPictureInPicture(!isPictureInPicture);
  };

  const renderDashboard = () => {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Matricop Connect
            </h1>
            <p className="text-gray-600 text-lg mt-2">Your gateway to seamless, secure, and decentralized meetings. Experience the future of collaboration today!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secure Connection
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Decentralized
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 text-center" onClick={handleStartVideoCall}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Start Instant Room</h3>
              <p className="text-gray-600">Launch a new video room in seconds</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-green-100 hover:border-green-300">
            <CardContent className="p-6 text-center" onClick={() => setIsScheduleModalOpen(true)}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Book a Session</h3>
              <p className="text-gray-600">Schedule a meeting with your team or clients</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-purple-100 hover:border-purple-300">
            <CardContent className="p-6 text-center" onClick={() => setIsJoinModalOpen(true)}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Enter Room</h3>
              <p className="text-gray-600">Join with a unique room code</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-orange-100 hover:border-orange-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">My Events</h3>
              <p className="text-gray-600">See all your upcoming and past events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Meetings */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Clock className="w-6 h-6 mr-3" />
                Recent Meetings
              </CardTitle>
              <CardDescription className="text-blue-100">
                Your latest video conferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <p className="text-gray-600 text-sm">{meeting.time} • {meeting.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Users className="w-3 h-3 mr-1" />
                        {meeting.participants}
                      </Badge>
                      <Button variant="outline" size="sm" className="hover:bg-blue-50">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {recentMeetings.length === 0 && (
                  <div className="text-center py-8">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent meetings</p>
                    <Button 
                      onClick={handleStartVideoCall}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Start Your First Meeting
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Calendar className="w-6 h-6 mr-3" />
                Upcoming
              </CardTitle>
              <CardDescription className="text-green-100">
                Scheduled meetings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h4 className="font-semibold text-gray-900 mb-2">{meeting.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{meeting.time}</p>
                    <div className="flex -space-x-2 mb-2">
                      {meeting.participants.slice(0, 3).map((participant, index) => (
                        <Avatar key={index} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${participant}`} />
                          <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs">
                            {participant.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {meeting.participants.length > 3 && (
                        <div className="w-8 h-8 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs text-gray-600">
                          +{meeting.participants.length - 3}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => handleCompleteMeeting(meeting)}>
                      Mark as Completed
                    </Button>
                  </div>
                ))}
                {upcomingMeetings.length === 0 && (
                  <div className="text-center py-6">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No upcoming meetings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Meeting Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleStartVideoCall}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
            size="lg"
          >
            <Video className="w-8 h-8" />
          </Button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Web3UserProfile />
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <Web3Provider>
      <Web3AuthGuard>
        <div className="flex h-screen bg-gray-50">
          <Web3Sidebar />
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
        
        {/* Video Conference Component */}
        <VideoConference
          contact={{
            id: meetingId,
            name: 'Conference Room',
            avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=conference'
          }}
          isOpen={isVideoConferenceOpen}
          onClose={handleCloseVideoCall}
          isPictureInPicture={isPictureInPicture}
          onTogglePictureInPicture={handleTogglePictureInPicture}
          isPremium={hasKey}
        />

        {/* Schedule Meeting Modal */}
        <ScheduleMeetingModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleScheduleMeeting}
        />

        {/* Join Meeting Modal */}
        <JoinMeetingModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoinMeeting={handleStartVideoCall}
        />
      </Web3AuthGuard>
    </Web3Provider>
  );
};

export default Index;
