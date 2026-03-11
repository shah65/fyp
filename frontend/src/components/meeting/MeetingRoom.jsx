// frontend/src/components/MeetingRoom.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Video,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  User,
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Loader,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellRing,
  RefreshCw
} from 'lucide-react';
import awkumimg from '../../public/awkumimg1.png';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMeetingDetails();

    // Connect to WebSocket
    const newSocket = io('http://localhost:4002', {
      query: { roomId, token: localStorage.getItem('token') }
    });
    setSocket(newSocket);

    // Listen for meeting updates
    newSocket.on('meeting-updated', (updatedMeeting) => {
      console.log('Meeting updated:', updatedMeeting);
      setMeeting(updatedMeeting);

      // Show notification when meeting starts
      if (updatedMeeting.status === 'live' && meeting?.status === 'scheduled') {
        setNotification({
          type: 'success',
          message: '🎉 Meeting has started! You can join now.',
          icon: BellRing
        });

        // Auto-hide notification after 10 seconds
        setTimeout(() => setNotification(null), 10000);

        // Play notification sound
        playNotificationSound();
      }

      // Show notification when meeting ends
      if (updatedMeeting.status === 'ended' && meeting?.status === 'live') {
        setNotification({
          type: 'info',
          message: 'Meeting has ended.',
          icon: XCircle
        });
        setTimeout(() => setNotification(null), 5000);
      }
    });

    // Listen for errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (meeting?.status === 'scheduled' && meeting.scheduledAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const scheduled = new Date(meeting.scheduledAt);
        const diff = scheduled - now;

        if (diff <= 0) {
          setCountdown('Starting soon...');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [meeting]);

  // Auto-refresh every 30 seconds if no WebSocket
  useEffect(() => {
    if (!socket && autoRefresh) {
      const interval = setInterval(() => {
        if (meeting?.status === 'scheduled') {
          refreshMeetingStatus();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [socket, autoRefresh, meeting]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4002/api/meetings/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeeting(response.data.meeting);
      setError(null);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setError(error.response?.data?.message || 'Failed to load meeting');
    } finally {
      setLoading(false);
    }
  };

  const refreshMeetingStatus = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4002/api/meetings/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const oldStatus = meeting?.status;
      const newStatus = response.data.meeting.status;

      setMeeting(response.data.meeting);

      // Show notification if status changed
      if (oldStatus !== newStatus) {
        if (newStatus === 'live') {
          setNotification({
            type: 'success',
            message: '🎉 Meeting has started! You can join now.',
            icon: BellRing
          });
          setTimeout(() => setNotification(null), 10000);
        } else if (newStatus === 'ended') {
          setNotification({
            type: 'info',
            message: 'Meeting has ended.',
            icon: XCircle
          });
          setTimeout(() => setNotification(null), 5000);
        }
      }
    } catch (error) {
      console.error('Error refreshing meeting:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4002/api/meetings/join/${roomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Open Jitsi in a new tab
      window.open(`https://meet.jit.si/${roomId}`, '_blank');
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert(error.response?.data?.message || 'Failed to join meeting');
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = (status) => {
    const configs = {
      live: {
        color: 'from-green-500 to-emerald-600',
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        icon: Video,
        label: 'Live Now',
        animation: 'animate-pulse',
        message: 'Meeting is live! Join now.'
      },
      scheduled: {
        color: 'from-yellow-500 to-orange-600',
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        icon: Clock,
        label: 'Scheduled',
        animation: '',
        message: 'Waiting for meeting to start...'
      },
      ended: {
        color: 'from-gray-500 to-gray-600',
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        icon: XCircle,
        label: 'Ended',
        animation: '',
        message: 'This meeting has ended'
      }
    };
    return configs[status] || configs.scheduled;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${awkumimg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 rounded-2xl text-center">
            <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/90 text-lg">Loading meeting room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${awkumimg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="glass-card-dark rounded-2xl p-8 max-w-md w-full text-center border border-red-500/30">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-white/60 mb-8">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(meeting?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${awkumimg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`glass-card-dark rounded-xl px-6 py-4 border ${notification.type === 'success' ? 'border-green-500/30' : 'border-blue-500/30'
            } flex items-center gap-3 min-w-[300px]`}>
            <notification.icon className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-400' : 'text-blue-400'
              }`} />
            <p className="text-white flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="text-white/40 hover:text-white/60"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 z-20 glass-card-dark p-3 rounded-xl text-white/80 hover:text-white hover:scale-105 transition-all duration-300 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Manual Refresh Button (for non-WebSocket mode) */}
      {!socket && (
        <button
          onClick={refreshMeetingStatus}
          disabled={refreshing}
          className="fixed top-24 right-6 z-20 glass-card-dark p-3 rounded-xl text-white/80 hover:text-white transition-all duration-300 group"
        >
          <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform`} />
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Meeting Header Card */}
          <div className={`glass-card-dark rounded-2xl p-8 mb-6 border ${statusConfig.border} animate-fadeIn`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${statusConfig.text} ${statusConfig.animation}`} />
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    {statusConfig.label}
                  </span>

                  {/* Status message for students */}
                  {meeting.status === 'scheduled' && (
                    <span className="text-white/50 text-sm flex items-center gap-2">
                      <Clock size={14} />
                      {countdown ? `Starts in ${countdown}` : 'Waiting for teacher to start'}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {meeting.title}
                </h1>

                {meeting.description && (
                  <p className="text-white/70 text-lg mb-6 leading-relaxed">
                    {meeting.description}
                  </p>
                )}

                {/* Room ID with copy */}
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 max-w-md">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Copy className="w-4 h-4 text-purple-400" />
                  </div>
                  <code className="text-white/80 font-mono text-sm flex-1 truncate">
                    {roomId}
                  </code>
                  <button
                    onClick={copyRoomId}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Countdown Timer for Scheduled Meetings */}
              {meeting.status === 'scheduled' && countdown && (
                <div className="glass-card-light p-6 rounded-2xl text-center min-w-[200px]">
                  <p className="text-white/60 text-sm mb-2 flex items-center justify-center gap-2">
                    <Clock size={14} />
                    Meeting starts in
                  </p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {countdown}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    You'll be notified when it starts
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Details Card */}
            <div className="lg:col-span-2 glass-card-dark rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Meeting Details
              </h3>

              <div className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-start gap-4 p-4 glass-card-light rounded-xl">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm">Supervisor</p>
                    <p className="text-white font-medium text-lg">{meeting.teacher?.name}</p>
                    <p className="text-white/40 text-sm mt-1">{meeting.teacher?.email}</p>
                  </div>
                </div>

                {/* Group Info */}
                <div className="flex items-start gap-4 p-4 glass-card-light rounded-xl">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm">Group</p>
                    <p className="text-white font-medium text-lg">{meeting.group?.groupName}</p>
                    {meeting.group?.members && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {meeting.group.members.slice(0, 3).map((member, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white/20 flex items-center justify-center"
                            >
                              <span className="text-white text-xs font-bold">
                                {member.name?.charAt(0) || 'M'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <span className="text-white/40 text-sm">
                          {meeting.group.members.length} members
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 glass-card-light rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <p className="text-white/60 text-sm">Scheduled Date</p>
                    </div>
                    <p className="text-white font-medium">
                      {meeting.scheduledAt
                        ? new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'Not scheduled'}
                    </p>
                  </div>

                  <div className="p-4 glass-card-light rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <p className="text-white/60 text-sm">Scheduled Time</p>
                    </div>
                    <p className="text-white font-medium">
                      {meeting.scheduledAt
                        ? new Date(meeting.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>

                {/* Meeting Timeline */}
                {(meeting.startedAt || meeting.endedAt) && (
                  <div className="p-4 glass-card-light rounded-xl">
                    <h4 className="text-white/80 text-sm font-medium mb-3">Meeting Timeline</h4>
                    <div className="space-y-2">
                      {meeting.startedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Started</span>
                          <span className="text-white">
                            {new Date(meeting.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {meeting.endedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Ended</span>
                          <span className="text-white">
                            {new Date(meeting.endedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="glass-card-dark rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Join Meeting
              </h3>

              {meeting.status === 'live' ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-green-400 font-medium">Meeting is Live!</p>
                    </div>
                    <p className="text-white/60 text-sm">Click below to join the meeting</p>
                  </div>

                  <button
                    onClick={handleJoinMeeting}
                    className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 group"
                  >
                    <Video size={24} className="group-hover:scale-110 transition-transform" />
                    Join Meeting Now
                  </button>

                  <p className="text-white/40 text-xs text-center">
                    You'll be redirected to Jitsi Meet
                  </p>
                </div>
              ) : meeting.status === 'scheduled' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                    <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-yellow-400 font-medium mb-2">Meeting Not Started</p>
                    <p className="text-white/60 text-sm mb-4">
                      {countdown ? `Starts in ${countdown}` : 'Waiting for teacher to start the meeting'}
                    </p>

                    {/* Progress bar for scheduled time */}
                    {meeting.scheduledAt && (
                      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, (new Date() - new Date(meeting.scheduledAt)) / (1000 * 60 * 60) * 100)}%`
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                      <Bell className="w-4 h-4" />
                      <span>You'll be notified when it starts</span>
                    </div>
                  </div>

                  {/* Auto-refresh toggle */}
                  {!socket && (
                    <div className="flex items-center justify-between p-3 glass-card-light rounded-xl">
                      <span className="text-white/60 text-sm">Auto-refresh</span>
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${autoRefresh ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoRefresh ? 'translate-x-6' : ''
                            }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6 text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium mb-2">Meeting Ended</p>
                    <p className="text-white/60 text-sm">
                      This meeting has already ended
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(-1)}
                    className="w-full py-4 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-white/60 hover:text-white transition-colors"
                >
                  <span className="text-sm">Meeting Information</span>
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {showDetails && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-white/40">
                      <span className="text-white/60">Room ID:</span> {roomId}
                    </p>
                    <p className="text-white/40">
                      <span className="text-white/60">Platform:</span> Jitsi Meet
                    </p>
                    <p className="text-white/40">
                      <span className="text-white/60">Security:</span> End-to-end encrypted
                    </p>
                    {socket && (
                      <p className="text-green-400/60 text-xs flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Real-time updates active
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="glass-card-dark rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Meeting Tips
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Video className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Test Your Camera</p>
                  <p className="text-white/40 text-sm">Ensure your camera is working properly</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Bell className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Stay Notified</p>
                  <p className="text-white/40 text-sm">Keep this page open for instant updates</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Stable Internet</p>
                  <p className="text-white/40 text-sm">Use a wired connection if possible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .glass-card-dark {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }
        
        .glass-card-light {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MeetingRoom;