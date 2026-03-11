import React, { useEffect, useState } from 'react';
import api from '../../api/Api';
import TeacherNavbar from './TeacherNavbar';
import awkumimg from '../../public/awkumimg1.png';
import ProjectDetailsModal from './ProjectDetailsModel';

const TeacherPendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPendingRequests();
    fetchStats();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/teacher/requests/pending');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        api.get('/teacher/projects/approved'),
        api.get('/teacher/projects/rejected')
      ]);

      setStats({
        pending: requests.length,
        approved: approvedRes.data.count || 0,
        rejected: rejectedRes.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleStatusUpdate = (updatedProject) => {
    // Remove from pending list if status changed
    if (updatedProject.status !== 'pending') {
      setRequests(requests.filter(r => r._id !== updatedProject._id));
      fetchStats(); // Refresh stats
    }
  };

  const getTimeAgo = (dateString) => {
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
            <p className="text-white/90 mt-4">Loading requests...</p>
          </div>
        </div>
      </>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Approved Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Approved Projects</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Rejected Projects</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        <div className="glass-card-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Pending Requests ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-white/60">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="glass-card-light p-5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-yellow-500/20 hover:border-yellow-500/40"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {request.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-400 border border-yellow-500/30">
                          {request.technology}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {/* Student Info */}
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            {request.student?.profileImage ? (
                              <img src={request.student.profileImage} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="text-purple-300 font-bold">
                                {request.student?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{request.student?.name}</p>
                            <p className="text-white/60 text-xs">{request.student?.email}</p>
                          </div>
                        </div>

                        {/* Group Info if available */}
                        {request.group && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div>
                              <p className="text-white">Group: {request.group.groupName}</p>
                              <p className="text-white/60 text-xs">
                                {request.group.members?.length || 0} members
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description Preview */}
                      <p className="text-white/60 text-sm mt-3 line-clamp-2">
                        {request.description || 'No description provided'}
                      </p>

                      {/* Timestamp */}
                      <p className="text-white/40 text-xs mt-2">
                        Requested {getTimeAgo(request.createdAt)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <button
                        onClick={() => handleViewProject(request)}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Review
                      </button>

                      <span className="text-xs text-center text-yellow-400/60">
                        Waiting for review
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <ProjectDetailsModal
          projectId={selectedProject._id}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Add styles
const styles = `
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
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default TeacherPendingRequests;