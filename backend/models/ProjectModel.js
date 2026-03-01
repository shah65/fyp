import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    technology: { type: String, required: true },
    description: String,
    document: {
      type: String,
      required: true
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    supervisorRemarks: {
      type: String,
      default: ""
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"]
      },
      remarks: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);