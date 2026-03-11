// frontend/src/components/StudentMeetings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Video, Clock, User, Phone, LogIn } from 'lucide-react';
import { io } from 'socket.io-client';

const StudentMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningMeeting, setJoiningMeeting] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchMeetings();

    // Initialize socket connection
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:4002', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('meeting-started', (data) => {
      alert(`🔔 Meeting "${data.title}" has started! You can now join.`);
      fetchMeetings(); // Refresh meetings list
    });

    newSocket.on('meeting-ended', (data) => {
      fetchMeetings(); // Refresh meetings list
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4002/api/student/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meeting) => {
    if (meeting.status !== 'live') {
      alert('This meeting has not started yet. Please wait for your supervisor to start it.');
      return;
    }

    try {
      setJoiningMeeting(meeting._id);
      const token = localStorage.getItem('token');

      // Record join
      await axios.post(`http://localhost:4002/api/meetings/join/${meeting.roomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Open meeting room in new tab
      window.open(meeting.shareLink, '_blank');

      // Refresh meetings to update join time
      setTimeout(fetchMeetings, 2000);
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert(error.response?.data?.message || 'Error joining meeting');
    } finally {
      setJoiningMeeting(null);
    }
  };

  const getStatusBadge = (meeting) => {
    if (meeting.status === 'live') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Now
        </span>
      );
    }

    if (meeting.status === 'scheduled') {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Scheduled
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
        Ended
      </span>
    );
  };

  const formatMeetingTime = (meeting) => {
    if (meeting.scheduledAt) {
      return format(new Date(meeting.scheduledAt), 'PPP p');
    }
    return 'No scheduled time';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
          <p className="text-gray-600 mt-1">
            View and join meetings scheduled by your supervisor
          </p>
        </div>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500">
              Your supervisor hasn't scheduled any meetings for your group yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${meeting.status === 'live'
                    ? 'border-green-500'
                    : meeting.status === 'ended'
                      ? 'border-gray-300'
                      : 'border-blue-500'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Meeting Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {meeting.title}
                      </h2>
                      {getStatusBadge(meeting)}
                    </div>

                    {meeting.description && (
                      <p className="text-gray-600 mb-4">{meeting.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatMeetingTime(meeting)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>Supervisor: {meeting.teacher?.name || 'N/A'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span>Group: {meeting.group?.groupName || 'N/A'}</span>
                      </div>

                      {meeting.leaderJoinedAt && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span>You joined at {format(new Date(meeting.leaderJoinedAt), 'p')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Join Button */}
                  <div className="flex items-center">
                    {meeting.status === 'live' ? (
                      <button
                        onClick={() => handleJoinMeeting(meeting)}
                        disabled={joiningMeeting === meeting._id}
                        className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${joiningMeeting === meeting._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {joiningMeeting === meeting._id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Joining...</span>
                          </>
                        ) : (
                          <>
                            <LogIn size={20} />
                            <span>Join Meeting</span>
                          </>
                        )}
                      </button>
                    ) : meeting.status === 'scheduled' ? (
                      <div className="text-center">
                        <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                          <Clock size={20} className="inline mr-2" />
                          Not Started
                        </div>
                        {meeting.scheduledAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Starts at {format(new Date(meeting.scheduledAt), 'p')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                        <Video size={20} className="inline mr-2" />
                        Meeting Ended
                      </div>
                    )}
                  </div>
                </div>

                {/* Meeting Link (for reference) */}
                {meeting.status === 'live' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Meeting link: <span className="font-mono text-gray-700">{meeting.shareLink}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add missing Users icon import
const Users = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default StudentMeetings;