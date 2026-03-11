// models/Meeting.js
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Teacher who owns this meeting
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    // Group this meeting is for (Group has leader:User ref + members[] subdocs)
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // Unique Jitsi room name
    roomId: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },

    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    leaderJoinedAt: { type: Date, default: null },

    // Share link sent to the group leader
    shareLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Meeting", meetingSchema);