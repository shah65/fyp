import mongoose from "mongoose";
import Project from "../models/ProjectModel.js";
import Group from "../models/Group.js";
import Teacher from "../models/TeacherModel.js";
import User from "../models/User.js";
import Feedback from '../models/FeedbackModel.js';
import crypto from 'crypto'; // For generating secure random codes
import bcrypt from 'bcrypt'; // Added for hashing approval codes



// ==================== STUDENT CONTROLLERS ====================
/*
Student sends request to supervisor
*/
export const requestApproval = async(req,res) =>{
  try {
    const { title, technology, supervisorId, description } = req.body;
    const studentId = req.user._id;

    const student = await User.findById(studentId).select('name email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    const teacher = await Teacher.findById(supervisorId).select('name email');
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found"
      });
    }
    let project = await Project.findOne({ student: studentId });
    if(project){
      // If project exists, update details and reset for re-request (e.g., after invalid code)
      if (project.approvalVerified) {
        return res.status(400).json({
          success: false,
          message: "Project already fully uploaded and verified"
        });
      }
      project.title = title;
      project.technology = technology;
      project.description = description;
      project.supervisor = supervisorId;
      project.approvalRequested = true;
      project.approvalCode = null; // Reset code for new request
      project.approvalVerified = false;
      project.approvalStatus = "waiting";
      project.status = "pending";
      project.statusHistory = project.statusHistory || [];
      project.statusHistory.push({
        status: "pending",
        remarks: "Approval re-requested",
      });
      await project.save();
    } else {
      // Create new project proposal
      project = await Project.create({
        title,
        technology,
        description,
        supervisor: supervisorId,
        student: studentId,
        approvalRequested: true, 
        approvalStatus: "waiting",
        status: "pending",
        statusHistory: [{
          status: "pending",
          remarks: "Initial approval request",
        }]
      });
    }

    // Real-time notification to supervisor
    const io = req.app.get('io')
    io.to(project.supervisor.toString()).emit('newApprovalRequest', {
      projectId: project._id,
      title: project.title,
      studentName: student.name
    });

    res.status(200).json({
      success: true,
      message: "Approval request submitted. Waiting for supervisor approval.",
      projectId: project._id
    });
  } catch (error) {
    console.error('Error in requestApproval:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
// New controller: Upload project document after verification
export const uploadProjectDocument = async (req, res) => {
  try {
    const { approvalCode } = req.body; // This is the hash from student
    const studentId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Project document is required"
      });
    }

    if (!approvalCode) {
      return res.status(400).json({
        success: false,
        message: "Approval code is required"
      });
    }

    const project = await Project.findOne({ student: studentId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project proposal not found. Please submit a request first."
      });
    }

    if (project.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Project not yet approved by supervisor."
      });
    }

    // DIRECT COMPARISON - no bcrypt, no toUpperCase
    console.log('Code comparison:', {
      userCode: approvalCode,
      storedHash: project.approvalCode,
      exactMatch: approvalCode === project.approvalCode
    });

    // Simple string comparison since both are hashes
    if (approvalCode !== project.approvalCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval code. Please check and try again."
      });
    }

    if (project.document) {
      return res.status(400).json({
        success: false,
        message: "Document already uploaded."
      });
    }

    // Upload successful
    project.document = req.file.path;
    project.approvalVerified = true;
    project.approvalRequested = false;
    project.approvalCode = null; // Clear code after use
    project.status = "approved";

    project.statusHistory = project.statusHistory || [];
    project.statusHistory.push({
      status: "approved",
      remarks: "Document uploaded and verified",
      updatedAt: new Date()
    });

    await project.save();

    const student = await User.findById(studentId);

    // Create group automatically
    const group = await Group.create({
      groupName: project.title,
      description: project.description,
      leader: studentId,
      supervisor: project.supervisor,
      members: [],
      project: project._id,
      status: "approved"
    });

    // Update student with project and supervisor
    await User.findByIdAndUpdate(studentId, {
      project: project._id,
      supervisor: project.supervisor,
      group: group._id
    });

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(project.supervisor.toString()).emit('projectUploaded', {
        projectId: project._id,
        title: project.title,
        groupId: group._id
      });
    }

    res.status(201).json({
      success: true,
      message: "Project document uploaded and verified successfully",
      project: {
        _id: project._id,
        title: project.title,
        status: project.status,
        document: project.document
      },
      group: {
        _id: group._id,
        name: group.groupName
      }
    });

  } catch (error) {
    console.error('Error in uploadProjectDocument:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// In your ProjectController.js - Add this function
export const getMyProject = async (req, res) => {
  try {
    const studentId = req.user._id;

    const project = await Project.findOne({ student: studentId })
      .populate('student', 'name email stdId semester')
      .populate('supervisor', 'name email teacherId department')
      // .populate({
      //   path: 'group',
      //   populate: [
      //     { path: 'leader', select: 'name email' },
      //      
      //   ]
      // })
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'No project found'
      });
    }

    // Get feedbacks
    const feedbacks = await Feedback.find({ project: project._id })
      .populate('author', 'name email')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      project,
      feedbacks
    });

  } catch (error) {
    console.error('Error fetching my project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== TEACHER CONTROLLERS ====================

// Get project details with all related information
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const teacherId = req.user.id;

    console.log('Fetching project details:', { projectId, teacherId });

    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    // Fetch project with all populations
    const project = await Project.findById(projectId)
      .populate({
        path: 'student',
        model: 'User',
        select: 'name email rollNumber semester'
      })
      .populate({
        path: 'supervisor',
        model: 'Teacher',
        select: 'name email teacherId department profileImage'
      })
      
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify that the teacher is the supervisor of this project
    // Convert both to string for safe comparison
    if (project.supervisor && project.supervisor._id.toString() !== teacherId.toString()) {
      console.log('Authorization failed:', {
        supervisorId: project.supervisor._id.toString(),
        teacherId: teacherId.toString()
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this project'
      });
    }

    // Get project feedbacks with proper population
    const feedbacks = await Feedback.find({ project: projectId })
      .populate({
        path: 'author',
        select: 'name email  '
      })
      .sort('-createdAt')
      .lean();

    // Format feedbacks to include author info properly
    const formattedFeedbacks = feedbacks.map(feedback => ({
      ...feedback,
      author: feedback.author || { name: 'Unknown', email: '' }
    }));

    res.json({
      success: true,
      project,
      feedbacks: formattedFeedbacks || []
    });

  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project details'
    });
  }
};

// Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, remarks } = req.body;
    const teacherId = req.user.id;

    console.log("TchID",teacherId);
    console.log("SeperID", projectId);
    console.log('Updating project status:', { projectId, status, teacherId });

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be pending, approved, or rejected'
      });
    }

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findById(projectId)
    .populate('student', 'name email')
    .populate('supervisor', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    console.log('=== DEBUG: Project Supervisor Check ===');
    console.log('Teacher ID from token:', teacherId.toString());
    console.log('Project supervisor ID:', project.supervisor.toString());
    console.log('Project ID:', projectId);
    console.log('Project title:', project.title);
    console.log('Project student:', project.student);
    console.log('Full project object:', JSON.stringify(project, null, 2));
    console.log('=====================================');

    let supervisorId;

    if (project.supervisor && typeof project.supervisor === 'object' && project.supervisor._id) {
      // Supervisor is populated (it's an object with _id)
      supervisorId = project.supervisor._id.toString();
      console.log('Supervisor is populated, extracted ID:', supervisorId);
    } else {
      // Supervisor is just the ID
      supervisorId = project.supervisor.toString();
      console.log('Supervisor is raw ID:', supervisorId);
    }

    console.log('Final supervisor ID for comparison:', supervisorId);
    console.log('Teacher ID for comparison:', teacherId.toString());
    console.log('Do they match?', supervisorId === teacherId.toString());

    // Check authorization
    if (supervisorId !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this project'
      });
    }
    // If approving, generate secure code, hash it, store hash, return plain
    let approvalCode = null;
    if (status === 'approved' && project.status !== 'approved') {
      approvalCode = crypto.randomBytes(8).toString('hex').toUpperCase(); // 16 hex chars, secure random
      const hashedCode = await bcrypt.hash(approvalCode, 12);
      project.approvalCode = hashedCode;
      project.approvalStatus = 'approved';

    }
    if (status === 'rejected') {
      project.approvalStatus = 'rejected';
    }
    project.status = status;
    if (remarks) {
      project.supervisorRemarks = remarks;
    }
    project.statusHistory = project.statusHistory || [];
    project.statusHistory.push({
      status,
      remarks: remarks || `Status changed to ${status}`,
      updatedBy: teacherId
    });
    await project.save();
     
    // Create feedback for status change
    try {
      await Feedback.create({
        project: projectId,
        author: teacherId,
        authorType: 'Teacher',
        comment: `Status changed to ${status}${remarks ? ': ' + remarks : ''}`
      });
    } catch (err) {
      console.log('Could not create feedback for status change:', err.message);
    }

    //get group info..
    const group = await Group.findOne({
      $or:[
        {leader:project.student._id},
        {project:projectId}
      ]
    })
    .populate('leader','name email')
    .populate('members','name email rollNumber')
    .lean();

    // Real-time notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(project.student._id.toString()).emit('projectStatusUpdate', {
        projectId: project._id,
        status: project.status,
        remarks: remarks,
        approvalCode: status === 'approved' ? approvalCode : null
      });
    }

    // Return updated project, include approvalCode if generated
    const updatedProject = await Project.findById(projectId)
      .populate('student', 'name email stdId')
      .populate('supervisor', 'name email teacherId department')
      .lean();

    res.json({
      success: true,
      message: `Project ${status} successfully`,
      project: {
        ...project.toObject(),
        group: group || null
      },
      approvalCode: approvalCode // Only present if approved
    });

  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project status'
    });
  }
};

