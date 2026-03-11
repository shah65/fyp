import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    technology: { type: String, required: true },
    description: String,

    document: {
      type: String,
      required: false
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    approvalCode: {
      type: String,
      default: null
    },

    approvalRequested: {
      type: Boolean,
      default: false
    },

    approvalVerified: {
      type: Boolean,
      default: false
    },
    approvalStatus: {
      type: String,
      enum: ["waiting", "approved", "rejected"],
      default: "waiting"
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }

  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);