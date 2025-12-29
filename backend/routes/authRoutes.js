import express from 'express'
import {register,login} from '../controllers/authController.js'
 
const router = express.Router();

router.post('/signup',register);
router.post('/login',login);
//router.post('/logout',logout)

export default router;