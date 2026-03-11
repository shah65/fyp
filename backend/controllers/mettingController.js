// controllers/meetingController.js
import Meeting from "../models/Meeting.js";
import Group from "../models/Group.js";
import { v4 as uuidv4 } from "uuid";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ═══════════════════════════════════════════════════════════════
   TEACHER — full control
═══════════════════════════════════════════════════════════════ */

/**
 * POST /api/teacher/meetings
 * Create a meeting for one of the teacher's assigned groups.
 * Body: { title, description?, scheduledAt, groupId }
 */

export const createMeeting = async(req,res) =>{
  try {
    const teacherId = req.user._id;
    const { title, description, scheduledAt, groupId } = req.body;
    
    if (!title) return res.status(400).json({ success: false, message: "Title is required." });
    if (!groupId) return res.status(400).json({ success: false, message: "Group is required." });
    // Verify the group belongs to this teacher's supervision
    const group = await Group.findOne({ _id: groupId, supervisor: teacherId })
      .populate("leader", "name email stdId")
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you don't have permission to create meetings for this group."
      });
    }

    const roomId = uuidv4();
    const shareLink = `${FRONTEND_URL}/meeting/room/${roomId}`;

    const meeting = await Meeting.create({
      title,
      description: description || "",
      teacher: teacherId,
      group: groupId,
      roomId,
      shareLink,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: "scheduled",
    });
    const populated = await Meeting.findById(meeting._id)
      .populate("group", "groupName leader members")
      .populate({ path: "group", populate: { path: "leader", select: "name email stdId" } })
      .populate('teacher','name email')
      .lean();

    res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully.",
      meeting: populated,
      shareLink,
    });

  } catch (error) {
    onsole.error("createMeeting Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
/**
 * GET /api/teacher/meetings
 * All meetings created by this teacher (history + upcoming).
 */

export const getTeacherMeetings = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query; // Optional filter by status

    let query = {teacher:teacherId};
    if(status && ['scheduled','live','ended'].includes(status)){
      query.status = status;
    }
    const meetings = await Meeting.find(query)
      .populate({
        path: "group",
        select: "groupName members status",
        populate: { path: "leader", select: "name email stdId" },
      })
      .sort({ createdAt: -1 })
      .lean();


    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    console.error('getTeacherMeetings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/teacher/meetings/:meetingId
 * Single meeting detail.
 */

export const getMeetingDetail = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const teacherId = req.user._id;

    const meeting = await Meeting.findOne({ _id: meetingId, teacher: teacherId })
      .populate({
        path: "group",
        select: "groupName members status description",
        populate: { path: "leader", select: "name email stdId" },
      })
      .lean();

    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });

    res.json({ success: true, meeting });
  } catch (error) {
    console.error("getMeetingDetail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/teacher/meetings/:meetingId/start
 * Teacher starts the meeting → status becomes 'live'.
 */
export const startMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const teacherId = req.user._id;

    const meeting = await Meeting.findOne({ _id: meetingId, teacher: teacherId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
    if (meeting.status === "ended") return res.status(400).json({ success: false, message: "Meeting already ended." });
    if(meeting.status === 'live') return res.status(400).json({success:false,message:"Meeting is already live!"})
    meeting.status = "live";
    meeting.startedAt = new Date();
    await meeting.save();

    // Emit socket event to notify group leader that meeting has started
    const io = req.app.get('io');
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("group", "leader")
      .lean();
     
    if (populatedMeeting.group && populatedMeeting.group.leader) {
      io.to(populatedMeeting.group.leader.toString()).emit('meeting-started', {
        meetingId: meeting._id,
        roomId: meeting.roomId,
        title: meeting.title
      });
    }
 
    res.json({ success: true, message: "Meeting is now live.", meeting });
  } catch (error) {
    console.error("startMeeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/teacher/meetings/:meetingId/end
 * Teacher ends the meeting.
 */
export const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const teacherId = req.user._id;

    const meeting = await Meeting.findOne({ _id: meetingId, teacher: teacherId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
    if (meeting.status === "ended") return res.status(400).json({ success: false, message: "Meeting already ended." });

    meeting.status = "ended";
    meeting.endedAt = new Date();
    await meeting.save();

    // Emit socket event to notify group leader that meeting has ended
    const io = req.app.get('io');
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("group", "leader")
      .lean();

    if (populatedMeeting.group && populatedMeeting.group.leader) {
      io.to(populatedMeeting.group.leader.toString()).emit('meeting-ended', {
        meetingId: meeting._id
      });
    }
    res.json({ success: true, message: "Meeting ended.", meeting });
  } catch (error) {
    console.error("endMeeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/teacher/meetings/:meetingId
 * Teacher updates meeting title / description / scheduledAt.
 */
export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const teacherId = req.user._id;
    const { title, description, scheduledAt } = req.body;

    const meeting = await Meeting.findOne({ _id: meetingId, teacher: teacherId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
    if (meeting.status === "ended") return res.status(400).json({ success: false, message: "Cannot edit an ended meeting." });
    if (meeting.status === "live") return res.status(400).json({ success: false, message: "Cannot edit a live meeting." });
    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meeting._id)
    .populate('group','groupName leader')
    .populate('teacher','name email')
    .lean();
    res.json({ success: true, message: "Meeting updated.", meeting });
  } catch (error) {
    console.error("updateMeeting:Error!", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/teacher/meetings/:meetingId
 * Teacher deletes a meeting.
 */
export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const teacherId = req.user._id;

    const meeting = await Meeting.findOneAndDelete({ _id: meetingId, teacher: teacherId });
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });

    res.json({ success: true, message: "Meeting deleted." });
  } catch (error) {
    console.error("deleteMeeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   STUDENT (LEADER) — read & join only
═══════════════════════════════════════════════════════════════ */

/**
 * GET /api/student/meetings
 * Returns meetings where the logged-in User is the group leader.
 * Shows scheduled, live, and recent ended ones.
 */
export const getStudentMeetings = async (req, res) => {
  try {
    const leaderId = req.user._id;

    // Find all groups where this user is the leader
    const groups = await Group.find({ leader: leaderId }).select("_id").lean();
    const groupIds = groups.map(g => g._id);

    if (groupIds.length === 0) {
      return res.json({ success: true, count: 0, meetings: [] });
    }
    const meetings = await Meeting.find({ group: { $in: groupIds } })
      .populate({
        path: "group",
        select: "groupName members",
        populate: { path: "leader", select: "name email stdId" },
      })
      .populate("teacher", "name email teacherId")
      .sort({ scheduledAt: 1, createdAt: -1 })
      .lean();

    // Add canJoin flag for frontend
    const now = new Date();
    const meetingsWithJoinStatus = meetings.map(meeting => ({
      ...meeting,
      canJoin: meeting.status === 'live' ||
        (meeting.status === 'scheduled' && meeting.scheduledAt && new Date(meeting.scheduledAt) <= now)
    }));

    res.json({ success: true, count: meetings.length, meetings: meetingsWithJoinStatus });
    } catch (error) {
    console.error("getStudentMeetingsError!:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/meetings/room/:roomId
 * Get meeting info when joining via link. Used by both teacher and student.
 */
export const getMeetingByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const meeting = await Meeting.findOne({ roomId })
      .populate({
        path: "group",
        select: "groupName members leader",
        populate: { path: "leader", select: "name email stdId" },
      })
      .populate("teacher", "name email teacherId")
      .lean();

    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });

    // Check if user is authorized to access this meeting
    let isAuthorized = false;
    if (userRole === 'teacher') {
      isAuthorized = meeting.teacher._id.toString() === userId.toString();
    } else {
      // Student - check if they are the group leader
      isAuthorized = meeting.group.leader._id.toString() === userId.toString();
    }
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "You are not authorized to join this meeting." });
    }
    res.json({ success: true, meeting });
  } catch (error) {
    console.error("getMeetingByRoomIdError!:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/meetings/join/:roomId
 * Leader records their join timestamp.
 */
export const joinMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({ roomId }).populate('group','leader')
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found." });
    // Check if user is the group leader
    // if (meeting.group.leader.toString() !== userId.toString()) {
    //   return res.status(403).json({ success: false, message: "Only the group leader can join the meeting." });
    // }
    if (meeting.status === "ended") return res.status(400).json({ success: false, message: "This meeting has already ended." });
    if (meeting.status === "scheduled") return res.status(400).json({ success: false, message: "Meeting hasn't started yet. Please wait for your supervisor." });

    if (!meeting.leaderJoinedAt) {
      meeting.leaderJoinedAt = new Date();
      await meeting.save();
    }

    res.json({ success: true, message: "Joined successfully.", meeting });
  } catch (error) {
    console.error("joinMeeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/upcoming-meetings
 * Get only upcoming meetings for student dashboard
 */
export const getStudentUpcomingMeetings = async (req, res) => {
  try {
    const leaderId = req.user._id;

    const groups = await Group.find({ leader: leaderId }).select("_id").lean();
    const groupIds = groups.map(g => g._id);

    if (groupIds.length === 0) {
      return res.json({ success: true, count: 0, meetings: [] });
    }

    const now = new Date();
    const meetings = await Meeting.find({
      group: { $in: groupIds },
      status: { $in: ['scheduled', 'live'] },
      scheduledAt: { $gte: now }
    })
      .populate("teacher", "name email")
      .populate("group", "groupName")
      .sort({ scheduledAt: 1 })
      .lean();

    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    console.error("getStudentUpcomingMeetings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};