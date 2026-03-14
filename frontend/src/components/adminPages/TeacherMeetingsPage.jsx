import React, { useState, useEffect } from 'react';
import api from '../../api/Api';
import { format } from 'date-fns';
import { Calendar, Video, Clock, Users, Edit, Trash2, Play, Square, Plus, Link, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import TeacherNavbar from './TeacherNavbar';
import awkumimg from '../../public/awkumimg1.png';

const TeacherMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    groupId: ''
  });

  useEffect(() => {
    fetchMeetings();
    fetchGroups();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/teacher/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(response.data.meetings || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Unable to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/teacher/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/teacher/meetings', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', scheduledAt: '', groupId: '' });
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/api/teacher/meetings/${meetingId}/start`, {}, );
      fetchMeetings();
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/api/teacher/meetings/${meetingId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/teacher/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/teacher/meetings/${selectedMeeting._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setSelectedMeeting(null);
      setFormData({ title: '', description: '', scheduledAt: '', groupId: '' });
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const copyToClipboard = (text, meetingId) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(meetingId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock
      },
      live: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: Video
      },
      ended: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: CheckCircle
      }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${config.color}`}>
        <Icon size={12} />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled'}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <TeacherNavbar />
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
          <div className="glass-card-dark p-8 rounded-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-white/90 mt-4">Loading meetings...</p>
          </div>
        </div>
      </>
    );
  }

  // Calculate stats
  const totalMeetings = meetings.length;
  const liveMeetings = meetings.filter(m => m.status === 'live').length;
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;
  const endedMeetings = meetings.filter(m => m.status === 'ended').length;

  return (
    <div className="min-h-screen relative">
      <TeacherNavbar />

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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Meetings Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Meetings</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{totalMeetings}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Video className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Live Now Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-green-500/30 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Live Now</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{liveMeetings}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <div className="relative">
                  <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduled Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Scheduled</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{scheduledMeetings}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Completed</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{endedMeetings}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Meetings Header */}
        <div className="glass-card-dark rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Meeting Management</h2>
                <p className="text-white/60 text-sm mt-1">Schedule and manage your virtual meetings</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-purple-500/20"
            >
              <Plus size={20} />
              Schedule Meeting
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card-dark border border-red-500/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="glass-card-dark rounded-2xl p-6">
          {!error && meetings.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-purple-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-white/80 text-lg">No meetings scheduled yet</p>
              <p className="text-white/40 text-sm mt-2">Click the button above to schedule your first meeting</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!error && meetings.map((meeting) => {
                const isLive = meeting.status === 'live';
                const isScheduled = meeting.status === 'scheduled';
                const isEnded = meeting.status === 'ended';
                const members = meeting.group?.members || [];

                return (
                  <div
                    key={meeting._id}
                    className={`glass-card-light p-6 rounded-xl hover:bg-white/10 transition-all duration-300 border ${isLive ? 'border-green-500/40 hover:border-green-500/60' :
                        isScheduled ? 'border-yellow-500/40 hover:border-yellow-500/60' :
                          'border-gray-500/20 hover:border-gray-500/40'
                      }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left Section - Meeting Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-xl font-semibold text-white">
                            {meeting.title}
                          </h3>
                          {getStatusBadge(meeting.status)}
                        </div>

                        {meeting.description && (
                          <p className="text-white/70 mb-4 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Group Info */}
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                              <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white/60 text-xs">Group</p>
                              <p className="text-white text-sm font-medium">
                                {meeting.group?.groupName || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Date/Time */}
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white/60 text-xs">Scheduled</p>
                              <p className="text-white text-sm">
                                {meeting.scheduledAt
                                  ? format(new Date(meeting.scheduledAt), 'MMM dd, yyyy • hh:mm a')
                                  : 'No scheduled time'}
                              </p>
                            </div>
                          </div>

                          {/* Start Time if meeting started */}
                          {meeting.startedAt && (
                            <div className="flex items-center gap-3">
                              <div className="bg-green-500/20 p-2 rounded-lg">
                                <Clock className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">Started</p>
                                <p className="text-white text-sm">
                                  {format(new Date(meeting.startedAt), 'hh:mm a')}
                                  {getTimeAgo(meeting.startedAt) && (
                                    <span className="text-white/40 text-xs ml-2">
                                      ({getTimeAgo(meeting.startedAt)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Team Members */}
                          {members.length > 0 && (
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-500/20 p-2 rounded-lg">
                                <Users className="w-4 h-4 text-orange-400" />
                              </div>
                              <div>
                                <p className="text-white/60 text-xs">Team Members</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-white text-sm">
                                    {members.length} members
                                  </span>
                                  <div className="flex -space-x-2 ml-2">
                                    {members.slice(0, 3).map((member, idx) => (
                                      <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white/10 flex items-center justify-center"
                                      >
                                        <span className="text-white text-xs font-bold">
                                          {member.name?.charAt(0) || 'M'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Meeting Link if available */}
                        {meeting.shareLink && (
                          <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                            <Link className="w-4 h-4 text-purple-400" />
                            <p className="text-white/60 text-sm flex-1 truncate">
                              {meeting.shareLink}
                            </p>
                            <button
                              onClick={() => copyToClipboard(meeting.shareLink, meeting._id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                            >
                              {copiedLink === meeting._id ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white/60" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 items-center lg:items-end">
                        <div className="flex gap-2">
                          {isScheduled && (
                            <>
                              <button
                                onClick={() => handleStartMeeting(meeting._id)}
                                className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-400 transition-all duration-200 group"
                                title="Start Meeting"
                              >
                                <Play size={20} className="group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setFormData({
                                    title: meeting.title,
                                    description: meeting.description || '',
                                    scheduledAt: meeting.scheduledAt?.slice(0, 16) || '',
                                    groupId: meeting.group?._id || ''
                                  });
                                  setShowEditModal(true);
                                }}
                                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-400 transition-all duration-200 group"
                                title="Edit Meeting"
                              >
                                <Edit size={20} className="group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          )}

                          {isLive && (
                            <button
                              onClick={() => handleEndMeeting(meeting._id)}
                              className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition-all duration-200 group"
                              title="End Meeting"
                            >
                              <Square size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteMeeting(meeting._id)}
                            className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition-all duration-200 group"
                            title="Delete Meeting"
                          >
                            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                          </button>

                          {meeting.shareLink && (
                            <a
                              href={meeting.shareLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-400 transition-all duration-200 group"
                              title="Join Meeting"
                            >
                              <Video size={20} className="group-hover:scale-110 transition-transform" />
                            </a>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-white/30 text-xs">
                          {meeting.updatedAt && getTimeAgo(meeting.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-dark rounded-2xl max-w-md w-full p-6 border border-purple-500/30 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Plus className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Schedule New Meeting</h2>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
                    placeholder="Enter meeting description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Select Group *
                  </label>
                  <select
                    required
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  >
                    <option value="" className="bg-gray-800">Choose a group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id} className="bg-gray-800">
                        {group.groupName} {group.leader?.name ? `(Lead: ${group.leader.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
                >
                  Create Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/5 text-white py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-dark rounded-2xl max-w-md w-full p-6 border border-purple-500/30 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Edit className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Edit Meeting</h2>
            </div>

            <form onSubmit={handleEditMeeting}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Select Group *
                  </label>
                  <select
                    required
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    <option value="" className="bg-gray-800">Choose a group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id} className="bg-gray-800">
                        {group.groupName} {group.leader?.name ? `(Lead: ${group.leader.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Update Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMeeting(null);
                    setFormData({ title: '', description: '', scheduledAt: '', groupId: '' });
                  }}
                  className="flex-1 bg-white/5 text-white py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TeacherMeetings;