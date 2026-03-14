import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadProjectModal from './UploadProjectModel';
import ProjectDetailsModal from './ProjectDetailsModel';
import awkumImage from '../../public/awkumimg1.png';
import hil from '../../assets/hl.jpeg';
import { FiCamera } from 'react-icons/fi';
import Header from '../../components/pages/Header';
import AuthContext from '../context/AuthContext';
import Footer from './Footer';
import api from '../../api/Api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext); // use refreshUser instead of setUser
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.image || null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [approvalCode, setApprovalCode] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [userStage, setUserStage] = useState('no-project');
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    daysRemaining: 30
  });

  // Sync image preview with user.image from context
  useEffect(() => {
    if (user?.image) {
      setImagePreview(user.image);
    }
  }, [user]);

  // Check user's project stage
  useEffect(() => {
    if (user && user._id) {
      fetchUserProject();
    }
  }, [user]);

  // Poll for updates
  useEffect(() => {
    if (user && user._id) {
      const interval = setInterval(() => {
        fetchUserProject();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/student/project/${user._id}`, {
        withCredentials: true
      });

      if (res.data && res.data.success) {
        const proj = res.data.project;
        setProject(proj);

        if (proj.document) {
          setUserStage('uploaded');
        } else if (proj.status === 'approved' && proj.approvalCode) {
          setUserStage('approved');
          const codeShown = localStorage.getItem(`code_shown_${proj._id}`);
          if (!codeShown && proj.approvalCode) {
            setApprovalCode(proj.approvalCode);
            setShowCodeModal(true);
            localStorage.setItem(`code_shown_${proj._id}`, 'true');
            toast.success('Your project has been approved!');
          }
        } else if (proj.status === 'pending') {
          setUserStage('waiting');
        } else if (proj.status === 'rejected') {
          setUserStage('rejected');
        }

        if (proj.createdAt) {
          const created = new Date(proj.createdAt);
          const deadline = new Date(created);
          deadline.setDate(deadline.getDate() + 30);
          const today = new Date();
          const diffTime = deadline - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setStats(prev => ({ ...prev, daysRemaining: diffDays > 0 ? diffDays : 0 }));
        }
      } else {
        setProject(null);
        setUserStage('no-project');
      }
    } catch (err) {
      console.log('No project found');
      setProject(null);
      setUserStage('no-project');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setShowUpload(true);
  };

  const handleUploadSuccess = (uploadedProject) => {
    setProject(uploadedProject);
    setUserStage('uploaded');
    setShowUpload(false);
    if (uploadedProject._id) {
      localStorage.removeItem(`code_shown_${uploadedProject._id}`);
    }
  };

 

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Approval code copied to clipboard!');
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingImage(true);
      const res = await api.post('/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setImagePreview(res.data.imageUrl);
        // Refresh user data from backend to update context
        await refreshUser();
        toast.success('Profile image updated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const getStatusBadge = () => {
    if (!project) return null;
    switch (project.status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">Approved ✓</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30">Rejected ✗</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30 animate-pulse">Pending Review</span>;
      default:
        return null;
    }
  };

  const getStageMessage = () => {
    switch (userStage) {
      case 'no-project':
        return "You haven't submitted any project proposal yet.";
      case 'waiting':
        return "Your proposal is waiting for supervisor approval.";
      case 'approved':
        return "Your proposal is approved! Please upload your project document.";
      case 'uploaded':
        return "Your project has been successfully uploaded!";
      case 'rejected':
        return "Your proposal was rejected. Please submit a new one.";
      default:
        return "";
    }
  };

  return (
    <>
      <ToastContainer position="top-right" theme="dark" />

      {user && (
        <div className="fixed top-0 left-0 z-50 w-full h-16 flex items-center bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/30">
          <Header user={user} />
        </div>
      )}

      {/* Approval Code Modal */}
      {showCodeModal && approvalCode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCodeModal(false)}></div>
          <div className="relative bg-linear-to-br from-green-900 to-emerald-900 rounded-2xl p-8 max-w-md w-full animate-slide-up border border-green-500/30 shadow-2xl">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Project Approved! 🎉</h2>
              <p className="text-green-300 mb-6">Use this code to upload your project documents</p>
              <div className="bg-white/10 p-4 rounded-xl mb-4 border border-green-500/30">
                <p className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
                  {approvalCode}
                </p>
                <button
                  onClick={() => copyToClipboard(approvalCode)}
                  className="text-sm text-green-300 hover:text-green-200 flex items-center justify-center gap-1 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Code
                </button>
              </div>
              <p className="text-xs text-green-300/60">This code will be auto-filled in the upload form</p>
            </div>
          </div>
        </div>
      )}

      <main className="relative mt-0.5 w-screen min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url(${awkumImage})` }}
        ></div>

        <div className="absolute inset-0 bg-linear-to-br from-black/15 via-black/10 to-indigo-800/35">
          {user && (
            <div className="relative z-20 mt-20 ml-6 flex gap-6 items-start flex-wrap">
              {/* STUDENT DETAILS CARD */}
              <div className="w-125 bg-white/15 backdrop-blur-lg hover:backdrop-blur-[6px] border border-white/30 shadow-[0_20px_40px_rgba(247,247,247,0.35)] rounded-2xl flex items-center gap-8 px-10 py-8 transition-all duration-300 hover:bg-white/20 hover:-translate-y-3">
                <div className="relative">
                  <img
                    src={imagePreview || hil}
                    className="w-44 h-44 rounded-2xl border border-white object-cover"
                    alt="Student"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 rounded-full p-2 cursor-pointer transition shadow-lg"
                    title="Upload profile picture"
                  >
                    <FiCamera className="text-white" size={18} />
                  </label>
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                <div className="text-white space-y-1 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">Student Details</h1>
                    {getStatusBadge()}
                  </div>

                  <p><span className="text-indigo-300">Name:</span> {user.name}</p>
                  <p><span className="text-indigo-300">Email:</span> {user.email}</p>
                  <p><span className="text-indigo-300">Subject:</span> {user.subject}</p>
                  <p><span className="text-indigo-300">Department:</span> {user.department}</p>
                  <p><span className="text-indigo-300">Semester:</span> {user.semester}</p>
                  <p><span className="text-indigo-300">Student ID:</span> {user.stdId}</p>

                  {project && project.supervisor && (
                    <p className="mt-2 pt-2 border-t border-white/20">
                      <span className="text-indigo-300">Supervisor:</span> {project.supervisor.name || 'Assigned'}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-indigo-200 italic">
                    {getStageMessage()}
                  </p>
                </div>
              </div>

              {/* ACTION CARD */}
              <div className="w-90 bg-white/15 backdrop-blur-xl border border-white/30 hover:backdrop-blur-[6px] shadow-[0_20px_40px_rgba(231,227,227,0.35)] rounded-2xl flex flex-col items-center justify-center gap-6 px-6 py-8 transition-all duration-300 hover:bg-white/20 hover:-translate-y-2">
                <h2 className="text-xl font-bold text-white">Project Actions</h2>

                {userStage === 'no-project' && (
                  <button
                    onClick={handleUploadClick}
                    className="w-full py-3 rounded-xl bg-indigo-500/80 text-white font-semibold hover:bg-indigo-300 hover:border-2 hover:border-blue-400 hover:text-zinc-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Request Proposal Approval
                  </button>
                )}

                {userStage === 'waiting' && (
                  <div className="w-full text-center">
                    <div className="flex justify-center mb-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                    <p className="text-yellow-300 text-sm">Waiting for supervisor approval...</p>
                    <button
                      onClick={handleUploadClick}
                      className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
                    >
                      View Proposal Details
                    </button>
                  </div>
                )}

                {userStage === 'approved' && (
                  <>
                    <button
                      onClick={handleUploadClick}
                      className="w-full py-3 rounded-xl bg-green-500/80 text-white font-semibold hover:bg-green-400 hover:border-2 hover:border-green-200 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Project Document
                    </button>

                    <button
                      onClick={() => setShowProjectDetails(true)}
                      className="w-full py-3 rounded-xl bg-indigo-600/80 text-white font-semibold hover:bg-indigo-400 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Project Details
                    </button>
                  </>
                )}

                {userStage === 'uploaded' && (
                  <>
                    <button
                      onClick={() => setShowProjectDetails(true)}
                      className="w-full py-3 rounded-xl bg-indigo-600/80 text-white font-semibold hover:bg-indigo-400 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Project Details
                    </button>

                    <button
                      onClick={() => navigate('/resources')}
                      className="w-full py-3 rounded-xl bg-emerald-600/80 text-white font-semibold hover:bg-emerald-400 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Manage Resources
                    </button>
                  </>
                )}

                {userStage === 'rejected' && (
                  <button
                    onClick={handleUploadClick}
                    className="w-full py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-400 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Submit Revised Proposal
                  </button>
                )}

                {/* Stage Indicator */}
                <div className="w-full mt-2 pt-2 border-t border-white/20">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Request</span>
                    <span>Review</span>
                    <span>Upload</span>
                    <span>Complete</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${userStage === 'uploaded' ? 'w-full bg-green-500' :
                          userStage === 'approved' ? 'w-3/4 bg-green-500' :
                            userStage === 'waiting' ? 'w-1/2 bg-yellow-500' :
                              userStage === 'rejected' ? 'w-1/2 bg-red-500' : 'w-0'
                        }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-white">
          {user && (
            <div className="absolute bottom-0 w-full">
              <Footer />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showUpload && (
        <UploadProjectModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
          project={project}
          userStage={userStage}
          approvalCode={approvalCode}
        />
      )}

      {showProjectDetails && project && (
        <ProjectDetailsModal
          projectId={project._id}
          onClose={() => setShowProjectDetails(false)}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            fetchUserProject();
          }}
        />
      )}
    </>
  );
};

// Add animation styles
const styles = `
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Home;