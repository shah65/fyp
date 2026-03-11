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

  try {
    const avilibleUser = await importedUser.findOne({ email });
    if (!avilibleUser) {
      return res.status(401).json({
        message: "Please Create An Account First",
      });
    }

    const isMatch = await bcrypt.compare(password.toString(), avilibleUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: avilibleUser._id,
        email: avilibleUser.email,
        role: avilibleUser.role || 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ FIX: Send token in response body as well
    res.status(200).json({
      message: 'Login successful',
      token, // 👈 THIS IS WHAT YOUR FRONTEND NEEDS
      user: {
        id: avilibleUser._id,
        name: avilibleUser.name,
        email: avilibleUser.email,
        stdId: avilibleUser.stdId,
        subject: avilibleUser.subject,
        department: avilibleUser.department,
        semester: avilibleUser.semester,
        role: avilibleUser.role || 'student',
        projectId: avilibleUser.project
      },
    });

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

// controllers/authController.js
export const me = async (req, res) => {
  try {
    // Check if user is already attached by middleware
    if (req.user) {
      let user = await importedUser.findById(req.user._id).select('-password').lean();
      if (user) {
        user.role = 'student';
        return res.json({
          success: true,
          user
        });
      }

      user = await Teacher.findById(req.user._id).select('-password').lean();
      if (user) {
        user.role = user.role || 'teacher';
        return res.json({
          success: true,
          user
        });
      }
    }

    // If no user in request, try to get from token in Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await importedUser.findById(decoded.id).select('-password').lean();
        if (user) {
          user.role = 'student';
          return res.json({ success: true, user });
        }

        user = await Teacher.findById(decoded.id).select('-password').lean();
        if (user) {
          user.role = user.role || 'teacher';
          return res.json({ success: true, user });
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};