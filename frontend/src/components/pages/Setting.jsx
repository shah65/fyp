import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiTrash2, FiAlertCircle,
  FiMail, FiHash, FiCamera,
  FiEdit2, FiEye, FiX, FiSave,
  FiUser, FiInfo, FiArrowLeft, FiCheckCircle
} from 'react-icons/fi';
import api from '../../api/Api.js';
import AuthContext from '../context/AuthContext.js';

const Setting = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(undefined); // undefined = loading, null = no group, object = has group
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', rollNumber: '', role: 'member', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Simple toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const res = await api.get('/group/my-group');
      setGroup(res.data.group); // null if no group, object if exists
    } catch (error) {
      console.error('Error fetching group:', error);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be less than 5MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { showToast('Please upload a valid image', 'error'); return; }
    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    // Basic validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      if (formData.name) fd.append('name', formData.name);
      if (formData.email) fd.append('email', formData.email);
      if (formData.rollNumber) fd.append('rollNumber', formData.rollNumber);
      if (formData.role) fd.append('role', formData.role);
      if (formData.image) fd.append('image', formData.image);

      const response = await api.put(`/group/member/${selectedMember._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setGroup(response.data.group);
        setShowEditModal(false);
        setSelectedMember(null);
        resetForm();
        showToast('Member updated successfully!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update member';
      if (error.response?.data?.field) {
        setFormErrors({ [error.response.data.field]: msg });
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const response = await api.delete(`/group/member/${memberToRemove}`);
      if (response.data.success) {
        await fetchGroup(); // Re-fetch to get latest state
        setMemberToRemove(null);
        showToast('Member removed successfully!');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', rollNumber: '', role: 'member', image: null });
    setImagePreview(null);
    setFormErrors({});
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      rollNumber: member.rollNumber || '',
      role: member.role || 'member',
      image: null
    });
    setImagePreview(member.image || null);
    setFormErrors({});
    setShowEditModal(true);
  };

  const openViewModal = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ── NO GROUP ──
  if (!group) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16 px-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-md w-full"
        >
          <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Group Found</h3>
          <p className="text-gray-400 mb-8">You haven't created a group yet. Go back and create one first.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg inline-flex items-center gap-2 transition-all"
          >
            <FiArrowLeft /> Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const hasMembers = group.members && group.members.length > 0;

  // ── MAIN RENDER ──
  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-white font-medium
              ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {toast.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800">

        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Group Settings
              </h1>
            </div>
            <div className="text-gray-400 text-sm">{user?.name}</div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">

            {/* Group Info Banner */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">{group.groupName}</h2>
                {group.description && <p className="text-gray-400 text-sm mt-1">{group.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${group.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    group.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'}`}>
                  {group.status?.toUpperCase() || 'PENDING'}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <FiUsers size={14} />
                  {group.members?.length || 0}/3 Members
                </span>
              </div>
            </motion.div>

            {/* NO MEMBERS STATE */}
            {!hasMembers ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiUsers className="w-12 h-12 text-blue-400/60" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">No Members Added Yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Your group is created but has no members. Go to the Group page to add members.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  <FiArrowLeft /> Back to Home
                </button>
              </motion.div>
            ) : (
              /* HAS MEMBERS */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.members.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 hover:border-blue-500/40 transition-all group"
                    >
                      {/* Member Avatar + Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg shrink-0 border-2 border-white/20">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <FiUser size={28} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-lg truncate">{member.name}</h4>
                          <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5 truncate">
                            <FiMail size={11} className="text-blue-400 shrink-0" />
                            {member.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium flex items-center gap-1">
                              <FiHash size={10} />{member.rollNumber}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium capitalize">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <button
                          onClick={() => openViewModal(member)}
                          className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <FiEdit2 size={14} /> Update
                        </button>
                        <button
                          onClick={() => setMemberToRemove(member._id)}
                          className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-300 flex items-center gap-2 text-sm">
                    <FiInfo className="text-blue-400" />
                    Total Members: <span className="font-bold text-white">{group.members.length}</span>
                    <span className="text-gray-500">/ Maximum 3 allowed</span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      <AnimatePresence>
        {showViewModal && selectedMember && (
          <ModalWrapper onClose={() => { setShowViewModal(false); setSelectedMember(null); }}>
            <div className="text-center">
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-blue-500 to-purple-500 mx-auto mb-4 overflow-hidden border-4 border-white/20 shadow-xl">
                {selectedMember.image ? (
                  <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="text-white" size={40} />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{selectedMember.name}</h3>
              <p className="text-blue-400 text-sm mb-5">{selectedMember.email}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Roll Number', value: selectedMember.rollNumber },
                  { label: 'Role', value: selectedMember.role },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-4 text-left">
                    <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-semibold capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowViewModal(false); setSelectedMember(null); }}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {showEditModal && selectedMember && (
          <ModalWrapper onClose={() => { setShowEditModal(false); setSelectedMember(null); resetForm(); }} title="Update Member">
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', name: 'name', type: 'text' },
                  { label: 'Email Address', name: 'email', type: 'email' },
                  { label: 'Roll Number', name: 'rollNumber', type: 'text' },
                ].map(field => (
                  <div key={field.name} className={field.name === 'rollNumber' ? 'md:col-span-2' : ''}>
                    <label className="block text-white/70 text-sm mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all
                        ${formErrors[field.name] ? 'border-red-500' : 'border-white/20'}`}
                    />
                    {formErrors[field.name] && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <FiAlertCircle size={11} />{formErrors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-white/70 text-sm mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="co-ordinator">Co-Ordinator</option>
                    <option value="leader">Leader</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2.5 text-white flex items-center gap-2 transition-all text-sm">
                    <FiCamera size={16} /> Change Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedMember(null); resetForm(); }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <><FiSave size={15} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {memberToRemove && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMemberToRemove(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-7 max-w-sm w-full border border-white/10 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-red-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Member?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. The member will be permanently removed from the group.</p>
              <div className="flex gap-3">
                <button onClick={() => setMemberToRemove(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                  Cancel
                </button>
                <button onClick={handleRemoveMember}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-semibold">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Reusable Modal Wrapper
const ModalWrapper = ({ children, onClose, title }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10"
      onClick={e => e.stopPropagation()}
    >
      {title && (
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <FiX className="text-white" size={18} />
          </button>
        </div>
      )}
      {children}
    </motion.div>
  </motion.div>
);

export default Setting;