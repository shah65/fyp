import React, { useEffect, useState } from 'react';
import api from '../../api/Api';
import TeacherNavbar from './TeacherNavbar';
import awkumimg from '../../public/awkumimg1.png';

const TeacherApprovedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  const fetchApprovedProjects = async () => {
    try {
      const response = await api.get('/teacher/projects/approved');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching approved projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TeacherNavbar />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${awkumimg})` }} />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card-dark p-8 rounded-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen relative">
      <TeacherNavbar />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${awkumimg})` }} />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="glass-card-dark rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approved Projects ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No approved projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project._id} className="glass-card-light p-5 rounded-xl border border-green-500/20">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      <p className="text-white/80 text-sm mt-1">Student: {project.student?.name}</p>

                      {/* Group Members */}
                      {project.group && (
                        <div className="mt-3">
                          <p className="text-white/60 text-xs mb-1">Group Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.members?.map((member, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">
                                {member.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs px-2 py-1 bg-green-500/20 rounded-full text-green-400 border border-green-500/30">
                        Approved
                      </span>
                      {project.document && (
                        <a
                          href={project.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                        >
                          View Document →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherApprovedProjects;