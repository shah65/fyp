import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  FiUser,
  FiUsers,
  FiStar,
  FiAward,
  FiMail,
  FiHash,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiUpload,
  FiX,
  FiUserPlus,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiGlobe,
} from 'react-icons/fi';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from 'framer-motion';
import api from '../../api/Api';
import img from '../../public/awkumimg1.png';

const Group = () => {
  // ==================== ALL HOOKS MUST BE AT THE TOP ====================

  // State Hooks
  const [group, setGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    role: 'member',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Ref Hooks
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Framer Motion Hooks
  const { scrollY, scrollYProgress } = useScroll();

  // Advanced scroll transformations
  const backgroundY = useTransform(scrollY, [0, 500], [0, -200]);
  const backgroundScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const backgroundBlur = useTransform(scrollY, [0, 300], [0, 10]);
  const headerOpacity = useTransform(scrollY, [0, 100, 200], [1, 0.8, 0.6]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  // Particle movement based on scroll
  const particleX = useTransform(scrollY, [0, 500], [0, 100]);
  const particleY = useTransform(scrollY, [0, 500], [0, -100]);
  const particleRotate = useTransform(scrollY, [0, 500], [0, 360]);

  // Mouse movement tracking for 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll progress indicator transformations (MOVED FROM INSIDE JSX)
  const progressScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const progressTextScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

  // Group info card 3D transformations (MOVED FROM INSIDE JSX)
  const cardRotateX = useTransform(mouseY, [-1, 1], [2, -2]);
  const cardRotateY = useTransform(mouseX, [-1, 1], [-2, 2]);

  // useMemo Hooks
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      color: `hsl(${Math.random() * 60 + 260}, 70%, 60%)`,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'triangle',
    }));
  }, []);

  // useCallback Hooks
  const handleMouseMove = useCallback(
    (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position between -1 and 1
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;

      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  // useEffect Hooks
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    fetchGroup();
  }, []);

  // ==================== FUNCTION DEFINITIONS ====================

  const fetchGroup = async () => {
    try {
      const res = await api.get('/group/mygroup/my');
      setGroup(res.data.group);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, image: 'Image size should be less than 5MB' });
        return;
      }

      setFormData({ ...formData, image: file });
      setFormErrors({ ...formErrors, image: null });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    } else if (formData.rollNumber.length < 3) {
      errors.rollNumber = 'Roll number must be at least 3 characters';
    }

    return errors;
  };

  const handleAddMember = async () => {
    setFormErrors({});
    setGeneralError('');
    setSuccessMessage('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('rollNumber', formData.rollNumber);
      formDataToSend.append('role', formData.role);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await api.post('/group/add-member', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Member added successfully!');
        setShowForm(false);
        setFormData({ name: '', email: '', rollNumber: '', role: 'member', image: null });
        setImagePreview('');
        fetchGroup();

        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding member:', err);

      if (err.response) {
        const errorData = err.response.data;
        if (errorData.field) {
          setFormErrors({ [errorData.field]: errorData.message });
        } else {
          setGeneralError(errorData.message || 'Failed to add member. Please try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  // ==================== CONDITIONAL RENDERING ====================

  // Loading state
  if (group === undefined) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center"
      >
        <div className="text-center relative">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-lg mt-4"
          >
            Loading group...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // No group state
  if (group === null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          className="text-center text-white p-8 bg-black/30 backdrop-blur-lg rounded-2xl max-w-md border border-white/10"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <FiUsers className="text-7xl mx-auto mb-4 text-purple-400" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            No Group Created Yet OR Please enter project Details
          </h2>
          <p className="text-white/70 text-lg">Create or join a group to get started!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold relative overflow-hidden group"
          >
             <motion.div
              className="absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Create member slots (max 3)
  const memberSlots = [
    ...(group.members || []),
    ...Array(Math.max(3 - (group.members?.length || 0), 0)).fill(null),
  ];

  // ==================== MAIN RENDER ====================

  return (
    <motion.div
      ref={containerRef}
      style={{
        backgroundImage: `url(${img})`,
        backgroundPositionY: backgroundY,
        scale: backgroundScale,
        filter: `blur(${backgroundBlur}px)`,
      }}
      className="min-h-screen bg-cover bg-center p-4 md:p-10 relative overflow-x-hidden"
    >
      {/* Advanced Background Overlay with Dynamic Gradient */}
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-purple-900/90 via-black/80 to-blue-900/90"
        style={{
          backdropFilter: 'blur(8px)',
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(0,0,0,0.8) 50%, rgba(30,58,138,0.9) 100%)',
            'linear-gradient(225deg, rgba(88,28,135,0.9) 0%, rgba(0,0,0,0.8) 50%, rgba(30,58,138,0.9) 100%)',
            'linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(0,0,0,0.8) 50%, rgba(30,58,138,0.9) 100%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Advanced Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius:
                particle.shape === 'circle' ? '50%' : particle.shape === 'square' ? '2px' : '0%',
              transform: particle.shape === 'triangle' ? 'rotate(45deg)' : 'none',
              opacity: 0.3,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, particle.x > 50 ? -50 : 50, 0],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: particle.speed * 5,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Success Message with Animation */}
        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2"
            >
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                <FiCheckCircle className="text-xl" />
              </motion.div>
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Info Card with 3D Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
          }}
          className="bg-black/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto mb-8 md:mb-10 border border-white/10 sticky top-4 z-20"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-3xl md:text-5xl font-bold text-center mb-4 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          >
            {group.groupName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-center mb-6 text-sm md:text-base"
          >
            {group.description}
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-4">
            {[
              {
                icon: FiStar,
                color: 'yellow',
                label: 'Leader',
                value: group.leader?.name || 'N/A',
              },
              { icon: FiAward, color: 'blue', label: 'Supervisor', value: group.supervisor },
              {
                icon: FiUsers,
                color: 'green',
                label: 'Members',
                value: `${group.members.length}/3`,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex items-center bg-white/10 px-3 md:px-4 py-2 rounded-full text-sm md:text-base cursor-pointer"
              >
                <item.icon className={`mr-2 text-${item.color}-400`} />
                <span className="text-white">
                  {item.label}: {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Members Grid with Advanced 3D Effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000">
          {memberSlots.map((member, index) => (
            <motion.div
              key={member?._id || `empty-${index}`}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100,
                damping: 10,
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 10,
                rotateX: 5,
                z: 50,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              style={{
                transformStyle: 'preserve-3d',
                transform:
                  hoveredCard === index
                    ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
                    : 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
              }}
              onClick={() => member && handleMemberClick(member)}
              className={`${
                member ? 'cursor-pointer' : ''
              } bg-black/30 backdrop-blur-xl p-4 md:p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Card Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {member ? (
                /* Member Card Content */
                <div className="text-center relative z-10">
                  {/* Animated Image Container */}
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-3 border-purple-500 relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Rotating Border */}
                    <motion.div
                      className="absolute inset-0 border-2 border-purple-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />

                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              <svg class="text-3xl text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <FiUser className="text-3xl text-white" />
                      </div>
                    )}
                  </motion.div>

                  {/* Member Info with Typing Effect */}
                  <motion.h3
                    className="text-xl font-bold text-white mb-2"
                    animate={{
                      textShadow: [
                        '0 0 8px rgba(168,85,247,0.5)',
                        '0 0 16px rgba(168,85,247,0.8)',
                        '0 0 8px rgba(168,85,247,0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {member.name}
                  </motion.h3>

                  <motion.p
                    className="text-purple-400 text-sm mb-3 capitalize"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {member.role}
                  </motion.p>

                  {/* Social Links (Placeholder) */}
                  <motion.div
                    className="flex justify-center gap-2 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="p-1 bg-white/10 rounded-full"
                    >
                      <FiGithub className="text-white/60 text-xs" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="p-1 bg-white/10 rounded-full"
                    >
                      <FiLinkedin className="text-white/60 text-xs" />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="p-1 bg-white/10 rounded-full"
                    >
                      <FiTwitter className="text-white/60 text-xs" />
                    </motion.div>
                  </motion.div>

                  {/* Member Details with Slide Animation */}
                  <motion.div
                    className="space-y-2 text-left"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <motion.div className="flex items-center gap-2 text-sm" whileHover={{ x: 5 }}>
                      <FiMail className="text-purple-400 shrink-0" />
                      <span className="text-white/80 truncate">{member.email}</span>
                    </motion.div>
                    <motion.div className="flex items-center gap-2 text-sm" whileHover={{ x: 5 }}>
                      <FiHash className="text-purple-400 shrink-0" />
                      <span className="text-white/80">{member.rollNumber}</span>
                    </motion.div>
                  </motion.div>

                  {/* View Details Badge with Pulse Effect */}
                  <motion.div
                    className="mt-4 text-xs text-purple-400 flex items-center justify-center gap-1"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span>Click to view details</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                /* Empty Slot Content with Advanced Animation */
                <motion.div
                  className="h-full flex flex-col items-center justify-center py-8 relative"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Pulsing Circle */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-purple-500/50 flex items-center justify-center relative"
                    animate={{
                      rotate: [0, 360],
                      borderColor: [
                        'rgba(168,85,247,0.5)',
                        'rgba(236,72,153,0.5)',
                        'rgba(168,85,247,0.5)',
                      ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <FiUserPlus className="text-3xl text-purple-500/50" />

                    {/* Orbiting Dots */}
                    <motion.div
                      className="absolute w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  </motion.div>

                  <motion.p
                    className="text-white/50 text-center mb-2"
                    animate={{
                      textShadow: [
                        '0 0 0 rgba(168,85,247,0)',
                        '0 0 10px rgba(168,85,247,0.5)',
                        '0 0 0 rgba(168,85,247,0)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Empty Slot
                  </motion.p>

                  <p className="text-white/30 text-xs text-center">Available for new member</p>

                  {/* Add Member Button with Advanced Animation */}
                  {group.members.length < 3 &&
                    index === memberSlots.findIndex((slot) => slot === null) && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowForm(true);
                        }}
                        className="mt-4 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <FiPlus />
                          Add Member
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-pink-600 to-purple-600"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Member Form with Advanced Animations */}
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="mt-8 md:mt-10 max-w-md mx-auto bg-black/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10"
            >
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl md:text-3xl font-bold text-center mb-6 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Add New Member
              </motion.h2>

              {/* Form Fields with Staggered Animation */}
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {/* Error Message */}
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm"
                  >
                    <FiAlertCircle className="shrink-0 mt-0.5" />
                    <span>{generalError}</span>
                  </motion.div>
                )}

                {/* Image Upload with Advanced Animation */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <label className="text-white/70 text-sm mb-2 block">Profile Image</label>
                  <div className="flex flex-col items-center gap-3">
                    {/* Preview with 3D Effect */}
                    <motion.div
                      className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/50"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={clearImage}
                            className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                          >
                            <FiX className="text-white text-sm" />
                          </motion.button>
                        </>
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <FiImage className="text-3xl text-white/70" />
                        </div>
                      )}
                    </motion.div>

                    {/* Upload Button */}
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white text-sm transition-all duration-300"
                    >
                      <FiUpload />
                      <span>Choose Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </motion.label>

                    {formErrors.image && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-xs flex items-center gap-1"
                      >
                        <FiAlertCircle />
                        {formErrors.image}
                      </motion.p>
                    )}

                    <p className="text-white/30 text-xs">Max size: 5MB (JPEG, PNG, GIF, WEBP)</p>
                  </div>
                </motion.div>

                {/* Form Inputs */}
                {[
                  {
                    field: 'name',
                    label: 'Full Name *',
                    type: 'text',
                    placeholder: "Enter member's full name",
                    icon: FiUser,
                  },
                  {
                    field: 'email',
                    label: 'Email Address *',
                    type: 'email',
                    placeholder: "Enter member's email",
                    icon: FiMail,
                  },
                  {
                    field: 'rollNumber',
                    label: 'Roll Number *',
                    type: 'text',
                    placeholder: "Enter member's roll number",
                    icon: FiHash,
                  },
                ].map((input) => (
                  <motion.div
                    key={input.field}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <label className="text-white/70 text-sm mb-1 block">{input.label}</label>
                    <div className="relative">
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        className={`w-full p-3 pl-10 rounded-lg bg-black/40 text-white border ${
                          formErrors[input.field] ? 'border-red-500' : 'border-white/10'
                        } focus:border-purple-500 focus:outline-none`}
                        onChange={(e) => {
                          setFormData({ ...formData, [input.field]: e.target.value });
                          setFormErrors({ ...formErrors, [input.field]: null });
                        }}
                        value={formData[input.field]}
                      />
                      <input.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                    </div>
                    {formErrors[input.field] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center gap-1"
                      >
                        <FiAlertCircle />
                        {formErrors[input.field]}
                      </motion.p>
                    )}
                  </motion.div>
                ))}

                {/* Role Select */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <label className="text-white/70 text-sm mb-1 block">Role</label>
                  <select
                    className="w-full p-3 rounded-lg bg-black/40 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    value={formData.role}
                  >
                    <option value="leader">Leader</option>
                    <option value="member">Member</option>
                    <option value="co-ordinator">Co-Ordinator</option>
                  </select>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  className="flex gap-3 pt-4"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddMember}
                    disabled={isSubmitting}
                    className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-lg text-white font-bold transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Adding...
                        </span>
                      ) : (
                        'Add Member'
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-emerald-600 to-green-600"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowForm(false);
                      setFormErrors({});
                      setGeneralError('');
                      clearImage();
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              </motion.div>

              <p className="text-white/50 text-xs text-center mt-4">
                * Required fields. Maximum 3 members per group.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Detail Modal with Advanced 3D Effect */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-linear-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMember(null)}
                    className="absolute -top-2 -right-2 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                  >
                    <FiX className="text-white" />
                  </motion.button>

                  <div className="text-center">
                    {/* Modal Image with 3D Effect */}
                    <motion.div
                      className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 relative"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(168,85,247,0.5)',
                          '0 0 40px rgba(168,85,247,0.8)',
                          '0 0 20px rgba(168,85,247,0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {/* Rotating Ring */}
                      <motion.div
                        className="absolute inset-0 border-2 border-purple-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      />

                      {selectedMember.image ? (
                        <img
                          src={selectedMember.image}
                          alt={selectedMember.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <svg class="text-4xl text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <FiUser className="text-4xl text-white" />
                        </div>
                      )}
                    </motion.div>

                    <motion.h3
                      className="text-2xl font-bold text-white mb-2"
                      animate={{
                        textShadow: [
                          '0 0 8px rgba(255,255,255,0.5)',
                          '0 0 16px rgba(255,255,255,0.8)',
                          '0 0 8px rgba(255,255,255,0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {selectedMember.name}
                    </motion.h3>

                    {/* Member Details with Staggered Animation */}
                    <motion.div
                      className="space-y-3 text-left mt-6"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.1 },
                        },
                      }}
                    >
                      {[
                        { icon: FiMail, label: 'Email', value: selectedMember.email },
                        { icon: FiHash, label: 'Roll Number', value: selectedMember.rollNumber },
                        { icon: FiAward, label: 'Role', value: selectedMember.role },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 },
                          }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-3 bg-white/10 p-3 rounded-lg"
                        >
                          <item.icon className="text-purple-400 text-xl" />
                          <div>
                            <p className="text-white/50 text-xs">{item.label}</p>
                            <p className="text-white capitalize">{item.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                      className="flex justify-center gap-4 mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[FiGithub, FiLinkedin, FiTwitter, FiGlobe].map((Icon, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          className="p-2 bg-white/10 rounded-full cursor-pointer"
                        >
                          <Icon className="text-white/60" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Progress Indicator - USING MOVED HOOK VALUES */}
      <motion.div
        className="fixed bottom-4 right-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg z-50 flex items-center justify-center"
        style={{
          scale: progressScale,
        }}
      >
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="26"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-white/20"
          />
          <motion.circle
            cx="28"
            cy="28"
            r="26"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="transparent"
            strokeLinecap="round"
            style={{
              pathLength: scrollYProgress,
            }}
          />
        </svg>
        <motion.span
          className="absolute text-white text-xs font-bold"
          style={{
            scale: progressTextScale,
          }}
        >
          {Math.round(scrollYProgress.get() * 100)}%
        </motion.span>

        {/* Gradient definition for progress circle */}
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default Group;
