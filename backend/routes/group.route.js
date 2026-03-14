import express from 'express';
import {
  createGroup,
  addMember,
  getMyGroup,
  getMember,
  updateMember,
  removeMember,
  deleteGroup,
  updateGroupStatus
} from '../controllers/Group.controller.js'; 
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/Multer.js'; // Import the upload object

const router = express.Router();
// Group management
router.post('/create', authMiddleware, createGroup);
router.get('/my-group', authMiddleware, getMyGroup);
router.delete('/delete', authMiddleware, deleteGroup);

// Member management
router.post('/add-member', authMiddleware,upload.memberImage, addMember);
router.get('/member/:memberId', authMiddleware, getMember);
router.put('/member/:memberId', authMiddleware, upload.memberImage, updateMember); 
router.delete('/member/:memberId', authMiddleware, removeMember);

// Status update (for supervisors)
router.put('/status/:groupId', authMiddleware, updateGroupStatus);


export default router;