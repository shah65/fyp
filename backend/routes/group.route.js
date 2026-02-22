import express from 'express';
import { addMember, createGroup,getMyGroup } from '../controllers/Group.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add-member',authMiddleware,addMember)
router.get('/mygroup/my',authMiddleware,getMyGroup)

export default router;