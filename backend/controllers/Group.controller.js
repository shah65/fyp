import Group from "../models/Group.js";
import { memberImageUpload } from '../middleware/Multer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createGroup = async (req, res) => {
  try {
    const { groupName, description, supervisor, members } = req.body;
    const leaderId = req.user.id;

    const group = await Group.create({
      groupName,
      description,
      leader: leaderId,
      members: members || [],
      supervisor: req.body.supervisor || 'Not Assigned',
      status: 'pending' // Add status field to track group approval

    });

    res.status(201).json({
      success: true,
      group
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while creating group"
    });
  }
};

// Add member with image upload
export const addMember = async (req, res) => {
  // Use the memberImageUpload middleware
  memberImageUpload(req, res, async (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "Image file is too large. Maximum size is 5MB.",
          field: 'image'
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message,
        field: 'image'
      });
    }

    try {
      const { name, email, rollNumber, role } = req.body;
      const userId = req.user.id;

      // Validation
      if (!name || !email || !rollNumber) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
          field: !name ? 'name' : !email ? 'email' : 'rollNumber'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
          field: 'email'
        });
      }

      // Find group where user is leader
      const group = await Group.findOne({ leader: userId });

      if (!group) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "No group found or you are not the group leader."
        });
      }

      // Check member limit
      if (group.members.length >= 3) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Cannot add more members. Maximum 3 members allowed.",
          limit: 3,
          current: group.members.length
        });
      }

      // Check for duplicate email
      const existingEmail = group.members.find(
        m => m.email.toLowerCase() === email.toLowerCase()
      );

      if (existingEmail) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Email "${email}" already exists in this group.`,
          field: 'email',
          errorType: "DUPLICATE_ERROR"
        });
      }

      // Check for duplicate roll number
      const existingRollNo = group.members.find(
        m => m.rollNumber === rollNumber
      );

      if (existingRollNo) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Roll number "${rollNumber}" already exists in this group.`,
          field: 'rollNumber',
          errorType: "DUPLICATE_ERROR"
        });
      }

      // Prepare image path
      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/members/${req.file.filename}`;
      }

      // Add new member
      const newMember = {
        name,
        email: email.toLowerCase(),
        rollNumber,
        role: role || 'member',
        image: imagePath,
        joinedAt: new Date()
      };

      group.members.push(newMember);
      await group.save();

      // Populate leader info
      await group.populate("leader", "name email");

      // Add full URL for images
      const groupObj = group.toObject();
      if (groupObj.members) {
        groupObj.members = groupObj.members.map(member => {
          if (member.image) {
            member.image = `${req.protocol}://${req.get('host')}${member.image}`;
          }
          return member;
        });
      }

      res.status(201).json({
        success: true,
        message: "Member added successfully!",
        group: groupObj
      });

    } catch (error) {
      console.error("Error adding member:", error);

      // Delete uploaded file if error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
        errorType: "SERVER_ERROR"
      });
    }
  });
};

export const getMyGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    const group = await Group.findOne({
      $or: [
        { leader: userId },
        { 'members._id': userId }
      ]
    }).populate('leader', 'name email');

    if (!group) {
      return res.status(200).json({
        success: true,
        group: null
      });
    }

    // Add full URLs for images
    const groupObj = group.toObject();
    if (groupObj.members && groupObj.members.length > 0) {
      groupObj.members = groupObj.members.map(member => {
        if (member.image) {
          member.image = `${req.protocol}://${req.get('host')}${member.image}`;
        }
        return member;
      });
    }

    res.json({
      success: true,
      group: groupObj
    });

  } catch (error) {
    console.error('Get my group error:', error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching group data"
    });
  }
};

// Remove member
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({ leader: userId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Find member to delete image
    const member = group.members.id(memberId);

    if (member && member.image) {
      // Delete image file
      const imagePath = path.join(__dirname, '../..', member.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove member
    group.members.pull(memberId);
    await group.save();

    res.json({
      success: true,
      message: "Member removed successfully"
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: "Error removing member"
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find group where user is leader
    const group = await Group.findOne({ leader: userId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not the group leader"
      });
    }

    // Delete all member images
    if (group.members && group.members.length > 0) {
      group.members.forEach(member => {
        if (member.image) {
          const imagePath = path.join(__dirname, '../..', member.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('✅ Member image deleted:', imagePath);
          }
        }
      });
    }

    // Delete the group
    await Group.findByIdAndDelete(group._id);

    res.json({
      success: true,
      message: "Group deleted successfully. You can now create a new group."
    });

  } catch (error) {
    console.error('❌ Delete group error:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting group"
    });
  }
};

export const updateGroupStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'pending'
    const userId = req.user.id;

    // Check if user is supervisor (you'll need to add role check)
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    group.status = status;
    if (status === 'rejected') {
      group.rejectionReason = req.body.reason || 'No reason provided';
    }

    await group.save();

    res.json({
      success: true,
      message: `Group ${status} successfully`,
      group
    });

  } catch (error) {
    console.error('❌ Update group status error:', error);
    res.status(500).json({
      success: false,
      message: "Error updating group status"
    });
  }
};