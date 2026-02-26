import express from 'express';
import {
  registerTeacher, teacherLogin, getMyStudents,
  getStudentDetails,
  getDashboardStats
} from '../controllers/teacherController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeTeacher from '../middleware/authorizeTeacher.js'
const router = express.Router();

 
// Teacher authentication routes
router.post('/signup', registerTeacher);
router.post('/login', teacherLogin);
router.use(authMiddleware, authorizeTeacher);
router.get('/dashboard', getDashboardStats);
router.get('/students',getMyStudents);
router.get('/students/:studentId',getStudentDetails)
export default router;