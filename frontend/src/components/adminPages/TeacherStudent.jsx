import React, { useState, useEffect } from 'react';
import awkumImage from '../../public/awkumimg1.png';
import api from '../../api/Api.js'
const TeacherStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students from the backend
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Retrieve token from localStorage (or wherever you store auth token)
      const token = localStorage.getItem('token');
      const response = await api.get('/teacher/students');

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        throw new Error(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search term (name, email, stdId, department)
  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Helper function to get semester display
  const getSemesterText = (semester) => {
    const suffix = semester === 1 ? 'st' : semester === 2 ? 'nd' : semester === 3 ? 'rd' : 'th';
    return `${semester}${suffix} Semester`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background Image with Glass Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src={awkumImage}
          alt="Background"
          className="h-full w-full object-cover opacity-20 blur-sm"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Floating decorative elements for modern feel */}
      <div className="fixed top-20 left-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="fixed bottom-20 right-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section with Glassmorphism */}
        <div className="mb-12 rounded-2xl bg-white/10 p-6 shadow-2xl backdrop-blur-md transition-all duration-500 hover:shadow-purple-500/20">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  My Students
                </h1>
                <p className="mt-1 text-sm text-purple-200">
                  You have{' '}
                  <span className="font-semibold text-white">{students.length}</span> brilliant minds
                  under your guidance
                </p>
              </div>
            </div>

            {/* Refresh Button with Animation */}
            <button
              onClick={fetchStudents}
              className="group flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-lg"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform duration-500 group-hover:rotate-180 ${loading ? 'animate-spin' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Search Bar with Glass Effect */}
          <div className="mt-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-white placeholder-purple-200/70 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Loading State with Skeleton Cards */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 h-6 w-32 rounded-lg bg-white/10" />
                <div className="mb-2 h-4 w-48 rounded-lg bg-white/10" />
                <div className="mb-2 h-4 w-40 rounded-lg bg-white/10" />
                <div className="h-4 w-32 rounded-lg bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-3">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-200">{error}</p>
              <button
                onClick={fetchStudents}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-red-200 transition hover:bg-red-500/30"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Students Grid */}
        {!loading && !error && (
          <>
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-12 text-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-white/10 p-4">
                    <svg className="h-10 w-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">No students found</h3>
                  <p className="text-purple-200">
                    {searchTerm ? "Try a different search term" : "You don't have any students assigned yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student._id}
                    className="group relative transform rounded-2xl bg-white/10 p-6 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-white/20 hover:shadow-2xl hover:shadow-purple-500/20"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    {/* Gradient border effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />

                    <div className="relative">
                      {/* Header with avatar placeholder */}
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                          <span className="text-lg font-bold text-white">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {student.name}
                          </h3>
                          <p className="text-xs text-purple-200">Student</p>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-purple-100">
                          <svg className="h-4 w-4 flex-shrink-0 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-100">
                          <svg className="h-4 w-4 flex-shrink-0 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0h4" />
                          </svg>
                          <span>ID: {student.stdId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-100">
                          <svg className="h-4 w-4 flex-shrink-0 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{student.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-100">
                          <svg className="h-4 w-4 flex-shrink-0 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getSemesterText(student.semester)}</span>
                        </div>
                      </div>

                      {/* Decorative line */}
                      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-purple-300/60">
          <p>Empowering the next generation of innovators ✨</p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherStudent;