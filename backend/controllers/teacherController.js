import Group from '../models/Group.js';
import Teacher from '../models/TeacherModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import Project from '../models/ProjectModel.js'; // Make sure path is correct

// Get all students under this teacher (from groups they supervise)
export const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id; // from auth middleware

    // 1. Find all groups where this teacher is the supervisor
    const groups = await Group.find({ supervisor: teacherId })
      .populate('leader', 'name email stdId department semester') // populate leader details
      .lean(); // lean for plain JS objects (faster)

    // 2. Collect all unique student emails from these groups
    //    - Leader email (from populated leader)
    //    - Member emails (from embedded members array)
    const leaderEmails = groups.map(g => g.leader?.email).filter(email => email);
    const memberEmails = groups.flatMap(g => g.members.map(m => m.email));

    // Combine and remove duplicates using Set
    const allEmails = [...new Set([...leaderEmails, ...memberEmails])];

    // 3. Find all User documents matching these emails
    const students = await User.find({ email: { $in: allEmails } })
      .select('-password') // exclude password
      .lean();

    // 4. Return the list
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

// Get detailed info of a specific student (including their group and project)
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.id;

    // 1. Find the student by ID
    const student = await User.findById(studentId).select('-password').lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Find the group supervised by this teacher that contains this student
    //    The student could be either the leader or a member (matched by email)
    const group = await Group.findOne({
      supervisor: teacherId,
      $or: [
        { leader: studentId },
        { 'members.email': student.email }
      ]
    })
      .populate('leader', 'name email') // populate leader details
      .lean();

    if (!group) {
      return res.status(403).json({ message: 'Student not under your supervision' });
    }

    // 3. Get the student's project (if any)
    const project = await Project.findOne({ student: studentId })
      .populate('supervisor', 'name email') // this assumes supervisor is a Teacher reference
      .lean();

    // 4. Return combined data
    res.json({
      success: true,
      student,
      group: {
        groupName: group.groupName,
        description: group.description,
        members: group.members
      },
      project: project || null
    });
  } catch (error) {
    console.error('Error in getStudentDetails:', error);
    res.status(500).json({ message: error.message });
  }
};

// Dashboard stats: number of groups supervised, total students, projects under supervision
export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Get all groups supervised by this teacher (populate leader to get emails)
    const groups = await Group.find({ supervisor: teacherId })
      .populate('leader', 'email') // only need email for counting
      .lean();

    const totalGroups = groups.length;

    // 2. Collect all unique student emails from these groups
    const leaderEmails = groups.map(g => g.leader?.email).filter(email => email);
    const memberEmails = groups.flatMap(g => g.members.map(m => m.email));
    const allEmails = [...new Set([...leaderEmails, ...memberEmails])];

    // 3. Count actual registered students with those emails
    const totalStudents = await User.countDocuments({ email: { $in: allEmails } });

    // 4. Get leader IDs to count projects (projects are linked to the student leader)
    const leaderIds = groups.map(g => g.leader?._id).filter(id => id);
    const totalProjects = await Project.countDocuments({ student: { $in: leaderIds } });

    // 5. Get recent projects from these leaders
    const recentProjects = await Project.find({ student: { $in: leaderIds } })
      .populate('student', 'name email')
      .sort('-createdAt')
      .limit(5)
      .lean();

    // 6. Return stats
    res.json({
      success: true,
      stats: {
        totalGroups,
        totalStudents,
        totalProjects,
        recentProjects
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
}; 

export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, teacherId, subject, department, qualification, experience, secretkey } = req.body;
    console.log("Received registration data:", { name, email, teacherId, subject, department, qualification, secretkey, experience })
    //verify secret key
    if (secretkey !== process.env.TEACHER_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized: Invalid secret key" })
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
    // Clean response
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
}

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

    }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log("Login successful for:", teacher.name);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role || 'teacher'
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
}