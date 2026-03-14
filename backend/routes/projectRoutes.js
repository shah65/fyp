import express from 'express'
import protect from '../middleware/authMiddleware.js';
import { videoUpload } from '../middleware/Multer.js';
import { uploadProjectVideo, getProjectByStudentId,getProjectResources,updateGithubRepo } from '../controllers/ProjectController.js';

const router = express.Router()
router.post(
  '/upload-video',
  protect,
  videoUpload('video'), // Call the function with field name
  uploadProjectVideo
);

// Get project by student ID (for initial fetch)
router.get(
  '/project/:studentId',
  protect,
  getProjectByStudentId
);
// Update GitHub repository
router.put(
  '/:projectId/github',
  protect,
  updateGithubRepo
);
// Get project resources
router.get(
  '/:projectId/resources',
  protect,
  getProjectResources
);

export default router;