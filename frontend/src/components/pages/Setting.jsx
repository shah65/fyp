import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiUserPlus, FiUserMinus, FiTrash2,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiSettings,
  FiMail, FiHash, FiCalendar, FiCamera, FiUpload
} from 'react-icons/fi';
import api from '../../api/Api.js';
import AuthContext from '../context/AuthContext.js';

const Settings = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    role: 'member',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchGroup();
  }, [token]);

  const fetchGroup = async () => {
    try {
      const response = await api.get('/groups/my-group', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Group data:', response.data);
      setGroup(response.data.group);
    } catch (error) {
      console.error('Error fetching group:', error);
      setMessage({ type: 'error', text: 'Failed to fetch group data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await api.post('/groups/add-member', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setGroup(response.data.group);
      setShowAddMember(false);
      setFormData({ name: '', email: '', rollNumber: '', role: 'member', image: null });
      setImagePreview(null);
      setMessage({ type: 'success', text: 'Member added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add member'
      });
    }
  };

  const handleRemoveMember = async () => {
    try {
      const response = await api.delete(`/groups/remove-member/${memberToRemove}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update group state by removing the member
      setGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m._id !== memberToRemove)
      }));

      setMemberToRemove(null);
      setMessage({ type: 'success', text: 'Member removed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to remove member'
      });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await api.delete('/groups/delete-group', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGroup(null);
      setShowDeleteConfirm(false);
      setMessage({ type: 'success', text: 'Group deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete group'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center">
            <FiSettings className="mr-4" /> Group Settings
          </h1>
          <p className="text-gray-300 text-lg">Manage your group members and settings</p>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}
            >
              {message.type === 'success' ? <FiCheckCircle className="mr-2" /> : <FiAlertCircle className="mr-2" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {group ? (
          <div className="space-y-6">
            {/* Group Info Card */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{group.groupName}</h2>
                  <p className="text-gray-300">{group.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm ${group.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                      group.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                    }`}>
                    {group.status?.charAt(0).toUpperCase() + group.status?.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                <div>
                  <p className="text-gray-400 text-sm">Supervisor</p>
                  <p className="font-semibold">{group.supervisor || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="font-semibold">{group.members?.length || 0} / 3</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="font-semibold">{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {group.status === 'rejected' && group.rejectionReason && (
                <div className="mt-4 p-3 bg-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm flex items-center">
                    <FiAlertCircle className="mr-2" />
                    Rejection Reason: {group.rejectionReason}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Members Section */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FiUsers className="mr-2" /> Group Members ({group.members?.length || 0}/3)
                </h3>
                {group.members?.length < 3 && (
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-all"
                  >
                    <FiUserPlus className="mr-2" /> Add Member
                  </button>
                )}
              </div>

              {/* Add Member Form */}
              <AnimatePresence>
                {showAddMember && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <form onSubmit={handleAddMember} className="bg-white/5 rounded-xl p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            placeholder="Member name"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            placeholder="member@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Roll Number *</label>
                          <input
                            type="text"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            placeholder="CS-1234"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-1">Role</label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                          >
                            <option value="member">Member</option>
                            <option value="co-leader">Co-Leader</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-white/80 text-sm mb-1">Profile Image</label>
                          <div className="flex items-center space-x-4">
                            <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-white flex items-center transition-all">
                              <FiCamera className="mr-2" /> Choose Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                            {imagePreview && (
                              <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMember(false)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                        >
                          <FiUpload className="mr-2" /> Add Member
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members List */}
              <div className="space-y-3">
                {group.members?.map((member, index) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{member.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center"><FiMail className="mr-1" /> {member.email}</span>
                          <span className="flex items-center"><FiHash className="mr-1" /> {member.rollNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                        {member.role}
                      </span>
                      {/* Only leader can remove members */}
                      {user._id === group.leader._id && (
                        <button
                          onClick={() => setMemberToRemove(member._id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                          title="Remove member"
                        >
                          <FiUserMinus />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Danger Zone - Only for leader */}
            {user._id === group.leader._id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30"
              >
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                  <FiAlertCircle className="mr-2" /> Danger Zone
                </h3>
                <p className="text-gray-300 mb-4">
                  If your group was rejected by the supervisor, you can delete it and create a new one.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-all"
                >
                  <FiTrash2 className="mr-2" /> Delete Group
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          // No Group Found
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16 bg-white/10 backdrop-blur-lg rounded-2xl"
          >
            <FiUsers className="w-20 h-20 text-white/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Group Found</h3>
            <p className="text-gray-400 mb-6">You haven't created or joined any group yet.</p>
            <button
              onClick={() => window.location.href = '/create-group'}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center"
            >
              <FiUserPlus className="mr-2" /> Create Group
            </button>
          </motion.div>
        )}

        {/* Remove Member Confirmation Modal */}
        <AnimatePresence>
          {memberToRemove && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setMemberToRemove(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Remove Member</h3>
                  <p className="text-gray-300">
                    Are you sure you want to remove this member from the group? This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setMemberToRemove(null)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveMember}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Group Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiTrash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Delete Group</h3>
                  <p className="text-gray-300">
                    This will permanently delete your group and all member data. You will need to create a new group to participate.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Settings;