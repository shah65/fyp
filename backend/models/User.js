// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: { type: String, required: true },

    stdId: {
      type: String,
      required: true,
      unique: true
    },

    subject: { type: String, required: true },
    semester: { type: String, required: true },
    department: { type: String, required: true },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null
    },

    role: {
      type: String,
      default: "student"
    },
    image:{type:String,default:null}
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);