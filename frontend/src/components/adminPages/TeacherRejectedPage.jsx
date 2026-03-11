import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import TeacherNavbar from './TeacherNavbar'
import awkumimg from '../../public/awkumimg1.png'

const TeacherRejectedPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getDate = async () => {
    try {
      setLoading(true)
      const res = await api.get('/teacher/projects/rejected')
      setProjects(res.data.projects || [])
    } catch (err) {
      setError('Unable to load rejected projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDate()
  }, [])

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
            <p className="text-white/90 mt-4">Loading rejected projects...</p>
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
          {/* Total Rejected Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Rejected Projects</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{projects.length}</p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Students Affected Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Students Affected</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {projects.reduce((acc, p) => acc + (p.members?.length || 1), 0)}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Need Revision Card */}
          <div className="glass-card-dark p-6 rounded-2xl border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Need Revision</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{projects.length}</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Projects Section */}
        <div className="glass-card-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Rejected Projects ({projects.length})
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {!error && projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/60">No rejected projects found</p>
              <p className="text-white/40 text-sm mt-2">All projects are on track!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!error && projects.map((project) => {
                const members = project.members || []
                const leadName = project.leaderName || project.student?.name || 'Team Lead'

                return (
                  <div
                    key={project._id}
                    className="glass-card-light p-5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-white">
                            {project.title || 'Untitled Project'}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-red-500/20 rounded-full text-red-400 border border-red-500/30">
                            Rejected
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-400 border border-purple-500/30">
                            {project.technology || 'Web Base'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          {/* Lead Info */}
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-purple-300 font-bold">
                                {leadName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{leadName}</p>
                              {project.student?.email && (
                                <p className="text-white/60 text-xs">{project.student.email}</p>
                              )}
                            </div>
                          </div>

                          {/* Team Members Info */}
                          {members.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <div>
                                <p className="text-white">{members.length} Team Members</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {members.slice(0, 3).map((member, idx) => (
                                    <span key={idx} className="text-white/60 text-xs">
                                      {member.name || 'Member'}{idx < Math.min(members.length, 3) - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                  {members.length > 3 && (
                                    <span className="text-white/40 text-xs">+{members.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description Preview if available */}
                        {project.description && (
                          <p className="text-white/60 text-sm mt-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Timestamp */}
                        <p className="text-white/40 text-xs mt-2">
                          Rejected {getTimeAgo(project.updatedAt || project.createdAt)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col gap-2 min-w-[120px] items-end">
                        <span className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-xs font-medium border border-red-500/30">
                          Needs Revision
                        </span>
                        <span className="text-xs text-white/40">
                          Feedback Available
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default TeacherRejectedPage