// Add feedback to project
export const addProjectFeedback = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { comment } = req.body;
    // ✅ Guard: check if auth middleware ran properly
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - please login again'
      });
    }
    const teacherId = req.user.id;
 
    console.log('Adding feedback:', { projectId, comment, teacherId });

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization - convert both to string for comparison
    // Allow BOTH supervisor and student to add feedback
    const isAuthorized =
      project.supervisor.toString() === teacherId.toString() ||
      project.student.toString() === teacherId.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add feedback to this project'
      });
    }

    // Get teacher info
    const teacher = await Teacher.findById(teacherId).select('name email');

    // Create feedback with authorType 'Teacher' (matching schema)
    const feedback = new Feedback({
      project: projectId,
      author: teacherId,
      authorType: 'Teacher', // Use authorType instead of authorModel
      comment: comment 
    });

   // await feedback.save();

    // Return formatted feedback
    const feedbackResponse = {
      _id: feedback._id,
      project: feedback.project,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      author: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: 'Teacher'
      }
    };

    res.json({
      success: true,
      feedback: feedbackResponse
    });

  } catch (error) {
    console.error('Error adding feedback:', error.message);
    console.error('Full error:', error);
    console.error('req.user at crash time:', req.user);    // check if user exists

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all projects for a teacher (dashboard)
export const getTeacherProjects = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const projects = await Project.find({ supervisor: teacherId })
      .populate('student', 'name email rollNumber profileImage')
      .populate('group', 'groupName members')
      .sort('-createdAt');

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Error fetching teacher projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// Get dashboard statistics for teacher
export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const [totalProjects, pendingProjects, approvedProjects, rejectedProjects, groups] = await Promise.all([
      Project.countDocuments({ supervisor: teacherId }),
      Project.countDocuments({ supervisor: teacherId, status: 'pending' }),
      Project.countDocuments({ supervisor: teacherId, status: 'approved' }),
      Project.countDocuments({ supervisor: teacherId, status: 'rejected' }),
      Group.countDocuments({ supervisor: teacherId })
    ]);

    // Get recent projects
    const recentProjects = await Project.find({ supervisor: teacherId })
      .populate('student', 'name email')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalProjects,
        pendingProjects,
        approvedProjects,
        rejectedProjects,
        totalGroups: groups,
        recentProjects
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// Get all pending project requests for a teacher
export const getPendingRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const pendingProjects = await Project.find({
      supervisor: teacherId,
      status: 'pending',
      approvalRequested: true
    })
    .populate({
      path: 'student',
      model: 'User',
      select: 'name email rollNumber semester  '
    })
      .populate({
        path: 'supervisor',
        model: 'Teacher',
        select: 'name email teacherId'
      })
      .sort('-createdAt')
      .lean();

      // Get group information for each project
    const projectsWithGroups = await Promise.all(
      pendingProjects.map(async (project) => {
        const group = await Group.findOne({
          $or: [
            { leader: project.student?._id },
            { project: project._id }
          ]
        })
          .populate('leader', 'name email')
          .populate('members', 'name email')
          .lean();
        return {
          ...project,
          group: group || null
        };
      })
    );
    res.json({
      success: true,
      count: projectsWithGroups.length,
      requests: projectsWithGroups
    });

  } catch (error) {
    console.error('Error in getPendingRequests:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get approved projects for teacher
export const getApprovedProjects = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const approvedProjects = await Project.find({
      supervisor: teacherId,
      status: 'approved'
    })
      .populate({
        path: 'student',
        model: 'User',
        select: 'name email rollNumber semester profileImage'
      })
      .populate({
        path: 'supervisor',
        model: 'Teacher',
        select: 'name email teacherId'
      })
      .sort('-updatedAt')
      .lean();

    // Get group information for each project
    const projectsWithGroups = await Promise.all(
      approvedProjects.map(async (project) => {
        const group = await Group.findOne({
          $or: [
            { leader: project.student?._id },
            { project: project._id }
          ]
        })
          .populate('leader', 'name email')
          .populate('members', 'name email rollNumber')
          .lean();

        return {
          ...project,
          group: group || null,
          members: group?.members || [],
          leaderName: group?.leader?.name || project.student?.name,
          memberCount: group?.members?.length || 0
        };
      })
    );

    res.json({
      success: true,
      count: approvedProjects.length,
      projects: projectsWithGroups
    });

  } catch (error) {
    console.error('Error in getApprovedProjects:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get rejected projects for teacher
export const getRejectedProjects = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const rejectedProjects = await Project.find({
      supervisor: teacherId,
      status: 'rejected'
    })
      .populate({
        path: 'student',
        model: 'User',
        select: 'name email rollNumber semester profileImage'
      })
      .populate({
        path: 'supervisor',
        model: 'Teacher',
        select: 'name email teacherId'
      })
      .sort('-updatedAt')
      .lean();

    // Get group information for each project
    const projectsWithGroups = await Promise.all(
      rejectedProjects.map(async (project) => {
        const group = await Group.findOne({
          $or: [
            { leader: project.student?._id },
            { project: project._id }
          ]
        })
          .populate('leader', 'name email')
          .populate('members', 'name email')
          .lean();

        return {
          ...project,
          group: group || null,
          members: group?.members || [],
          leaderName: group?.leader?.name || project.student?.name
        };
      })
    );

    res.json({
      success: true,
      count: rejectedProjects.length,
      projects: projectsWithGroups
    });

  } catch (error) {
    console.error('Error in getRejectedProjects:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

