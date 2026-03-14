import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/pages/Header';
import AuthContext from '../context/AuthContext';
import api from '../../api/Api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awkumImage from '../../public/awkumimg1.png';

const Resource = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [githubRepo, setGithubRepo] = useState('');
  const [isEditingGithub, setIsEditingGithub] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      fetchProjectDetails();
    }
  }, [user]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/student/project/${user._id}`, {
        withCredentials: true
      });

      if (res.data && res.data.success) {
        setProject(res.data.project);
        if (res.data.project.githubRepo) {
          setGithubRepo(res.data.project.githubRepo);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      if (err.response?.status === 404) {
        toast.info('No project found. Please submit a project first.');
        navigate('/');
      } else {
        toast.error('Failed to load project details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = () => {
    if (project?.document) {
      window.open(project.document, '_blank');
    } else {
      toast.info('No document uploaded yet');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size should be less than 100MB (approx 5 minutes)');
      return;
    }

    setVideoFile(file);
    await uploadVideo(file);
  };

  const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('projectId', project._id);

    try {
      const uploadingToast = toast.loading('Uploading video...');

      const res = await api.post('/api/student/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (res.data.success) {
        toast.update(uploadingToast, {
          render: 'Video uploaded successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });

        setProject(prev => ({
          ...prev,
          projectVideo: res.data.videoUrl
        }));
        setShowVideoUpload(false);
        setVideoFile(null);
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      toast.error(err.response?.data?.message || 'Failed to upload video');
      setVideoFile(null);
    }
  };

  const handleGithubUpdate = async () => {
    if (!githubRepo) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/;
    if (!githubRegex.test(githubRepo)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    try {
      const res = await api.put(`/student/${project._id}/github`, {
        githubRepo: githubRepo
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        toast.success('GitHub repository URL saved successfully');
        setIsEditingGithub(false);
        setProject(prev => ({
          ...prev,
          githubRepo: githubRepo
        }));
      }
    } catch (err) {
      console.error('Error updating GitHub repo:', err);
      toast.error(err.response?.data?.message || 'Failed to save GitHub repository URL');
    }
  };

  const handleWatchVideo = () => {
    if (project?.projectVideo) {
      window.open(project.projectVideo, '_blank');
    } else {
      toast.info('No project video uploaded yet');
    }
  };

  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 z-50 w-full h-16 flex items-center bg-white/20 backdrop-blur-xl border-b border-white/30">
          <Header user={user} />
        </div>
        <div className="fixed inset-0 bg-linear-to-br from-black/90 via-indigo-900/20 to-black/90 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <div className="fixed top-0 left-0 z-50 w-full h-16 flex items-center bg-white/20 backdrop-blur-xl border-b border-white/30">
          <Header user={user} />
        </div>
        <div className="fixed inset-0 bg-linear-to-br from-black/90 via-indigo-900/20 to-black/90 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">No Project Found</h2>
            <p className="text-indigo-200 mb-6">You haven't submitted any project yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-500/80 text-white rounded-xl hover:bg-indigo-400 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" theme="dark" />

      {/* Fixed Header */}
      {user && (
        <div className="fixed top-0 left-0 z-50 w-full h-16 flex items-center bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <Header user={user} />
        </div>
      )}

      {/* Main Content - Fixed to allow scrolling */}
      <div className="relative w-full min-h-screen pt-16"> {/* Added pt-16 for header spacing */}
        {/* Background Image */}
        <div
          className="fixed inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${awkumImage})` }}
        ></div>

        {/* Color overlay */}
        <div className="fixed inset-0 bg-linear-to-br from-black/70 via-indigo-900/30 to-purple-900/40"></div>

        {/* Scrollable Content */}
        <div className="relative z-20 w-full min-h-screen overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Project Resources</h1>
              <p className="text-indigo-200">Manage your project documents and resources</p>
            </div>

            {/* Resources Grid - Fixed grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Project Document</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${project?.document ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                    {project?.document ? 'Uploaded' : 'Pending'}
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-4">
                  {project?.document ? 'Your project document is ready for viewing' : 'No document uploaded yet'}
                </p>

                {project?.document && (
                  <button
                    onClick={handleViewDocument}
                    className="w-full py-3 rounded-xl bg-indigo-500/80 text-white font-semibold hover:bg-indigo-400 transition flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Document
                  </button>
                )}
              </div>

              {/* GitHub Repository Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">GitHub Repository</h2>
                  </div>
                </div>

                <p className="text-white/60 text-sm mb-4">
                  Add your GitHub repository URL for teachers to review your code
                </p>

                {isEditingGithub ? (
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="https://github.com/username/repository-name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleGithubUpdate}
                        className="flex-1 py-2 bg-green-500/80 text-white rounded-lg hover:bg-green-400 transition"
                      >
                        Save URL
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingGithub(false);
                          setGithubRepo(project?.githubRepo || '');
                        }}
                        className="flex-1 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project?.githubRepo ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <a
                            href={project.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-300 hover:text-indigo-200 truncate flex-1"
                          >
                            {project.githubRepo}
                          </a>
                          <button
                            onClick={() => window.open(project.githubRepo, '_blank')}
                            className="ml-2 p-2 hover:bg-white/10 rounded-lg transition"
                            title="Open in new tab"
                          >
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => setIsEditingGithub(true)}
                          className="w-full py-2 rounded-lg bg-purple-500/80 text-white hover:bg-purple-400 transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Update URL
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditingGithub(true)}
                        className="w-full py-3 rounded-xl bg-purple-500/80 text-white font-semibold hover:bg-purple-400 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add GitHub Repository URL
                      </button>
                    )}
                  </div>
                )}

                <p className="mt-3 text-xs text-white/40 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Teachers can view your code at this URL. Make sure your repository is public or shared with your teacher.
                </p>
              </div>

              {/* Project Video Card - Full width on all screens */}
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Project Video (Max 5 minutes)</h2>
                  </div>
                  {project?.projectVideo && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                      Uploaded ✓
                    </span>
                  )}
                </div>

                <p className="text-white/60 text-sm mb-4">
                  Upload a final video presentation of your project (maximum 5 minutes duration)
                </p>

                {project?.projectVideo ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleWatchVideo}
                      className="w-full py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-400 transition flex items-center justify-center gap-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Video
                    </button>

                    <button
                      onClick={() => setShowVideoUpload(true)}
                      className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload New Video
                    </button>
                  </div>
                ) : (
                  <div>
                    {showVideoUpload ? (
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="block w-full py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-400 transition text-center cursor-pointer"
                        >
                          Choose Video File
                        </label>
                        <button
                          onClick={() => setShowVideoUpload(false)}
                          className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                          Cancel
                        </button>
                        <p className="text-xs text-white/40 text-center">
                          Supported formats: MP4, WebM, MOV (Max 100MB)
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowVideoUpload(true)}
                        className="w-full py-3 rounded-xl bg-red-500/80 text-white font-semibold hover:bg-red-400 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        Upload Project Video
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-indigo-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Keep your video under 5 minutes for best results
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>All resources are securely stored and can only be accessed by you and your supervisor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Resource;