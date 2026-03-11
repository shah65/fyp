import { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, MessageCircle, Send, Clock, CheckCircle, XCircle, Eye, Download, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import api from '../../api/Api';
import { toast } from 'react-toastify';

const ProjectDetailsModal = ({ projectId, onClose, onStatusUpdate }) => {
  const [project, setProject] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'feedback', 'history'

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Try student endpoint first
      let response;
      try {
        response = await api.get(`/student/project/${projectId}`, {
          withCredentials: true
        });
      } catch (err) {
        // Fall back to teacher endpoint
        response = await api.get(`/teacher/projects/${projectId}`, {
          withCredentials: true
        });
      }

      console.log('Project details response:', response.data);

      if (response.data && response.data.success) {
        setProject(response.data.project);
        setFeedbacks(response.data.feedbacks || []);
      } else {
        toast.error('Failed to load project details');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error(error.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Please enter a comment');
      return;
    }

    // try {
    //   setSubmitting(true);

       
    //   const response = await api.post( `/student/project/${projectId}/feedback`, { withCredentials: true });

    //   console.log('Feedback response:', response.data);

    //   if (response.data.success) {
    //     setFeedbacks([response.data.feedback, ...feedbacks]);
    //     setComment('');
    //     toast.success('Feedback added successfully');
    //   }
    // } catch (error) {
    //   console.error('Error adding feedback:', error);
    //   toast.error(error.response?.data?.message || 'Failed to add feedback');
    // } finally {
    //   setSubmitting(false);
    // }
  };

  const handleViewDocument = (url, type) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(`No ${type} document available`);
    }
  };

  const handleDownloadDocument = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30 flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30 flex items-center">
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 bg-gray-500/20 text-gray-300 rounded-full text-xs font-medium border border-gray-500/30">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const getApprovalStatusIcon = () => {
    if (!project) return null;

    if (project.approvalVerified) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (project.status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-400" />;
    } else if (project.status === 'approved') {
      return <Clock className="w-5 h-5 text-yellow-400" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400"></div>
              <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-300" />
            </div>
            <p className="text-white text-lg font-light">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg mb-4">Project not found</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="bg-indigo-500/20 p-2 rounded-lg flex-shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                  {project.title || 'Untitled Project'}
                </h2>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {getStatusBadge(project.status)}
                  {project.approvalVerified && (
                    <span className="text-xs text-green-400 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition p-2 hover:bg-white/10 rounded-lg ml-2 flex-shrink-0"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'details'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative flex items-center ${activeTab === 'feedback'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Feedback ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'history'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Project Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Project Title</p>
                      <p className="text-white font-medium">{project.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technology?.split(',').map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-500/20 rounded-md text-xs text-indigo-300 border border-indigo-500/30">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 mb-1">Description</p>
                    <p className="text-white/90 text-sm bg-black/30 p-3 rounded-lg whitespace-pre-wrap">
                      {project.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Student</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {project.student?.name || 'Unknown'}
                          </p>
                          <p className="text-white/40 text-xs">{project.student?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Supervisor</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-green-300" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {project.supervisor?.name || 'Not assigned'}
                          </p>
                          <p className="text-white/40 text-xs">{project.supervisor?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Submitted</p>
                      <p className="text-white text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Last Updated</p>
                      <p className="text-white text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-indigo-400" />
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-indigo-300 mb-4">Documents</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proposal Document */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-white font-medium">Proposal</span>
                      </div>
                      {project.proposalDocumentUrl && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {project.proposalDocumentUrl ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewDocument(project.proposalDocumentUrl, 'proposal')}
                          className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition group"
                        >
                          <span className="text-sm text-indigo-300 group-hover:text-indigo-200 truncate">
                            View Proposal
                          </span>
                          <Eye className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-white/40">No proposal document uploaded</p>
                    )}
                  </div>

                  {/* Final Document */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-white font-medium">Final Project</span>
                      </div>
                      {project.document && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {project.document ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewDocument(project.document, 'final')}
                          className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition group"
                        >
                          <span className="text-sm text-green-300 group-hover:text-green-200 truncate">
                            View Document
                          </span>
                          <Eye className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-white/40">No final document uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Approval Code Section (if approved) */}
              {project.status === 'approved' && project.approvalCode && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-200 text-sm font-medium">Approval Code</p>
                      <p className="text-green-300 text-lg font-mono mt-1">{project.approvalCode}</p>
                      <p className="text-green-200/60 text-xs mt-1">
                        Use this code to upload your final project document
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason (if rejected) */}
              {project.status === 'rejected' && project.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-200 text-sm font-medium">Rejection Reason</p>
                      <p className="text-red-300 text-sm mt-1">{project.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              
              
              {/* Feedback List */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-indigo-300 mb-4">
                  Feedback History ({feedbacks.length})
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40">No feedback yet</p>
                      <p className="text-white/20 text-sm mt-1">Be the first to add feedback</p>
                    </div>
                  ) : (
                    feedbacks.map((fb, index) => (
                      <div key={fb._id || index} className="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {fb.author?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {fb.author?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-white/40">
                                {fb.author?.role || 'User'} • {formatDate(fb.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80 text-sm ml-10 whitespace-pre-wrap">{fb.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Status History
              </h3>

              <div className="space-y-4">
                {project.statusHistory && project.statusHistory.length > 0 ? (
                  project.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${history.status === 'approved' ? 'bg-green-400' :
                            history.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                        {index < project.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-white/10 absolute top-4"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium capitalize">{history.status}</p>
                          <p className="text-xs text-white/40">{formatDate(history.updatedAt)}</p>
                        </div>
                        {history.remarks && (
                          <p className="text-sm text-white/60 mt-1">{history.remarks}</p>
                        )}
                        {history.updatedBy && (
                          <p className="text-xs text-white/40 mt-1">
                            By: {history.updatedBy?.name || 'System'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/40">No status history available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
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

export default ProjectDetailsModal;