import React, { useEffect, useState, useRef } from 'react';
import ProjectDetailsModal from './ProjectDetailsModel';
import api from '../../api/Api';
import TeacherNavbar from './TeacherNavbar';
import awkumimg from '../../public/awkumimg1.png';
import toast from 'react-hot-toast'; // NEW: for notifications
import io from 'socket.io-client';


const TeacherHome = () => {
  const [stats, setStats] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const socketRef = useRef(null);


  // NEW: state for Create Student modal
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    stdId: '',
    subject: '',
    department: '',
    semester: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, teacherRes] = await Promise.all([
          api.get('/teacher/dashboard'),
          api.get('/teacher/profile')
        ]);
        setStats(statsRes.data.stats);
        setTeacher(teacherRes.data.teacher);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Only connect if teacher is loaded (meaning user is authenticated)
    if (teacher && !socketRef.current) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, cannot connect socket');
        return;
      }
      const socket = io('http://localhost:4002', {
        auth: { token },
        transports: ['websocket'],
      });
      socket.on('connect', () => {
        console.log('Socket connected');
      });
      socket.on('student-created', (data) => {
        console.log("EVENT RECIEVED!",data);
        toast.success(`🎉 New student created: ${data.name}`);
     
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      socketRef.current = socket;
    }
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [teacher]); // Re-run when teacher data is loaded
  // Handlers for Create Student form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/teacher/create-student', formData);
      // Emit socket event for new student creation
      toast.success('Student account created successfully! Email sent.');
      setShowCreateStudentModal(false);
      setFormData({ name: '', email: '', stdId: '', subject: '', department: '', semester: '' });
      // Optionally refresh stats – not necessary for now
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create student';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewProject = (project) => {
    console.log('Viewing project:', project);
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const uploadFormData = new FormData();
    uploadFormData.append('profileImage', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/teacher/profile/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTeacher(prev => ({ ...prev, profileImage: res.data.imageUrl }));
      toast.success('Profile image updated');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const displayedProjects = showAllProjects
    ? stats?.recentProjects
    : stats?.recentProjects?.slice(0, 2);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
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
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: 'scale(1)'
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 rounded-2xl animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 bg-purple-500/20 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-white/90 mt-4 text-lg font-light tracking-wide animate-pulse">
              Loading your dashboard
              <span className="inline-flex ml-1">
                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                <span className="animate-bounce">.</span>
              </span>
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!stats || !teacher) {
    return (
      <>
        <TeacherNavbar />
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${awkumimg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 rounded-2xl text-center animate-slide-up">
            <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-white/90 text-xl font-light">No dashboard data available</p>
            <p className="text-white/60 mt-2">Please check back later</p>
          </div>
        </div>
      </>
    );
  }

  const statCards = [
    {
      key: 'totalGroups',
      label: 'Total Groups',
      icon: 'groups',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-300'
    },
    {
      key: 'totalStudents',
      label: 'Total Students',
      icon: 'students',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-300'
    },
    {
      key: 'totalProjects',
      label: 'Total Projects',
      icon: 'projects',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-300'
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'groups':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        );
      case 'students':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        );
      case 'projects':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <TeacherNavbar />

      {/* Background Image - Fixed and Full */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${awkumimg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative glass-card-dark rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Complete Profile</h2>

            <div className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden">
                      {teacher.profileImage ? (
                        <img
                          src={teacher.profileImage}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-900 to-pink-900">
                          <span className="text-4xl text-white font-bold">
                            {teacher.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors group-hover:scale-110">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                </div>
                <p className="text-white/60 text-sm mt-2">Click the camera icon to upload photo</p>
              </div>

              {/* Teacher Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={teacher.name || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Email</label>
                  <input
                    type="email"
                    value={teacher.email || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Teacher ID</label>
                  <input
                    type="text"
                    value={teacher.teacherId || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Teacher ID"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Subject</label>
                  <input
                    type="text"
                    value={teacher.subject || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Department</label>
                  <input
                    type="text"
                    value={teacher.department || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Qualification</label>
                  <input
                    type="text"
                    value={teacher.qualification || ''}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Qualification"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm block mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={teacher.experience || 0}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Experience"
                  />
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Create Student Modal */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateStudentModal(false)}></div>
          <div className="relative glass-card-dark rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <button
              onClick={() => setShowCreateStudentModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create Student Account</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="text-white/80 text-sm block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="Student full name"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-1">Student ID *</label>
                <input
                  type="text"
                  name="stdId"
                  required
                  value={formData.stdId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="e.g., CS2024001"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-1">Department *</label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="e.g., CS"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-1">Semester *</label>
                <input
                  type="text"
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="e.g., 3"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Teacher Profile Header */}
        <div className="glass-card-dark p-6 rounded-2xl mb-8 animate-slide-down">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden">
                  {teacher.profileImage ? (
                    <img
                      src={teacher.profileImage}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-900 to-pink-900">
                      <span className="text-2xl md:text-3xl text-white font-bold">
                        {teacher.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors group-hover:scale-110"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {teacher.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300 border border-purple-500/30">
                      {teacher.subject}
                    </span>
                    <span className="text-white/60 text-sm">
                      {teacher.department} • {teacher.experience} years exp.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-light text-white/60 animate-pulse flex items-center gap-2">
                    Live
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
                  </span>
                  {/* NEW: Create Student Button */}
                  <button
                    onClick={() => setShowCreateStudentModal(true)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Student
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="flex items-center gap-2 text-sm text-white/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {teacher.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-white/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  ID: {teacher.teacherId}
                </span>
                <span className="flex items-center gap-2 text-sm text-white/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {teacher.qualification}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={card.key}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`
                glass-card-dark p-6 rounded-2xl border ${card.borderColor}
                transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                hover:shadow-2xl hover:shadow-purple-500/20
              `}>
                <div className={`absolute inset-0 bg-linear-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/70 text-sm font-light tracking-wide">
                        {card.label}
                      </p>
                      <p className="text-4xl font-bold text-white mt-2 group-hover:scale-110 transition-transform duration-300">
                        {stats[card.key]}
                      </p>
                    </div>
                    <div className={`${card.iconBg} p-3 rounded-xl backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300`}>
                      <svg className={`w-8 h-8 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getIcon(card.icon)}
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
                    <span className="inline-block h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                      <span className={`block h-full w-3/4 bg-linear-to-r ${card.color} rounded-full`}></span>
                    </span>
                    <span>Updated just now</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects Section */}
        <div className="glass-card-dark rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {showAllProjects ? 'All Projects' : 'Recent Projects'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">
                {stats.recentProjects?.length || 0} total projects
              </span>
              {stats.recentProjects?.length > 2 && (
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-all flex items-center gap-2 group"
                >
                  {showAllProjects ? 'Show Less' : 'View All'}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showAllProjects ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {!stats.recentProjects || stats.recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <p className="text-white/60">No projects available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayedProjects.map((proj, index) => (
                <div
                  key={proj._id}
                  className="group relative glass-card-light p-5 rounded-xl hover:bg-white/10 transition-all duration-300 animate-fade-in border border-white/5 hover:border-purple-500/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {proj.title}
                          </h2>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(proj.status)}`}>
                            {proj.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-white/60">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {proj.student?.name || 'Unknown Student'}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-white/60">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {proj.student?.email || 'No email'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300 border border-purple-500/30">
                          {proj.technology || 'Not specified'}
                        </span>
                        <button
                          onClick={() => {
                            console.log('Project clicked:', proj);
                            if (proj && proj._id) {
                              handleViewProject(proj);
                            } else {
                              console.error('Project ID is missing:', proj);
                            }
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-transform duration-200 group-hover:translate-x-1 transform transition-transform"
                        >
                          <svg className="w-5 h-5 text-white/40 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-linear-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-3/4 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats.recentProjects?.length > 2 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="inline-flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors"
              >
                <span>{showAllProjects ? 'Show less' : `View all ${stats.recentProjects.length} projects`}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${showAllProjects ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
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
          onStatusUpdate={(newStatus) => {
            console.log('Status updated to:', newStatus);
          }}
        />
      )}
    </div>
  );
};

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
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-down {
    from { 
      opacity: 0;
      transform: translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
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
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-slide-down {
    animation: slide-down 0.6s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default TeacherHome;