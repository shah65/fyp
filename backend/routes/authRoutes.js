import express from 'express'
import { upload } from '../middleware/Multer.js';
import { uploadProject } from '../controllers/ProjectController.js';
import {register,login, me} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import { getProject } from '../controllers/ProjectController.js';
 
const router = express.Router();

router.post('/signup',register);
router.post('/login',login);
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, authMiddleware, uploadProject);
router.get('/project/:id',authMiddleware,getProject);

router.get('/me',authMiddleware,me)
//router.post('/logout',logout)

export default router;