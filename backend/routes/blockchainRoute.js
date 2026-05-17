import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeTeacher from '../middleware/authorizeTeacher.js'
import fabricService from '../services/fabricService.js';

const router = express.Router();
// Teachers and admins can view all blockchain projects
router.get('/projects', authMiddleware, authorizeTeacher, async (req, res) => {
  try {
    const projects = await fabricService.queryAllProjects();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// View single project by ID
router.get('/project/:projectId', authMiddleware, authorizeTeacher, async (req, res) => {
  try {
    const project = await fabricService.queryProject(req.params.projectId);
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;