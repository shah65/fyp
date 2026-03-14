import express from 'express'
import { upload } from '../middleware/Multer.js';
import { uploadProjectDocument, requestApproval, getMyProject } from '../controllers/ProjectController.js';
import { register,uploadProfileImage,login, me,logout} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js';
 
const router = express.Router();

router.post('/signup',register);
router.post('/login',login);
router.post('/upload-document',
  authMiddleware,
  (req, res, next) => {
    console.log(req.body)
    // Call the middleware directly, not as a function
    upload.pdf(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  uploadProjectDocument
); 
router.post('/request-approval', authMiddleware, requestApproval);
router.get('/project/:id', authMiddleware, getMyProject);

router.post('/upload-profile-image', authMiddleware, upload.memberImage, uploadProfileImage);

router.get('/me',authMiddleware,me)
router.post('/logout',logout)

export default router;