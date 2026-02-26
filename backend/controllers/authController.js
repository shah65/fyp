import bcrypt from 'bcrypt';
import importedUser from '../models/User.js';
import jwt from 'jsonwebtoken'
import Project from '../models/ProjectModel.js'
import Teacher from '../models/TeacherModel.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, stdId, subject, department, semester, } = req.body;

    // ✅ Check both email and student ID
    const existingUser = await importedUser.findOne({
      $or: [{ email }, { stdId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash password
    const hash = await bcrypt.hash(password, 12);
    // ✅ Save ALL required fields
    const user = await importedUser.create({
      name,
      email,
      password: hash,
      stdId,
      subject,
      department,
      semester,

    });

    // ✅ Clean response (never send password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stdId: user.stdId,
        subject: user.subject,
        department: user.department,
        semester: user.semester,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  //check User if have
  try {
    const avilibleUser = await importedUser.findOne({ email });
    if (!avilibleUser) {
      return res.status(401).json({
        message: "Please Create An Account Frst",
        redirect: '/signup'
      })
    }

    //passwordMatching

    const isMatch = await bcrypt.compare(password.toString(), avilibleUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const project = await Project.findOne({ student: avilibleUser._id });


    //create jwt token
    const token = jwt.sign(
      {
        id: avilibleUser._id,
        email: avilibleUser.email,
        role: 'student', // Explicitly set role as 'student' for users logging in through this route
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: avilibleUser._id,
        name: avilibleUser.name,
        email: avilibleUser.email,
        stdId: avilibleUser.stdId,
        subject: avilibleUser.subject,
        department: avilibleUser.department,
        semester: avilibleUser.semester,
      },
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: "Logout Successfully" })
  } catch (error) {
    console.error(error);
  }
}

export const me = async (req, res) => {
  try {
    // Try to find a student (User)
    let user = await importedUser.findById(req.user.id).select('-password').lean();
    if (user) {
      user.role = 'student'; // ✅ Works on plain object
      return res.json({ user });
    }

    // If not a student, try teacher
    user = await Teacher.findById(req.user.id).select('-password').lean();
    if (user) {
      // Teacher model already has role, but ensure it's set (in case it's missing)
      user.role = user.role || 'teacher';
      return res.json({ user });
    }

    // Neither found
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ message: 'Server error' });
  }
};