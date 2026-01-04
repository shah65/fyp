import express from 'express'
import {register,login, me} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js';
 
const router = express.Router();

router.post('/signup',register);
router.post('/login',login);
router.get('/me',authMiddleware,me)
//router.post('/logout',logout)

export default router;