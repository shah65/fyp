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
    },
// New fields for resources
  githubRepo: {
      type: String,
      trim:true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          // GitHub URL validation
          return /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/.test(v);
        },
        message: 'Please provide a valid GitHub repository URL'
      }
    },
    projectVideo: {
      type: String // URL to uploaded video
    },
    videoPublicId: {
      type: String // Cloudinary public ID for video management
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);