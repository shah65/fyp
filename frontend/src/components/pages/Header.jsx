import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiChevronDown, FiBookOpen } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { MdDashboard } from 'react-icons/md';
import api from '../../api/Api';

const Header = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const Logout = async () => {
    try {
      await api.post('/logout', { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user's first letter or default
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  // Navigation items for easy management
  const navItems = [
    { path: '/', icon: <FiHome />, text: 'Home' },
    { path: '/resources', icon: <FiBookOpen />, text: 'Resources' },
    { path: '/group', icon: <FiUsers />, text: 'Group' },
    // { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-linear-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-linear-to-r from-indigo-800 to-purple-800 py-4'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo with animation */}
          <Link to="/" className="group flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative text-2xl font-bold text-white bg-linear-to-r from-blue-400 to-pink-400 bg-clip-text">
                AWKUM
              </div>
            </div>
          </Link>

          {/* Navigation Links - Centered */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                text={item.text}
                active={isActive(item.path)}
              />
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-3 group focus:outline-none"
            >
              {/* User Avatar with Animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-400 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-white/30 group-hover:border-white/50 transition-all duration-300">
                  {userInitial}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>

              {/* User Name with Chevron */}
              <div className="hidden hover:cursor-pointer lg:flex items-center space-x-2 text-white">
                <span className="font-medium">{user?.name || 'User'}</span>
                <FiChevronDown
                  className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Dropdown Menu with Animation */}
            {isOpen && (
              <div className="absolute   right-0 mt-2 w-64 animate-slideDown">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden">
                  {/* User Info Card */}
                  <div className="p-4 bg-linear-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {userInitial}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{user?.name || 'User'}</div>
                        <div className="text-white/60 text-sm">
                          {user?.email || 'user@awkum.edu'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {/* <DropdownItem
                      to="/profile"
                      icon={<CgProfile />}
                      text="My Profile"
                      description="View and edit your profile"
                      isActive={isActive('/profile')}
                      onClick={() => setIsOpen(false)}
                      onHover={() => setHoveredItem('profile')}
                      isHovered={hoveredItem === 'profile'}
                    /> */}
                    <DropdownItem
                      to="/settings"
                      icon={<FiSettings />}
                      text="Settings"
                      description="Account preferences"
                      isActive={isActive('/settings')}
                      onClick={() => setIsOpen(false)}
                      onHover={() => setHoveredItem('settings')}
                      isHovered={hoveredItem === 'settings'}
                    />
                    <div className="border-t border-white/10 my-2"></div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        Logout();
                      }}
                      onMouseEnter={() => setHoveredItem('logout')}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="w-full group flex items-center justify-between p-3 rounded-lg transition-all duration-200 relative overflow-hidden"
                    >
                      {/* Background gradient on hover */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          hoveredItem === 'logout'
                            ? 'bg-linear-to-r from-red-500/30 to-red-600/30 opacity-100'
                            : 'opacity-0'
                        }`}
                      ></div>

                      <div className="relative flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            hoveredItem === 'logout' ? 'bg-red-500/30' : 'bg-red-500/20'
                          }`}
                        >
                          <FiLogOut
                            className={`transition-colors duration-200 ${
                              hoveredItem === 'logout' ? 'text-red-300' : 'text-red-400'
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-medium transition-colors duration-200 ${
                              hoveredItem === 'logout' ? 'text-white' : 'text-white'
                            }`}
                          >
                            Logout
                          </div>
                          <div
                            className={`text-sm transition-colors duration-200 ${
                              hoveredItem === 'logout' ? 'text-white/70' : 'text-white/50'
                            }`}
                          >
                            Sign out of your account
                          </div>
                        </div>
                      </div>
                      <span
                        className={`transition-all duration-200 ${
                          hoveredItem === 'logout' ? 'text-white/70 translate-x-1' : 'text-white/30'
                        }`}
                      >
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Reusable NavLink Component with enhanced active state
const NavLink = ({ to, icon, text, active = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative px-4 py-2 rounded-lg overflow-hidden transition-all duration-300 ${
        active ? 'text-white bg-white/20 shadow-lg' : 'text-white/80 hover:text-white'
      }`}
    >
      {/* Animated background on hover/active */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          active
            ? 'bg-linear-to-r from-white/20 to-white/5'
            : isHovered
              ? 'bg-white/10 scale-100'
              : 'bg-white/0 scale-0'
        }`}
        style={{ transformOrigin: 'center' }}
      ></div>

      {/* Shine effect on hover */}
      {isHovered && !active && (
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine"></div>
      )}

      {/* Content */}
      <div className="relative flex items-center space-x-2">
        <span
          className={`text-lg transition-transform duration-300 ${
            isHovered || active ? 'scale-110' : ''
          }`}
        >
          {icon}
        </span>
        <span className="font-medium">{text}</span>
      </div>

      {/* Active indicator with animation */}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-0.5">
          <div className="h-full bg-linear-to-r from-blue-400 to-purple-400 animate-slideIn"></div>
        </div>
      )}

      {/* Pulsing dot for active page */}
      {active && (
        <div className="absolute -top-1 -right-1 w-2 h-2">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-blue-400 rounded-full"></div>
        </div>
      )}
    </Link>
  );
};

// Enhanced DropdownItem Component with active state
const DropdownItem = ({ 
  to, 
  icon, 
  text, 
  description, 
  isActive = false,
  onClick,
  onHover,
  isHovered = false 
}) => {
  const [localHover, setLocalHover] = useState(false);

  const handleMouseEnter = () => {
    setLocalHover(true);
    if (onHover) onHover();
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
    if (onHover) onHover(null);
  };

  const showHover = isHovered || localHover;

  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
        isActive 
          ? 'bg-linear-to-r from-blue-500/30 to-purple-500/30 border-l-2 border-purple-400' 
          : showHover 
            ? 'bg-white/15' 
            : 'hover:bg-white/10'
      }`}
    >
      {/* Background glow for active item */}
      {isActive && (
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 animate-pulse-slow"></div>
      )}

      <div className="relative flex items-center space-x-3">
        <div className={`p-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-linear-to-r from-blue-500/40 to-purple-500/40' 
            : showHover 
              ? 'bg-white/25' 
              : 'bg-white/10 group-hover:bg-white/20'
        }`}>
          <span className={`transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
          }`}>
            {icon}
          </span>
        </div>
        <div className="text-left">
          <div className={`font-medium transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-white'
          }`}>
            {text}
          </div>
          <div className={`text-sm transition-colors duration-200 ${
            isActive ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'
          }`}>
            {description}
          </div>
        </div>
      </div>

      {/* Active indicator arrow */}
      <div className="relative">
        {isActive && (
          <span className="text-white/80 animate-pulse-slow">←</span>
        )}
        {!isActive && (
          <span className={`transition-all duration-200 ${
            showHover ? 'text-white/70 translate-x-1' : 'text-white/30'
          }`}>
            →
          </span>
        )}
      </div>
    </Link>
  );
};

export default Header;