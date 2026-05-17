import express from 'express';
import multer from 'multer';
import {
  getPendingRequests,
  getApprovedProjects,
  getRejectedProjects, 
  getProjectDetails,
  updateProjectStatus,
  addProjectFeedback } from '../controllers/ProjectController.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js'; // Import configured cloudinary
import {
  registerTeacher,
  teacherLogin,
  getMyStudents,
  getDashboardStats,
  getTeacherProfile,
  getTeacherGroups,
  uploadProfileImage,
  teacherLogout,
  createStudentAccount
} from '../controllers/teacherController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeTeacher from '../middleware/authorizeTeacher.js';

const router = express.Router();

// Configure Cloudinary storage with the configured cloudinary instance
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the configured instance
  params: {
    folder: 'teacher-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes
router.post('/signup', registerTeacher);
router.post('/login', teacherLogin);

// Protected routes
router.use(authMiddleware, authorizeTeacher);

// Teacher profile routes
router.get('/profile', getTeacherProfile);
// router.put('/profile', updateTeacherProfile);
router.post('/profile/image', upload.single('profileImage'), uploadProfileImage);

// Dashboard stats
router.get('/dashboard', getDashboardStats);
router.get('/students', getMyStudents);
router.get('/groups', getTeacherGroups);   // ← add this line


// Project request routes - IMPORTANT: Order matters! Put specific routes before dynamic ones
router.get('/requests/pending', getPendingRequests);
router.get('/projects/approved', getApprovedProjects);
router.get('/projects/rejected', getRejectedProjects);

router.get('/project/:projectId/details', getProjectDetails);
router.patch('/project/:projectId/status', updateProjectStatus);
router.post('/project/:projectId/feedback', addProjectFeedback);


// Student management routes
// router.get('/students', getMyStudents);

// Logout route
router.post('/logout', teacherLogout);
//creating student 
router.post('/create-student' ,createStudentAccount);

export default router;