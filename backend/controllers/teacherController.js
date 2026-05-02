import Group from '../models/Group.js';
import Teacher from '../models/TeacherModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/ProjectModel.js';
 
// Get teacher profile details
export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id; // from auth middleware

    const teacher = await Teacher.findById(teacherId)
      .select('-password') // exclude password
      .lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      teacher
    });
  } catch (error) {
    console.error('Error in getTeacherProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getTeacherGroups = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const groups = await Group.find({ supervisor: teacherId, status: 'approved' })
      .populate('leader', 'name email stdId')
      .lean();

      res.json({ success: true, groups });
    console.log("This is groups to assing techers", groups)

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update teacher profile
export const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { name, subject, department, qualification, experience } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      {
        name,
        subject,
        department,
        qualification,
        experience
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      teacher
    });
  } catch (error) {
    console.error('Error in updateTeacherProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const teacherId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { profileImage: req.file.path }, // Cloudinary URL from multer-storage-cloudinary
      { new: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: teacher.profileImage,
      teacher
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all students under this teacher (from groups they supervise)
export const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const groups = await Group.find({ supervisor: teacherId })
      .populate('leader', 'name email stdId department semester')
      .lean();

    const leaderEmails = groups.map(g => g.leader?.email).filter(email => email);
    const memberEmails = groups.flatMap(g => g.members.map(m => m.email));
    const allEmails = [...new Set([...leaderEmails, ...memberEmails])];

    const students = await User.find({ email: { $in: allEmails } })
      .select('-password')
      .lean();

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error in getMyStudents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const groups = await Group.find({ supervisor: teacherId })
      .populate('leader', 'name email')
      .lean();

    const totalGroups = groups.length;

    const leaderEmails = groups.map(g => g.leader?.email).filter(Boolean);
    const memberEmails = groups.flatMap(g => g.members.map(m => m.email));
    const allEmails = [...new Set([...leaderEmails, ...memberEmails])];

    const totalStudents = await User.countDocuments({ email: { $in: allEmails } });

    const leaderIds = groups.map(g => g.leader?._id).filter(Boolean);
    const totalProjects = await Project.countDocuments({ student: { $in: leaderIds } });

    const recentProjects = await Project.find({ student: { $in: leaderIds } })
      .populate('student', 'name email')
      .sort('-createdAt')
      .limit(5)
      .lean();

    // Get teacher details for the response
    const teacher = await Teacher.findById(teacherId)
      .select('-password')
      .lean();

    res.json({
      success: true,
      stats: {
        totalGroups,
        totalStudents,
        totalProjects,
        recentProjects,
      },
      teacher // Include teacher details in dashboard response
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Teacher Registration
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, teacherId, subject, department, qualification, experience, secretkey } = req.body;

    console.log("Received registration data:", { name, email, teacherId, subject, department, qualification, secretkey, experience });

    if (secretkey !== process.env.TEACHER_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized: Invalid secret key" });
    }

    const existenceTeacher = await Teacher.findOne({
      $or: [{ email }, { teacherId }],
    });

    if (existenceTeacher) {
      return res.status(400).json({ message: 'Teacher already exists with this email or ID' });
    }

    const hash = await bcrypt.hash(password, 12);

    const teacher = await Teacher.create({
      name,
      email,
      password: hash,
      teacherId,
      subject,
      department,
      qualification,
      experience: experience || 0,
    });

    res.status(201).json({
      message: 'Teacher registered successfully',
      user: {
        id: teacher._id,
        name: teacher.name,
        role: 'teacher',
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Teacher Login
export const teacherLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      console.log("Teacher not found with email:", email);
      return res.status(401).json({
        message: "No account found with this email",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      console.log("Invalid password for teacher:", email);
      return res.status(401).json({
        message: 'Invalid Credentials'
      });
    }

    const token = jwt.sign({
      id: teacher._id,
      email: teacher.email,
      role: teacher.role || 'teacher'
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("Login successful for:", teacher.name);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role || 'teacher',
        profileImage: teacher.profileImage || null
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

// Logout teacher
export const teacherLogout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in teacherLogout:', error);
    res.status(500).json({ message: error.message });
  }
};