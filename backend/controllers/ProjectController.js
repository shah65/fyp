import mongoose from "mongoose";
import Project from "../models/ProjectModel.js";
import Group from "../models/Group.js";
import Teacher from "../models/TeacherModel.js";
import User from "../models/User.js";
import Feedback from '../models/FeedbackModel.js';

// ==================== STUDENT CONTROLLERS ====================
export const uploadProject = async (req, res) => {
  try {
    const { title, technology, supervisorId, description } = req.body;
    const studentId = req.user._id;

    // Check if project already exists for this student
    const existenceProject = await Project.findOne({ student: studentId });
    if (existenceProject) {
      return res.status(400).json({
        success: false,
        message: "Project already uploaded.",
      });
    }

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Project document is required"
      });
    }

    // Validate supervisorId
    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Supervisor ID"
      });
    }

    // Check if supervisor exists
    const teacher = await Teacher.findById(supervisorId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found!"
      });
    }

    // Create project
    const project = await Project.create({
      title,
      technology,
      description,
      supervisor: teacher._id,
      document: req.file.path,
      student: studentId,
      statusHistory: [{
        status: "pending",
        remarks: "Project uploaded and pending review",
      }]
    });

    const student = await User.findById(studentId);

    // Create group automatically
    await Group.create({
      groupName: title,
      description,
      leader: studentId,
      supervisor: teacher._id,
      members: []
    });

    // Update student with project and supervisor
    await User.findByIdAndUpdate(studentId, {
      project: project._id,
      supervisor: teacher._id
    });

    res.status(201).json({
      success: true,
      message: "Project uploaded successfully",
      project: {
        _id: project._id,
        title: project.title,
        status: project.status
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
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
        select: 'name email rollNumber semester profileImage'
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
        select: 'name email profileImage'
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

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization - convert both to string for comparison
    if (project.supervisor.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this project'
      });
    }

    // Add to status history
    const historyEntry = {
      status,
      remarks: remarks || `Status changed to ${status}`,
      updatedBy: teacherId,
      updatedAt: new Date()
    };

    // Update project
    project.status = status;
    if (remarks) {
      project.supervisorRemarks = remarks;
    }
    project.statusHistory = project.statusHistory || [];
    project.statusHistory.push(historyEntry);

    await project.save();

    // Get teacher info for feedback
    const teacher = await Teacher.findById(teacherId).select('name email');

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

    // Return updated project with populated fields
    const updatedProject = await Project.findById(projectId)
      .populate('student', 'name email rollNumber')
      .populate('supervisor', 'name email');

    res.json({
      success: true,
      message: 'Project status updated successfully',
      project: updatedProject
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
    const teacherId = req.user.id;

    console.log('Adding feedback:', { projectId, comment, teacherId });

    // Validate input
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback comment is required'
      });
    }

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
    if (project.supervisor.toString() !== teacherId.toString()) {
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
      comment: comment.trim()
    });

    await feedback.save();

    // Return formatted feedback
    const feedbackResponse = {
      _id: feedback._id,
      project: feedback.project,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      author: {
        _id: teacher._id,
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
    console.error('Error adding feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding feedback'
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