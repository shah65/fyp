import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import awkumImage from '../../public/awkumimg1.png';
import { FiCheckCircle, FiClock, FiAlertCircle, FiUser, FiMail, FiBookOpen, FiCpu, FiDownload, FiCalendar } from 'react-icons/fi';

const ViewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true);
        console.log('Fetching project with ID:', id);

        const res = await api.get(`/student/project/${id}`, {
          withCredentials: true,
        });

        console.log('API Response:', res.data);

        if (res.data && res.data.success) {
          setProject(res.data.project);
          setFeedbacks(res.data.feedbacks || []);
        } else {
          setError('Failed to load project');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getProject();
    }
  }, [id]);

  const goBack = () => navigate('/');

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'rejected': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  // ✨ shine effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-white animate-pulse">
        Loading your project...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-lg text-red-400">
        <p className="mb-4">Error: {error}</p>
        <button
          onClick={goBack}
          className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 
            border border-white/20 text-white text-sm transition-all hover:scale-105"
        >
          ⬅ Go Back
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-lg text-red-400">
        <p className="mb-4">No project found 🚫</p>
        <button
          onClick={goBack}
          className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 
            border border-white/20 text-white text-sm transition-all hover:scale-105"
        >
          ⬅ Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-900 via-black to-purple-900">
      {/* 🌄 Background */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${awkumImage})` }}
      ></div>

      {/* 🌑 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-indigo-900/30 to-black/50 backdrop-blur-[2px] pointer-events-none"></div>

      {/* 🌟 Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="shine-card max-w-4xl w-full rounded-2xl p-6 md:p-8
            bg-white/10 backdrop-blur-3xl border border-white/20
            shadow-[0_25px_60px_rgba(0,0,0,0.7)]
            transition-all duration-500 hover:scale-[1.02] animate-fadeIn"
        >
          {/* Header with Status */}
          <div className="mb-6 p-4 rounded-xl
            bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-pink-600/15
            border border-indigo-400/30">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">
                  Project Name
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold
                  bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300
                  bg-clip-text text-transparent">
                  {project.title || 'Untitled Project'}
                </h1>
              </div>
              <span className={`text-sm px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(project.status || 'pending')}`}>
                {getStatusIcon(project.status || 'pending')}
                {(project.status || 'pending').charAt(0).toUpperCase() + (project.status || 'pending').slice(1)}
              </span>
            </div>
          </div>

          {/* Technology & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-white/5 border border-sky-300/20">
              <p className="text-[10px] uppercase tracking-wider text-sky-300 mb-2 flex items-center gap-1">
                <FiCpu className="w-3 h-3" /> Technology
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                bg-indigo-500/20 border border-indigo-300/40 text-indigo-200">
                🚀 {project.technology || 'Not specified'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-purple-300/20">
              <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" /> Submitted
              </p>
              <span className="text-white text-sm">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-gray-300/20">
              <p className="text-[10px] uppercase tracking-wider text-gray-300 mb-2">
                Description
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Student Info */}
          {project.student && (
            <div className="mb-4 p-4 rounded-xl
              bg-linear-to-br from-purple-500/10 to-pink-500/10
              border border-purple-400/30">
              <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-1">
                <FiUser className="w-3 h-3" /> Your Information
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {project.student.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.student.name || 'N/A'}</h3>
                  <p className="text-xs text-gray-300">{project.student.rollNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <FiMail className="w-4 h-4 text-purple-400" />
                {project.student.email || 'N/A'}
              </div>
              {project.student.semester && (
                <p className="text-xs text-gray-300 mt-1">Semester: {project.student.semester}</p>
              )}
            </div>
          )}

          {/* Supervisor Info */}
          {project.supervisor && (
            <div className="mb-4 p-4 rounded-xl
              bg-gradient-to-br from-blue-500/10 to-indigo-500/10
              border border-blue-400/30">
              <p className="text-[10px] uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-1">
                <FiUser className="w-3 h-3" /> Supervisor
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {project.supervisor.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.supervisor.name || 'N/A'}</h3>
                  <p className="text-xs text-gray-300">ID: {project.supervisor.teacherId || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <FiMail className="w-4 h-4 text-blue-400" />
                {project.supervisor.email || 'N/A'}
              </div>
              <span className="inline-block mt-2 text-[11px] px-3 py-1 rounded-full
                bg-blue-400/20 border border-blue-300/40 text-blue-200">
                {project.supervisor.department || 'Department'}
              </span>
            </div>
          )}

          {/* Status History */}
          {project.statusHistory && project.statusHistory.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-yellow-500/20">
              <p className="text-[10px] uppercase tracking-wider text-yellow-300 mb-3">
                Status History
              </p>
              <div className="space-y-2">
                {project.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {history.updatedAt ? new Date(history.updatedAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {history.remarks && (
                        <p className="text-gray-300 text-xs mt-1">{history.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedbacks */}
          {feedbacks && feedbacks.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-blue-500/20">
              <p className="text-[10px] uppercase tracking-wider text-blue-300 mb-3">
                Feedback ({feedbacks.length})
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {feedbacks.map((feedback, index) => (
                  <div key={feedback._id || index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-white">
                        {feedback.author?.name || 'Supervisor'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document & Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            {project.document && (
              <a
                href={`http://localhost:4002/${project.document}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 
                  text-black text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                View Document
              </a>
            )}
            <button
              onClick={goBack}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                border border-white/20 text-white text-sm transition-all hover:scale-105"
            >
              ⬅ Go Back
            </button>
          </div>
        </div>
      </div>

      {/* ✨ Effects CSS */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .shine-card {
          position: relative;
          overflow: hidden;
          animation: floatCard 6s ease-in-out infinite;
        }

        .shine-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            500px circle at var(--x) var(--y),
            rgba(255,255,255,0.15),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .shine-card:hover::before {
          opacity: 1;
        }

        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes gradientMove {
          0% { background-position: 0% }
          50% { background-position: 100% }
          100% { background-position: 0% }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ViewProject;