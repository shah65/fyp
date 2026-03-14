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

export const addMember = async (req, res) => {
  try {
    const { name, email, rollNumber, role } = req.body;
    const userId = req.user.id;

    if (!name || !email || !rollNumber) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
        field: !name ? 'name' : !email ? 'email' : 'rollNumber'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Please enter a valid email address", field: 'email' });
    }

    const group = await Group.findOne({ leader: userId });
    if (!group) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "No group found or you are not the group leader." });
    }

    if (group.members.length >= 3) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Cannot add more members. Maximum 3 members allowed." });
    }

    if (group.members.find(m => m.email.toLowerCase() === email.toLowerCase())) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: `Email "${email}" already exists.`, field: 'email', errorType: "DUPLICATE_ERROR" });
    }

    if (group.members.find(m => m.rollNumber === rollNumber)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: `Roll number "${rollNumber}" already exists.`, field: 'rollNumber', errorType: "DUPLICATE_ERROR" });
    }

    const newMember = {
      name,
      email: email.toLowerCase(),
      rollNumber,
      role: role || 'member',
      image: req.file ? `/uploads/members/${req.file.filename}` : null,
      joinedAt: new Date()
    };

    group.members.push(newMember);
    await group.save();
    await group.populate("leader", "name email");

    const groupObj = group.toObject();
    groupObj.members = groupObj.members.map(member => {
      if (member.image) member.image = `${req.protocol}://${req.get('host')}${member.image}`;
      return member;
    });

    return res.status(201).json({ success: true, message: "Member added successfully!", group: groupObj });

  } catch (error) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) { } }
    return res.status(500).json({ success: false, message: "An unexpected error occurred: " + error.message });
  }
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

//get sngle member dtetail
export const getMember = async (req,res) =>{
  try {
    const {memberId} = req.params;
    const userId = req.user.id;
    const group  = await Group.findOne({
      $or:[
        {leader:userId},
        {'members._id':userId}
      ]
    });
    if(!group){
      return res.status(404).json({
        success:false,
        message:"Group not found!"
      })
    }

    const member = group.members.id(memberId);
    if(!member){
      return res.status(404).json({
        success:false,
        message:"Member not found!"
      });
    }

    const memberObj = member.toObject();
    if(memberObj.image){
      memberObj.image = `${req.protocol}://${req.get('host')}${memberObj.image}`;

    }
    res.json({
      success:true,
      member:memberObj
    })
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching member"
    });
  }
}

// Update member
export const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, email, rollNumber, role } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({ leader: userId });

    if (!group) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not the leader"
      });
    }

    const member = group.members.id(memberId);
    if (!member) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // Check for duplicate email if changing
    if (email && email.toLowerCase() !== member.email) {
      const existingEmail = group.members.find(
        m => m.email.toLowerCase() === email.toLowerCase() && m._id.toString() !== memberId
      );
      if (existingEmail) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Email "${email}" already exists in this group.`,
          field: 'email'
        });
      }
      member.email = email.toLowerCase();
    }

    // Check for duplicate roll number if changing
    if (rollNumber && rollNumber !== member.rollNumber) {
      const existingRollNo = group.members.find(
        m => m.rollNumber === rollNumber && m._id.toString() !== memberId
      );
      if (existingRollNo) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Roll number "${rollNumber}" already exists in this group.`,
          field: 'rollNumber'
        });
      }
      member.rollNumber = rollNumber;
    }

    // Update fields
    if (name) member.name = name;
    if (role) member.role = role;

    // Handle image update
    if (req.file) {
      if (member.image) {
        const oldImagePath = path.join(__dirname, '../..', member.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      member.image = `/uploads/members/${req.file.filename}`;
    }

    await group.save();

    await group.populate([
      { path: 'leader', select: 'name email' },
      { path: 'supervisor', select: 'name email' }
    ]);

    const groupObj = group.toObject();
    if (groupObj.members) {
      groupObj.members = groupObj.members.map(m => {
        if (m.image) m.image = `${req.protocol}://${req.get('host')}${m.image}`;
        return m;
      });
    }

    res.json({
      success: true,
      message: "Member updated successfully!",
      group: groupObj
    });

  } catch (error) {
    console.error('Update member error:', error);
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) { } }
    res.status(500).json({
      success: false,
      message: "Error updating member"
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
    // Populate for response
    await group.populate([
      { path: 'leader', select: 'name email' },
      { path: 'supervisor', select: 'name email' }
    ]);

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
    await group.populate([
      { path: 'leader', select: 'name email' },
      { path: 'supervisor', select: 'name email' }
    ]);
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
// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    const group = await Group.findOne({ leader: userId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not the leader"
      });
    }

    // Delete all member images
    for (const member of group.members) {
      if (member.image) {
        const imagePath = path.join(__dirname, '../..', member.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await group.deleteOne();

    res.json({
      success: true,
      message: "Group deleted successfully"
    });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting group"
    });
  }
};
