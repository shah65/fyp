// models/Group.js
import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rollNumber: { type: String, required: true },

  role: {
    type: String,
    enum: ["co-ordinator", "member", "leader"],
    default: "member"
  },

  image: { type: String, default: null }
});

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },

    description: String,

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    members: [memberSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);