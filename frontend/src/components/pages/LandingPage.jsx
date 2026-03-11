import React from 'react';
import { useNavigate } from 'react-router-dom';
import awkumImage from '../../public/awkumimg1.png';
import tchrlogo from '../../public/tchlogo.png';
import stdlgo from '../../public/stdlogo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url(${awkumImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Animated overlay for better glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40 animate-gradient" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">

          {/* Top row - Teacher and Student cards */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full">

            {/* Student Card */}
            <div
              onClick={() => handleNavigation('/login')}
              className="group relative w-full max-w-xs h-64 rounded-2xl backdrop-blur-md bg-white/10 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_15px_45px_0_rgba(255,255,255,0.3)] flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:bg-white/20 hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden"
            >
              {/* Animated border effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              {/* Icon container with animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500" />
                <img
                  src={stdlgo}
                  alt="Student"
                  className="relative w-20 h-20 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white transition-all duration-500 group-hover:text-white group-hover:tracking-wide">
                Are you a Student?
              </h2>

              <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                Access your courses & materials
              </p>
            </div>

            {/* Teacher Card */}
            <div
              onClick={() => handleNavigation('/teacherlogin')}
              className="group relative w-full max-w-xs h-64 rounded-2xl backdrop-blur-md bg-white/10 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_15px_45px_0_rgba(255,255,255,0.3)] flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:bg-white/20 hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden"
            >
              {/* Animated border effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500" />
                <img
                  src={tchrlogo}
                  alt="Teacher"
                  className="relative w-20 h-20 object-contain transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white transition-all duration-500 group-hover:text-white group-hover:tracking-wide">
                Are you a Teacher?
              </h2>

              <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                Manage classes & assignments
              </p>
            </div>
          </div>

          {/* Bottom row - Guest card centered */}
          <div className="flex justify-center w-full">
            <div
              onClick={() => handleNavigation('/guest')}
              className="group relative w-full max-w-xs h-64 rounded-2xl backdrop-blur-md bg-white/10 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_15px_45px_0_rgba(255,255,255,0.3)] flex flex-col items-center justify-center gap-4 transition-all duration-500 hover:bg-white/20 hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden"
            >
              {/* Animated border effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500" />
                <img
                  src={tchrlogo}
                  alt="Guest"
                  className="relative w-20 h-20 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white transition-all duration-500 group-hover:text-white group-hover:tracking-wide">
                Are you a Guest?
              </h2>

              <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                Explore as a visitor
              </p>
            </div>
          </div>

          {/* Optional: Add a subtle decorative element */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30 text-sm">
            Abdul Wali Khan University Mardan
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;