import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiSend, FiUser, FiMail, FiCalendar, FiBookOpen, FiCpu } from 'react-icons/fi';
import api from '../../api/Api';

const ProjectDetailsModal = ({ projectId, onClose, onStatusUpdate }) => {
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newFeedback, setNewFeedback] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState('');

  useEffect(() => {
    console.log('ProjectDetailsModal mounted with projectId:', projectId);

    // Validate projectId
    if (!projectId) {
      setError('Project ID is missing');
      setLoading(false);
      return;
    }

    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching details for projectId:', projectId);
      const response = await api.get(`/teacher/project/${projectId}/details`);
      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setProject(response.data.project);
        setMilestones(response.data.milestones || []);
        setFeedbacks(response.data.feedbacks || []);
        setSelectedStatus(response.data.project.status);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch project details');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setUpdating(true);
      const response = await api.patch(`/teacher/project/${projectId}/status`, {
        status: selectedStatus,
        remarks: statusRemarks
      });

      console.log('Status update response:', response.data);

      setProject(prev => ({ ...prev, status: selectedStatus }));
      setShowStatusConfirm(false);
      setStatusRemarks('');

      if (onStatusUpdate) {
        onStatusUpdate(selectedStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) return;

    try {
      const response = await api.post(`/teacher/project/${projectId}/feedback`, {
        comment: newFeedback
      });

      console.log('Feedback added:', response.data);

      setFeedbacks(prev => [response.data.feedback, ...prev]);
      setNewFeedback('');
    } catch (error) {
      console.error('Error adding feedback:', error);
      alert('Failed to add feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="w-5 h-5" />;
      case 'rejected': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiClock className="w-5 h-5" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative glass-card-dark rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white/60 mt-4">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative glass-card-dark rounded-2xl p-8 max-w-md">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // No project state
  if (!project) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative glass-card-dark rounded-2xl p-8 max-w-md">
          <p className="text-white/60">No project data available</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative glass-card-dark rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B1F3A]/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
                {project.title}
                <span className={`text-sm px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                </span>
              </h2>
              <p className="text-white/60 mt-1 flex items-center gap-2">
                <FiBookOpen className="w-4 h-4" />
                {project.technology || 'Not specified'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Info */}
            <div className="glass-card-light p-5 rounded-xl">
              <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
                <FiUser className="text-purple-400" />
                Student Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {project.student?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{project.student?.name || 'N/A'}</p>
                    <p className="text-white/60 text-sm">{project.student?.rollNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <FiMail className="w-4 h-4" />
                  {project.student?.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <FiCalendar className="w-4 h-4" />
                  Semester {project.student?.semester || 'N/A'}
                </div>
              </div>
            </div>

            {/* Add Supervisor Info */}
            {project.supervisor && (
              <div className="glass-card-light p-5 rounded-xl">
                <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
                  <FiUser className="text-purple-400" />
                  Supervisor Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {project.supervisor.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.supervisor.name || 'N/A'}</p>
                      <p className="text-white/60 text-sm">{project.supervisor.teacherId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <FiMail className="w-4 h-4" />
                    {project.supervisor.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <FiBookOpen className="w-4 h-4" />
                    {project.supervisor.department || 'N/A'}
                  </div>
                </div>
              </div>
            )}
            {/* Project Meta */}
            <div className="glass-card-light p-5 rounded-xl">
              <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
                <FiCpu className="text-purple-400" />
                Project Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm">Description</p>
                  <p className="text-white">{project.description || 'No description provided'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Submitted on</p>
                  <p className="text-white">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {project.document && (
                  <a
                    href={`http://localhost:4002/${project.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-all"
                  >
                    <FiDownload className="w-4 h-4" />
                    View Project Document
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Group Members */}
          {project.group && project.group.members?.length > 0 && (
            <div className="glass-card-light p-5 rounded-xl">
              <h3 className="text-white/80 font-semibold mb-4">Group Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.group.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{member.name || 'N/A'}</p>
                      <p className="text-white/60 text-xs">{member.rollNumber || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Section */}
          <div className="glass-card-light p-5 rounded-xl">
            <h3 className="text-white/80 font-semibold mb-4">Update Project Status</h3>

            {!showStatusConfirm ? (
              <div className="flex flex-wrap gap-3">
                {['pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowStatusConfirm(true);
                    }}
                    disabled={status === project.status}
                    className={`
                      px-4 py-2 rounded-lg font-medium capitalize transition-all
                      ${status === project.status
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : status === 'approved'
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                          : status === 'rejected'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                            : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300'
                      }
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Add remarks (optional)"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-purple-500 outline-none"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Confirm Update'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusConfirm(false);
                      setSelectedStatus(project.status);
                      setStatusRemarks('');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Project Status History */}
          {project.statusHistory && project.statusHistory.length > 0 && (
            <div className="glass-card-light p-5 rounded-xl">
              <h3 className="text-white/80 font-semibold mb-4">Status History</h3>
              <div className="space-y-2">
                {project.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(history.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {history.remarks && (
                        <p className="text-white/60 text-sm mt-1">{history.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="glass-card-light p-5 rounded-xl">
              <h3 className="text-white/80 font-semibold mb-4">Project Milestones</h3>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{milestone.title}</p>
                      <p className="text-white/60 text-xs">
                        Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {milestone.completed && (
                      <span className="text-xs text-green-400">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="glass-card-light p-5 rounded-xl">
            <h3 className="text-white/80 font-semibold mb-4">Feedback & Comments</h3>

            {/* Add Feedback */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                placeholder="Add your feedback..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-purple-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeedback()}
              />
              <button
                onClick={handleAddFeedback}
                className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-all"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback, index) => (
                  <div key={feedback._id || index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {feedback.author?.name || 'Teacher'}
                      </span>
                      <span className="text-xs text-white/40">
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{feedback.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/40 py-4">No feedback yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;