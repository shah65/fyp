import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiX, FiHome, FiUsers, FiFolder, FiBookOpen, FiLogOut, FiUser, FiSettings, FiChevronDown, FiClock, FiCheckCircle, FiXCircle, FiVideo } from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import api from "../../api/Api";

const TeacherNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await api.get('/teacher/requests/pending');
        setPendingCount(response.data.count || 0);
        setNotifications(response.data.count || 0); // Update notification bell too
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/teacherlogin");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Update navLinks with all teacher routes
  const navLinks = [
    { path: "/teacher-home", label: "Dashboard", icon: FiHome },
    {
      path: "/teacher/pending-request",
      label: "Pending",
      icon: FiClock,
      badge: pendingCount,
      badgeColor: "yellow"
    },
    { path: "/teacher/approved-projects", label: "Approved", icon: FiCheckCircle },
    { path: "/teacher/rejected-project", label: "Rejected", icon: FiXCircle },
    { path: "/teacher/students", label: "Students", icon: FiUsers },
    { path: "/teacher/meetings", label: "Meetings", icon: FiVideo },  // ← add this

    // { path: "/teacher/projects", label: "All Projects", icon: FiFolder },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-[#0B1F3A] py-3'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* LEFT - Logo */}
          <Link to="/teacher-home" className="flex items-center space-x-3 group">
            <div className="bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold rounded-xl w-10 h-10 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-110">
              <span className="text-lg">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-white">
                AWKU Portal
              </span>
              <span className="text-xs text-blue-300 hidden sm:block">
                Teacher Dashboard
              </span>
            </div>
          </Link>

          {/* CENTER - Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                    flex items-center space-x-2 group overflow-hidden
                    ${active
                      ? 'text-white bg-blue-600/20'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {/* Active indicator line */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
                  )}

                  {/* Icon */}
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-blue-400' : 'text-blue-300'
                    }`} />

                  <span>{link.label}</span>

                  {/* Badge for pending count */}
                  {link.badge > 0 && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full
                      ${link.badgeColor === 'yellow'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      }
                    `}>
                      {link.badge}
                    </span>
                  )}

                  {/* Hover effect */}
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-200"></span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* Notification Bell */}
            <button className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group">
              <FiBell size={20} className="group-hover:scale-110 transition-transform" />
              {notifications > 0 && (
                <>
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 text-[10px] font-bold text-white items-center justify-center">
                      {notifications}
                    </span>
                  </span>
                </>
              )}
            </button>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 cursor-pointer group focus:outline-none"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
                    {user?.name?.charAt(0) || 'T'}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0B1F3A]"></span>
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Teacher'}
                  </p>
                  <p className="text-xs text-blue-300">
                    {user?.role || 'Educator'}
                  </p>
                </div>

                <FiChevronDown
                  className={`text-blue-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-fadeIn">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Pending:</span>
                      <span className="font-semibold text-yellow-600">{pendingCount}</span>
                    </div>
                  </div>

                  {/* Menu items */}

                  <Link
                    to="/teacher/setting"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiSettings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden fixed inset-x-0 top-18 bg-[#132C4E]/95 backdrop-blur-md border-t border-white/10
          transform transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'}
        `}
      >
        <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${active
                    ? 'bg-blue-600/20 text-white border-l-4 border-blue-400'
                    : 'text-blue-100 hover:bg-white/10'
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-blue-300'}`} />
                  <span className="font-medium">{link.label}</span>
                </div>

                {/* Badge for mobile */}
                {link.badge > 0 && (
                  <span className={`
                    px-2 py-1 text-xs font-bold rounded-full
                    ${link.badgeColor === 'yellow'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                    }
                  `}>
                    {link.badge}
                  </span>
                )}

                {active && (
                  <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile user info */}
          <div className="px-4 py-3 mt-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-blue-300">{user?.email}</p>
              </div>
            </div>

            {/* Mobile quick links */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/teacher/profile"
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 rounded-lg text-sm text-white"
                onClick={() => setMobileOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/teacher/settings"
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 rounded-lg text-sm text-white"
                onClick={() => setMobileOpen(false)}
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Mobile logout button */}
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 mt-2"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default TeacherNavbar;