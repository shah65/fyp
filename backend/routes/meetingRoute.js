import express from "express";
import {
  createMeeting,
  getTeacherMeetings,
  getMeetingDetail,
  startMeeting,
  endMeeting,
  updateMeeting,
  deleteMeeting,
  getStudentMeetings,
  getMeetingByRoomId,
  joinMeeting,
  getStudentUpcomingMeetings,

} from "../controllers/mettingController.js";
import  verifyToken  from "../middleware/authMiddleware.js";
import verifyTeacher from '../middleware/authorizeTeacher.js';
import { getTeacherGroups } from '../controllers/teacherController.js';
const router = express.Router();

// ── Teacher routes ─────────────────────────────────────────────────────────────
router.post('/teacher/meetings', verifyTeacher, createMeeting);
router.get('/teacher/meetings', verifyTeacher, getTeacherMeetings);
router.get('/teacher/groups', verifyTeacher, getTeacherGroups);
router.get('/teacher/meetings/:meetingId', verifyTeacher, getMeetingDetail);
router.patch('/teacher/meetings/:meetingId/start', verifyTeacher, startMeeting);
router.patch('/teacher/meetings/:meetingId/end', verifyTeacher, endMeeting);
router.put('/teacher/meetings/:meetingId', verifyTeacher, updateMeeting);
router.delete('/teacher/meetings/:meetingId', verifyTeacher, deleteMeeting);

// ── Student routes ─────────────────────────────────────────────────────────────
router.get('/student/meetings', verifyToken, getStudentMeetings);
router.get('/student/upcoming-meetings', verifyToken, getStudentUpcomingMeetings);
router.post('/meetings/join/:roomId', verifyToken, joinMeeting);

// ── Shared / public ────────────────────────────────────────────────────────────
router.get('/meetings/room/:roomId', verifyToken, getMeetingByRoomId);

export default router;